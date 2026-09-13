import { useLocale } from "../i18n/LocaleProvider";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useReveal, splitWords } from "../lib/useReveal";
import MouseTrail from "../components/MouseTrail";
import PingPongVideo from "../components/PingPongVideo";

// Fotos do hero da página Empresa. Substitua estes caminhos pelas fotos
// enviadas pelo cliente. Coloque os arquivos em /public/assets/empresa-hero/
// e liste-os aqui.
const EMPRESA_HERO_IMAGES = [
  "/assets/empresa-hero/hero-1.webp",
  "/assets/empresa-hero/hero-2.webp",
  "/assets/empresa-hero/hero-3.webp",
  "/assets/empresa-hero/hero-4.webp",
  "/assets/empresa-hero/hero-5.webp",
  "/assets/empresa-hero/hero-6.webp",
];

// SEÇÃO 2 — NOSSA HISTÓRIA
const TIMELINE = [
  {
    y: "2001",
    t: "Fundação em Parobé/RS",
    d: "A Gi é fundada por Juvenil Alves de Souza e Guido Rauch de Souza, com foco em matrizes para conformação de palmilhas, atendendo inicialmente a Palmisinos.",
  },
  {
    y: "2003",
    t: "Nova sede e expansão da matrizaria",
    d: "A empresa adquire seu prédio próprio na RS-239, onde está até hoje, e inicia um ciclo contínuo de investimento em tecnologia de usinagem e ferramental.",
  },
  {
    y: "2007",
    t: "Matrizes para injeção de solados",
    d: "Com a implementação de CNCs para usinagem e ferramental, a Gi passa a produzir matrizes para injeção de solados, ampliando o escopo técnico.",
  },
  {
    y: "2008",
    t: "Início da injeção de solados em EVA",
    d: "A Gi adquire sua primeira máquina injetora de EVA e começa a injetar solas dentro da própria empresa, aumentando a capacidade produtiva e o controle de qualidade.",
  },
  {
    y: "2022",
    t: "Segunda unidade e produção de compostos em EVA",
    d: "Inauguração da segunda unidade, dedicada à produção de matéria-prima em EVA e à injeção de solas, consolidando a integração entre matrizaria, solado e composto.",
  },
  {
    y: "2024",
    t: "Ampliação da filial e E-TPU (Gi Reboot®)",
    d: "Ampliação da unidade de compostos e início da injeção de solas em E-TPU (Gi Reboot®), com parque de máquinas pioneiro no Brasil e foco em novas aplicações além do calçado.",
  },
];

// SEÇÃO 3 — ESTRUTURA INTEGRADA
const ESTRUTURA = [
  {
    n: "01",
    t: "Matrizaria de alta precisão",
    d: "Equipe própria de projetistas, CNCs de 5 eixos e laboratório 3D para desenvolvimento de matrizes para solados e componentes, com foco em encaixe, repetibilidade e controle dimensional.",
  },
  {
    n: "02",
    t: "Injeção de solados em EVA",
    d: "Produção de solados e chinelos em EVA para diferentes segmentos, com controle de densidade, dureza e acabamento, alinhados às necessidades de cada cliente.",
  },
  {
    n: "03",
    t: "Gi Reboot® — E\u2011TPU da Gi",
    d: "E-TPU desenvolvido e processado pela própria Gi, aplicado em conjunto com o EVA em linhas de alta performance e em outras aplicações industriais que exigem alto retorno de energia e durabilidade.",
  },
  {
    n: "04",
    t: "Compostos em EVA sob medida",
    d: "Desenvolvimento e produção de compostos em EVA para uso interno e para parceiros estratégicos, ajustando formulações conforme o tipo de aplicação e processo de injeção.",
  },
];

// SEÇÃO 5 — PESSOAS E CULTURA
const PESSOAS = [
  {
    t: "Equipe experiente e estável",
    d: "Muitos colaboradores com anos de casa, o que preserva conhecimento técnico e garante consistência na execução dos projetos.",
  },
  {
    t: "Proximidade no dia a dia",
    d: "Direção presente na rotina da fábrica, facilitando decisões rápidas e alinhamento entre áreas técnicas, produção e atendimento ao cliente.",
  },
  {
    t: "Orgulho de fazer parte",
    d: "Em auditorias externas, colaboradores relatam espontaneamente satisfação em trabalhar na Gi, reforçando um ambiente de respeito e responsabilidade.",
  },
];

// SEÇÃO 6 — SUSTENTABILIDADE INTEGRADA AO PROCESSO
const SUSTENTAVEL = [
  {
    t: "Linhas Recovery e Green",
    d: "Linhas que utilizam insumos reciclados (como pó de borracha de pneu e sobras de EVA) e polímeros de origem renovável, reduzindo o uso de matérias-primas fósseis.",
  },
  {
    t: "Economia circular na prática",
    d: "Reaproveitamento de alumínio, óleos e resíduos de EVA em processos internos, diminuindo desperdício e necessidade de insumos virgens.",
  },
  {
    t: "Gestão de água",
    d: "100% da água utilizada na produção é tratada e reutilizada, reduzindo o impacto sobre recursos hídricos.",
  },
  {
    t: "Energia de fonte renovável",
    d: "A operação da Gi utiliza energia elétrica proveniente de fontes renováveis, contribuindo para uma matriz energética mais limpa.",
  },
  {
    t: "Programa Origem Sustentável",
    d: "A Gi está em processo de certificação no programa Origem Sustentável, com práticas auditáveis e foco em melhoria contínua em critérios ambientais, sociais e de governança.",
  },
];

// SEÇÃO 7 — MISSÃO, VISÃO, VALORES E POLÍTICA DE QUALIDADE
const MVV = [
  {
    t: "Missão",
    d: "Desenvolver soluções inovadoras em matrizes e solados que proporcionem conforto, desempenho e sustentabilidade para a indústria calçadista e outras aplicações industriais.",
    bullets: null,
  },
  {
    t: "Visão",
    d: "Ser referência nacional em inovação e qualidade na produção de matrizes e solados de alta performance até 2030.",
    bullets: null,
  },
  {
    t: "Valores",
    d: null,
    bullets: [
      "Inovação aplicada ao desenvolvimento de matrizes, solados e compostos.",
      "Sustentabilidade integrada ao processo produtivo.",
      "Ética nas relações com clientes, fornecedores e colaboradores.",
      "Qualidade como compromisso em cada etapa do projeto.",
      "Respeito às pessoas, buscando sempre entregar mais que produtos: entregar confiança e parceria.",
    ],
  },
  {
    t: "Política de qualidade",
    d: null,
    bullets: [
      "Garantir a satisfação dos clientes, superando suas expectativas em relação a produto, atendimento e prazos.",
      "Manter o padrão de qualidade dos processos, assegurando a conformidade com os requisitos técnicos e normativos aplicáveis.",
      "Promover a melhoria contínua dos métodos de produção, controle e gestão.",
      "Investir no desenvolvimento da equipe, valorizando a capacitação, o comprometimento e a responsabilidade de cada colaborador.",
      "Contribuir para a sustentabilidade do negócio, com ética, inovação e responsabilidade social.",
    ],
  },
];

export default function Empresa() {
  const { tr } = useLocale();
  useReveal("empresa");
  const [openIdx, setOpenIdx] = useState(0);
  const heroTrailRef = useRef(null);

  // Nav imersiva (letras brancas) enquanto o hero escuro está visível
  useEffect(() => {
    const hero = heroTrailRef.current;
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio > 0.25) {
          document.body.classList.add("hero-immersive");
        } else {
          document.body.classList.remove("hero-immersive");
        }
      },
      { threshold: [0, 0.25, 0.5, 1] }
    );
    io.observe(hero);
    return () => {
      io.disconnect();
      document.body.classList.remove("hero-immersive");
    };
  }, []);

  return (
    <main data-testid="empresa-page">
      {/* SEÇÃO 1 — HERO IMERSIVO (estilo "Passos firmes e fortes") com título */}
      <section
        className="footprint trail-zone empresa-hero-trail"
        ref={heroTrailRef}
        data-testid="empresa-hero-trail"
      >
        <MouseTrail
          zoneRef={heroTrailRef}
          images={EMPRESA_HERO_IMAGES}
          autoStart={true}
        />
        <div className="shell empresa-hero-content">
          <h1 className="empresa-hero-title text-reveal" data-testid="empresa-hero-title">
            {splitWords(tr("Nossa história"))}
          </h1>
        </div>
      </section>

      {/* SEÇÃO 2 — NOSSA HISTÓRIA (timeline) */}
      <section className="section sec-white sec-timeline-dots">
        <div className="shell">
          <p data-testid="empresa-p-1" className="body-lg reveal" style={{ maxWidth: "72ch", color: "var(--cor-texto-muted)" }}>{tr("Desde 2001, a Gi cresce unindo matrizaria de alta precisão, desenvolvimento de solados e compostos em EVA e E-TPU, sempre com foco em desempenho técnico, seriedade nas entregas e parceria de longo prazo com quem produz calçados e componentes industriais.")}</p>

          <ol className="gi-timeline mt-xl" style={{ marginTop: "clamp(3.5rem, 7vw, 6rem)" }}>
            {TIMELINE.map((m, localeIndex0) => (
              <li className="gi-timeline-item reveal" key={m.y}>
                <span className="gi-timeline-dot" aria-hidden="true" />
                <div className="gi-timeline-year">{m.y}</div>
                <div className="gi-timeline-body">
                  <h3 data-testid={`empresa-h3-2-${localeIndex0}`}>{tr(m.t)}</h3>
                  <p data-testid={`empresa-p-3-${localeIndex0}`}>{tr(m.d)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SEÇÃO 3 — INOVAÇÃO, MATRIZARIA E ESTRUTURA INTEGRADA */}
      <section className="section sec-warm sec-inovacao-bg" id="produtos">
        <PingPongVideo
          src="/inovacao-loop.mp4"
          className="sec-inovacao-video"
        />
        <div className="shell">
          <h2 data-testid="empresa-h2-4" className="h-section text-reveal" style={{ maxWidth: "32ch" }}>
            {splitWords(tr("Inovação, matrizaria e estrutura integrada"))}
          </h2>
          <p data-testid="empresa-p-5" className="body-lg reveal mt-lg" style={{ maxWidth: "76ch", color: "var(--cor-texto-muted)" }}>{tr("A Gi integra, em uma mesma estrutura, matrizaria, injeção de solados em EVA e E-TPU e desenvolvimento de compostos. Com equipe própria de projetistas, CNCs de 5 eixos e laboratório 3D, desenvolve matrizes para solados e componentes com foco em encaixe, repetibilidade e controle dimensional — reduzindo retrabalho, facilitando ajustes e dando mais segurança para P")}<span data-testid="empresa-span-6" className="amp">{tr("&")}</span>{tr("D testar novas soluções com suporte técnico próximo.")}</p>

          <div className="what-grid mt-xl">
            {ESTRUTURA.map((p, localeIndex1) => (
              <div className="what-card reveal" key={p.n} data-cursor={tr("Ver mais")}>
                <span data-testid={`empresa-span-7-${localeIndex1}`} className="num">{p.n}</span>
                <h4 data-testid={`empresa-h4-8-${localeIndex1}`}>{tr(p.t)}</h4>
                <p data-testid={`empresa-p-9-${localeIndex1}`}>{tr(p.d)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 4 — PESSOAS E CONTINUIDADE */}
      <section className="section sec-pessoas-center pessoas-hero-inverted">
        <div className="shell text-center">
          <h2 data-testid="empresa-h2-10" className="h-section text-reveal" style={{ maxWidth: "32ch", marginLeft: "auto", marginRight: "auto" }}>
            {splitWords(tr("Pessoas e continuidade"))}
          </h2>
          <p data-testid="empresa-p-11" className="body-lg reveal mt-lg" style={{ maxWidth: "76ch", color: "var(--cor-texto-muted)", marginLeft: "auto", marginRight: "auto" }}>{tr("Por trás das máquinas, a Gi é feita por uma equipe experiente e estável, com baixa rotatividade e proximidade entre direção e chão de fábrica — o que preserva conhecimento técnico e garante consistência nos projetos.")}</p>

          <div className="what-grid mt-xl">
            {PESSOAS.map((p, localeIndex2) => (
              <div className="what-card reveal" key={p.t}>
                <h4 data-testid={`empresa-h4-12-${localeIndex2}`}>{tr(p.t)}</h4>
                <p data-testid={`empresa-p-13-${localeIndex2}`}>{tr(p.d)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 6 — MISSÃO, VISÃO, VALORES E POLÍTICA DE QUALIDADE */}
      <section className="section sec-cool sec-mvv-bg">
        <PingPongVideo
          src="/particulas-loop.mp4"
          className="sec-mvv-video"
        />
        <div className="shell">
          <h2 data-testid="empresa-h2-14" className="h-section text-reveal" style={{ maxWidth: "32ch" }}>
            {splitWords(tr("Missão, visão, valores e política de qualidade"))}
          </h2>
          <p data-testid="empresa-p-15" className="body-lg reveal mt-lg" style={{ maxWidth: "62ch", color: "var(--cor-texto-muted)" }}>{tr("A base que orienta as decisões técnicas e industriais da Gi.")}</p>

          <div className="accordion mt-xl">
            {MVV.map((item, i) => (
              <div
                className={`acc-item ${openIdx === i ? "open" : ""}`}
                key={item.t}
                data-testid={`acc-${i}`}
              >
                <button data-testid={`empresa-button-16-${i}`}
                  className="acc-trigger"
                  onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                  aria-expanded={openIdx === i}
                  data-cursor={tr(openIdx === i ? "Fechar" : "Abrir")}
                >
                  <span data-testid={`empresa-span-17-${i}`}>{tr(item.t)}</span>
                  <span className="plus" aria-hidden>+</span>
                </button>
                <div className="acc-content">
                  <div className="acc-content-inner">
                    {item.d && <p data-testid={`empresa-p-18-${i}`}>{tr(item.d)}</p>}
                    {item.bullets && (
                      <ul className="acc-bullets">
                        {item.bullets.map((b, idx) => <li key={idx}>{tr(b)}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p data-testid="empresa-p-19" className="reveal mt-xl" style={{ maxWidth: "70ch", color: "var(--cor-texto-muted)" }}>{tr("Esta política orienta as ações e decisões da Gi, garantindo a excelência dos produtos e soluções entregues ao mercado.")}</p>
        </div>
      </section>

      {/* CTA final removido */}
    </main>
  );
}
