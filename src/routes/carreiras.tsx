import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/carreiras")({
  head: () => ({
    meta: [
      { title: "Azul Carreiras · Vagas e Recrutamento" },
      {
        name: "description",
        content:
          "Portal de carreiras da Azul Linhas Aéreas: vagas em Tecnologia, Aeroportos, Tripulação de Voo e mais.",
      },
    ],
  }),
  component: CareersPortal,
});

// Cores oficiais (Manual de Identidade Azul Linhas Aéreas)
const AZUL_DEEP = "#041E42"; // Pantone 282 — primária
const AZUL_LIGHT = "#13B5EA"; // Pantone 298 — destaque/negativo
const WHITE = "#FFFFFF";

// Cores de apoio (Mapa de Diversidade) — usadas apenas como toques pontuais nas tags.
const SUPPORT = {
  verde: "#00A859",
  amarelo: "#FFC400",
  laranja: "#FF6B00",
  roxo: "#7B2FF7",
  ciano: "#00B4D8",
} as const;
type SupportKey = keyof typeof SUPPORT;

type Job = {
  title: string;
  area: string;
  tag: SupportKey;
  location: string;
  type: string;
};

const JOBS: Job[] = [
  {
    title: "Engenheiro de Software (Pleno)",
    area: "Tecnologia",
    tag: "ciano",
    location: "São Paulo · SP",
    type: "Híbrido",
  },
  { title: "Agile Coach", area: "Tecnologia", tag: "ciano", location: "Remoto", type: "Remoto" },
  {
    title: "Agente de Aeroporto",
    area: "Aeroportos",
    tag: "laranja",
    location: "Campinas · SP",
    type: "Presencial",
  },
  {
    title: "Operador Comercial",
    area: "Aeroportos",
    tag: "laranja",
    location: "Viracopos · SP",
    type: "Presencial",
  },
  {
    title: "Comissário de Voo",
    area: "Tripulação de Voo",
    tag: "verde",
    location: "Base SP · CG",
    type: "Presencial",
  },
  {
    title: "Mecânico de Manutenção Aeronáutica",
    area: "Tripulação de Voo",
    tag: "verde",
    location: "Belo Horizonte · MG",
    type: "Presencial",
  },
  {
    title: "Analista da Qualidade",
    area: "Qualidade",
    tag: "roxo",
    location: "São Paulo · SP",
    type: "Híbrido",
  },
  {
    title: "Técnico de SST",
    area: "Segurança",
    tag: "amarelo",
    location: "Rio de Janeiro · RJ",
    type: "Presencial",
  },
  {
    title: "Coordenador de TI",
    area: "Tecnologia",
    tag: "ciano",
    location: "São Paulo · SP",
    type: "Híbrido",
  },
];

function CareersPortal() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const filtered = JOBS.filter((j) => {
    const q = query.trim().toLowerCase();
    const l = location.trim().toLowerCase();
    const matchQ = !q || j.title.toLowerCase().includes(q) || j.area.toLowerCase().includes(q);
    const matchL = !l || j.location.toLowerCase().includes(l);
    return matchQ && matchL;
  });

  return (
    <div className="azul-portal">
      <style>{`
        .azul-portal {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: ${AZUL_DEEP};
          background: ${WHITE};
          line-height: 1.1;
        }
        .azul-portal * { box-sizing: border-box; }
        .azul-portal h1, .azul-portal h2, .azul-portal h3 {
          font-weight: 800;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 0;
        }
        .azul-portal h1 { letter-spacing: -0.05em; }
        .azul-portal p, .azul-portal span, .azul-portal a, .azul-portal input, .azul-portal select, .azul-portal button {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        .azul-portal .body-text { font-weight: 400; line-height: 1.45; }
        .azul-portal .body-light { font-weight: 300; line-height: 1.5; }
        .azul-portal .brand-logo { font-weight: 800; letter-spacing: -0.04em; color: ${AZUL_DEEP}; line-height: 1; }
        .azul-portal .btn-azul {
          background: ${AZUL_LIGHT};
          color: ${WHITE};
          font-weight: 700;
          letter-spacing: -0.01em;
          border-radius: 999px;
          padding: 0.7rem 1.5rem;
          border: none;
          cursor: pointer;
          transition: filter .15s ease, transform .15s ease;
        }
        .azul-portal .btn-azul:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .azul-portal .btn-deep {
          background: ${AZUL_DEEP};
          color: ${WHITE};
          font-weight: 700;
          border-radius: 999px;
          padding: 0.7rem 1.5rem;
          border: none;
          cursor: pointer;
          transition: filter .15s ease;
        }
        .azul-portal .btn-deep:hover { filter: brightness(1.12); }
        .azul-portal .nav-link {
          color: ${AZUL_DEEP};
          font-weight: 500;
          text-decoration: none;
          opacity: 0.78;
          transition: opacity .15s ease;
        }
        .azul-portal .nav-link:hover { opacity: 1; }
        .azul-portal .field {
          width: 100%;
          border: 1px solid #d7dde6;
          border-radius: 10px;
          padding: 0.85rem 1rem;
          font-size: 1rem;
          color: ${AZUL_DEEP};
          background: ${WHITE};
          outline: none;
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        .azul-portal .field:focus {
          border-color: ${AZUL_LIGHT};
          box-shadow: 0 0 0 3px rgba(19,181,234,0.2);
        }
        @media (min-width: 720px) {
          .azul-portal .search-grid {
            grid-template-columns: 1fr 1fr auto;
            align-items: center;
          }
        }
        .azul-portal .pillar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -20px rgba(4,30,66,0.28);
          border-color: rgba(19,181,234,0.4);
        }
        .azul-portal .job-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 36px -20px rgba(4,30,66,0.25);
          border-color: rgba(19,181,234,0.35);
        }
      `}</style>

      {/* 1. NAVBAR */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: WHITE,
          borderBottom: "1px solid #eef1f5",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: 1180, padding: "1.1rem 1.5rem" }}
        >
          {/* Logotipo oficial — área de proteção 1/5, largura >= 70px */}
          <a
            href="/carreiras"
            className="flex items-center gap-2"
            style={{ padding: "0.4rem 0.5rem", textDecoration: "none" }}
            aria-label="Azul Carreiras"
          >
            <AzulLogo height={36} />
            <span
              style={{
                color: AZUL_LIGHT,
                fontWeight: 700,
                fontSize: "12px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Carreiras
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8" style={{ fontSize: "15px" }}>
            <a className="nav-link" href="#vagas">
              Vagas
            </a>
            <a className="nav-link" href="#pilares">
              Por que Azul
            </a>
            <a className="nav-link" href="#pilares">
              Áreas
            </a>
            <a className="nav-link" href="#rodape">
              Contato
            </a>
          </nav>

          <button className="btn-azul" style={{ fontSize: "15px" }}>
            Cadastrar Currículo
          </button>
        </div>
      </header>

      {/* 2. HERO */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${AZUL_DEEP} 0%, #0a2f5c 55%, ${AZUL_LIGHT} 160%)`,
          color: WHITE,
        }}
      >
        {/* Fundo inspirador (substituir por foto de tripulantes/aeronaves em solo) */}
        <HeroBackdrop />
        <div
          className="mx-auto"
          style={{ maxWidth: 1180, padding: "5.5rem 1.5rem 6rem", position: "relative", zIndex: 2 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "12px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: AZUL_LIGHT,
              fontWeight: 700,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 999, background: AZUL_LIGHT }} />
            Recrutamento oficial Azul Linhas Aéreas
          </div>

          <h1
            style={{
              color: WHITE,
              fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
              marginTop: "1.2rem",
              maxWidth: 760,
            }}
          >
            Voe com a gente.
            <br />
            <span style={{ color: AZUL_LIGHT }}>Sua carreira tem destino.</span>
          </h1>

          <p
            className="body-light"
            style={{
              color: "rgba(255,255,255,0.88)",
              fontSize: "1.15rem",
              marginTop: "1.2rem",
              maxWidth: 560,
            }}
          >
            Orgulho de ser brasileira, gente boa e tecnologia de ponta. Encontre sua vaga na Azul e
            venha fazer parte da companhia mais querida do Brasil.
          </p>

          {/* Barra de busca */}
          <div
            style={{
              marginTop: "2.2rem",
              background: WHITE,
              borderRadius: 16,
              padding: "0.7rem",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "0.6rem",
              maxWidth: 720,
              boxShadow: "0 20px 50px -20px rgba(4,30,66,0.5)",
            }}
            className="search-grid"
          >
            <input
              className="field"
              placeholder="Cargo, palavra-chave ou área (ex.: Tecnologia)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <input
              className="field"
              placeholder="Localidade (ex.: São Paulo)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button className="btn-deep" style={{ width: "100%", fontSize: "1rem" }}>
              Buscar vagas
            </button>
          </div>
        </div>
      </section>

      {/* 3. PILARES */}
      <section id="pilares" className="mx-auto" style={{ maxWidth: 1180, padding: "5rem 1.5rem" }}>
        <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: AZUL_DEEP, maxWidth: 640 }}>
          Por que trabalhar na Azul?
        </h2>
        <p
          className="body-text"
          style={{ color: "#5a6b82", marginTop: "0.8rem", maxWidth: 560, fontSize: "1.05rem" }}
        >
          Três pilares que fazem da Azul um lugar onde vale a pena trabalhar — e crescer.
        </p>

        <div
          style={{
            marginTop: "2.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <Pillar
            color={AZUL_LIGHT}
            icon={<HeartGlyph />}
            title="Orgulho de ser brasileira"
            text="Alegria, vibração e diversidade em cada voo. Celebrando o Brasil em tudo o que fazemos, com otimismo e acolhimento."
          />
          <Pillar
            color={SUPPORT.verde}
            icon={<SparkGlyph />}
            title="Inovação & Tecnologia"
            text="Investimos em dados, IA e produtos digitais para uma experiência ágil, segura e cada vez melhor para nossos clientes."
          />
          <Pillar
            color={AZUL_DEEP}
            icon={<SmileGlyph />}
            title="Experiência Azul"
            text="Gente boa, atendimento descontraído e qualidade de serviço. Aqui o cuidado com o próximo é parte do dia a dia."
          />
        </div>
      </section>

      {/* 4. LISTAGEM DE VAGAS */}
      <section
        id="vagas"
        className="mx-auto"
        style={{ maxWidth: 1180, padding: "1rem 1.5rem 5rem" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", color: AZUL_DEEP }}>
            Vagas abertas
          </h2>
          <span className="body-text" style={{ color: "#5a6b82", fontSize: "0.95rem" }}>
            {filtered.length} {filtered.length === 1 ? "vaga encontrada" : "vagas encontradas"}
          </span>
        </div>

        <div
          style={{
            marginTop: "1.8rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.2rem",
          }}
        >
          {filtered.map((j) => (
            <JobCard key={j.title} job={j} />
          ))}
          {filtered.length === 0 && (
            <div style={{ color: "#5a6b82", padding: "2rem 0" }}>
              Nenhuma vaga encontrada para esse filtro. Tente outros termos.
            </div>
          )}
        </div>
      </section>

      {/* 5. RODAPÉ */}
      <footer
        id="rodape"
        style={{ background: AZUL_DEEP, color: "rgba(255,255,255,0.82)", marginTop: "2rem" }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: 1180,
            padding: "3rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "2rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AzulLogo height={30} />
              <span
                style={{
                  color: AZUL_LIGHT,
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                Carreiras
              </span>
            </div>
            <p
              className="body-light"
              style={{ marginTop: "0.8rem", fontSize: "0.92rem", maxWidth: 240 }}
            >
              Portal oficial de carreiras da Azul Linhas Aéreas.
            </p>
          </div>
          <FooterCol
            title="Carreiras"
            links={["Vagas", "Estágio & Trainee", "Programa de Diversidade", "Jovem Aprendiz"]}
          />
          <FooterCol
            title="Azul"
            links={["Sobre a companhia", "Sustentabilidade", "TudoAzul", "Imprensa"]}
          />
          <FooterCol
            title="Ajuda"
            links={["Central de candidatos", "Dúvidas frequentes", "LGPD", "Contato"]}
          />
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.12)",
            padding: "1.2rem 1.5rem",
          }}
          className="mx-auto"
        >
          <div
            className="mx-auto"
            style={{
              maxWidth: 1180,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.5rem",
              fontSize: "0.85rem",
            }}
          >
            <span>© {new Date().getFullYear()} Azul Linhas Aéreas Brasileiras S.A.</span>
            <span style={{ color: AZUL_LIGHT, fontWeight: 700 }}>carreiras.azul.com.br</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Pillar({
  color,
  icon,
  title,
  text,
}: {
  color: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: WHITE,
        border: "1px solid #eef1f5",
        borderRadius: 18,
        padding: "1.8rem",
        transition: "transform .18s ease, box-shadow .18s ease",
        boxShadow: "0 1px 2px rgba(4,30,66,0.04), 0 14px 30px -18px rgba(4,30,66,0.18)",
      }}
      className="pillar-card"
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          background: `${color}1a`,
          color: color,
          marginBottom: "1.1rem",
        }}
        aria-hidden
      >
        {icon}
      </div>
      <h3 style={{ fontSize: "1.3rem", color: AZUL_DEEP }}>{title}</h3>
      <p className="body-text" style={{ color: "#5a6b82", marginTop: "0.6rem", fontSize: "1rem" }}>
        {text}
      </p>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const color = SUPPORT[job.tag];
  return (
    <article
      style={{
        background: WHITE,
        border: "1px solid #eef1f5",
        borderRadius: 16,
        padding: "1.4rem",
        transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
        boxShadow: "0 1px 2px rgba(4,30,66,0.04)",
      }}
      className="job-card"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.9rem" }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: color,
            display: "inline-block",
          }}
          aria-hidden
        />
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: color,
          }}
        >
          {job.area}
        </span>
      </div>
      <h3 style={{ fontSize: "1.18rem", color: AZUL_DEEP, lineHeight: 1.15 }}>{job.title}</h3>
      <div
        className="body-text"
        style={{
          color: "#5a6b82",
          marginTop: "0.7rem",
          fontSize: "0.92rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        <span>📍 {job.location}</span>
        <span>🕒 {job.type}</span>
      </div>
      <button
        className="btn-azul"
        style={{ width: "100%", marginTop: "1.2rem", fontSize: "0.92rem", padding: "0.6rem 1rem" }}
      >
        Ver vaga e candidatar-se
      </button>
    </article>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div
        style={{ fontWeight: 700, color: WHITE, letterSpacing: "0.04em", marginBottom: "0.9rem" }}
      >
        {title}
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.55rem",
        }}
      >
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="nav-link"
              style={{ opacity: 0.82, color: "rgba(255,255,255,0.82)" }}
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --- Logotipo oficial "Azul" (recriado em SVG: emblema + wordmark arredondado) --- */
function AzulLogo({ height = 34 }: { height?: number }) {
  // viewBox 0 0 224 64 — emblema à esquerda, wordmark "Azul" à direita.
  return (
    <svg
      height={height}
      viewBox="0 0 224 64"
      role="img"
      aria-label="Azul"
      style={{ display: "block" }}
    >
      {/* Emblema (versão "mapa lateral"): quadrado arredondado azul + rota de voo branca */}
      <rect x="2" y="11" width="42" height="42" rx="13" fill={AZUL_DEEP} />
      <path
        d="M13 34 Q23 24 33 34"
        fill="none"
        stroke={WHITE}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="33" cy="34" r="2.4" fill={WHITE} />

      {/* Wordmark "Azul" — traços arredondados, amigáveis (estilo da marca) */}
      <g
        fill="none"
        stroke={AZUL_DEEP}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* A */}
        <path d="M62 52 L80 15 L98 52" />
        <path d="M69 40 L91 40" />
        {/* z */}
        <path d="M112 19 L141 19" />
        <path d="M141 19 L112 47" />
        <path d="M112 47 L141 47" />
        {/* u */}
        <path d="M153 19 L153 41 Q153 51 163 51 Q173 51 173 41 L173 19" />
        {/* l */}
        <path d="M189 19 L189 47 Q189 52 195 50" />
      </g>
    </svg>
  );
}

/* --- Ilustrações (SVG inline, sem dependências externas) --- */
function HeartGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-7.5-4.6-10-9.3C.3 8.2 2 4.5 5.5 4.5c2 0 3.4 1.2 4.5 2.7C11.1 5.7 12.5 4.5 14.5 4.5 18 4.5 19.7 8.2 22 11.7 19.5 16.4 12 21 12 21Z"
        fill="currentColor"
      />
    </svg>
  );
}
function SparkGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function SmileGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 14c1 1.3 2.3 2 4 2s3-.7 4-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="10" r="1.3" fill="currentColor" />
      <circle cx="15" cy="10" r="1.3" fill="currentColor" />
    </svg>
  );
}
function HeroBackdrop() {
  return (
    <svg
      className="hero-bg"
      viewBox="0 0 1440 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.16 }}
    >
      <path
        d="M-50 460 Q 360 300 720 240 T 1500 120"
        fill="none"
        stroke={WHITE}
        strokeWidth="2"
        strokeDasharray="2 10"
      />
      <path
        d="M-50 520 Q 420 380 820 300 T 1500 200"
        fill="none"
        stroke={AZUL_LIGHT}
        strokeWidth="2"
        strokeDasharray="2 14"
        opacity="0.8"
      />
      <circle cx="1180" cy="150" r="90" fill={AZUL_LIGHT} opacity="0.25" />
      <circle cx="180" cy="430" r="120" fill={WHITE} opacity="0.08" />
    </svg>
  );
}
