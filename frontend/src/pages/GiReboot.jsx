import { useLocale } from "../i18n/LocaleProvider";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import Viewer3DCarousel from "../components/Viewer3DCarousel";
import { useReveal, splitWords } from "../lib/useReveal";

const CALCADOS = [
  "Tênis esportivos e casuais de alta performance",
  "Calçados infantis com uso intenso",
  "Linhas premium e de posicionamento tecnológico",
];

const INDUSTRIAL = [
  "Rodas, rodízios e carrinhos que precisam absorver impacto e reduzir ruído",
  "Brinquedos e acessórios esportivos",
  "Outros projetos industriais com impacto controlado e resistência à fadiga",
];

const INDUSTRIAL_IMGS = [
  { img: "/aplicacoes/carrinho.jpg", label: "Rodas & rodízios", text: "Absorção de impacto e redução de ruído em carrinhos, rodas e rodízios." },
  { img: "/aplicacoes/bola.jpg", label: "Esportes & brinquedos", text: "Núcleo em E-TPU dá vida a bolas, brinquedos e acessórios esportivos." },
  { img: "/aplicacoes/bike.jpg", label: "Indústria & mobilidade", text: "Componentes industriais com impacto controlado e alta resistência à fadiga." },
];

const COMBINAR = [
  "Mantém o custo competitivo do EVA na maior parte do produto.",
  "Aplica E-TPU em regiões de maior impacto ou conforto decisivo.",
  "Aumenta a percepção de valor com componente de alta performance.",
  "Permite ajustar o nível de performance por linha ou modelo, sem mudar toda a plataforma.",
];

export default function GiReboot() {
  const { tr, locale } = useLocale();
  useReveal("gi-reboot");
  const heroRef = useRef(null);

  // Aplica o mesmo padrão da Home: enquanto o hero está visível, o body
  // recebe a classe `hero-immersive`, deixando o cabeçalho transparente
  // sobre o vídeo. Ao rolar para fora do hero, o nav volta ao estado sólido.
  useEffect(() => {
    const hero = heroRef.current;
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
    <main data-testid="gi-reboot-page">
      {/* SEÇÃO 1 — HERO / INTRODUÇÃO */}
      <section className="reboot-hero reboot-hero--runner" ref={heroRef}>
        <div className="reboot-hero-media" aria-hidden="true">
          <video data-testid="gi-reboot-video-1"
            className="reboot-hero-video"
            src="/assets/gi-reboot/hero-video.mp4"
            poster="/assets/gi-reboot/hero-runner.jpeg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
        <div className="reboot-hero-veil" aria-hidden="true" />

        <div className="shell reboot-hero-grid">
          <div>
            <img data-testid="gi-reboot-img-2"
              src="/assets/gi-reboot/logo-gi-reboot.png"
              alt={tr("Gi Reboot®")}
              className="reboot-hero-logo reveal"
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO 2 — ONDE O GI REBOOT® FAZ MAIS DIFERENÇA */}
      <section className="section section--video-bg" id="aplicacoes">
        <video
          className="section-video-bg"
          src="/spheres-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="section-video-overlay" aria-hidden="true" />
        <div className="shell" style={{ position: "relative", zIndex: 2 }}>
          <h2 data-testid="gi-reboot-h2-3" className="h-section text-reveal" style={{ maxWidth: "32ch" }}>
            {splitWords(tr("Onde o Gi Reboot® faz mais diferença"))}
          </h2>
          <p data-testid="gi-reboot-p-4" className="body-lg reveal mt-lg" style={{ maxWidth: "70ch", color: "var(--cor-texto-muted)" }}>{tr("Para projetos em que conforto percebido, retorno de energia e durabilidade são decisivos.")}</p>

          <div className="stacked-panels mt-xl">
            <div className="panel panel--full panel--split reveal" data-testid="panel-calcados">
              <div className="panel-content">
                <h4 data-testid="gi-reboot-h4-5">{tr("Em calçados")}</h4>
                <ul>
                  {CALCADOS.map((c, i) => <li key={i}>{tr(c)}</li>)}
                </ul>
              </div>
              <div className="panel-video-wrap">
                <video
                  className="panel-video"
                  src="/take5.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="panel panel--full panel--industrial reveal" data-testid="panel-outros-componentes">
              <h4 data-testid="gi-reboot-h4-6">{tr("Em outros componentes")}</h4>
              <div className="industrial-grid">
                {INDUSTRIAL_IMGS.map((it, i) => (
                  <figure key={i} className="industrial-card">
                    <div className="industrial-card-media">
                      <img data-testid={`gi-reboot-img-7-${i}`} src={it.img} alt={tr(it.label)} loading="lazy" />
                    </div>
                    <figcaption>
                      <span data-testid={`gi-reboot-span-8-${i}`} className="industrial-card-tag">{tr(it.label)}</span>
                      <p data-testid={`gi-reboot-p-9-${i}`}>{tr(it.text)}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3 — VÍDEO Gi Reboot® (legendado) */}
      <section className="section reboot-video-section" data-testid="reboot-video-section">
        <div className="reboot-video-bg" aria-hidden="true">
          <div className="meteor-layer">
            <span className="meteor meteor--1" />
            <span className="meteor meteor--3" />
            <span className="meteor meteor--5" />
            <span className="meteor meteor--7" />
          </div>
        </div>
        <div className="shell reboot-video-shell" style={{ position: "relative", zIndex: 2 }}>
          <span data-testid="gi-reboot-video-eyebrow" className="reboot-video-eyebrow reveal">{tr("Em movimento")}</span>
          <h2 data-testid="gi-reboot-video-title" className="h-section text-reveal reboot-video-title" style={{ maxWidth: "24ch" }}>
            {splitWords(tr("Veja o Gi Reboot® em ação"))}
          </h2>
          <p data-testid="gi-reboot-video-lead" className="body-lg reveal mt-lg reboot-video-lead" style={{ maxWidth: "64ch" }}>
            {tr("Energia, retorno e conforto em cada passada — assista à tecnologia E-TPU da Gi ganhando vida.")}
          </p>
          <figure data-testid="gi-reboot-video-figure" className="reboot-video-figure reveal">
            <video
              data-testid="gi-reboot-legendado-video"
              className="reboot-video-player"
              src="/gi-reboot-video.mp4"
              poster="/assets/gi-reboot/hero-runner.jpeg"
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          </figure>
        </div>
      </section>

      {/* SEÇÃO 4 — SOLADOS EM E-TPU Gi Reboot® */}
      <section className="section reboot-solados-section">
        <div className="reboot-solados-bg" aria-hidden="true" />
        <div className="shell" style={{ position: "relative", zIndex: 2 }}>
          <div className="prod-wide-canvas">
            <h2 data-testid="gi-reboot-h2-10" className="h-section text-reveal prod-wide-title reboot-solados-title">
              {splitWords(tr("Solados em E-TPU Gi Reboot®"))}
            </h2>
            <div className="reveal prod-wide-3d reboot-hero-viewer reboot-hero-viewer--dark" data-testid="gi-reboot-3d-carousel">
              <Viewer3DCarousel
                showCatalogLink={false}
                items={[
                  { url: "/assets/3d/GI014.glb", label: "GI014" },
                  { url: "/assets/3d/GI015.glb", label: "GI015" },
                  { url: "/assets/3d/GI019.glb", label: "GI019" },
                  { url: "/assets/3d/GI020.glb", label: "GI020" },
                ]}
              />
            </div>
            <div className="prod-wide-cols">
              <div className="prod-wide-col">
                <p data-testid="gi-reboot-p-11" className="body-lg reveal">{tr("O Gi Reboot® é o E-TPU da Gi: solados e componentes com alto retorno de energia, estabilidade dimensional e comportamento consistente em produção.")}</p>
                <a data-testid="gi-reboot-a-12" href="/contato" className="viewer-catalog-link prod-wide-catalog reveal" data-cursor={tr("Ver catálogo")}>{tr("Ver nosso catálogo completo")}</a>
              </div>
              <div className="prod-wide-col">
                <p data-testid="gi-reboot-p-13" className="body-lg reveal">{tr("Indicado para linhas que exigem durabilidade, resiliência e conforto em diferentes condições de uso, atendendo marcas que querem elevar o nível de desempenho dos seus produtos.")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO INTERMEDIÁRIA — Infográfico Versatilidade */}
      <section className="section versatilidade-section" data-testid="versatilidade-section">
        <div className="shell">
          <figure className="versatilidade-figure reveal">
            <img
              src={locale === "es" ? "/versatilidade-es.jpg" : "/versatilidade.jpg"}
              alt={tr("Versatilidade que impulsiona inovação — 8 aplicações do Gi Reboot® eTPU")}
              className="versatilidade-img"
              loading="lazy"
              data-testid="versatilidade-img"
            />
          </figure>
        </div>
      </section>

      {/* SEÇÃO 4 — Gi Reboot® E EVA TRABALHANDO JUNTOS */}
      <section className="section reboot-together-section">
        <div className="reboot-together-bg" aria-hidden="true">
          <div className="meteor-layer">
            <span data-testid="gi-reboot-span-14" className="meteor meteor--1" />
            <span data-testid="gi-reboot-span-15" className="meteor meteor--2" />
            <span data-testid="gi-reboot-span-16" className="meteor meteor--3" />
            <span data-testid="gi-reboot-span-17" className="meteor meteor--4" />
            <span data-testid="gi-reboot-span-18" className="meteor meteor--5" />
            <span data-testid="gi-reboot-span-19" className="meteor meteor--6" />
            <span data-testid="gi-reboot-span-20" className="meteor meteor--7" />
            <span data-testid="gi-reboot-span-21" className="meteor meteor--8" />
          </div>
        </div>
        <div className="shell" style={{ position: "relative", zIndex: 2 }}>
          <h2 data-testid="gi-reboot-h2-22" className="h-section text-reveal reboot-together-title" style={{ maxWidth: "26ch" }}>
            {splitWords(tr("Gi Reboot® e EVA trabalhando juntos"))}
          </h2>
          <p data-testid="gi-reboot-p-23" className="body-lg reveal mt-lg reboot-together-lead" style={{ maxWidth: "76ch" }}>{tr("Em muitos projetos, o Gi Reboot® é aplicado em conjunto com o EVA: o EVA segue como base versátil e competitiva; o E-TPU entra em pontos estratégicos para elevar conforto e performance.")}</p>

          <ul className="manifesto-list reveal mt-xl reboot-together-list" style={{ maxWidth: "78ch" }}>
            {COMBINAR.map((c, i) => <li key={i}>{tr(c)}</li>)}
          </ul>
        </div>
      </section>

      {/* SEÇÃO 5 — CHAMADA ESTRATÉGICA */}
      <section className="final-cta section">
        <div className="shell final-cta-inner">
          <h2 data-testid="gi-reboot-h2-24" className="h-section text-reveal" style={{ maxWidth: "34ch" }}>
            {splitWords(tr("Quer avaliar Gi Reboot® no seu próximo projeto?"))}
          </h2>
          <p data-testid="gi-reboot-p-25" className="body-lg reveal" style={{ textAlign: "center", maxWidth: "72ch" }}>{tr("Nossa equipe técnica pode apoiar na definição de aplicação, desenho de peça e requisitos de processo para solados em E-TPU e outros componentes.")}</p>
          <div className="reveal">
            <Link data-testid="gi-reboot-link-26" to="/contato" className="btn-big" data-cursor={tr("Conversar")}>{tr("Falar com a equipe técnica ")}<span aria-hidden>→</span>
            </Link>
          </div>
          <p data-testid="gi-reboot-p-27" className="body-md reveal" style={{ marginTop: "1.4rem", color: "var(--cor-texto-muted)", textAlign: "center" }}>{tr("Prefere falar direto com o time?")}<br />{tr("E-mail: ")}<a data-testid="gi-reboot-a-28" href="mailto:contato@giinovacoes.com.br">{tr("contato@giinovacoes.com.br")}</a>{tr(" · Telefone: ")}<a data-testid="gi-reboot-a-29" href="tel:+555135436151">+55 (51) 3543.6151</a>
          </p>
        </div>
      </section>
    </main>
  );
}
