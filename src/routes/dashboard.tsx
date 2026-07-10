import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell, Stat } from "@/components/AppShell";
import {
  deleteJob,
  listCandidates,
  listJobs,
  shortlistIds,
  SHORTLIST_PCT,
  type Job,
} from "@/lib/skyhire";
import { importGupyFiles, isSpreadsheetFile } from "@/lib/spreadsheet";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel do RH · Azul Talentos" },
      { name: "description", content: "Importe lotes do Gupy e acompanhe a triagem." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

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
    setHydrated(true);
  }, [navigate]);

  const totalCands = hydrated ? listCandidates().length : 0;
  const selectedCount = hydrated
    ? jobs.reduce((acc, j) => acc + shortlistIds(j, listCandidates(j.id)).size, 0)
    : 0;

  async function handleFiles(files: File[]) {
    const valid = files.filter(isSpreadsheetFile);
    if (valid.length === 0) {
      alert("Nenhum arquivo de planilha (.xlsx, .csv ou .zip) encontrado.");
      return;
    }
    setBusy(true);
    try {
      const { jobs: imported, total } = await importGupyFiles(valid);
      const withCands = imported.filter((j) => listCandidates(j.id).length > 0);
      if (total === 0) {
        alert(
          "Nenhum candidato encontrado. Confirme se as planilhas exportadas do Gupy contêm colunas como Nome, Email, Experiência, Escolaridade e Competências.",
        );
        setJobs(listJobs());
        return;
      }
      if (imported.length === 1) {
        navigate({ to: "/jobs/$jobId", params: { jobId: imported[0].id } });
        return;
      }
      setJobs(listJobs());
      alert(`${imported.length} lotes importados (${total} candidatos no total).`);
    } catch (e) {
      console.error(e);
      alert("Não foi possível ler a planilha. Use .xlsx, .csv ou um .zip contendo a planilha.");
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) return null;

  return (
    <AppShell
      actions={
        <div className="flex items-center gap-2">
          <label className="btn-primary btn-primary-hover text-sm cursor-pointer">
            {busy ? "Analisando…" : "+ Importar lote(s)"}
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv,.zip"
              multiple
              className="hidden"
              onChange={(e) => {
                const f = e.target.files ? Array.from(e.target.files) : [];
                if (f.length) handleFiles(f);
                e.currentTarget.value = "";
              }}
            />
          </label>
          <label
            className="btn-ghost text-sm cursor-pointer"
            title="Importar uma pasta inteira de planilhas"
          >
            📁 Pasta
            <input
              ref={folderRef}
              type="file"
              accept=".xlsx,.xls,.csv,.zip"
              multiple
              {...{ webkitdirectory: "", directory: "" }}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files ? Array.from(e.target.files) : [];
                if (f.length) handleFiles(f);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>
      }
    >
      <section className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-end mb-12">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary/90 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Painel Azul Talentos
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
            Triagem <span className="text-primary">justa</span> e ágil
            <br />
            para a Azul Linhas Aéreas.
          </h1>
          <p className="mt-5 text-muted-foreground text-lg max-w-xl">
            Anexe a planilha exportada do Gupy — o Azul Talentos pontua cada candidato pelo perfil e
            valores da Azul e seleciona automaticamente o top {Math.round(SHORTLIST_PCT * 100)}%
            para a etapa de vídeo.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Lotes" value={jobs.length} />
          <Stat label="Candidatos" value={totalCands} tone="primary" />
          <Stat label="Selecionados" value={selectedCount} tone="success" />
        </div>
      </section>

      <section className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold">Seus lotes</h2>
        <span className="text-xs text-muted-foreground">
          Ordenados por importação · dados locais
        </span>
      </section>

      {jobs.length === 0 ? (
        <EmptyState onImport={() => fileRef.current?.click()} busy={busy} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((j) => {
            const cands = listCandidates(j.id);
            const selected = shortlistIds(j, cands).size;
            return (
              <Link
                key={j.id}
                to="/jobs/$jobId"
                params={{ jobId: j.id }}
                className="panel p-6 group hover:border-primary/50 transition-colors relative overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition" />
                <div className="relative">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {j.department || "Azul"}
                  </div>
                  <h3 className="mt-1 font-display text-xl font-semibold">{j.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {j.description || "Lote importado do Gupy."}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-xs">
                    <div className="flex gap-4">
                      <span>
                        <b className="text-foreground">{cands.length}</b>{" "}
                        <span className="text-muted-foreground">candidatos</span>
                      </span>
                      <span>
                        <b className="text-[color:var(--success)]">{selected}</b>{" "}
                        <span className="text-muted-foreground">selecionados</span>
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      top {Math.round(SHORTLIST_PCT * 100)}%
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm(`Excluir o lote "${j.title}"?`)) {
                        deleteJob(j.id);
                        setJobs(listJobs());
                      }
                    }}
                    className="absolute top-4 right-4 text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition"
                  >
                    excluir
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function EmptyState({ onImport, busy }: { onImport: () => void; busy: boolean }) {
  return (
    <div className="panel p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-full bg-primary/15 grid place-items-center text-primary text-2xl">
        ✦
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold">Anexe seu primeiro lote do Gupy</h3>
      <p className="mt-2 text-muted-foreground max-w-md mx-auto text-sm">
        Exporte as aplicações da vaga no Gupy (500+ candidatos suportados) e envie a planilha aqui.
        O Azul Talentos pontua cada perfil pelos valores da Azul e mantém apenas o top{" "}
        {Math.round(SHORTLIST_PCT * 100)}%.
      </p>
      <button
        onClick={onImport}
        disabled={busy}
        className="btn-primary btn-primary-hover mt-6 disabled:opacity-40"
      >
        {busy ? "Analisando lote…" : "Enviar planilha Gupy"}
      </button>
    </div>
  );
}
