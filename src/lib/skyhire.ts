// Local storage-backed data layer for the SkyHire triage platform.
// LGPD: dados armazenados apenas no dispositivo do recrutador (localStorage).

export type Criterion = {
  id: string;
  label: string;
  keywords: string; // comma-separated
  weight: number; // 1-10
  required: boolean;
};

export type ProfessionGroup =
  | "leadership"
  | "ti"
  | "comercial"
  | "qualidade"
  | "manutencao"
  | "sst"
  | "administrativo"
  | "docente"
  | "militar";

export type Profession = {
  id: string;
  label: string;
  group: ProfessionGroup;
};

export type QuestionnaireQuestion = {
  id: string;
  prompt: string;
};

// Cargos atendidos pela plataforma. Cada profissão pertence a um grupo que
// define qual questionário o candidato deverá responder.
export const PROFESSIONS: Profession[] = [
  // Liderança
  { id: "agile_leader", label: "Agile Leader / Coordenador de Agilidade", group: "leadership" },
  { id: "squad_leader", label: "Squad Leader", group: "leadership" },
  { id: "gerente_negocios", label: "Gerente de Negócios", group: "leadership" },
  { id: "gerente_vendas", label: "Gerente de Vendas", group: "leadership" },
  { id: "coordenadores", label: "Coordenadores", group: "leadership" },
  // Tecnologia
  { id: "agile_coach", label: "Agile Coach", group: "ti" },
  { id: "analista_negocios_ti", label: "Analista de Negócios em TI (Trainee)", group: "ti" },
  // Comercial / Aeroporto
  { id: "agente_aeroporto", label: "Agente de Aeroporto", group: "comercial" },
  { id: "operador_comercial", label: "Operador Comercial", group: "comercial" },
  { id: "representante_comercial", label: "Representante Comercial", group: "comercial" },
  // Qualidade
  { id: "analista_qualidade", label: "Analista da Qualidade", group: "qualidade" },
  { id: "assistente_qualidade", label: "Assistente da Qualidade", group: "qualidade" },
  { id: "inspetor_qualidade", label: "Inspetor da Qualidade", group: "qualidade" },
  // Manutenção aeronáutica
  { id: "mecanico_manutencao", label: "Mecânico de Manutenção Aeronáutica", group: "manutencao" },
  { id: "mecanico_inspetor", label: "Mecânico Inspetor de Aeronaves", group: "manutencao" },
  { id: "tecnico_manutencao", label: "Técnico de Manutenção de Aeronaves", group: "manutencao" },
  // Saúde e Segurança do Trabalho
  { id: "auxiliar_sst", label: "Auxiliar de Saúde e Segurança do Trabalho", group: "sst" },
  { id: "tecnico_sst", label: "Técnico(a) de Saúde e Segurança do Trabalho", group: "sst" },
  // Administrativo
  { id: "assistente_administrativo", label: "Assistente Administrativo", group: "administrativo" },
  { id: "auxiliar_administrativo", label: "Auxiliar Administrativo", group: "administrativo" },
  // Docente
  { id: "docente", label: "Docente", group: "docente" },
  // Militar
  { id: "militar_marinha", label: "Militar da Marinha do Brasil", group: "militar" },
];

// Questionários por grupo de profissão. As respostas são texto livre —
// avaliadas pelo recrutador, sem viés de imagem, voz ou sotaque (LGPD).
export const QUESTIONNAIRES: Record<ProfessionGroup, QuestionnaireQuestion[]> = {
  // Perguntas calibradas para extrair os sinais de mérito dos critérios do grupo.
  leadership: [
    {
      id: "l1",
      prompt:
        "Conte uma situação em que você liderou times ágeis (Scrum/Kanban/SAFe) entregando valor com previsibilidade.",
    },
    {
      id: "l2",
      prompt:
        "Como você conduz a gestão de portfólio/projetos e alinha prioridades com os objetivos estratégicos do negócio?",
    },
    {
      id: "l3",
      prompt:
        "Descreva como você desenvolve pessoas: mentoria, 1:1, PDIs e construção de times de alta performance.",
    },
    {
      id: "l4",
      prompt:
        "Como você comunica resultados a stakeholders e lideranças (relatórios executivos, storytelling)?",
    },
    {
      id: "l5",
      prompt:
        "Conte uma iniciativa de transformação digital ou inovação que liderou e quais ganhos mensuráveis obteve.",
    },
    {
      id: "l6",
      prompt: "Como você usa dados, KPIs e métricas (ex.: DORA, velocity) para melhoria contínua?",
    },
    {
      id: "l7",
      prompt: "Descreva uma decisão difícil como líder e quais critérios utilizou.",
    },
    {
      id: "l8",
      prompt:
        "Como você atua em ambientes multidisciplinares de TI/engenharia (arquitetura, DevOps, produto)?",
    },
    {
      id: "l9",
      prompt: "Como você lidera a adoção de IA/dados (agentes, analytics, LLMs) na operação?",
    },
    {
      id: "l10",
      prompt: "Por que seu perfil de liderança é adequado a uma cultura de mérito e colaboração?",
    },
  ],
  ti: [
    {
      id: "t1",
      prompt:
        "Conte um projeto de tecnologia ou transformação digital do qual participou e seu papel.",
    },
    {
      id: "t2",
      prompt:
        "Quais metodologias ágeis você aplica (Scrum, Kanban, SAFe) e como organiza demandas?",
    },
    {
      id: "t3",
      prompt: "Como você levanta e documenta requisitos (backlog, user stories, modelagem)?",
    },
    {
      id: "t4",
      prompt: "Descreva uma situação em que identificou oportunidade de melhoria em um processo.",
    },
    { id: "t5", prompt: "Quais tecnologias, ferramentas e linguagens você domina?" },
    {
      id: "t6",
      prompt:
        "Conte uma resolução de problema técnico complexo (arquitetura, DevOps, microsserviços).",
    },
    {
      id: "t7",
      prompt: "Como você trabalha em equipes multidisciplinares (produto, negócio, arquitetura)?",
    },
    {
      id: "t8",
      prompt: "Como garante comunicação eficiente entre áreas técnicas e de negócio?",
    },
    { id: "t9", prompt: "Como usa dados/IA (analytics, LLMs) para agregar valor?" },
    {
      id: "t10",
      prompt: "O que motiva você a atuar com tecnologia, inovação e metodologias ágeis?",
    },
  ],
  comercial: [
    {
      id: "c1",
      prompt: "Conte uma situação em que atendeu um cliente insatisfeito e como resolveu.",
    },
    {
      id: "c2",
      prompt: "Qual sua disponibilidade de horários, escalas e região de atuação (presencial)?",
    },
    {
      id: "c3",
      prompt: "Você já atuou ou tem interesse na área de aviação/atendimento aeroportuário? Conte.",
    },
    { id: "c4", prompt: "Como você lida com clientes sob pressão ou em situações de conflito?" },
    {
      id: "c5",
      prompt: "Descreva uma ocasião em que atendeu diversas pessoas ao mesmo tempo.",
    },
    {
      id: "c6",
      prompt: "Como você define prioridades quando vários clientes aguardam atendimento?",
    },
    {
      id: "c7",
      prompt: "Conte um exemplo em que superou as expectativas de um cliente (resultado/métrica).",
    },
    { id: "c8", prompt: "Como você trabalha em equipe durante períodos de alta demanda?" },
    { id: "c9", prompt: "Como reage a mudanças inesperadas na rotina de trabalho?" },
    {
      id: "c10",
      prompt: "Por que deseja atuar em atendimento e relacionamento com clientes (cultura Azul)?",
    },
  ],
  qualidade: [
    {
      id: "q1",
      prompt:
        "Conte uma situação em que identificou não conformidade e como aplicou CAPA/correção.",
    },
    {
      id: "q2",
      prompt: "Quais normas você domina (ISO 9001, ISO 13485, ANVISA) e como conduz auditorias?",
    },
    {
      id: "q3",
      prompt: "Descreva uma melhoria de processo com indicadores/KPIs e os resultados obtidos.",
    },
    {
      id: "q4",
      prompt: "Como você organiza registros, procedimentos e documentação da qualidade?",
    },
    {
      id: "q5",
      prompt: "Conte uma auditoria ou inspeção (interna/externa) e qual foi sua atuação.",
    },
    { id: "q6", prompt: "Como você comunica desvios e ações preventivas a outras equipes?" },
    {
      id: "q7",
      prompt: "Como lida com erros recorrentes (Ishikawa, Pareto, FMEA, 5 Porquês)?",
    },
    { id: "q8", prompt: "Quais ferramentas e metodologias da qualidade você utiliza?" },
    { id: "q9", prompt: "Como você organiza e prioriza suas atividades?" },
    { id: "q10", prompt: "O que significa excelência para você na área de qualidade?" },
  ],
  manutencao: [
    {
      id: "m1",
      prompt: "Possui CHT/CCT/MMA? Descreva os módulos (GMP/CEL/AVI) e o tempo de habilitação.",
    },
    {
      id: "m2",
      prompt: "Conte uma manutenção preventiva/corretiva em aeronave ou equipamento e o resultado.",
    },
    {
      id: "m3",
      prompt: "Como você interpreta e aplica manuais técnicos (AMM, IPC) e documentação em inglês?",
    },
    {
      id: "m4",
      prompt: "Descreva uma manutenção complexa e como restaurou a aeronavegabilidade.",
    },
    {
      id: "m5",
      prompt: "Como você registra Ordens de Serviço e garante o controle de qualidade?",
    },
    { id: "m6", prompt: "Como você trabalha sob pressão em operações críticas ou isoladas?" },
    { id: "m7", prompt: "Como você identifica riscos antes da execução (segurança operacional)?" },
    { id: "m8", prompt: "Como você mantém seus conhecimentos técnicos atualizados?" },
    {
      id: "m9",
      prompt: "Conte uma situação em que trabalhou em equipe para solucionar um problema técnico.",
    },
    { id: "m10", prompt: "O que significa segurança operacional para você?" },
  ],
  sst: [
    {
      id: "s1",
      prompt: "Possui formação técnica em SST? Conte sua atuação e as NRs que domina (PGR/PCMSO).",
    },
    { id: "s2", prompt: "Conte uma situação em que identificou um risco e aplicou prevenção." },
    { id: "s3", prompt: "Como você orienta colaboradores sobre normas de segurança?" },
    { id: "s4", prompt: "Descreva uma inspeção ou auditoria de segurança que realizou." },
    { id: "s5", prompt: "Como você incentiva a prevenção de acidentes no ambiente de trabalho?" },
    {
      id: "s6",
      prompt: "Quais NRs utiliza com maior frequência e como monitora a conformidade?",
    },
    { id: "s7", prompt: "Como você organiza treinamentos e campanhas de segurança/SSMA?" },
    { id: "s8", prompt: "Como você registra ocorrências e acompanha ações corretivas?" },
    {
      id: "s9",
      prompt: "Como lida com colaboradores resistentes ao cumprimento das normas de segurança?",
    },
    { id: "s10", prompt: "Por que escolheu atuar na área de Saúde e Segurança do Trabalho?" },
  ],
  administrativo: [
    { id: "a1", prompt: "Como você organiza suas atividades diárias?" },
    {
      id: "a2",
      prompt: "Conte uma situação em que precisou lidar com várias demandas ao mesmo tempo.",
    },
    { id: "a3", prompt: "Como utiliza o Pacote Office na sua rotina profissional?" },
    { id: "a4", prompt: "Como garante a organização de documentos e informações?" },
    { id: "a5", prompt: "Conte uma situação em que atendeu um cliente interno ou externo." },
    { id: "a6", prompt: "Como evita erros em atividades administrativas?" },
    { id: "a7", prompt: "Como reage quando precisa aprender um novo processo ou sistema?" },
    { id: "a8", prompt: "Descreva uma melhoria administrativa que você sugeriu ou implementou." },
    { id: "a9", prompt: "Como lida com prazos curtos e mudanças de prioridade?" },
    { id: "a10", prompt: "Por que deseja atuar na área administrativa?" },
  ],
  docente: [
    { id: "d1", prompt: "Conte uma situação em que precisou adaptar sua metodologia de ensino." },
    { id: "d2", prompt: "Como motiva alunos com diferentes perfis de aprendizagem?" },
    { id: "d3", prompt: "Como avalia o desenvolvimento e o aprendizado dos estudantes?" },
    { id: "d4", prompt: "Como utiliza tecnologia para enriquecer suas aulas?" },
    { id: "d5", prompt: "Descreva um desafio enfrentado em sala de aula e como o solucionou." },
    { id: "d6", prompt: "Como resolve conflitos entre alunos?" },
    { id: "d7", prompt: "Como organiza seu planejamento pedagógico?" },
    { id: "d8", prompt: "Como recebe e utiliza feedback para melhorar sua prática docente?" },
    { id: "d9", prompt: "Como incentiva a participação e o protagonismo dos estudantes?" },
    { id: "d10", prompt: "O que significa excelência na educação para você?" },
  ],
  militar: [
    { id: "mb1", prompt: "Conte uma situação em que precisou tomar uma decisão sob pressão." },
    {
      id: "mb2",
      prompt: "Como sua experiência militar contribuiu para seu desenvolvimento profissional?",
    },
    { id: "mb3", prompt: "Como você exerce liderança em equipes?" },
    { id: "mb4", prompt: "Como mantém a disciplina em situações desafiadoras?" },
    { id: "mb5", prompt: "Descreva uma missão em que o trabalho em equipe foi essencial." },
    { id: "mb6", prompt: "Como lida com mudanças de planejamento ou prioridades?" },
    { id: "mb7", prompt: "Conte uma situação em que precisou resolver um conflito." },
    { id: "mb8", prompt: "Como organiza suas atividades e prioridades?" },
    {
      id: "mb9",
      prompt:
        "Quais competências desenvolvidas na carreira militar considera mais relevantes para esta vaga?",
    },
    {
      id: "mb10",
      prompt: "Por que deseja fazer a transição da carreira militar para o setor civil?",
    },
  ],
};

export function getQuestionnaireForGroup(group: ProfessionGroup): QuestionnaireQuestion[] {
  return QUESTIONNAIRES[group];
}

// Critérios de mérito por grupo de profissão, derivados de perfis reais de
// candidatos da Azul (Comissário/Agente, Liderança de TI, Mecânico de
// Manutenção, SST e Qualidade). 100% baseados em mérito — sem nome, gênero,
// idade ou origem. Usados na criação de vagas e na pontuação (scoreCandidate).
type CriterionTemplate = Omit<Criterion, "id">;

const GROUP_CRITERIA_TEMPLATES: Record<ProfessionGroup, CriterionTemplate[]> = {
  leadership: [
    {
      label: "Liderança & gestão de pessoas",
      keywords:
        "liderança, liderança servidora, gestão de pessoas, times, mentoria, desenvolvimento de times",
      weight: 10,
      required: true,
    },
    {
      label: "Metodologias ágeis",
      keywords: "ágil, scrum, kanban, safe, lean, agile, okr",
      weight: 9,
      required: true,
    },
    {
      label: "Gestão de projetos / portfólio",
      keywords: "gestão de projetos, pmo, portfólio, governança, indicadores",
      weight: 8,
      required: true,
    },
    {
      label: "Experiência em TI / engenharia",
      keywords: "ti, software, desenvolvimento, arquitetura, devops, microsserviços",
      weight: 7,
      required: true,
    },
    {
      label: "Comunicação executiva",
      keywords: "comunicação, stakeholders, executivo, storytelling, relatórios",
      weight: 6,
      required: true,
    },
    {
      label: "Transformação digital / inovação",
      keywords: "transformação digital, inovação, digitalização",
      weight: 5,
      required: false,
    },
    {
      label: "IA & dados",
      keywords: "ia, inteligência artificial, analytics, llms, dados, prompts",
      weight: 4,
      required: false,
    },
    {
      label: "Melhoria contínua / métricas",
      keywords: "kpi, métricas, melhoria contínua, dora, ciclo de vida",
      weight: 4,
      required: false,
    },
    {
      label: "Cultura & colaboração",
      keywords: "colaboração, cultura, engajamento, autonomia",
      weight: 3,
      required: false,
    },
    {
      label: "Idiomas",
      keywords: "inglês, espanhol",
      weight: 3,
      required: false,
    },
  ],
  ti: [
    {
      label: "Metodologias ágeis",
      keywords: "ágil, scrum, kanban, safe, lean, agile",
      weight: 9,
      required: true,
    },
    {
      label: "Engenharia de software / TI",
      keywords: "ti, software, desenvolvimento, arquitetura, devops, microsserviços",
      weight: 8,
      required: true,
    },
    {
      label: "Levantamento de requisitos",
      keywords: "requisitos, backlog, user stories, histórias, modelagem",
      weight: 8,
      required: true,
    },
    {
      label: "Comunicação técnica / negócio",
      keywords: "comunicação, negócio, stakeholder, interlocução, documentação",
      weight: 6,
      required: true,
    },
    {
      label: "Transformação digital / inovação",
      keywords: "transformação digital, inovação, digitalização",
      weight: 5,
      required: false,
    },
    {
      label: "IA & dados",
      keywords: "ia, inteligência artificial, analytics, llms, dados, prompts",
      weight: 4,
      required: false,
    },
    {
      label: "Métricas e melhoria contínua",
      keywords: "métricas, kpi, melhoria contínua, flow, dora",
      weight: 4,
      required: false,
    },
    {
      label: "Gestão / mentoria",
      keywords: "liderança, mentoria, facilitação, coaching",
      weight: 4,
      required: false,
    },
  ],
  comercial: [
    {
      label: "Atendimento & disponibilidade presencial",
      keywords: "atendimento, cliente, presencial, disponibilidade",
      weight: 9,
      required: true,
    },
    {
      label: "Comunicação & relacionamento",
      keywords: "comunicação, relacionamento, público, hospitalidade",
      weight: 7,
      required: true,
    },
    {
      label: "Experiência comercial / varejo",
      keywords: "comercial, caixa, venda, repositor, atendimento ao público",
      weight: 7,
      required: true,
    },
    {
      label: "Trabalho em equipe",
      keywords: "equipe, colaboração, colaborar",
      weight: 5,
      required: true,
    },
    {
      label: "Conhecimento em aviação",
      keywords: "aeroporto, voo, aeronave, aviação, embarque, check-in",
      weight: 4,
      required: false,
    },
    {
      label: "Serviço / cuidado",
      keywords: "cuidador, infantil, serviço, apoio",
      weight: 2,
      required: false,
    },
    {
      label: "Idiomas",
      keywords: "inglês, espanhol",
      weight: 2,
      required: false,
    },
    {
      label: "Fit cultural Azul (ação social)",
      keywords: "ação social, voluntário, voluntária, hospitalidade",
      weight: 2,
      required: false,
    },
  ],
  qualidade: [
    {
      label: "Formação em qualidade / farmácia",
      keywords: "qualidade, farmácia, gestão da qualidade, bioquímica",
      weight: 10,
      required: true,
    },
    {
      label: "ISO / normas",
      keywords: "iso 9001, iso 13485, norma, auditor líder, anvisa",
      weight: 9,
      required: true,
    },
    {
      label: "Não conformidade / CAPA",
      keywords: "não conformidade, capa, desvio, correção, preventiva",
      weight: 8,
      required: true,
    },
    {
      label: "Indicadores / KPIs",
      keywords: "indicadores, kpi, performance",
      weight: 6,
      required: true,
    },
    {
      label: "Procedimentos / documentação",
      keywords: "procedimento, manual, instrução de trabalho, documentação",
      weight: 6,
      required: true,
    },
    {
      label: "Auditoria & inspeção",
      keywords: "auditoria, inspeção, homologação, gmp",
      weight: 5,
      required: false,
    },
    {
      label: "Gestão de equipes",
      keywords: "equipe, coordenação, liderança",
      weight: 4,
      required: false,
    },
    {
      label: "Cadeia fria / logística farma",
      keywords: "cadeia fria, temperatura, logística, farmacêutica",
      weight: 4,
      required: false,
    },
    {
      label: "Ferramentas da qualidade",
      keywords: "ishikawa, pareto, fmea, 5 por quês",
      weight: 3,
      required: false,
    },
    {
      label: "Idiomas",
      keywords: "inglês, espanhol",
      weight: 3,
      required: false,
    },
    {
      label: "Fit cultural Azul (ação social)",
      keywords: "ação social, doação, voluntário",
      weight: 2,
      required: false,
    },
  ],
  manutencao: [
    {
      label: "Habilitação aeronáutica (CHT/CCT/MMA)",
      keywords: "cht, cct, mma, certificado de habilitação",
      weight: 10,
      required: true,
    },
    {
      label: "Manutenção aeronáutica prática",
      keywords: "manutenção, aeronave, aeronavegabilidade, preventiva, corretiva",
      weight: 9,
      required: true,
    },
    {
      label: "Conformidade técnica / manuais",
      keywords: "manual, amm, ipc, conformidade, documentação técnica",
      weight: 8,
      required: true,
    },
    {
      label: "Segurança operacional",
      keywords: "segurança, incêndio, pista, procedimentos, socorro",
      weight: 8,
      required: true,
    },
    {
      label: "Módulos (GMP/CEL/AVI)",
      keywords: "gmp, cel, avi, motor, célula, aviônica",
      weight: 7,
      required: true,
    },
    {
      label: "Experiência militar / operacional",
      keywords: "militar, marinha, operacional, pressão, disciplina",
      weight: 4,
      required: false,
    },
    {
      label: "Inglês técnico",
      keywords: "inglês, documentação em inglês",
      weight: 3,
      required: false,
    },
    {
      label: "Trabalho em equipe / liderança",
      keywords: "equipe, liderança, coordenação, tropa",
      weight: 3,
      required: false,
    },
    {
      label: "Controle de qualidade (OS)",
      keywords: "ordem de serviço, qualidade, inspeção, vibração",
      weight: 3,
      required: false,
    },
  ],
  sst: [
    {
      label: "Formação técnica em SST",
      keywords: "segurança do trabalho, sst, técnico em segurança",
      weight: 10,
      required: true,
    },
    {
      label: "NRs / legislação SST",
      keywords: "nr, norma regulamentadora, pgr, pcmso, legislação, documentação legal",
      weight: 9,
      required: true,
    },
    {
      label: "Treinamentos & campanhas",
      keywords: "treinamento, integração, campanha, conscientização",
      weight: 7,
      required: true,
    },
    {
      label: "Indicadores / dashboards",
      keywords: "indicadores, dashboard, planilha, desempenho",
      weight: 6,
      required: true,
    },
    {
      label: "SSMA / meio ambiente",
      keywords: "ssma, meio ambiente, ambiental",
      weight: 5,
      required: true,
    },
    {
      label: "Auditoria & conformidade",
      keywords: "auditoria, conformidade, sg3, siclope, sgc",
      weight: 4,
      required: false,
    },
    {
      label: "Gestão de contratos / clientes",
      keywords: "contratos, clientes, requisitos",
      weight: 3,
      required: false,
    },
    {
      label: "Comunicação & orientação",
      keywords: "orientação, relatórios, suporte",
      weight: 3,
      required: false,
    },
    {
      label: "Ação social / voluntariado (fit cultural)",
      keywords: "voluntário, social, diálise",
      weight: 2,
      required: false,
    },
  ],
  administrativo: [
    {
      label: "Organização e planejamento",
      keywords: "organização, planejamento, agenda, prioridade",
      weight: 10,
      required: true,
    },
    {
      label: "Pacote Office",
      keywords: "excel, word, power point, planilha, office",
      weight: 8,
      required: true,
    },
    {
      label: "Atendimento",
      keywords: "atendimento, cliente, interno, externo",
      weight: 6,
      required: false,
    },
    {
      label: "Gestão de documentos",
      keywords: "documentos, arquivo, controle, prazos",
      weight: 6,
      required: false,
    },
  ],
  docente: [
    {
      label: "Metodologias de ensino",
      keywords: "metodologia, ensino, pedagogia, aprendizagem",
      weight: 10,
      required: true,
    },
    {
      label: "Planejamento pedagógico",
      keywords: "planejamento, plano de aula, currículo",
      weight: 8,
      required: true,
    },
    {
      label: "Tecnologia educacional",
      keywords: "tecnologia, digital, lms, recursos",
      weight: 6,
      required: false,
    },
    {
      label: "Avaliação e feedback",
      keywords: "avaliação, feedback, nota",
      weight: 6,
      required: false,
    },
  ],
  militar: [
    {
      label: "Liderança militar",
      keywords: "liderança, comando, equipe, disciplina",
      weight: 10,
      required: true,
    },
    {
      label: "Decisão sob pressão",
      keywords: "pressão, crítica, emergência, resposta",
      weight: 8,
      required: true,
    },
    {
      label: "Trabalho em equipe",
      keywords: "equipe, missão, colaboração",
      weight: 7,
      required: false,
    },
    {
      label: "Transição para o civil",
      keywords: "transição, civil, carreira",
      weight: 6,
      required: false,
    },
  ],
};

// Retorna um novo conjunto de critérios (com ids únicos) para o grupo.
export function getCriteriaForGroup(group: ProfessionGroup): Criterion[] {
  const tpl = GROUP_CRITERIA_TEMPLATES[group] ?? [];
  return tpl.map((c) => ({ ...c, id: uid() }));
}

// Primeira profissão de um grupo (usado para pré-selecionar no formulário).
export function firstProfessionOfGroup(group: ProfessionGroup): string {
  return PROFESSIONS.find((p) => p.group === group)?.id ?? PROFESSIONS[0].id;
}

// Tenta inferir o grupo de profissão a partir do título de uma vaga (usado em
// lotes importados do Gupy, onde a vaga é criada automaticamente).
export function detectProfessionGroup(title: string): ProfessionGroup {
  const s = title.toLowerCase();
  if (/(lider|lideran|gerente|coordena|squad|negócio|negocio|venda|diretor|manager|head)/.test(s))
    return "leadership";
  if (/(qualidade|qualidade|auditor|inspetor|iso|não conform|não-conform|nãoconform)/.test(s))
    return "qualidade";
  if (
    /(manuten|mecânico|mecanico|aeronave|aeronáutic|aeronautic|inspetor|técnico de manuten|tecnico de manuten)/.test(
      s,
    )
  )
    return "manutencao";
  if (
    /(segurança|seguranca|sst|sms|nr-|nr |ocupacional|prevenção|prevencao|ambiente de trabalho)/.test(
      s,
    )
  )
    return "sst";
  if (
    /(administrat|auxiliar administr|assistente administr|escritório|escritorio|backoffice)/.test(s)
  )
    return "administrativo";
  if (/(docente|professor|educação|educacao|ensino|pedagog|escola|professora)/.test(s))
    return "docente";
  if (
    /(militar|marinha|exército|exercito|exército|força aérea|forca aerea|fuzileiro|eb|fab|mb)/.test(
      s,
    )
  )
    return "militar";
  if (
    /(tecnologia|ti|tech|ágil|agil|ágei|scrum|analista|desenvolv|dados|sistema|produto|ti\b)/.test(
      s,
    )
  )
    return "ti";
  return "comercial";
}

export type Job = {
  id: string;
  title: string;
  department: string;
  description: string;
  minExperience: number; // years
  minEducation: "none" | "medio" | "tecnico" | "superior" | "pos";
  criteria: Criterion[];
  cutoff: number; // 0-5 (nota mínima para aprovação)
  createdAt: number;
  profession: string; // id da profissão (ver PROFESSIONS)
  questionnaire: QuestionnaireQuestion[];
};

export type Candidate = {
  id: string;
  jobId: string;
  // Anonymizable identity — hidden from ranking view by default
  fullName: string;
  email: string;
  phone?: string;
  // Merit data
  experienceYears: number;
  education: string;
  skills: string; // free text / comma-separated
  certifications?: string;
  languages?: string;
  raw: Record<string, unknown>;
  score: number; // 0.0 – 5.0
  matched: string[]; // matched criteria labels
  missingRequired: string[];
  justification: string; // texto explicando a nota (auditável / antiviés)
  status: "screening" | "approved" | "rejected" | "invited" | "answered";
  inviteToken?: string;
  answers?: Record<string, string>; // questionId -> resposta
  questionnaireSubmittedAt?: number;
  aiAnalysis?: {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendation: "avancar" | "revisar" | "descartar";
    confidence: number;
    perQuestion: { id: string; observation: string }[];
    model: string;
    createdAt: number;
  } | null;
};

const K_JOBS = "skyhire.jobs.v1";
const K_CANDS = "skyhire.candidates.v1";

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(v));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// --- Jobs ---
export function listJobs(): Job[] {
  return read<Job[]>(K_JOBS, []).sort((a, b) => b.createdAt - a.createdAt);
}
export function getJob(id: string): Job | undefined {
  return listJobs().find((j) => j.id === id);
}
export function saveJob(job: Job) {
  const all = read<Job[]>(K_JOBS, []);
  const idx = all.findIndex((j) => j.id === job.id);
  if (idx >= 0) all[idx] = job;
  else all.push(job);
  write(K_JOBS, all);
}
export function deleteJob(id: string) {
  write(
    K_JOBS,
    read<Job[]>(K_JOBS, []).filter((j) => j.id !== id),
  );
  write(
    K_CANDS,
    read<Candidate[]>(K_CANDS, []).filter((c) => c.jobId !== id),
  );
}

// --- Candidates ---
export function listCandidates(jobId?: string): Candidate[] {
  const all = read<Candidate[]>(K_CANDS, []);
  return jobId ? all.filter((c) => c.jobId === jobId) : all;
}
export function getCandidateByToken(token: string): Candidate | undefined {
  return read<Candidate[]>(K_CANDS, []).find((c) => c.inviteToken === token);
}
export function getCandidateByEmail(email: string): Candidate | undefined {
  const e = email.trim().toLowerCase();
  return read<Candidate[]>(K_CANDS, []).find((c) => c.email.trim().toLowerCase() === e);
}
export function getCandidateByJobAndEmail(jobId: string, email: string): Candidate | undefined {
  const e = email.trim().toLowerCase();
  return read<Candidate[]>(K_CANDS, []).find(
    (c) => c.jobId === jobId && c.email.trim().toLowerCase() === e,
  );
}
export function saveCandidates(candidates: Candidate[]) {
  const all = read<Candidate[]>(K_CANDS, []);
  const map = new Map(all.map((c) => [c.id, c]));
  for (const c of candidates) map.set(c.id, c);
  write(K_CANDS, Array.from(map.values()));
}
export function replaceJobCandidates(jobId: string, candidates: Candidate[]) {
  const others = read<Candidate[]>(K_CANDS, []).filter((c) => c.jobId !== jobId);
  write(K_CANDS, [...others, ...candidates]);
}
export function updateCandidate(id: string, patch: Partial<Candidate>) {
  const all = read<Candidate[]>(K_CANDS, []);
  const idx = all.findIndex((c) => c.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...patch };
    write(K_CANDS, all);
  }
}

// --- Scoring engine ---
// Fair scoring: only considers merit fields. Ignores name, email, phone, age, gender.
const EDU_RANK: Record<string, number> = {
  none: 0,
  medio: 1,
  tecnico: 2,
  superior: 3,
  pos: 4,
};

export function scoreCandidate(
  job: Job,
  cand: Omit<
    Candidate,
    "score" | "matched" | "missingRequired" | "justification" | "status" | "id" | "jobId"
  >,
) {
  const haystack = [cand.skills, cand.certifications ?? "", cand.languages ?? "", cand.education]
    .join(" ")
    .toLowerCase();

  const matched: string[] = [];
  const missingRequired: string[] = [];
  let earned = 0;
  let total = 0;

  for (const c of job.criteria) {
    total += c.weight;
    const kws = c.keywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    const hit = kws.some((k) => haystack.includes(k));
    if (hit) {
      earned += c.weight;
      matched.push(c.label);
    } else if (c.required) {
      missingRequired.push(c.label);
    }
  }

  // Experiência: escala 0-1 relativa ao mínimo da vaga
  const expScore = Math.min(1, cand.experienceYears / Math.max(1, job.minExperience || 1));
  const eduOk = EDU_RANK[normalizeEducation(cand.education)] >= EDU_RANK[job.minEducation];

  // Nota 0–5: 80% critérios ponderados + 20% experiência
  const criteriaFrac = total > 0 ? earned / total : 0.8;
  let raw = criteriaFrac * 4 + expScore * 1; // 0..5

  if (!eduOk) {
    raw = raw * 0.5;
    missingRequired.push("Escolaridade mínima");
  }
  if (cand.experienceYears < job.minExperience) {
    missingRequired.push(`Experiência mínima (${job.minExperience} anos)`);
  }

  const baseScore = Math.round(Math.max(0, Math.min(5, raw)) * 10) / 10;

  // Bônus de fit cultural Azul (valores da companhia) — teto de +0.3 na nota
  const azulHits = AZUL_VALUE_KEYWORDS.filter((k) => haystack.includes(k));
  const cultureBonus = Math.min(0.3, azulHits.length * 0.08);
  let score = Math.round(Math.min(5, baseScore + cultureBonus) * 10) / 10;

  // Justificativa auditável — apenas critérios de mérito (LGPD/antiviés)
  const parts: string[] = [];
  parts.push(
    total > 0
      ? `Atendeu ${matched.length} de ${job.criteria.length} critérios (${Math.round(criteriaFrac * 100)}% do peso)`
      : `Sem critérios definidos`,
  );
  parts.push(`${cand.experienceYears} anos de experiência (mín. ${job.minExperience})`);
  parts.push(`Formação: ${cand.education || "não informada"}${eduOk ? "" : " — abaixo do mínimo"}`);
  if (azulHits.length)
    parts.push(
      `Fit cultural Azul: ${azulHits.slice(0, 4).join(", ")}${azulHits.length > 4 ? "…" : ""} (+${cultureBonus.toFixed(2)})`,
    );
  if (missingRequired.length) parts.push(`Requisitos ausentes: ${missingRequired.join(", ")}`);

  // Avaliação das respostas do questionário (quando o candidato respondeu).
  // Heurística determinística e auditável: premia evidências de experiência,
  // resultados e aderência ao cargo; penaliza respostas vazias/curtas ou que
  // declarem ausência de experiência. Sem uso de LLM — 100% local.
  if (cand.answers && Object.keys(cand.answers).length > 0) {
    const ev = evaluateAnswers(cand.answers, job);
    score = Math.round(Math.min(5, score * 0.7 + ev.score * 0.3) * 10) / 10;
    if (ev.notes.length) parts.push(`Questionário: ${ev.notes.join("; ")}`);
  }

  const justification = parts.join(" · ");

  return { score, matched, missingRequired, justification };
}

// Avalia o conteúdo textual das respostas do questionário e devolve uma nota
// 0–5 com justificativas. Baseia-se em evidências explícitas (anos citados,
// resultados/métricas, termos do cargo) — nunca em nome, gênero ou aparência.
export function evaluateAnswers(
  answers: Record<string, string>,
  job: Job,
): { score: number; notes: string[] } {
  const answered = Object.values(answers)
    .map((a) => (a ?? "").trim())
    .filter((a) => a.length > 0);
  if (answered.length === 0) {
    return { score: 0, notes: ["Questionário em branco"] };
  }

  const corpus = answered.join(" ").toLowerCase();
  const words = corpus.split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  const avgLen = totalWords / answered.length;

  // Sinais de ausência de experiência
  const lackRe =
    /(n[aã]o sei|nunca|sem experi[eê]ncia|n[aã]o tenho|n[aã]o possuo|n[aã]o tive|ainda n[aã]o|sem experi|falta de experi)/;
  const lackHits = (corpus.match(lackRe) || []).length;

  // Sinais de experiência / resultados (verbos de ação + métricas)
  const resultRe =
    /(aument|reduz|melhor|econom|lider|conduz|implement|alcanc|alcanç|resultad|entreg|negoci|resolv|otimiz|superou|super|ating|conquist|coordene|gerenci|treine|desenvolv|gerei|criei|estruturei)/;
  const resultHits = (corpus.match(resultRe) || []).length;
  const hasYears = /(\d{1,2})\s*(anos|ano|years|anos de)/.test(corpus);

  // Aderência ao cargo: termos dos critérios + palavras-chave Azul
  const kwHits = countKeywordHits(corpus, job);

  let s = 2.5; // neutro
  const notes: string[] = [];

  if (totalWords < 30 || avgLen < 6) {
    s -= 1.3;
    notes.push("respostas curtas/pouco desenvolvidas");
  }
  if (lackHits > 0) {
    s -= 0.6 * Math.min(lackHits, 3);
    notes.push(`declara ausência de experiência (${Math.min(lackHits, 3)}x)`);
  }
  if (hasYears) {
    s += 0.8;
    notes.push("cita tempo de experiência");
  }
  if (resultHits > 0) {
    s += Math.min(1.3, resultHits * 0.25);
    notes.push(`evidências de ações/resultados (${resultHits})`);
  }
  if (kwHits > 0) {
    s += Math.min(1.1, kwHits * 0.15);
    notes.push(`aderência ao cargo (${kwHits} termos)`);
  }

  s = Math.max(0, Math.min(5, Math.round(s * 10) / 10));
  if (notes.length === 0) notes.push("respostas genéricas sem evidências claras");
  return { score: s, notes };
}

function countKeywordHits(corpus: string, job: Job): number {
  const kws = new Set<string>();
  for (const c of job.criteria) {
    for (const k of c.keywords.split(",")) {
      const t = k.trim().toLowerCase();
      if (t.length >= 3) kws.add(t);
    }
  }
  for (const v of AZUL_VALUE_KEYWORDS) if (v.length >= 3) kws.add(v);
  let hits = 0;
  for (const k of kws) if (corpus.includes(k)) hits++;
  return hits;
}

// Valores e código de cultura da Azul Linhas Aéreas — usados como bônus de fit,
// nunca como corte eliminatório (para preservar mérito e LGPD).
export const AZUL_VALUE_KEYWORDS = [
  "paixão",
  "paixao",
  "cliente",
  "hospitalidade",
  "atendimento",
  "segurança",
  "seguranca",
  "inovação",
  "inovacao",
  "criatividade",
  "excelência",
  "excelencia",
  "qualidade",
  "integridade",
  "ética",
  "etica",
  "trabalho em equipe",
  "colaboração",
  "colaboracao",
  "equipe",
  "resultado",
  "protagonismo",
  "iniciativa",
  "diversidade",
  "inclusão",
  "inclusao",
];

// Shortlist — top 10% (mín. 1) entre os que passam do corte. Usado para lotes
// grandes (planilhas Gupy, 500+ aplicações).
export const SHORTLIST_PCT = 0.1;

export function shortlistIds(job: Job, candidates: Candidate[], pct = SHORTLIST_PCT): Set<string> {
  const eligible = candidates.filter((c) => passesCutoff(job, c)).sort((a, b) => b.score - a.score);
  const n = Math.max(1, Math.ceil(candidates.length * pct));
  return new Set(eligible.slice(0, n).map((c) => c.id));
}

export function normalizeEducation(raw: string): string {
  const s = (raw || "").toLowerCase();
  if (/pós|pos|mestrado|doutorado|mba/.test(s)) return "pos";
  if (/superior|graduação|graduacao|bacharel|licenciatura|engenharia|universidade/.test(s))
    return "superior";
  if (/técnico|tecnico|tecnólogo|tecnologo/.test(s)) return "tecnico";
  if (/médio|medio|ensino médio|colegial/.test(s)) return "medio";
  return "none";
}

export function passesCutoff(job: Job, c: Candidate): boolean {
  return c.score >= job.cutoff && c.missingRequired.length === 0;
}
