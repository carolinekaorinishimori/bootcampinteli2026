import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/AppShell";
import { getSession, logout } from "@/lib/auth";
import { getCandidateByJobAndEmail, listJobs, PROFESSIONS, type Job } from "@/lib/skyhire";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Vagas · Azul Talentos" },
      {
        name: "description",
        content: "Área do candidato: escolha a vaga e responda ao questionário.",
      },
    ],
  }),
  component: Apply,
});

function Apply() {
  const navigate = useNavigate();
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate({ to: "/" });
      return;
    }
    if (s.role !== "candidato") {
      navigate({ to: "/dashboard" });
      return;
    }
    setSession(s);
    setJobs(listJobs());
    setReady(true);
  }, [navigate]);

  if (!session || !ready) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link to="/apply" className="flex items-center gap-2.5">
            <LogoMark />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-semibold text-lg tracking-tight">
                Azul Talentos
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Área do candidato
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">
              Olá, {session.name.split(" ")[0]}
            </span>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="btn-ghost text-xs"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-10">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary/90 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Vagas abertas
        </div>
        <h1 className="font-display text-4xl font-semibold leading-tight">
          Escolha a vaga e responda o questionário
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
          Selecione o cargo que deseja se candidatar. Você responderá a um formulário específico da
          vaga — sem necessidade de vídeo. Sua triagem considera apenas mérito (LGPD).
        </p>

        {jobs.length === 0 ? (
          <div className="panel p-10 text-center mt-8">
            <h3 className="font-display text-xl font-semibold">Nenhuma vaga disponível</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              O recrutador ainda não publicou vagas. Volte em breve.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {jobs.map((j) => {
              const profession = PROFESSIONS.find((p) => p.id === j.profession);
              const applied = session.email
                ? getCandidateByJobAndEmail(j.id, session.email)
                : undefined;
              const answered = applied?.status === "answered";
              return (
                <div key={j.id} className="panel p-6 flex flex-col">
                  <div className="text-xs uppercase tracking-widest text-primary/90">
                    {profession?.label ?? j.department ?? "Azul"}
                  </div>
                  <h3 className="mt-1 font-display text-xl font-semibold">{j.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
                    {j.description || "Vaga disponível para candidatura."}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {j.questionnaire?.length ?? 10} perguntas no questionário
                  </div>
                  <Link
                    to="/aplicar/$jobId"
                    params={{ jobId: j.id }}
                    className="btn-primary btn-primary-hover mt-4 text-center"
                  >
                    {answered ? "Editar respostas" : "Responder questionário"}
                  </Link>
                  {answered && (
                    <div className="mt-2 text-center text-xs text-[color:var(--success)]">
                      ✓ Candidatura enviada
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
