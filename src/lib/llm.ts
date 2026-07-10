// Integração com OpenAI feita diretamente do navegador (lado do recrutador).
// A chave fica em import.meta.env.VITE_OPENAI_API_KEY ou em localStorage
// (preenchida via UI), nunca é enviada a servidores próprios — apenas à OpenAI.
//
// AVISO: chamar a OpenAI direto do cliente expõe a chave no navegador. Use
// apenas em ambiente controlado/demo. Para produção, prefira um proxy de
// servidor (Nitro/edge function) que mantenha a chave oculta.

export type AIRecommendation = "avancar" | "revisar" | "descartar";

export type AIAnalysis = {
  score: number; // 0.0 – 5.0 (revisão da nota com base nas respostas)
  summary: string; // 2-4 frases em português
  strengths: string[];
  weaknesses: string[];
  recommendation: AIRecommendation;
  confidence: number; // 0.0 – 1.0
  perQuestion: { id: string; observation: string }[];
  model: string;
  createdAt: number;
};

const LS_KEY = "skyhire.openai.key";
const LS_MODEL = "skyhire.openai.model";

type ImportMetaEnv = {
  env?: {
    VITE_OPENAI_API_KEY?: string;
    VITE_OPENAI_MODEL?: string;
  };
};

export function getOpenAIKey(): string {
  const envKey = (import.meta as ImportMetaEnv)?.env?.VITE_OPENAI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(LS_KEY)?.trim() ?? "";
  }
  return "";
}

export function getOpenAIModel(): string {
  const envModel = (import.meta as ImportMetaEnv)?.env?.VITE_OPENAI_MODEL;
  if (envModel && envModel.trim()) return envModel.trim();
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(LS_MODEL)?.trim() || "gpt-4o-mini";
  }
  return "gpt-4o-mini";
}

export function setOpenAIConfig(key: string, model: string) {
  if (typeof window === "undefined") return;
  if (key.trim()) window.localStorage.setItem(LS_KEY, key.trim());
  if (model.trim()) window.localStorage.setItem(LS_MODEL, model.trim());
}

export function isOpenAIConfigured(): boolean {
  return getOpenAIKey().length > 0;
}

const SYSTEM_PROMPT = `Você é um analista de triagem de RH da Azul Talentos, especializado em avaliar respostas de questionários de candidatos de forma justa, baseada em mérito e livre de viés (LGPD). Você NUNCA considera nome, gênero, idade, origem, religião ou aparência — apenas o conteúdo das respostas, a aderência à vaga e aos critérios informados. Responda sempre em português do Brasil e devolva SOMENTE um objeto JSON válido, sem texto adicional, com a seguinte estrutura:
{
  "score": number (0.0 a 5.0),
  "summary": string (2 a 4 frases),
  "strengths": string[] (3 a 5 pontos fortes observados nas respostas),
  "weaknesses": string[] (2 a 4 fragilidades ou lacunas),
  "recommendation": "avancar" | "revisar" | "descartar",
  "confidence": number (0.0 a 1.0),
  "perQuestion": [{ "id": string, "observation": string }]
}
Recomende "avancar" para perfis aderentes e com evidências concretas; "revisar" para casos com potencial mas respostas incompletas; "descartar" para ausência de aderência ou evidências.`;

function buildUserPrompt(
  job: {
    title: string;
    department?: string;
    minExperience?: number;
    minEducation?: string;
    criteria: { label: string; keywords: string; required: boolean }[];
  },
  candidate: {
    experienceYears?: number;
    education?: string;
    skills?: string;
    answers?: Record<string, string>;
  },
  questions: { id: string; prompt: string }[],
): string {
  const criteria = (job.criteria ?? [])
    .map(
      (c, i) =>
        `${i + 1}. ${c.label} (requisito obrigatório: ${c.required ? "sim" : "não"}) — palavras-chave: ${c.keywords || "—"}`,
    )
    .join("\n");

  const qa = questions
    .map((q) => {
      const a = (candidate.answers?.[q.id] ?? "").trim();
      return `Pergunta: ${q.prompt}\nResposta: ${a || "(em branco)"}`;
    })
    .join("\n\n");

  return `VAGA
Título: ${job.title}
Área: ${job.department || "—"}
Experiência mínima exigida: ${job.minExperience ?? 0} anos
Escolaridade mínima: ${job.minEducation || "não informada"}
Critérios da vaga:
${criteria || "(nenhum critério definido)"}

CANDIDATO (dados de mérito)
Experiência declarada: ${candidate.experienceYears ?? 0} anos
Escolaridade: ${candidate.education || "não informada"}
Competências declaradas: ${candidate.skills || "—"}

RESPOSTAS DO QUESTIONÁRIO
${qa}

Avalie as respostas e devolva o JSON conforme instruído.`;
}

export async function analyzeCandidate(
  job: {
    title: string;
    department?: string;
    minExperience?: number;
    minEducation?: string;
    criteria: { label: string; keywords: string; required: boolean }[];
  },
  candidate: {
    id: string;
    experienceYears?: number;
    education?: string;
    skills?: string;
    answers?: Record<string, string>;
  },
  questions: { id: string; prompt: string }[],
): Promise<AIAnalysis> {
  const key = getOpenAIKey();
  const model = getOpenAIModel();
  if (!key) throw new Error("Chave da OpenAI não configurada.");

  const userPrompt = buildUserPrompt(job, candidate, questions);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const err = await res.json();
      detail = err?.error?.message || JSON.stringify(err);
    } catch {
      detail = await res.text();
    }
    throw new Error(`OpenAI ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as Record<string, unknown>;

  const score = clamp(Number(parsed.score) || 0, 0, 5);
  const confidence = clamp(Number(parsed.confidence) || 0.5, 0, 1);

  const recommendation: AIRecommendation =
    parsed.recommendation === "avancar" ||
    parsed.recommendation === "revisar" ||
    parsed.recommendation === "descartar"
      ? parsed.recommendation
      : "revisar";

  const perQuestion: { id: string; observation: string }[] = Array.isArray(parsed.perQuestion)
    ? parsed.perQuestion
        .filter(
          (p: unknown): p is { id: string; observation?: unknown } =>
            !!p && typeof p === "object" && typeof (p as { id?: unknown }).id === "string",
        )
        .map((p) => ({ id: p.id, observation: String(p.observation ?? "") }))
    : [];

  return {
    score: Math.round(score * 10) / 10,
    summary: String(parsed.summary ?? ""),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [],
    recommendation,
    confidence: Math.round(confidence * 100) / 100,
    perQuestion,
    model,
    createdAt: Date.now(),
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
