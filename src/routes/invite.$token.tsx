import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getCandidateByToken, getJob, updateCandidate, type Candidate, type Job } from "@/lib/skyhire";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "Convite para gravar vídeo · Azul Talentos" },
      { name: "description", content: "Você foi aprovado(a) na triagem. Grave um vídeo curto para avançar no processo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvitePage,
});

const QUESTIONS = [
  "Apresente-se em 30 segundos: nome, formação e áreas de experiência.",
  "Conte uma situação profissional em que você garantiu a segurança da operação.",
  "Por que você quer trabalhar na Azul nesta função?",
];

function InvitePage() {
  const { token } = Route.useParams();
  const [candidate, setCandidate] = useState<Candidate | undefined>();
  const [job, setJob] = useState<Job | undefined>();
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState<"intro" | "record" | "done">("intro");

  useEffect(() => {
    const c = getCandidateByToken(token);
    setCandidate(c);
    if (c) setJob(getJob(c.jobId));
  }, [token]);

  if (!candidate || !job) {
    return (
      <AppShell>
        <div className="panel p-10 text-center max-w-lg mx-auto">
          <h1 className="font-display text-2xl font-semibold">Link inválido</h1>
          <p className="text-muted-foreground mt-2">
            Este convite não foi encontrado ou expirou. Fale com o recrutador que enviou o link.
          </p>
        </div>
      </AppShell>
    );
  }

  if (candidate.status === "recorded" && step !== "done") {
    return (
      <AppShell>
        <div className="panel p-10 text-center max-w-lg mx-auto">
          <div className="mx-auto h-14 w-14 rounded-full bg-[color:var(--success)]/20 grid place-items-center text-[color:var(--success)] text-2xl">✓</div>
          <h1 className="mt-4 font-display text-2xl font-semibold">Vídeo já enviado</h1>
          <p className="text-muted-foreground mt-2">Recebemos sua gravação. O time de recrutamento entrará em contato.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-primary/90">Etapa em vídeo · {job.department || "Aviação"}</div>
        <h1 className="font-display text-4xl font-semibold mt-1">Parabéns, você avançou! ✈</h1>
        <p className="text-muted-foreground mt-2">
          A vaga <b className="text-foreground">{job.title}</b> tem uma etapa em vídeo. Você terá até
          2 minutos para responder às perguntas abaixo.
        </p>

        {step === "intro" && (
          <div className="panel p-6 mt-8 space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">Perguntas</h2>
              <ol className="mt-3 space-y-2 text-sm">
                {QUESTIONS.map((q, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="h-6 w-6 shrink-0 rounded-full bg-primary/20 text-primary text-xs grid place-items-center font-semibold">{i + 1}</span>
                    <span className="text-foreground/90">{q}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="hairline pt-5 text-xs text-muted-foreground space-y-2">
              <p><b className="text-foreground">Privacidade (LGPD):</b> seu vídeo será usado apenas para avaliação nesta vaga. Você pode solicitar a exclusão a qualquer momento pelo email do recrutador.</p>
              <label className="flex items-start gap-2 mt-3 cursor-pointer">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[color:var(--primary)] h-4 w-4" />
                <span>Autorizo a gravação e o uso deste vídeo exclusivamente no processo seletivo desta vaga.</span>
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
          <Recorder
            questions={QUESTIONS}
            onSaved={(url) => {
              updateCandidate(candidate.id, { status: "recorded", videoBlobUrl: url, videoRecordedAt: Date.now() });
              setStep("done");
            }}
          />
        )}

        {step === "done" && (
          <div className="panel p-10 text-center mt-8">
            <div className="mx-auto h-14 w-14 rounded-full bg-[color:var(--success)]/20 grid place-items-center text-[color:var(--success)] text-2xl">✓</div>
            <h2 className="mt-4 font-display text-2xl font-semibold">Vídeo enviado!</h2>
            <p className="text-muted-foreground mt-2">Boa sorte. O recrutador foi notificado.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

const MAX_SECONDS = 120;

function Recorder({ questions, onSaved }: { questions: string[]; onSaved: (url: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase, setPhase] = useState<"preview" | "recording" | "done">("preview");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          await videoRef.current.play().catch(() => {});
        }
      } catch (e) {
        console.error(e);
        setError("Não conseguimos acessar câmera/microfone. Verifique as permissões do navegador.");
      }
    })();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function start() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm";
    const rec = new MediaRecorder(streamRef.current, { mimeType: mime });
    rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPhase("done");
    };
    rec.start();
    recorderRef.current = rec;
    setPhase("recording");
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((s) => {
        const next = s + 1;
        if (next >= MAX_SECONDS) stop();
        return next;
      });
    }, 1000);
  }

  function stop() {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function submit() {
    if (previewUrl) onSaved(previewUrl);
  }

  function retake() {
    setPreviewUrl(null);
    setPhase("preview");
    setCurrentQ(0);
    setElapsed(0);
  }

  if (error) {
    return (
      <div className="panel p-6 mt-8">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  const mm = Math.floor(elapsed / 60).toString().padStart(1, "0");
  const ss = (elapsed % 60).toString().padStart(2, "0");

  return (
    <div className="panel p-6 mt-8 space-y-5">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
        {phase !== "done" ? (
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
        ) : (
          <video ref={playbackRef} src={previewUrl ?? undefined} controls className="w-full h-full object-cover" />
        )}
        {phase === "recording" && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-xs">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            REC · {mm}:{ss} / 2:00
          </div>
        )}
      </div>

      {phase !== "done" && (
        <div className="rounded-lg border border-border p-4 bg-surface">
          <div className="text-xs uppercase tracking-wider text-primary/90">Pergunta {currentQ + 1} de {questions.length}</div>
          <p className="mt-1 text-foreground font-medium">{questions[currentQ]}</p>
          <div className="mt-3 flex gap-2 text-xs">
            <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="btn-ghost disabled:opacity-40">← Anterior</button>
            <button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))} disabled={currentQ === questions.length - 1} className="btn-ghost disabled:opacity-40">Próxima →</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        {phase === "preview" && (
          <button onClick={start} className="btn-primary btn-primary-hover">● Começar a gravar</button>
        )}
        {phase === "recording" && (
          <button onClick={stop} className="btn-primary btn-primary-hover">■ Parar gravação</button>
        )}
        {phase === "done" && (
          <>
            <button onClick={retake} className="btn-ghost">Regravar</button>
            <button onClick={submit} className="btn-primary btn-primary-hover">Enviar vídeo</button>
          </>
        )}
      </div>
    </div>
  );
}
