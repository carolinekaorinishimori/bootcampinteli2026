import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { listCandidates, listJobs, type Candidate, type Job } from "@/lib/skyhire";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Galeria de vídeos · Azul Talentos" },
      { name: "description", content: "Assista às gravações dos candidatos aprovados na triagem." },
    ],
  }),
  component: Videos,
});

function Videos() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cands, setCands] = useState<Candidate[]>([]);
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [anonymized, setAnonymized] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate({ to: "/" });
      return;
    }
    if (s.role !== "rh") {
      navigate({ to: "/apply" });
      return;
    }
    setJobs(listJobs());
    setCands(listCandidates().filter((c) => c.status === "recorded" && c.videoBlobUrl));
    setReady(true);
  }, [navigate]);

  const jobMap = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);
  const filtered = jobFilter === "all" ? cands : cands.filter((c) => c.jobId === jobFilter);
  const sorted = [...filtered].sort((a, b) => b.score - a.score);

  if (!ready) return null;

  return (
    <AppShell
      actions={
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={anonymized}
            onChange={(e) => setAnonymized(e.target.checked)}
            className="accent-[color:var(--primary)] h-4 w-4"
          />
          Modo cego
        </label>
      }
    >
      <div className="mb-8">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Painel
        </Link>
        <h1 className="mt-2 font-display text-4xl font-semibold">Galeria de vídeos</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Respostas gravadas pelos candidatos aprovados na triagem. Avalie com base na
          comunicação, clareza e alinhamento cultural — sem considerar aparência, sotaque
          regional, gênero ou idade.
        </p>
      </div>

      {jobs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 text-sm">
          <button
            onClick={() => setJobFilter("all")}
            className={`px-3 py-1.5 rounded-md border transition ${
              jobFilter === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas as vagas ({cands.length})
          </button>
          {jobs.map((j) => {
            const count = cands.filter((c) => c.jobId === j.id).length;
            if (count === 0) return null;
            return (
              <button
                key={j.id}
                onClick={() => setJobFilter(j.id)}
                className={`px-3 py-1.5 rounded-md border transition ${
                  jobFilter === j.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {j.title} ({count})
              </button>
            );
          })}
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="panel p-10 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 grid place-items-center text-primary text-2xl">🎬</div>
          <h3 className="mt-4 font-display text-xl font-semibold">Nenhum vídeo ainda</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Quando os candidatos aprovados gravarem seus vídeos, eles aparecerão aqui organizados por vaga.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((c, i) => {
            const job = jobMap.get(c.jobId);
            const name = anonymized ? `Candidato #${(i + 1).toString().padStart(3, "0")}` : c.fullName;
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="panel p-4 text-left group hover:border-primary/50 transition-colors"
              >
                <div className="relative aspect-video rounded-md overflow-hidden bg-black">
                  <video src={c.videoBlobUrl} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 grid place-items-center bg-black/40 group-hover:bg-black/20 transition">
                    <div className="h-11 w-11 rounded-full bg-primary/90 grid place-items-center text-primary-foreground">
                      ▶
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 text-xs bg-black/60 backdrop-blur px-2 py-0.5 rounded-full">
                    {c.score.toFixed(1)}/5
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-widest text-primary/90">
                    {job?.title ?? "Vaga removida"}
                  </div>
                  <div className="font-medium mt-0.5 truncate">{name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {c.videoRecordedAt ? new Date(c.videoRecordedAt).toLocaleString("pt-BR") : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="panel max-w-3xl w-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-primary/90">
                  {jobMap.get(selected.jobId)?.title}
                </div>
                <h3 className="font-display text-xl font-semibold mt-0.5">
                  {anonymized ? `Candidato ·  ${selected.score.toFixed(1)}/5` : selected.fullName}
                </h3>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost text-xs">Fechar ✕</button>
            </div>
            <video src={selected.videoBlobUrl} controls autoPlay className="w-full rounded-lg bg-black aspect-video" />
            <div className="mt-3 rounded-md border border-border bg-surface p-3 text-xs">
              <div className="uppercase tracking-wider text-muted-foreground mb-1">Justificativa da triagem</div>
              <p className="text-foreground/90">{selected.justification}</p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
