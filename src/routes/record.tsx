import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { VideoRecorder, VIDEO_QUESTIONS } from "@/components/VideoRecorder";

export const Route = createFileRoute("/record")({
  head: () => ({
    meta: [
      { title: "Gravação de vídeo · Azul Talentos" },
      {
        name: "description",
        content: "Grave seu vídeo de apresentação para o processo seletivo da Azul.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RecordPage,
});

function RecordPage() {
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState<"intro" | "record" | "done">("intro");

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-primary/90">
          Etapa em vídeo · Azul Talentos
        </div>
        <h1 className="font-display text-4xl font-semibold mt-1">
          Grave seu vídeo de apresentação ✈
        </h1>
        <p className="text-muted-foreground mt-2">
          Você terá até 2 minutos para responder às perguntas abaixo. Sem necessidade de token ou
          e-mail — é só gravar.
        </p>

        {step === "intro" && (
          <div className="panel p-6 mt-8 space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">Perguntas</h2>
              <ol className="mt-3 space-y-2 text-sm">
                {VIDEO_QUESTIONS.map((q, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="h-6 w-6 shrink-0 rounded-full bg-primary/20 text-primary text-xs grid place-items-center font-semibold">
                      {i + 1}
                    </span>
                    <span className="text-foreground/90">{q}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="hairline pt-5 text-xs text-muted-foreground space-y-2">
              <p>
                <b className="text-foreground">Privacidade (LGPD):</b> seu vídeo será usado apenas
                para avaliação neste processo. Você pode solicitar a exclusão a qualquer momento.
              </p>
              <label className="flex items-start gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-[color:var(--primary)] h-4 w-4"
                />
                <span>
                  Autorizo a gravação e o uso deste vídeo exclusivamente no processo seletivo.
                </span>
              </label>
            </div>
            <div className="flex justify-end">
              <button
                disabled={!consent}
                onClick={() => setStep("record")}
                className="btn-primary btn-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Iniciar gravação
              </button>
            </div>
          </div>
        )}

        {step === "record" && (
          <VideoRecorder
            onSaved={() => {
              setStep("done");
            }}
          />
        )}

        {step === "done" && (
          <div className="panel p-10 text-center mt-8">
            <div className="mx-auto h-14 w-14 rounded-full bg-[color:var(--success)]/20 grid place-items-center text-[color:var(--success)] text-2xl">
              ✓
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold">Vídeo enviado!</h2>
            <p className="text-muted-foreground mt-2">Obrigado pela sua participação. Boa sorte!</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
