import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/AppShell";
import { getSession, login, type Role } from "@/lib/auth";
import { listCandidates } from "@/lib/skyhire";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar · Azul Talentos" },
      { name: "description", content: "Acesse a Azul Talentos como RH ou candidato." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("rh");
  const [name, setName] = useState("");
  const [candidateCount, setCandidateCount] = useState(0);

  useEffect(() => {
    setCandidateCount(listCandidates().length);
    const s = getSession();
    if (s) {
      navigate({ to: s.role === "rh" ? "/dashboard" : "/record" });
    }
  }, [navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(role, name);
    navigate({ to: role === "rh" ? "/dashboard" : "/record" });
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <aside
        className="hidden md:flex flex-col justify-between p-10 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.32 0.15 260) 0%, oklch(0.55 0.18 250) 55%, oklch(0.68 0.16 240) 100%)",
        }}
      >
        {/* Decorative flight path */}
        <svg
          className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
          viewBox="0 0 400 600"
          preserveAspectRatio="none"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        >
          <path d="M-20 480 Q 120 340 240 260 T 460 60" strokeDasharray="4 6" />
          <path d="M-20 540 Q 160 420 300 320 T 480 140" strokeDasharray="2 8" opacity="0.6" />
        </svg>
        <div
          className="absolute -top-16 -right-16 h-64 w-64 rounded-full"
          style={{ background: "var(--azul-yellow)", opacity: 0.18, filter: "blur(24px)" }}
        />

        <div className="relative flex items-center gap-2.5">
          <LogoMark />
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-lg tracking-tight text-white">
              Azul Talentos
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/70">
              Azul Linhas Aéreas
            </span>
          </div>
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[color:var(--azul-yellow)] mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--azul-yellow)] animate-pulse" />
            Recrutamento oficial
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight text-white">
            Voe com
            <br />a gente. <span style={{ color: "var(--azul-yellow)" }}>Recrutamento justo.</span>
          </h1>
          <p className="mt-4 text-white/85 max-w-md">
            Recrutadores da Azul gerenciam vagas e vídeos. Candidatos entram com o token recebido
            por e-mail para completar a aplicação.
          </p>
        </div>
        <div className="relative text-xs text-white/70">
          {candidateCount} candidatos já triados · Conforme princípios da LGPD
        </div>
      </aside>

      <main className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="panel p-8 w-full max-w-md">
          <h2 className="font-display text-2xl font-semibold">Entrar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Selecione seu perfil para continuar.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <RoleCard
              active={role === "rh"}
              onClick={() => setRole("rh")}
              icon="✈️"
              title="RH"
              desc="Gerencia vagas, candidatos e vídeos."
            />
            <RoleCard
              active={role === "candidato"}
              onClick={() => setRole("candidato")}
              icon="🎧"
              title="Candidato"
              desc="Pessoa que fará a aplicação."
            />
          </div>

          <label className="block mt-6 text-sm">
            <span className="text-muted-foreground">Seu nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === "rh" ? "Ex.: Ana Recrutadora" : "Ex.: João Candidato"}
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <button type="submit" className="btn-primary btn-primary-hover w-full mt-6">
            {role === "rh" ? "Entrar como RH" : "Continuar como candidato"}
          </button>

          <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed text-center">
            Ambiente de demonstração · sessão salva localmente neste navegador.
          </p>
        </form>
      </main>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-lg border p-4 transition ${
        active
          ? "border-primary bg-primary/10 ring-1 ring-primary/40"
          : "border-border hover:border-primary/40 bg-surface"
      }`}
    >
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 font-display font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground mt-1 leading-snug">{desc}</div>
    </button>
  );
}
