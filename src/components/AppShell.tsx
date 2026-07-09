import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { getSession, logout, type Session } from "@/lib/auth";

export function AppShell({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <LogoMark />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-semibold text-lg tracking-tight">SkyHire</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Triagem para aviação
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link to="/dashboard" activeOptions={{ exact: true }} className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:bg-surface">Vagas</Link>
            <Link to="/videos" className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:bg-surface">Galeria de vídeos</Link>
          </nav>
          <div className="flex items-center gap-3">
            {actions}
            {session && (
              <div className="flex items-center gap-2 pl-3 ml-1 border-l border-border">
                <div className="hidden sm:flex flex-col leading-tight text-right">
                  <span className="text-xs font-medium">{session.name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {session.role === "rh" ? "RH" : "Aplicador"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate({ to: "/" });
                  }}
                  className="btn-ghost text-xs"
                  title="Sair"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      <footer className="mx-auto max-w-6xl px-6 py-10 text-xs text-muted-foreground">
        <div className="hairline pt-6 flex flex-wrap justify-between gap-2">
          <span>© SkyHire · Triagem justa e auditável</span>
          <span>Dados locais · Conforme princípios da LGPD</span>
        </div>
      </footer>
    </div>
  );
}

export function LogoMark({ size = 40 }: { size?: number } = {}) {
  // Wordmark "azul" — estilizado, lowercase, em azul da marca.
  const h = size;
  const w = size * 2.3;
  return (
    <div
      className="rounded-full grid place-items-center px-3"
      style={{
        height: h,
        minWidth: w,
        background: "white",
        boxShadow: "0 4px 14px -4px oklch(0.62 0.17 245 / 0.35)",
      }}
    >
      <svg viewBox="0 0 92 40" height={h * 0.62} aria-label="Azul">
        <text
          x="0"
          y="30"
          fontFamily="Poppins, system-ui, sans-serif"
          fontWeight="800"
          fontSize="34"
          letterSpacing="-1.5"
          fill="oklch(0.55 0.18 250)"
        >
          azul
        </text>
        {/* Ponto sobre o "u" evocando amarelo TudoAzul */}
        <circle cx="60" cy="8" r="3.2" fill="var(--azul-yellow)" />
      </svg>
    </div>
  );
}

export function Stat({ label, value, tone = "default" }: { label: string; value: ReactNode; tone?: "default" | "primary" | "success" | "warning" }) {
  const toneClass = {
    default: "text-foreground",
    primary: "text-primary",
    success: "text-[color:var(--success)]",
    warning: "text-[color:var(--warning)]",
  }[tone];
  return (
    <div className="panel p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-3xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
