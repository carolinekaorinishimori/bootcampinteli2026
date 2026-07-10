import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  firstProfessionOfGroup,
  getCriteriaForGroup,
  getQuestionnaireForGroup,
  PROFESSIONS,
  saveJob,
  uid,
  type Criterion,
  type Job,
  type ProfessionGroup,
} from "@/lib/skyhire";

export const Route = createFileRoute("/jobs/new")({
  head: () => ({
    meta: [
      { title: "Nova vaga · Azul Talentos" },
      {
        name: "description",
        content: "Defina cargo, critérios, requisitos e nota de corte para uma nova vaga.",
      },
    ],
  }),
  component: NewJob,
});

const GROUP_PRESETS: { group: ProfessionGroup; label: string }[] = [
  { group: "leadership", label: "Liderança (TI/Agile)" },
  { group: "ti", label: "Tecnologia" },
  { group: "comercial", label: "Comercial / Aeroporto" },
  { group: "qualidade", label: "Qualidade" },
  { group: "manutencao", label: "Manutenção" },
  { group: "sst", label: "SST" },
  { group: "administrativo", label: "Administrativo" },
  { group: "docente", label: "Docente" },
  { group: "militar", label: "Militar" },
];

function NewJob() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [profession, setProfession] = useState<string>(PROFESSIONS[0].id);
  const [minExperience, setMinExperience] = useState(2);
  const [minEducation, setMinEducation] = useState<Job["minEducation"]>("medio");
  const [cutoff, setCutoff] = useState(3.5);
  const [criteria, setCriteria] = useState<Criterion[]>(() =>
    getCriteriaForGroup(PROFESSIONS[0].group),
  );

  const prof = PROFESSIONS.find((p) => p.id === profession) ?? PROFESSIONS[0];

  function onProfessionChange(next: string) {
    setProfession(next);
    const p = PROFESSIONS.find((x) => x.id === next) ?? PROFESSIONS[0];
    setCriteria(getCriteriaForGroup(p.group));
  }

  function applyPreset(group: ProfessionGroup) {
    setProfession(firstProfessionOfGroup(group));
    setCriteria(getCriteriaForGroup(group));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = criteria.filter((c) => c.label.trim());
    if (!title.trim() || cleaned.length === 0) {
      alert("Preencha o título da vaga e ao menos um critério.");
      return;
    }
    const job: Job = {
      id: uid(),
      title: title.trim(),
      department: department.trim(),
      description: description.trim(),
      minExperience,
      minEducation,
      criteria: cleaned,
      cutoff,
      createdAt: Date.now(),
      profession: prof.id,
      questionnaire: getQuestionnaireForGroup(prof.group as ProfessionGroup),
    };
    saveJob(job);
    navigate({ to: "/jobs/$jobId", params: { jobId: job.id } });
  }

  return (
    <AppShell>
      <div className="mb-8">
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Voltar
        </button>
        <h1 className="mt-2 font-display text-4xl font-semibold">Nova vaga</h1>
        <p className="text-muted-foreground mt-1">
          Descreva o cargo e os critérios que serão usados para pontuar cada candidato.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="panel p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Título da vaga">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Piloto Comercial — Frota A320"
                className="input"
              />
            </Field>
            <Field label="Área / Departamento">
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Operações de voo"
                className="input"
              />
            </Field>
            <Field label="Cargo / Profissão">
              <select
                value={profession}
                onChange={(e) => onProfessionChange(e.target.value)}
                className="input"
              >
                {PROFESSIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
            Questionário da vaga:{" "}
            <b className="text-foreground">
              {getQuestionnaireForGroup(prof.group as ProfessionGroup).length} perguntas
            </b>{" "}
            — o candidato responderá este formulário (em vez de vídeo) após ser aprovado na triagem.
          </div>
          <Field label="Descrição">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Contexto, responsabilidades, base operacional…"
              className="input resize-none"
            />
          </Field>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Experiência mínima (anos)">
              <input
                type="number"
                min={0}
                max={40}
                value={minExperience}
                onChange={(e) => setMinExperience(Number(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Escolaridade mínima">
              <select
                value={minEducation}
                onChange={(e) => setMinEducation(e.target.value as Job["minEducation"])}
                className="input"
              >
                <option value="none">Indiferente</option>
                <option value="medio">Ensino Médio</option>
                <option value="tecnico">Técnico</option>
                <option value="superior">Superior</option>
                <option value="pos">Pós-graduação</option>
              </select>
            </Field>
            <Field label={`Nota de corte: ${cutoff.toFixed(1)} / 5`}>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={cutoff}
                onChange={(e) => setCutoff(Number(e.target.value))}
                className="w-full accent-[color:var(--primary)]"
              />
            </Field>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-xl font-semibold">Critérios ponderados</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Palavras-chave são buscadas nas competências, certificações, idiomas e formação do
                candidato.
              </p>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              {GROUP_PRESETS.map((p) => (
                <button
                  key={p.group}
                  type="button"
                  onClick={() => applyPreset(p.group)}
                  className="btn-ghost !py-1.5"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="hidden md:grid grid-cols-[1.2fr_2fr_120px_100px_40px] gap-3 text-[11px] uppercase tracking-wider text-muted-foreground px-1">
              <span>Critério</span>
              <span>Palavras-chave (vírgula)</span>
              <span>Peso 1–10</span>
              <span>Obrigatório</span>
              <span />
            </div>
            {criteria.map((c, i) => (
              <div
                key={c.id}
                className="grid md:grid-cols-[1.2fr_2fr_120px_100px_40px] gap-3 items-center"
              >
                <input
                  value={c.label}
                  onChange={(e) => updateCrit(i, { label: e.target.value })}
                  placeholder="Ex.: Licença ANAC"
                  className="input"
                />
                <input
                  value={c.keywords}
                  onChange={(e) => updateCrit(i, { keywords: e.target.value })}
                  placeholder="anac, cms, atpl"
                  className="input"
                />
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={c.weight}
                  onChange={(e) =>
                    updateCrit(i, { weight: Math.max(1, Math.min(10, Number(e.target.value))) })
                  }
                  className="input"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={c.required}
                    onChange={(e) => updateCrit(i, { required: e.target.checked })}
                    className="accent-[color:var(--primary)] h-4 w-4"
                  />
                  <span className="text-muted-foreground md:hidden">Obrig.</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCriteria(criteria.filter((_, j) => j !== i))}
                  className="text-muted-foreground hover:text-destructive text-lg leading-none"
                  aria-label="Remover"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setCriteria([
                  ...criteria,
                  { id: uid(), label: "", keywords: "", weight: 5, required: false },
                ])
              }
              className="btn-ghost text-sm"
            >
              + Adicionar critério
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="btn-ghost"
          >
            Cancelar
          </button>
          <button type="submit" className="btn-primary btn-primary-hover">
            Criar vaga e importar candidatos
          </button>
        </div>
      </form>
    </AppShell>
  );

  function updateCrit(i: number, patch: Partial<Criterion>) {
    setCriteria(criteria.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
