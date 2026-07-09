import * as XLSX from "xlsx";
import type { Candidate, Job } from "./skyhire";
import { replaceJobCandidates, saveJob, scoreCandidate, uid } from "./skyhire";

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
  "experiência": "experienceYears",
  "anos de experiencia": "experienceYears",
  "anos de experiência": "experienceYears",
  "tempo de experiência": "experienceYears",
  "tempo de experiencia": "experienceYears",
  experience: "experienceYears",
  "years of experience": "experienceYears",
  // Escolaridade / formação (Gupy usa "Escolaridade" e "Formação Acadêmica")
  escolaridade: "education",
  formacao: "education",
  "formação": "education",
  "formação acadêmica": "education",
  "formacao academica": "education",
  "nível de escolaridade": "education",
  "nivel de escolaridade": "education",
  education: "education",
  // Habilidades / competências (Gupy: "Competências" / "Skills")
  habilidades: "skills",
  competencias: "skills",
  "competências": "skills",
  "competências técnicas": "skills",
  "competencias tecnicas": "skills",
  skills: "skills",
  // Certificações
  certificacoes: "certifications",
  "certificações": "certifications",
  certifications: "certifications",
  cursos: "certifications",
  // Idiomas
  idiomas: "languages",
  languages: "languages",
};

// Colunas do Gupy que identificam a vaga (para inferir o cargo do lote)
const JOB_TITLE_COLUMNS = ["vaga", "cargo", "posição", "posicao", "job", "position", "nome da vaga"];
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

export async function parseSpreadsheetToCandidates(
  file: File,
  job: Job,
): Promise<Candidate[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
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

// Importa um lote Gupy: cria a vaga automaticamente (título vem de colunas
// "Vaga"/"Cargo" ou do nome do arquivo), parseia e pontua todos os candidatos,
// e persiste tudo. Não exige preenchimento manual de critérios — o Gupy já
// filtra profissão/experiência.
export async function importGupyBatch(file: File): Promise<{ job: Job; count: number }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
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
    inferredTitle = file.name.replace(/\.(xlsx|xls|csv)$/i, "").replace(/[_-]+/g, " ").trim() || "Lote Gupy";
  }

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
