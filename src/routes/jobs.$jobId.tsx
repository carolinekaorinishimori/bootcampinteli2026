import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell, Stat } from "@/components/AppShell";
import {
  getJob,
  listCandidates,
  passesCutoff,
  replaceJobCandidates,
  shortlistIds,
  SHORTLIST_PCT,
  uid,
  updateCandidate,
  type Candidate,
  type Job,
} from "@/lib/skyhire";
import { downloadTemplate, parseSpreadsheetToCandidates } from "@/lib/spreadsheet";

export const Route = createFileRoute("/jobs/$jobId")({
  component: JobDetail,
});

function JobDetail() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | undefined>();
  const [cands, setCands] = useState<Candidate[]>([]);
  const [anonymized, setAnonymized] = useState(true);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "shortlist" | "rejected">("all");

  function refresh() {
    const j = getJob(jobId);
    setJob(j);
    setCands(listCandidates(jobId).sort((a, b) => b.score - a.score));
  }

  useEffect(() => {
    refresh();
  }, [jobId]);

  const shortlist = useMemo(
    () => (job ? shortlistIds(job, cands) : new Set<string>()),
    [job, cands],
  );

  const stats = useMemo(() => {
    if (!job) return { total: 0, shortlisted: 0, rejected: 0, avg: 0, invited: 0, recorded: 0, passing: 0 };
    const passing = cands.filter((c) => passesCutoff(job, c)).length;
    const avg = cands.length ? cands.reduce((a, c) => a + c.score, 0) / cands.length : 0;
    return {
      total: cands.length,
      shortlisted: shortlist.size,
      rejected: cands.length - shortlist.size,
      passing,
      avg,
      invited: cands.filter((c) => c.status === "invited" || c.status === "recorded").length,
      recorded: cands.filter((c) => c.status === "recorded").length,
    };
  }, [job, cands, shortlist]);

  if (!job) {
    return (
      <AppShell>
        <div className="panel p-10 text-center">
          <p className="text-muted-foreground">Vaga não encontrada.</p>
          <Link to="/dashboard" className="btn-primary btn-primary-hover inline-block mt-4">
            Voltar
          </Link>
        </div>
      </AppShell>
    );
  }

  async function handleFile(f: File) {
    if (!job) return;
    setBusy(true);
    try {
      const parsed = await parseSpreadsheetToCandidates(f, job);
      if (parsed.length === 0) {
        alert("Nenhum candidato encontrado. Verifique se a planilha tem colunas como Nome, Email, Experiencia, Escolaridade, Habilidades.");
      } else {
        replaceJobCandidates(job.id, parsed);
        refresh();
      }
    } catch (e) {
      console.error(e);
      alert("Não foi possível ler a planilha. Use .xlsx ou .csv.");
    } finally {
      setBusy(false);
    }
  }

  function inviteApproved() {
    if (!job) return;
    const list = cands.map((c) => {
      if (shortlist.has(c.id) && !c.inviteToken) {
        return { ...c, inviteToken: uid(), status: "invited" as const };
      }
      return c;
    });
    replaceJobCandidates(job.id, list);
    refresh();
  }

  const filtered = cands.filter((c) => {
    if (filter === "shortlist") return shortlist.has(c.id);
    if (filter === "rejected") return !shortlist.has(c.id);
    return true;
  });

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
          Modo cego (antiviés)
        </label>
      }
    >
      <div className="mb-6">
        <button onClick={() => navigate({ to: "/dashboard" })} className="text-sm text-muted-foreground hover:text-foreground">
          ← Todas as vagas
        </button>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary/90">{job.department || "Aviação"}</div>
            <h1 className="font-display text-4xl font-semibold mt-1">{job.title}</h1>
            {job.description && <p className="text-muted-foreground mt-2 max-w-2xl">{job.description}</p>}
          </div>
          <div className="text-xs text-muted-foreground text-right">
            <div>Nota de corte: <b className="text-foreground">{job.cutoff.toFixed(1)} / 5</b></div>
            <div>Exp. mínima: <b className="text-foreground">{job.minExperience} anos</b></div>
            <div>{job.criteria.length} critérios ponderados</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-8">
        <Stat label="Candidatos" value={stats.total} />
        <Stat label={`Selecionados (top ${Math.round(SHORTLIST_PCT * 100)}%)`} value={stats.shortlisted} tone="success" />
        <Stat label="Descartados" value={stats.rejected} tone="warning" />
        <Stat label="Nota média" value={`${stats.avg.toFixed(1)}/5`} tone="primary" />
      </div>

      {/* Upload panel */}
      <div className="panel p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Importar planilha de candidatos (lote Gupy)</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-lg">
              Envie .xlsx ou .csv exportado do Gupy (500+ aplicações suportadas). A triagem pontua cada
              candidato de 0–5 pelos critérios da vaga + fit cultural Azul, e seleciona automaticamente o
              top {Math.round(SHORTLIST_PCT * 100)}% para a etapa de vídeo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadTemplate} className="btn-ghost text-sm">Baixar modelo</button>
            <label className="btn-primary btn-primary-hover text-sm cursor-pointer">
              {busy ? "Analisando…" : cands.length ? "Substituir planilha" : "Enviar planilha"}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {cands.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border text-sm">
              {(["all", "shortlist", "rejected"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`px-3 py-1.5 rounded-md transition ${
                    filter === k ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {k === "all"
                    ? `Todos (${stats.total})`
                    : k === "shortlist"
                      ? `Selecionados (${stats.shortlisted})`
                      : `Descartados (${stats.rejected})`}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={inviteApproved}
                disabled={stats.shortlisted === 0}
                className="btn-primary btn-primary-hover text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Convidar selecionados para vídeo ({stats.shortlisted})
              </button>
            </div>
          </div>

          <div className="panel divide-y divide-border overflow-hidden">
            {filtered.map((c, idx) => (
              <CandidateRow
                key={c.id}
                candidate={c}
                job={job}
                rank={idx + 1}
                anonymized={anonymized}
                shortlisted={shortlist.has(c.id)}
                onRefresh={refresh}
              />
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">Nenhum candidato neste filtro.</div>
            )}
          </div>
        </>
      )}

      <p className="mt-8 text-xs text-muted-foreground max-w-2xl">
        <b>LGPD & antiviés:</b> a triagem considera apenas dados de mérito (experiência, formação,
        competências e certificações). Nome e contatos ficam ocultos por padrão. Dados ficam
        armazenados no navegador do recrutador — nunca envie planilhas com dados sensíveis
        (idade, gênero, foto, estado civil).
      </p>
    </AppShell>
  );
}

function CandidateRow({
  candidate,
  job,
  rank,
  anonymized,
  shortlisted,
  onRefresh,
}: {
  candidate: Candidate;
  job: Job;
  rank: number;
  anonymized: boolean;
  shortlisted: boolean;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const approved = shortlisted;
  const displayName = anonymized ? `Candidato #${rank.toString().padStart(3, "0")}` : candidate.fullName;

  const inviteUrl = candidate.inviteToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${candidate.inviteToken}`
    : "";

  function copyInvite() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => alert("Link copiado:\n" + inviteUrl));
  }

  function sendEmail() {
    // Convite por e-mail (mailto). Substituível por integração SMTP/SendGrid no backend.
    const token = candidate.inviteToken ?? uid();
    if (!candidate.inviteToken) {
      updateCandidate(candidate.id, { inviteToken: token, status: "invited" });
      onRefresh();
    }
    const url = `${window.location.origin}/invite/${token}`;
    const subject = encodeURIComponent(`Etapa em vídeo — ${job.title}`);
    const body = encodeURIComponent(
      `Olá,\n\nVocê avançou para a etapa em vídeo da vaga "${job.title}".\n` +
        `Acesse o link abaixo para gravar suas respostas (até 2 min):\n\n${url}\n\n` +
        `Este link é pessoal e intransferível. Ao acessar, você poderá revisar o consentimento LGPD.\n\n` +
        `Equipe de Recrutamento — Azul Talentos`,
    );
    window.location.href = `mailto:${candidate.email}?subject=${subject}&body=${body}`;
  }

  function generateInvite() {
    updateCandidate(candidate.id, { inviteToken: uid(), status: "invited" });
    onRefresh();
  }

  return (
    <div className="p-4 md:p-5">
      <div className="flex items-center gap-4">
        <div className="text-xs font-mono text-muted-foreground w-8 text-center">#{rank}</div>
        <ScoreDial value={candidate.score} approved={approved} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{displayName}</span>
            <StatusPill status={candidate.status} approved={approved} />
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            {candidate.experienceYears} anos · {candidate.education || "sem escolaridade"} ·{" "}
            {candidate.matched.length}/{job.criteria.length} critérios
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {candidate.status === "recorded" && candidate.videoBlobUrl && (
            <a href={candidate.videoBlobUrl} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
              ▶ Ver vídeo
            </a>
          )}
          {approved && !candidate.inviteToken && (
            <button onClick={generateInvite} className="btn-primary btn-primary-hover text-xs">
              Gerar convite
            </button>
          )}
          {approved && candidate.email && (
            <button onClick={sendEmail} className="btn-ghost text-xs" title={`Enviar e-mail para ${candidate.email}`}>
              ✉ Enviar e-mail
            </button>
          )}
          {candidate.inviteToken && (
            <button onClick={copyInvite} className="btn-ghost text-xs">
              Copiar link
            </button>
          )}
          <button onClick={() => setOpen(!open)} className="btn-ghost text-xs">
            {open ? "Ocultar" : "Detalhes"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-4 text-sm">
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Justificativa da nota (auditável)</div>
            <p className="text-foreground/90 text-xs leading-relaxed">{candidate.justification}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Critérios atendidos</div>
            <div className="flex flex-wrap gap-1.5">
              {candidate.matched.length === 0 && <span className="text-muted-foreground text-xs">Nenhum.</span>}
              {candidate.matched.map((m) => (
                <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)] border border-[color:var(--success)]/30">
                  ✓ {m}
                </span>
              ))}
            </div>
            {candidate.missingRequired.length > 0 && (
              <>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-3 mb-1.5">Requisitos ausentes</div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.missingRequired.map((m) => (
                    <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
                      ✗ {m}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="space-y-1.5 text-xs">
            {!anonymized && (
              <>
                <Row k="Email" v={candidate.email} />
                <Row k="Telefone" v={candidate.phone || "—"} />
              </>
            )}
            <Row k="Competências" v={candidate.skills || "—"} />
            <Row k="Certificações" v={candidate.certifications || "—"} />
            <Row k="Idiomas" v={candidate.languages || "—"} />
            <Row k="Formação" v={candidate.education || "—"} />
          </div>
          <div className="md:hidden flex flex-wrap gap-2">
            {approved && !candidate.inviteToken && (
              <button onClick={generateInvite} className="btn-primary btn-primary-hover text-xs">Gerar convite</button>
            )}
            {candidate.inviteToken && (
              <button onClick={copyInvite} className="btn-ghost text-xs">Copiar link do vídeo</button>
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-28 shrink-0">{k}</span>
      <span className="text-foreground/90 break-words">{v}</span>
    </div>
  );
}

function ScoreDial({ value, approved }: { value: number; approved: boolean }) {
  const angle = (value / 5) * 360;
  const color = approved ? "var(--success)" : value >= 2.5 ? "var(--warning)" : "var(--destructive)";
  return (
    <div
      className="h-12 w-12 rounded-full grid place-items-center text-xs font-semibold shrink-0"
      style={{
        background: `conic-gradient(${color} ${angle}deg, oklch(1 0 0 / 0.08) 0deg)`,
      }}
    >
      <div className="h-9 w-9 rounded-full bg-surface grid place-items-center flex-col leading-none">
        <span className="text-sm">{value.toFixed(1)}</span>
      </div>
    </div>
  );
}

function StatusPill({ status, approved }: { status: Candidate["status"]; approved: boolean }) {
  const map: Record<Candidate["status"], { label: string; cls: string }> = {
    screening: {
      label: approved ? "Aprovado na triagem" : "Reprovado",
      cls: approved
        ? "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30"
        : "bg-destructive/15 text-destructive border-destructive/30",
    },
    approved: { label: "Aprovado", cls: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30" },
    rejected: { label: "Reprovado", cls: "bg-destructive/15 text-destructive border-destructive/30" },
    invited: { label: "Convidado p/ vídeo", cls: "bg-primary/15 text-primary border-primary/30" },
    recorded: { label: "Vídeo gravado", cls: "bg-accent/15 text-accent border-accent/30" },
  };
  const s = map[status];
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>;
}
