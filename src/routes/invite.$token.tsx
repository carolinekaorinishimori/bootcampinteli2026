import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  getCandidateByToken,
  getJob,
  updateCandidate,
  type Candidate,
  type Job,
} from "@/lib/skyhire";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "Questionário da vaga · Azul Talentos" },
      {
        name: "description",
        content:
          "Você foi aprovado(a) na triagem. Responda ao questionário para avançar no processo.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const [candidate, setCandidate] = useState<Candidate | undefined>();
  const [job, setJob] = useState<Job | undefined>();
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState<"intro" | "form" | "done">("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const c = getCandidateByToken(token);
    setCandidate(c);
    if (c) {
      setJob(getJob(c.jobId));
      if (c.status === "answered" && c.answers) setAnswers(c.answers);
    }
  }, [token]);

  if (!candidate || !job) {
    return (
      <AppShell>
        <div className="panel p-10 text-center max-w-lg mx-auto">
          <h1 className="font-display text-2xl font-semibold">Link inválido</h1>
          <p className="text-muted-foreground mt-2">
            Este convite não foi encontrado ou expirou. Fale com o recrutador que enviou o link.
          </p>
        </div>
      </AppShell>
    );
  }

  const questions = job.questionnaire ?? [];

  if (candidate.status === "answered" && step !== "form") {
    return (
      <AppShell>
        <div className="panel p-10 text-center max-w-lg mx-auto">
          <div className="mx-auto h-14 w-14 rounded-full bg-[color:var(--success)]/20 grid place-items-center text-[color:var(--success)] text-2xl">
            ✓
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold">Questionário enviado</h1>
          <p className="text-muted-foreground mt-2">
            Recebemos suas respostas. O time de recrutamento entrará em contato.
          </p>
        </div>
      </AppShell>
    );
  }

  function submit() {
    const filled = questions.every((q) => (answers[q.id] ?? "").trim().length > 0);
    if (!filled) {
      setMissing(true);
      return;
    }
    updateCandidate(candidate!.id, {
      status: "answered",
      answers: { ...answers },
      questionnaireSubmittedAt: Date.now(),
    });
    setStep("done");
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-primary/90">
          Etapa de questionário · {job.department || "Azul Talentos"}
        </div>
        <h1 className="font-display text-4xl font-semibold mt-1">Parabéns, você avançou! ✈</h1>
        <p className="text-muted-foreground mt-2">
          A vaga <b className="text-foreground">{job.title}</b> tem uma etapa de questionário.
          Responda às {questions.length} perguntas abaixo — sem pressa, em texto livre.
        </p>

        {step === "intro" && (
          <div className="panel p-6 mt-8 space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">Sobre o questionário</h2>
              <p className="text-sm text-muted-foreground mt-2">
                São {questions.length} perguntas abertas. Escreva com sinceridade — não há resposta
                certa ou errada, avaliaremos seu raciocínio e experiência.
              </p>
            </div>
            <div className="hairline pt-5 text-xs text-muted-foreground space-y-2">
              <p>
                <b className="text-foreground">Privacidade (LGPD):</b> suas respostas serão usadas
                apenas para avaliação nesta vaga. Você pode solicitar a exclusão a qualquer momento
                pelo email do recrutador.
              </p>
              <label className="flex items-start gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-[color:var(--primary)] h-4 w-4"
                />
                <span>
                  Autorizo o uso destas respostas exclusivamente no processo seletivo desta vaga.
                </span>
              </label>
            </div>
            <div className="flex justify-end">
              <button
                disabled={!consent}
                onClick={() => setStep("form")}
                className="btn-primary btn-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Iniciar questionário
              </button>
            </div>
          </div>
        )}

        {step === "form" && (
          <div className="panel p-6 mt-8 space-y-6">
            {missing && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-sm px-3 py-2">
                Responda todas as perguntas antes de enviar.
              </div>
            )}
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
            <div className="flex justify-between pt-2">
              <button onClick={() => setStep("intro")} className="btn-ghost">
                Voltar
              </button>
              <button onClick={submit} className="btn-primary btn-primary-hover">
                Enviar questionário
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="panel p-10 text-center mt-8">
            <div className="mx-auto h-14 w-14 rounded-full bg-[color:var(--success)]/20 grid place-items-center text-[color:var(--success)] text-2xl">
              ✓
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold">Questionário enviado!</h2>
            <p className="text-muted-foreground mt-2">Boa sorte. O recrutador foi notificado.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
