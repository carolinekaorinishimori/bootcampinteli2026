// Local storage-backed data layer for the SkyHire triage platform.
// LGPD: dados armazenados apenas no dispositivo do recrutador (localStorage).

export type Criterion = {
  id: string;
  label: string;
  keywords: string; // comma-separated
  weight: number; // 1-10
  required: boolean;
};

export type Job = {
  id: string;
  title: string;
  department: string;
  description: string;
  minExperience: number; // years
  minEducation: "none" | "medio" | "tecnico" | "superior" | "pos";
  criteria: Criterion[];
  cutoff: number; // 0-5 (nota mínima para aprovação)
  createdAt: number;
};

export type Candidate = {
  id: string;
  jobId: string;
  // Anonymizable identity — hidden from ranking view by default
  fullName: string;
  email: string;
  phone?: string;
  // Merit data
  experienceYears: number;
  education: string;
  skills: string; // free text / comma-separated
  certifications?: string;
  languages?: string;
  raw: Record<string, unknown>;
  score: number; // 0.0 – 5.0
  matched: string[]; // matched criteria labels
  missingRequired: string[];
  justification: string; // texto explicando a nota (auditável / antiviés)
  status: "screening" | "approved" | "rejected" | "invited" | "recorded";
  inviteToken?: string;
  videoBlobUrl?: string;
  videoRecordedAt?: number;
};

const K_JOBS = "skyhire.jobs.v1";
const K_CANDS = "skyhire.candidates.v1";

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(v));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// --- Jobs ---
export function listJobs(): Job[] {
  return read<Job[]>(K_JOBS, []).sort((a, b) => b.createdAt - a.createdAt);
}
export function getJob(id: string): Job | undefined {
  return listJobs().find((j) => j.id === id);
}
export function saveJob(job: Job) {
  const all = read<Job[]>(K_JOBS, []);
  const idx = all.findIndex((j) => j.id === job.id);
  if (idx >= 0) all[idx] = job;
  else all.push(job);
  write(K_JOBS, all);
}
export function deleteJob(id: string) {
  write(
    K_JOBS,
    read<Job[]>(K_JOBS, []).filter((j) => j.id !== id),
  );
  write(
    K_CANDS,
    read<Candidate[]>(K_CANDS, []).filter((c) => c.jobId !== id),
  );
}

// --- Candidates ---
export function listCandidates(jobId?: string): Candidate[] {
  const all = read<Candidate[]>(K_CANDS, []);
  return jobId ? all.filter((c) => c.jobId === jobId) : all;
}
export function getCandidateByToken(token: string): Candidate | undefined {
  return read<Candidate[]>(K_CANDS, []).find((c) => c.inviteToken === token);
}
export function getCandidateByEmail(email: string): Candidate | undefined {
  const e = email.trim().toLowerCase();
  return read<Candidate[]>(K_CANDS, []).find(
    (c) => c.email.trim().toLowerCase() === e,
  );
}
export function saveCandidates(candidates: Candidate[]) {
  const all = read<Candidate[]>(K_CANDS, []);
  const map = new Map(all.map((c) => [c.id, c]));
  for (const c of candidates) map.set(c.id, c);
  write(K_CANDS, Array.from(map.values()));
}
export function replaceJobCandidates(jobId: string, candidates: Candidate[]) {
  const others = read<Candidate[]>(K_CANDS, []).filter((c) => c.jobId !== jobId);
  write(K_CANDS, [...others, ...candidates]);
}
export function updateCandidate(id: string, patch: Partial<Candidate>) {
  const all = read<Candidate[]>(K_CANDS, []);
  const idx = all.findIndex((c) => c.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...patch };
    write(K_CANDS, all);
  }
}

// --- Scoring engine ---
// Fair scoring: only considers merit fields. Ignores name, email, phone, age, gender.
const EDU_RANK: Record<string, number> = {
  none: 0,
  medio: 1,
  tecnico: 2,
  superior: 3,
  pos: 4,
};

export function scoreCandidate(
  job: Job,
  cand: Omit<Candidate, "score" | "matched" | "missingRequired" | "justification" | "status" | "id" | "jobId">,
) {
  const haystack = [cand.skills, cand.certifications ?? "", cand.languages ?? "", cand.education]
    .join(" ")
    .toLowerCase();

  const matched: string[] = [];
  const missingRequired: string[] = [];
  let earned = 0;
  let total = 0;

  for (const c of job.criteria) {
    total += c.weight;
    const kws = c.keywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    const hit = kws.some((k) => haystack.includes(k));
    if (hit) {
      earned += c.weight;
      matched.push(c.label);
    } else if (c.required) {
      missingRequired.push(c.label);
    }
  }

  // Experiência: escala 0-1 relativa ao mínimo da vaga
  const expScore = Math.min(1, cand.experienceYears / Math.max(1, job.minExperience || 1));
  const eduOk = EDU_RANK[normalizeEducation(cand.education)] >= EDU_RANK[job.minEducation];

  // Nota 0–5: 80% critérios ponderados + 20% experiência
  const criteriaFrac = total > 0 ? earned / total : 0.8;
  let raw = criteriaFrac * 4 + expScore * 1; // 0..5

  if (!eduOk) {
    raw = raw * 0.5;
    missingRequired.push("Escolaridade mínima");
  }
  if (cand.experienceYears < job.minExperience) {
    missingRequired.push(`Experiência mínima (${job.minExperience} anos)`);
  }

  const baseScore = Math.round(Math.max(0, Math.min(5, raw)) * 10) / 10;

  // Bônus de fit cultural Azul (valores da companhia) — teto de +0.3 na nota
  const azulHits = AZUL_VALUE_KEYWORDS.filter((k) => haystack.includes(k));
  const cultureBonus = Math.min(0.3, azulHits.length * 0.08);
  const score = Math.round(Math.min(5, baseScore + cultureBonus) * 10) / 10;

  // Justificativa auditável — apenas critérios de mérito (LGPD/antiviés)
  const parts: string[] = [];
  parts.push(
    total > 0
      ? `Atendeu ${matched.length} de ${job.criteria.length} critérios (${Math.round(criteriaFrac * 100)}% do peso)`
      : `Sem critérios definidos`,
  );
  parts.push(`${cand.experienceYears} anos de experiência (mín. ${job.minExperience})`);
  parts.push(`Formação: ${cand.education || "não informada"}${eduOk ? "" : " — abaixo do mínimo"}`);
  if (azulHits.length)
    parts.push(
      `Fit cultural Azul: ${azulHits.slice(0, 4).join(", ")}${azulHits.length > 4 ? "…" : ""} (+${cultureBonus.toFixed(2)})`,
    );
  if (missingRequired.length) parts.push(`Requisitos ausentes: ${missingRequired.join(", ")}`);
  const justification = parts.join(" · ");

  return { score, matched, missingRequired, justification };
}

// Valores e código de cultura da Azul Linhas Aéreas — usados como bônus de fit,
// nunca como corte eliminatório (para preservar mérito e LGPD).
export const AZUL_VALUE_KEYWORDS = [
  "paixão", "paixao",
  "cliente", "hospitalidade", "atendimento",
  "segurança", "seguranca",
  "inovação", "inovacao", "criatividade",
  "excelência", "excelencia", "qualidade",
  "integridade", "ética", "etica",
  "trabalho em equipe", "colaboração", "colaboracao", "equipe",
  "resultado", "protagonismo", "iniciativa",
  "diversidade", "inclusão", "inclusao",
];

// Shortlist — top 10% (mín. 1) entre os que passam do corte. Usado para lotes
// grandes (planilhas Gupy, 500+ aplicações).
export const SHORTLIST_PCT = 0.1;

export function shortlistIds(
  job: Job,
  candidates: Candidate[],
  pct = SHORTLIST_PCT,
): Set<string> {
  const eligible = candidates
    .filter((c) => passesCutoff(job, c))
    .sort((a, b) => b.score - a.score);
  const n = Math.max(1, Math.ceil(candidates.length * pct));
  return new Set(eligible.slice(0, n).map((c) => c.id));
}

export function normalizeEducation(raw: string): string {
  const s = (raw || "").toLowerCase();
  if (/pós|pos|mestrado|doutorado|mba/.test(s)) return "pos";
  if (/superior|graduação|graduacao|bacharel|licenciatura|engenharia|universidade/.test(s))
    return "superior";
  if (/técnico|tecnico|tecnólogo|tecnologo/.test(s)) return "tecnico";
  if (/médio|medio|ensino médio|colegial/.test(s)) return "medio";
  return "none";
}

export function passesCutoff(job: Job, c: Candidate): boolean {
  return c.score >= job.cutoff && c.missingRequired.length === 0;
}
