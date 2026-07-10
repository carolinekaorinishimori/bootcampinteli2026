import * as XLSX from "xlsx";
import {
  detectProfessionGroup,
  getQuestionnaireForGroup,
  replaceJobCandidates,
  saveJob,
  scoreCandidate,
  uid,
  type Candidate,
  type Job,
} from "./skyhire";

// --- Suporte a arquivos ZIP -----------------------------------------------
// O app aceita .xlsx/.xls/.csv direto OU um .zip contendo uma dessas planilhas.
// Implementamos um extrator ZIP mínimo (sem dependências) usando o
// DecompressionStream nativo do navegador (métodos STORE e DEFLATE).

const SPREADSHEET_RE = /\.(xlsx|xls|csv)$/i;

type Extracted = { data: ArrayBuffer | string; isCsv: boolean } | null;

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("Seu navegador não suporta descompressão ZIP.");
  }
  for (const format of ["deflate-raw", "deflate"] as const) {
    try {
      const ds = new DecompressionStream(format);
      const writer = ds.writable.getWriter();
      void writer.write(bytes as unknown as BufferSource);
      void writer.close();
      const out = await new Response(ds.readable).arrayBuffer();
      return new Uint8Array(out);
    } catch {
      // tenta o próximo formato
    }
  }
  throw new Error("Não foi possível descomprimir a entrada do ZIP.");
}

// Procura a assinatura do diretório central do ZIP a partir de `start`.
function findCentralDir(bytes: Uint8Array, start: number): number {
  const sig = [0x50, 0x4b, 0x01, 0x02];
  for (let i = start; i + 4 <= bytes.length; i++) {
    if (
      bytes[i] === sig[0] &&
      bytes[i + 1] === sig[1] &&
      bytes[i + 2] === sig[2] &&
      bytes[i + 3] === sig[3]
    ) {
      return i;
    }
  }
  return -1;
}

// Varre os cabeçalhos locais do ZIP e extrai a primeira planilha encontrada.
async function extractSpreadsheet(buf: ArrayBuffer): Promise<Extracted> {
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);
  const len = buf.byteLength;
  const entries: { name: string; method: number; compSize: number; dataPos: number }[] = [];

  let pos = 0;
  while (pos + 4 <= len) {
    if (view.getUint32(pos, true) !== 0x04034b50) {
      // Fim dos cabeçalhos locais (diretório central / EOCD) ou lixo
      break;
    }
    const method = view.getUint16(pos + 8, true);
    let compSize = view.getUint32(pos + 18, true);
    const fileNameLen = view.getUint16(pos + 26, true);
    const extraLen = view.getUint16(pos + 28, true);
    const name = new TextDecoder().decode(bytes.subarray(pos + 30, pos + 30 + fileNameLen));
    const dataPos = pos + 30 + fileNameLen + extraLen;

    // Suporte a data descriptor (tamanho 0 no cabeçalho local)
    if (compSize === 0) {
      const next = findCentralDir(bytes, dataPos);
      compSize = next > 0 ? next - dataPos : len - dataPos;
    }
    if (!name.endsWith("/")) {
      entries.push({ name, method, compSize, dataPos });
    }
    pos = dataPos + compSize;
  }

  if (entries.length === 0) return null;

  // Prefere planilhas (xlsx/xls) e, secundário, csv
  const pick =
    entries.find((e) => SPREADSHEET_RE.test(e.name) && /\.xlsx?$/i.test(e.name)) ??
    entries.find((e) => SPREADSHEET_RE.test(e.name));
  if (!pick) return null;

  const isCsv = /\.csv$/i.test(pick.name);
  const slice = bytes.subarray(pick.dataPos, pick.dataPos + pick.compSize);
  if (pick.method === 0) {
    return {
      data: isCsv
        ? new TextDecoder().decode(slice)
        : (slice.buffer.slice(
            slice.byteOffset,
            slice.byteOffset + slice.byteLength,
          ) as ArrayBuffer),
      isCsv,
    };
  }
  if (pick.method === 8) {
    const inflated = await inflate(slice);
    return {
      data: isCsv ? new TextDecoder().decode(inflated) : (inflated.buffer as ArrayBuffer),
      isCsv,
    };
  }
  throw new Error(`Método de compressão ZIP não suportado (${pick.method}).`);
}

async function readWorkbook(file: File): Promise<XLSX.WorkBook> {
  const buf = await file.arrayBuffer();
  const sig = new Uint8Array(buf, 0, 4);
  const isZip = sig[0] === 0x50 && sig[1] === 0x4b; // "PK"
  if (isZip) {
    const extracted = await extractSpreadsheet(buf);
    if (extracted) {
      return XLSX.read(extracted.data, { type: extracted.isCsv ? "string" : "array" });
    }
    // Era um .xlsx direto (também é um ZIP) — lê normalmente
    return XLSX.read(buf, { type: "array" });
  }
  // CSV solto
  return XLSX.read(buf, { type: "array" });
}

// Column name normalization -> canonical fields
const FIELD_MAP: Record<string, keyof ParsedRow> = {
  // Nome
  nome: "fullName",
  "nome completo": "fullName",
  "nome do candidato": "fullName",
  candidato: "fullName",
  name: "fullName",
  "full name": "fullName",
  // E-mail
  email: "email",
  "e-mail": "email",
  "email do candidato": "email",
  // Telefone
  telefone: "phone",
  celular: "phone",
  "telefone celular": "phone",
  phone: "phone",
  // Experiência
  experiencia: "experienceYears",
  experiência: "experienceYears",
  "anos de experiencia": "experienceYears",
  "anos de experiência": "experienceYears",
  "tempo de experiência": "experienceYears",
  "tempo de experiencia": "experienceYears",
  experience: "experienceYears",
  "years of experience": "experienceYears",
  // Escolaridade / formação (Gupy usa "Escolaridade" e "Formação Acadêmica")
  escolaridade: "education",
  formacao: "education",
  formação: "education",
  "formação acadêmica": "education",
  "formacao academica": "education",
  "nível de escolaridade": "education",
  "nivel de escolaridade": "education",
  education: "education",
  // Habilidades / competências (Gupy: "Competências" / "Skills")
  habilidades: "skills",
  competencias: "skills",
  competências: "skills",
  "competências técnicas": "skills",
  "competencias tecnicas": "skills",
  skills: "skills",
  // Certificações
  certificacoes: "certifications",
  certificações: "certifications",
  certifications: "certifications",
  cursos: "certifications",
  // Idiomas
  idiomas: "languages",
  languages: "languages",
};

// Colunas do Gupy que identificam a vaga (para inferir o cargo do lote)
const JOB_TITLE_COLUMNS = [
  "vaga",
  "cargo",
  "posição",
  "posicao",
  "job",
  "position",
  "nome da vaga",
];
const JOB_DEPT_COLUMNS = ["departamento", "área", "area", "setor", "department"];

type ParsedRow = {
  fullName: string;
  email: string;
  phone?: string;
  experienceYears: number;
  education: string;
  skills: string;
  certifications?: string;
  languages?: string;
  raw: Record<string, unknown>;
};

function normalizeKey(k: string) {
  return k.trim().toLowerCase();
}

export async function parseSpreadsheetToCandidates(file: File, job: Job): Promise<Candidate[]> {
  const wb = await readWorkbook(file);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return rows
    .map((row): Candidate | null => {
      const parsed: ParsedRow = {
        fullName: "",
        email: "",
        experienceYears: 0,
        education: "",
        skills: "",
        raw: row,
      };
      for (const [k, v] of Object.entries(row)) {
        const nk = normalizeKey(k);
        const canonical = FIELD_MAP[nk];
        if (!canonical) continue;
        if (canonical === "experienceYears") {
          const n = Number(String(v).replace(/[^0-9.]/g, ""));
          parsed.experienceYears = Number.isFinite(n) ? n : 0;
        } else {
          (parsed as unknown as Record<string, unknown>)[canonical] = String(v);
        }
      }
      if (!parsed.fullName && !parsed.email) return null;

      const { score, matched, missingRequired, justification } = scoreCandidate(job, parsed);

      return {
        id: uid(),
        jobId: job.id,
        fullName: parsed.fullName || "(sem nome)",
        email: parsed.email,
        phone: parsed.phone,
        experienceYears: parsed.experienceYears,
        education: parsed.education,
        skills: parsed.skills,
        certifications: parsed.certifications,
        languages: parsed.languages,
        raw: parsed.raw,
        score,
        justification,
        matched,
        missingRequired,
        status: "screening",
      };
    })
    .filter((c): c is Candidate => c !== null)
    .sort((a, b) => b.score - a.score);
}

export function isSpreadsheetFile(f: File): boolean {
  return /\.(xlsx|xls|csv|zip)$/i.test(f.name);
}

// Importa um lote Gupy: cria a vaga automaticamente (título vem de colunas
// "Vaga"/"Cargo" ou do nome do arquivo), parseia e pontua todos os candidatos,
// e persiste tudo. Não exige preenchimento manual de critérios — o Gupy já
// filtra profissão/experiência.
export async function importGupyBatch(file: File): Promise<{ job: Job; count: number }> {
  return processGupyFile(file);
}

// Processa vários arquivos (arquivos selecionados ou uma pasta inteira) como
// lotes Gupy distintos. Cada planilha válida vira uma vaga; retorna o resumo.
export async function importGupyFiles(
  files: Iterable<File>,
): Promise<{ jobs: Job[]; total: number }> {
  const valid = Array.from(files).filter(isSpreadsheetFile);
  const jobs: Job[] = [];
  let total = 0;
  for (const f of valid) {
    try {
      const { job, count } = await processGupyFile(f);
      jobs.push(job);
      total += count;
    } catch (e) {
      console.error("Falha ao importar", f.name, e);
    }
  }
  return { jobs, total };
}

async function processGupyFile(file: File): Promise<{ job: Job; count: number }> {
  const wb = await readWorkbook(file);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  // Inferir cargo/departamento a partir das primeiras linhas
  let inferredTitle = "";
  let inferredDept = "";
  for (const row of rows.slice(0, 20)) {
    for (const [k, v] of Object.entries(row)) {
      const nk = normalizeKey(k);
      const val = String(v).trim();
      if (!val) continue;
      if (!inferredTitle && JOB_TITLE_COLUMNS.includes(nk)) inferredTitle = val;
      if (!inferredDept && JOB_DEPT_COLUMNS.includes(nk)) inferredDept = val;
    }
    if (inferredTitle) break;
  }
  if (!inferredTitle) {
    inferredTitle =
      file.name
        .replace(/\.(xlsx|xls|csv|zip)$/i, "")
        .replace(/[_-]+/g, " ")
        .trim() || "Lote Gupy";
  }

  const group = detectProfessionGroup(inferredTitle);
  const job: Job = {
    id: uid(),
    title: inferredTitle,
    department: inferredDept || "Azul",
    description: `Lote importado do Gupy — ${rows.length} aplicação(ões).`,
    minExperience: 0,
    minEducation: "none",
    criteria: [],
    cutoff: 0,
    createdAt: Date.now(),
    profession: group,
    questionnaire: getQuestionnaireForGroup(group),
  };
  saveJob(job);

  const candidates = await parseSpreadsheetToCandidates(file, job);
  replaceJobCandidates(job.id, candidates);
  return { job, count: candidates.length };
}

// Template download for recruiters
export function downloadTemplate() {
  const data = [
    {
      Nome: "Ana Silva",
      Email: "ana@example.com",
      Telefone: "+55 11 90000-0000",
      Experiencia: 5,
      Escolaridade: "Superior",
      Habilidades: "Aeronaves, Manutenção, Inglês, ANAC",
      Certificacoes: "CMS, IATA",
      Idiomas: "Português, Inglês",
    },
    {
      Nome: "Bruno Costa",
      Email: "bruno@example.com",
      Telefone: "+55 21 98888-8888",
      Experiencia: 2,
      Escolaridade: "Técnico",
      Habilidades: "Atendimento, Serviço de bordo, Espanhol",
      Certificacoes: "",
      Idiomas: "Português, Espanhol",
    },
  ];
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Candidatos");
  XLSX.writeFile(wb, "modelo-candidatos-skyhire.xlsx");
}
