import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { saveJob, uid, type Criterion, type Job } from "@/lib/skyhire";

export const Route = createFileRoute("/jobs/new")({
  head: () => ({
    meta: [
      { title: "Nova vaga · Azul Talentos" },
      { name: "description", content: "Defina critérios, requisitos e nota de corte para uma nova vaga." },
    ],
  }),
  component: NewJob,
});

const PRESET_CRITERIA: Record<string, Criterion[]> = {
  piloto: [
    { id: uid(), label: "Licença ANAC / CMS", keywords: "anac, cms, piloto comercial, atpl, ppl, cpl", weight: 10, required: true },
    { id: uid(), label: "Horas de voo", keywords: "horas de voo, voo, flight hours", weight: 8, required: true },
    { id: uid(), label: "Inglês ICAO", keywords: "inglês, english, icao", weight: 8, required: true },
    { id: uid(), label: "Simulador / Type Rating", keywords: "simulador, type rating, a320, b737, e190", weight: 6, required: false },
  ],
  comissario: [
    { id: uid(), label: "Certificado CMS Comissário", keywords: "cms, comissário, comissario, tripulante", weight: 10, required: true },
    { id: uid(), label: "Inglês avançado", keywords: "inglês avançado, english advanced, fluente", weight: 7, required: true },
    { id: uid(), label: "Atendimento ao cliente", keywords: "atendimento, serviço de bordo, hospitalidade", weight: 6, required: false },
    { id: uid(), label: "Segurança de voo", keywords: "segurança, emergência, primeiros socorros", weight: 6, required: false },
  ],
  manutencao: [
    { id: uid(), label: "Habilitação MMA/GMP", keywords: "mma, gmp, mecânico, aeronaves", weight: 10, required: true },
    { id: uid(), label: "Experiência prática", keywords: "manutenção, hangar, linha, base", weight: 8, required: true },
    { id: uid(), label: "Conhecimento de sistemas", keywords: "sistemas, motores, aviônicos", weight: 7, required: false },
    { id: uid(), label: "Inglês técnico", keywords: "inglês técnico, manuais, ata", weight: 5, required: false },
  ],
};

function NewJob() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [minExperience, setMinExperience] = useState(2);
  const [minEducation, setMinEducation] = useState<Job["minEducation"]>("medio");
  const [cutoff, setCutoff] = useState(3.5);
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: uid(), label: "", keywords: "", weight: 5, required: false },
  ]);

  function applyPreset(k: keyof typeof PRESET_CRITERIA) {
    setCriteria(PRESET_CRITERIA[k].map((c) => ({ ...c, id: uid() })));
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
    };
    saveJob(job);
    navigate({ to: "/jobs/$jobId", params: { jobId: job.id } });
  }

  return (
    <AppShell>
      <div className="mb-8">
        <button onClick={() => navigate({ to: "/dashboard" })} className="text-sm text-muted-foreground hover:text-foreground">
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
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Piloto Comercial — Frota A320" className="input" />
            </Field>
            <Field label="Área / Departamento">
              <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Operações de voo" className="input" />
            </Field>
          </div>
          <Field label="Descrição">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Contexto, responsabilidades, base operacional…" className="input resize-none" />
          </Field>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Experiência mínima (anos)">
              <input type="number" min={0} max={40} value={minExperience} onChange={(e) => setMinExperience(Number(e.target.value))} className="input" />
            </Field>
            <Field label="Escolaridade mínima">
              <select value={minEducation} onChange={(e) => setMinEducation(e.target.value as Job["minEducation"])} className="input">
                <option value="none">Indiferente</option>
                <option value="medio">Ensino Médio</option>
                <option value="tecnico">Técnico</option>
                <option value="superior">Superior</option>
                <option value="pos">Pós-graduação</option>
              </select>
            </Field>
            <Field label={`Nota de corte: ${cutoff.toFixed(1)} / 5`}>
              <input type="range" min={0} max={5} step={0.1} value={cutoff} onChange={(e) => setCutoff(Number(e.target.value))} className="w-full accent-[color:var(--primary)]" />
            </Field>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-xl font-semibold">Critérios ponderados</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Palavras-chave são buscadas nas competências, certificações, idiomas e formação do candidato.
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => applyPreset("piloto")} className="btn-ghost !py-1.5">Preset: Piloto</button>
              <button type="button" onClick={() => applyPreset("comissario")} className="btn-ghost !py-1.5">Comissário(a)</button>
              <button type="button" onClick={() => applyPreset("manutencao")} className="btn-ghost !py-1.5">Manutenção</button>
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
              <div key={c.id} className="grid md:grid-cols-[1.2fr_2fr_120px_100px_40px] gap-3 items-center">
                <input value={c.label} onChange={(e) => updateCrit(i, { label: e.target.value })} placeholder="Ex.: Licença ANAC" className="input" />
                <input value={c.keywords} onChange={(e) => updateCrit(i, { keywords: e.target.value })} placeholder="anac, cms, atpl" className="input" />
                <input type="number" min={1} max={10} value={c.weight} onChange={(e) => updateCrit(i, { weight: Math.max(1, Math.min(10, Number(e.target.value))) })} className="input" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={c.required} onChange={(e) => updateCrit(i, { required: e.target.checked })} className="accent-[color:var(--primary)] h-4 w-4" />
                  <span className="text-muted-foreground md:hidden">Obrig.</span>
                </label>
                <button type="button" onClick={() => setCriteria(criteria.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive text-lg leading-none" aria-label="Remover">
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setCriteria([...criteria, { id: uid(), label: "", keywords: "", weight: 5, required: false }])} className="btn-ghost text-sm">
              + Adicionar critério
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate({ to: "/dashboard" })} className="btn-ghost">Cancelar</button>
          <button type="submit" className="btn-primary btn-primary-hover">Criar vaga e importar candidatos</button>
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
