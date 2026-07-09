import { useEffect, useRef, useState } from "react";

export const VIDEO_QUESTIONS = [
  "Apresente-se em 30 segundos: nome, formação e áreas de experiência.",
  "Conte uma situação profissional em que você garantiu a segurança da operação.",
  "Por que você quer trabalhar na Azul nesta função?",
];

const MAX_SECONDS = 120;

export function VideoRecorder({ onSaved }: { onSaved: (url: string) => void }) {
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

  const mm = Math.floor(elapsed / 60)
    .toString()
    .padStart(1, "0");
  const ss = (elapsed % 60).toString().padStart(2, "0");

  return (
    <div className="panel p-6 mt-8 space-y-5">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
        {phase !== "done" ? (
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
        ) : (
          <video
            ref={playbackRef}
            src={previewUrl ?? undefined}
            controls
            className="w-full h-full object-cover"
          />
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
          <div className="text-xs uppercase tracking-wider text-primary/90">
            Pergunta {currentQ + 1} de {VIDEO_QUESTIONS.length}
          </div>
          <p className="mt-1 text-foreground font-medium">{VIDEO_QUESTIONS[currentQ]}</p>
          <div className="mt-3 flex gap-2 text-xs">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="btn-ghost disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setCurrentQ(Math.min(VIDEO_QUESTIONS.length - 1, currentQ + 1))}
              disabled={currentQ === VIDEO_QUESTIONS.length - 1}
              className="btn-ghost disabled:opacity-40"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        {phase === "preview" && (
          <button onClick={start} className="btn-primary btn-primary-hover">
            ● Começar a gravar
          </button>
        )}
        {phase === "recording" && (
          <button onClick={stop} className="btn-primary btn-primary-hover">
            ■ Parar gravação
          </button>
        )}
        {phase === "done" && (
          <>
            <button onClick={retake} className="btn-ghost">
              Regravar
            </button>
            <button onClick={submit} className="btn-primary btn-primary-hover">
              Enviar vídeo
            </button>
          </>
        )}
      </div>
    </div>
  );
}
