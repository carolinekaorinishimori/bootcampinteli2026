import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  getCandidateByJobAndEmail,
  getJob,
  saveCandidates,
  scoreCandidate,
  uid,
  type Candidate,
  type Job,
} from "@/lib/skyhire";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/aplicar/$jobId")({
  head: () => ({
    meta: [
      { title: "Aplicar à vaga · Azul Talentos" },
      {
        name: "description",
        content: "Escolha a vaga e responda ao questionário para se candidatar.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ApplyToJob,
});

function ApplyToJob() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | undefined>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [education, setEducation] = useState<Candidate["education"]>("");
  const [skills, setSkills] = useState("");
  const [consent, setConsent] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [missing, setMissing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "candidato") {
      navigate({ to: "/" });
      return;
    }
    setName(s.name);
    setEmail(s.email ?? "");
    const j = getJob(jobId);
    setJob(j);
    if (j) {
      const existing = s.email ? getCandidateByJobAndEmail(j.id, s.email) : undefined;
      if (existing) {
        setName(existing.fullName);
        setEmail(existing.email);
        setExperienceYears(existing.experienceYears);
        setEducation(existing.education);
        setSkills(existing.skills);
        if (existing.answers) setAnswers(existing.answers);
        if (existing.status === "answered") setDone(true);
      }
    }
  }, [jobId, navigate]);

  if (!job) {
    return (
      <AppShell>
        <div className="panel p-10 text-center max-w-lg mx-auto">
          <h1 className="font-display text-2xl font-semibold">Vaga não encontrada</h1>
          <p className="text-muted-foreground mt-2">
            Esta vaga pode ter sido removida pelo recrutador.
          </p>
          <Link to="/apply" className="btn-primary btn-primary-hover inline-block mt-4">
            Voltar
          </Link>
        </div>
      </AppShell>
    );
  }

  const questions = job.questionnaire ?? [];

  function submit() {
    if (!name.trim() || !email.trim()) {
      setMissing(true);
      return;
    }
    const filled = questions.every((q) => (answers[q.id] ?? "").trim().length > 0);
    if (!filled || !consent) {
      setMissing(true);
      return;
    }
    const existing = getCandidateByJobAndEmail(job!.id, email);
    const parsed = {
      fullName: name.trim(),
      email: email.trim(),
      experienceYears,
      education,
      skills,
      certifications: "",
      languages: "",
      raw: {},
      answers,
    };
    const { score, matched, missingRequired, justification } = scoreCandidate(job!, parsed);
    const candidate: Candidate = existing
      ? {
          ...existing,
          fullName: name.trim(),
          email: email.trim(),
          experienceYears,
          education,
          skills,
          certifications: "",
          languages: "",
          score,
          matched,
          missingRequired,
          justification,
          status: "answered",
          answers: { ...answers },
          questionnaireSubmittedAt: Date.now(),
        }
      : {
          id: uid(),
          jobId: job!.id,
          fullName: name.trim(),
          email: email.trim(),
          experienceYears,
          education,
          skills,
          certifications: "",
          languages: "",
          raw: {},
          score,
          matched,
          missingRequired,
          justification,
          status: "answered",
          answers: { ...answers },
          questionnaireSubmittedAt: Date.now(),
        };
    saveCandidates([candidate]);
    setDone(true);
  }

  if (done) {
    return (
      <AppShell>
        <div className="panel p-10 text-center max-w-lg mx-auto">
          <div className="mx-auto h-14 w-14 rounded-full bg-[color:var(--success)]/20 grid place-items-center text-[color:var(--success)] text-2xl">
            ✓
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold">Candidatura enviada!</h1>
          <p className="text-muted-foreground mt-2">
            Recebemos suas respostas para a vaga <b className="text-foreground">{job.title}</b>. O
            time de recrutamento entrará em contato.
          </p>
          <div className="flex justify-center gap-2 mt-6">
            <Link to="/apply" className="btn-primary btn-primary-hover">
              Ver minhas vagas
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <Link to="/apply" className="text-sm text-muted-foreground hover:text-foreground">
          ← Voltar
        </Link>
        <div className="text-xs uppercase tracking-widest text-primary/90 mt-4">
          {job.department || "Azul Talentos"}
        </div>
        <h1 className="font-display text-4xl font-semibold mt-1">Candidatar-se: {job.title}</h1>
        <p className="text-muted-foreground mt-2">
          Conte um pouco sobre você e responda ao questionário da vaga. As respostas são usadas
          apenas para avaliação neste processo (LGPD).
        </p>

        {missing && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-sm px-3 py-2 mt-6">
            Preencha nome, e-mail, todas as perguntas e o consentimento antes de enviar.
          </div>
        )}

        <div className="panel p-6 mt-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Nome completo
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input mt-1.5 w-full"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1.5 w-full"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Experiência (anos)
              </span>
              <input
                type="number"
                min={0}
                max={50}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="input mt-1.5 w-full"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Escolaridade
              </span>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="input mt-1.5 w-full"
              >
                <option value="">Não informada</option>
                <option value="medio">Ensino Médio</option>
                <option value="tecnico">Técnico</option>
                <option value="superior">Superior</option>
                <option value="pos">Pós-graduação</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Competências (palavras separadas por vírgula)
            </span>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Ex.: liderança, scrum, excel"
              className="input mt-1.5 w-full"
            />
          </label>
        </div>

        <div className="panel p-6 mt-5 space-y-6">
          <h2 className="font-display text-xl font-semibold">
            Questionário ({questions.length} perguntas)
          </h2>
          {questions.map((q, i) => (
            <div key={q.id}>
              <label className="text-sm font-medium flex gap-2">
                <span className="text-primary/80">{i + 1}.</span>
                <span>{q.prompt}</span>
              </label>
              <textarea
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                rows={4}
                className="input resize-none mt-2 w-full"
                placeholder="Escreva sua resposta aqui…"
              />
            </div>
          ))}
          <label className="flex items-start gap-2 cursor-pointer text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 accent-[color:var(--primary)] h-4 w-4"
            />
            <span>
              Autorizo o uso destas informações e respostas exclusivamente no processo seletivo
              desta vaga.
            </span>
          </label>
          <div className="flex justify-end">
            <button onClick={submit} className="btn-primary btn-primary-hover">
              Enviar candidatura
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
