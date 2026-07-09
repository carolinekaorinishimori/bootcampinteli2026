import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/AppShell";
import { getSession, logout } from "@/lib/auth";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Aplicação do candidato · Azul Talentos" },
      { name: "description", content: "Área do candidato: acesse sua aplicação com o token recebido." },
    ],
  }),
  component: Apply,
});

function Apply() {
  const navigate = useNavigate();
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

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
  }, [navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = token.trim();
    if (!t) {
      setError("Informe o token recebido no e-mail.");
      return;
    }
    navigate({ to: "/invite/$token", params: { token: t } });
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-semibold text-lg tracking-tight">Azul Talentos</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Área do candidato
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">Olá, {session.name}</span>
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

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="panel p-8 w-full max-w-lg">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary/90 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Sua aplicação
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Bem-vindo(a) à Azul Talentos, {session.name.split(" ")[0]}.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Se você foi aprovado(a) na triagem de currículo, recebeu por e-mail um
            <b className="text-foreground"> token de convite</b> exclusivo. Cole-o abaixo para
            acessar sua gravação de vídeo.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">Token do convite</span>
              <input
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError(null);
                }}
                placeholder="Ex.: 8f3a-92c1-77bd"
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            {error && <div className="text-xs text-destructive">{error}</div>}
            <button type="submit" className="btn-primary btn-primary-hover w-full">
              Acessar minha aplicação
            </button>
          </form>

          <div className="mt-6 text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-4">
            <b className="text-foreground">Não recebeu um token?</b> A triagem inicial é
            automática e livre de viés. Se seu currículo atingir a nota de corte da vaga, o
            recrutador dispara o convite para gravação. Fique atento(a) ao seu e-mail.
          </div>
        </div>
      </main>
    </div>
  );
}
