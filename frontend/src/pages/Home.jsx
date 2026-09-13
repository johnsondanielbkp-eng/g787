import { useLocale } from "../i18n/LocaleProvider";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MouseTrail from "../components/MouseTrail";
import SectionDivider from "../components/SectionDivider";
import SustainMarquee from "../components/SustainMarquee";
import { useReveal, splitWords } from "../lib/useReveal";
import { listArticles, resolveMediaUrl } from "../lib/api";

gsap.registerPlugin(ScrollTrigger);

// ===================== SEÇÃO 2 — SOLUÇÕES TÉCNICAS DA GI (HUB) =====================
const SOLUCOES = [
  {
    n: "01",
    t: "Gi Reboot® — E-TPU da Gi",
    d: "E-TPU desenvolvido para trabalhar junto com o EVA em linhas de alta performance e em outras aplicações industriais.",
    img: "/assets/solucoes/gi-reboot-etpu.jpg",
    link: "/gi-reboot",
  },
  {
    n: "02",
    t: "Chinelos em EVA",
    d: "Chinelos em EVA com diferentes densidades, desenhos e acabamentos para marcas próprias.",
    img: "/assets/solucoes/Chinelo.webp",
    link: "/eva#chinelos-em-eva",
  },
  {
    n: "03",
    t: "Solados em EVA",
    d: "Solados injetados em EVA para linhas casuais, esportivas, infantis e de segurança.",
    img: "/assets/solucoes/Fabrica-solados.webp",
    link: "/eva#solados-em-eva",
  },
  {
    n: "04",
    t: "Linhas sustentáveis",
    d: "Linhas com conteúdo reciclado e de origem renovável, como Recovery e Green, aliando desempenho e responsabilidade ambiental.",
    img: "/assets/solucoes/Solado-pneu.webp",
    link: "/#sustentabilidade",
  },
  {
    n: "05",
    t: "Compostos em EVA",
    d: "Compostos em EVA formulados sob medida para injetoras e parceiros estratégicos.",
    img: "/assets/solucoes/composto-eva.jpg",
    link: "/eva#compostos-em-eva",
  },
  {
    n: "06",
    t: "Matrizes",
    d: "Matrizaria de alta precisão para solados e componentes, integrada ao desenvolvimento de produto.",
    img: "/assets/solucoes/Fabrica-Matriz.webp",
    link: "/matrizes",
  },
];

// ===================== SEÇÃO 3 — SUSTENTABILIDADE NA PRÁTICA (neon verde) =====================
const SUSTENTABILIDADE = [
  {
    t: "Linhas com conteúdo reciclado e renovável",
    d: "Linhas Recovery e Green utilizam insumos reciclados e polímeros de origem renovável, aliando desempenho e redução de impacto ambiental.",
  },
  {
    t: "Reaproveitamento de materiais",
    d: "Alumínio, óleos e resíduos de EVA são reaproveitados em processos internos, reduzindo desperdício e consumo de matéria-prima virgem.",
  },
  {
    t: "Água tratada e reutilizada",
    d: "100% da água utilizada na produção passa por tratamento e é reutilizada nos processos industriais.",
  },
  {
    t: "Energia de fonte renovável",
    d: "A operação da Gi utiliza energia elétrica proveniente de fontes renováveis, reforçando o compromisso com uma matriz energética mais limpa.",
  },
  {
    t: "Programa Origem Sustentável",
    d: "A Gi está em processo de certificação no programa Origem Sustentável, com práticas auditáveis e foco em melhoria contínua.",
  },
];

// Ícones neon (lineart) para cada item da seção sustentabilidade
const NEON_ICONS = [
  // 1. Reciclado / renovável — recycle triangle
  (
    <svg key="ico-1" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 19l-2.5-4.3a2 2 0 0 1 1.7-3l2.3 0" />
      <path d="M14 5l2.5 4.3a2 2 0 0 1-1.7 3l-2.3 0" />
      <path d="M14 19h4.5a2 2 0 0 0 1.7-3l-1.2-2" />
      <path d="M10 5H5.5a2 2 0 0 0-1.7 3L5 10" />
      <path d="M9 22l-2-3 2-3" />
      <path d="M15 2l2 3-2 3" />
    </svg>
  ),
  // 2. Reaproveitamento — circular arrows
  (
    <svg key="ico-2" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3.5-7.1" />
      <path d="M21 4v5h-5" />
      <path d="M3 12a9 9 0 0 1 .8-3.7" opacity="0.4" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  // 3. Água — droplet com onda
  (
    <svg key="ico-3" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c4 5 6 8 6 11a6 6 0 1 1-12 0c0-3 2-6 6-11z" />
      <path d="M9 15c1 1 2 1 3 0s2-1 3 0" />
    </svg>
  ),
  // 4. Energia renovável — raio + folha
  (
    <svg key="ico-4" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
      <path d="M19 4c1.5 1.5 2 4 0 6" opacity="0.6" />
    </svg>
  ),
  // 5. Certificação — selo / shield com check
  (
    <svg key="ico-5" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
];

// ===================== SEÇÃO 4 — CONTEÚDOS TÉCNICOS (BLOG) =====================
export default function Home() {
  const { tr } = useLocale();
  useReveal("home");
  const heroRef = useRef(null);
  const footprintRef = useRef(null);
  const solucoesBgRef = useRef(null);
  const sustainStackRef = useRef(null);
  const [artigos, setArtigos] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState(false);

  // Apenas artigos publicados; nunca reintroduzir demonstrações.
  useEffect(() => {
    let alive = true;
    listArticles()
      .then((data) => {
        if (!alive) return;
        if (Array.isArray(data) && data.length > 0) {
          setArtigos(data.slice(0, 3));
        }
      })
      .catch(() => { if (alive) setArticlesError(true); })
      .finally(() => { if (alive) setArticlesLoading(false); });
    return () => { alive = false; };
  }, []);

  // ====== PARALLAX — Fundo da seção "Soluções técnicas" ======
  // O background se move mais lentamente que o scroll da página,
  // criando sensação de profundidade e sofisticação.
  useEffect(() => {
    const bg = solucoesBgRef.current;
    if (!bg) return;
    const section = bg.closest("#solucoes");
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bg,
        { yPercent: -12, scale: 1.15 },
        {
          yPercent: 12,
          scale: 1.15,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  // ====== STACK SCROLL — Sustentabilidade na prática ======
  // Pin da SEÇÃO inteira. Cria o trigger DEPOIS do hero pin para que
  // a posição absoluta seja calculada com o layout final.
  useEffect(() => {
    const wrap = sustainStackRef.current;
    if (!wrap) return;
    const section = wrap.closest(".section-sustain-dark");
    const cards = Array.from(wrap.querySelectorAll(".sustain-stack-card"));
    if (!section || cards.length === 0) return;

    let ctx;
    // Aguarda o hero pin existir antes de criar este trigger
    const setupTrigger = () => {
      ctx = gsap.context(() => {
        // Estado inicial: 1º card visível, demais escondidos abaixo
        cards.forEach((card, i) => {
          gsap.set(card, {
            yPercent: i === 0 ? 0 : 110,
            scale: 1,
            autoAlpha: i === 0 ? 1 : 0,
            transformOrigin: "50% 50%",
          });
        });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${(cards.length - 1) * window.innerHeight * 0.5}`,
            scrub: 0.25,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Background: fundo neon escuro (azul profundo) -> claro (branco/azul claro)
        // As bolinhas do bg-texture-dark: brancas -> azuis (via CSS custom props)
        // Texto: branco -> escuro (invertendo)
        const titleEl = section.querySelector(".sustain-dark-title");
        const eyebrowEl = section.querySelector(".sustain-eyebrow");
        const leadEl = section.querySelector(".sustain-dark-lead");
        const wordEls = section.querySelectorAll(".sustain-dark-title .word");
        const bgTextureEl = section.querySelector(".bg-texture-dark");
        const totalDur = cards.length - 1; // toda a duração do timeline (em segmentos)
        const bgEase = "power2.inOut";

        // Fundo da seção: escuro -> claro azulado
        tl.fromTo(
          section,
          { "--sustain-bg-a": "#051428", "--sustain-bg-b": "#0a2145", "--sustain-bg-c": "#061632" },
          {
            "--sustain-bg-a": "#e8f1fb",
            "--sustain-bg-b": "#f4f8fd",
            "--sustain-bg-c": "#dce8f5",
            duration: totalDur,
            ease: bgEase,
          },
          0
        );
        // Bolinhas: brancas -> azuis
        tl.fromTo(
          bgTextureEl,
          {
            "--bubble-core": "rgba(200, 235, 255, 0.95)",
            "--bubble-halo": "rgba(160, 210, 255, 0.45)",
            "--bubble-small": "rgba(200, 235, 255, 0.75)",
          },
          {
            "--bubble-core": "rgba(30, 90, 180, 0.85)",
            "--bubble-halo": "rgba(60, 130, 220, 0.35)",
            "--bubble-small": "rgba(40, 110, 200, 0.60)",
            duration: totalDur,
            ease: bgEase,
          },
          0
        );

        // Texto: branco -> escuro
        if (titleEl)
          tl.to(
            titleEl,
            {
              color: "#0a2145",
              textShadow: "0 0 30px rgba(60, 130, 220, 0.25)",
              duration: totalDur,
              ease: bgEase,
            },
            0
          );
        if (wordEls.length)
          tl.to(
            wordEls,
            { color: "#0a2145", duration: totalDur, ease: bgEase },
            0
          );
        if (eyebrowEl)
          tl.to(
            eyebrowEl,
            {
              color: "#0a2145",
              borderColor: "rgba(10, 33, 69, 0.20)",
              backgroundColor: "rgba(10, 33, 69, 0.05)",
              duration: totalDur,
              ease: bgEase,
            },
            0
          );
        if (leadEl)
          tl.to(
            leadEl,
            { color: "rgba(10, 33, 69, 0.72)", duration: totalDur, ease: bgEase },
            0
          );

        for (let i = 0; i < cards.length - 1; i++) {
          const current = cards[i];
          const next = cards[i + 1];
          tl.to(
            current,
            {
              yPercent: -14 - i * 4,
              scale: 0.92 - i * 0.025,
              autoAlpha: 0.45,
            },
            i
          ).to(
            next,
            {
              yPercent: 0,
              scale: 1,
              autoAlpha: 1,
            },
            i
          );
        }

        ScrollTrigger.refresh();
      }, section);
    };

    // Polling: aguarda o hero pin existir (criado em outro useEffect após
    // o vídeo carregar). Quando detecta, cria o trigger desta seção.
    let interval = null;
    let attempts = 0;
    const tryCreate = () => {
      attempts++;
      const heroPinExists = ScrollTrigger.getAll().some(
        (t) => t.pin && t.trigger && t.trigger.classList && t.trigger.classList.contains("hero")
      );
      // Em mobile não há hero pin — cria após algumas tentativas mesmo assim
      if (heroPinExists || attempts > 12) {
        clearInterval(interval);
        setupTrigger();
      }
    };
    interval = setInterval(tryCreate, 250);
    tryCreate();

    return () => {
      if (interval) clearInterval(interval);
      if (ctx) ctx.revert();
    };
  }, []);

  // ====== HERO · VÍDEO EM LOOP SIMPLES ======
  // O mecanismo de scroll-scrub foi encapsulado em `useVideoScrollScrub`
  // (em /lib) e pode ser reusado em outras páginas. Aqui o hero é
  // apenas autoplay + loop, como o cliente solicitou.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const video = hero.querySelector(".hero-video");
    const h1 = hero.querySelector(".hero-h1");
    if (!video) return;

    const isMobile =
      window.matchMedia("(max-width: 767px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;

    // Conteúdo visível imediatamente
    hero.style.setProperty("--hero-fade", "1");
    document.documentElement.style.setProperty("--hero-fade", "1");

    // Fontes conforme device (mobile leve, desktop full)
    const sources = video.querySelectorAll("source");
    if (sources.length >= 2) {
      if (isMobile) {
        // Novo vídeo mobile (apenas mp4). Limpa a fonte webm para forçar o mp4.
        sources[0].removeAttribute("src");
        sources[1].src = "/assets/hero/fabio_mobile.mp4";
      } else {
        sources[0].src = "/assets/hero/fabio.webm";
        sources[1].src = "/assets/hero/fabio.mp4";
      }
    }

    // Configura loop
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    try { video.load(); } catch (e) {}
    const p = video.play();
    if (p && p.catch) p.catch(() => {});

    // Nav imersiva enquanto o hero está visível
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

    // Parallax sutil do H1 (só desktop)
    const onMove = (e) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      if (h1) h1.style.transform = `translate(${-cx * 8}px, ${-cy * 5}px)`;
    };
    if (!isMobile) window.addEventListener("mousemove", onMove);

    // Retry play em touch (iOS às vezes exige gesto)
    const onTouch = () => {
      const pp = video.play();
      if (pp && pp.catch) pp.catch(() => {});
    };
    if (isMobile) window.addEventListener("touchstart", onTouch, { once: true, passive: true });

    // ===== Card de conteúdo aparece SÓ após o primeiro scroll =====
    // Título + descrição + CTA começam invisíveis (opacity 0).
    // Assim que o usuário rolar QUALQUER pouco, o card entra num
    // fade-in suave (transição CSS controlada).
    const card = hero.querySelector("[data-hero-card]");
    if (card) {
      card.classList.add("is-hidden-initial");

      let revealed = false;
      // scrollY inicial (pode não ser 0 se o browser restaurou posição)
      let baseY = window.scrollY;

      const reveal = () => {
        if (revealed) return;
        revealed = true;
        card.classList.remove("is-hidden-initial");
        card.classList.add("is-revealed");
      };

      const onScrollOnce = () => {
        // Só revela se o usuário rolou pelo menos 5px A PARTIR da posição inicial
        if (Math.abs(window.scrollY - baseY) > 5) reveal();
      };
      const onWheelOnce = () => reveal();
      const onTouchMoveOnce = () => reveal();

      // Delay para skip de eventos disparados no setup inicial
      // (Lenis, reveal reveal, IntersectionObservers etc)
      const attachT = setTimeout(() => {
        baseY = window.scrollY; // re-baseline após setup terminar
        window.addEventListener("scroll", onScrollOnce, { passive: true });
        window.addEventListener("wheel", onWheelOnce, { passive: true });
        window.addEventListener("touchmove", onTouchMoveOnce, { passive: true });
      }, 400);

      // Fallback: se o usuário ficar parado, revela após 8s
      const fallbackT = setTimeout(reveal, 8000);

      return () => {
        clearTimeout(attachT);
        clearTimeout(fallbackT);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("touchstart", onTouch);
        window.removeEventListener("scroll", onScrollOnce);
        window.removeEventListener("wheel", onWheelOnce);
        window.removeEventListener("touchmove", onTouchMoveOnce);
        io.disconnect();
        document.body.classList.remove("hero-immersive");
      };
    }

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onTouch);
      io.disconnect();
      document.body.classList.remove("hero-immersive");
    };
  }, []);

  return (
    <main data-testid="home-page">
      {/* ============== SEÇÃO 1 — HERO (vídeo em loop + scrub) ============== */}
      <section className="hero hero--video" ref={heroRef} data-cursor="">
        <div className="hero-stage">
          <div className="hero-bg">
            <video data-testid="home-video-1"
              className="hero-video"
              muted
              playsInline
              preload="auto"
              aria-label={tr("Gi Inovações — vídeo institucional")}
            >
              {/* sources são definidas pelo useEffect conforme device (mobile vs desktop) */}
              <source data-role="webm" type="video/webm" />
              <source data-role="mp4" type="video/mp4" />
            </video>
            <div className="hero-overlay" />
          </div>
        </div>
      </section>

      {/* ============== SEÇÃO 2 — SOLUÇÕES TÉCNICAS DA GI (HUB) ============== */}
      <section className="section section-solucoes-eps" id="solucoes">
        <div
          ref={solucoesBgRef}
          className="solucoes-eps-bg"
          aria-hidden="true"
          style={{ backgroundImage: "url(/assets/bg/eps-branco.jpeg)" }}
        />
        <div className="shell" style={{ position: "relative", zIndex: 2 }}>
          <h2 data-testid="home-h2-2" className="h-section text-reveal">
            {splitWords(tr("Soluções técnicas da Gi"))}
          </h2>
          <p data-testid="home-p-3"
            className="body-lg reveal mt-lg"
            style={{ maxWidth: "72ch", color: "var(--cor-texto-muted)" }}
          >{tr("Desenvolvemos matrizes, solados em EVA, E-TPU (Gi Reboot®) e compostos para projetos que exigem conforto, impacto controlado e estabilidade de processo, em calçados e em componentes industriais diversos.")}</p>

          <div className="services-stack">
            {SOLUCOES.map((s, localeIndex0) => (
              <Link
                to={s.link}
                className="svc-card reveal"
                key={s.n}
                id={`sol-${s.n}`}
                data-cursor={tr("Ver mais")}
                data-testid={`svc-${s.n}`}
              >
                <img data-testid={`home-img-4-${localeIndex0}`}
                  className="svc-bg-img"
                  src={s.img}
                  alt={tr(s.t)}
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <div className="svc-head">
                    <h3 data-testid={`home-h3-5-${localeIndex0}`} className="svc-title">{tr(s.t)}</h3>
                  </div>
                  <p data-testid={`home-p-6-${localeIndex0}`} className="svc-body">{tr(s.d)}</p>
                </div>
                <span data-testid={`home-span-7-${localeIndex0}`} className="svc-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============== MOUSE TRAIL — fotos que aparecem com o cursor ============== */}
      <section
        className="footprint trail-zone"
        ref={footprintRef}
        data-testid="footprint-section"
      >
        <MouseTrail zoneRef={footprintRef} autoStart={true} />
        <div className="shell footprint-content">
          <h2 data-testid="home-h2-8" className="footprint-title text-reveal">
            {splitWords(tr("Passos firmes e fortes."))}
          </h2>
        </div>
      </section>

      {/* ============== SEÇÃO 3 — SUSTENTABILIDADE NA PRÁTICA (marquee interativo) ============== */}
      <section className="section section-sustain-marquee" id="sustentabilidade">
        <div className="shell shell-narrow">
          <div className="sustain-marquee-header">
            <h2 data-testid="home-h2-9" className="h-section text-reveal sustain-marquee-title">
              {splitWords(tr("Sustentabilidade na prática"))}
            </h2>
            <p data-testid="home-p-10" className="body-lg reveal sustain-marquee-lead">{tr("Cinco frentes que rodam dentro da operação da Gi — da matéria-prima ao produto final — combinando responsabilidade ambiental com engenharia industrial.")}</p>
          </div>
        </div>

        {/* Marquee interativo — pausa no hover/foco, setas navegam manualmente */}
        <SustainMarquee items={SUSTENTABILIDADE} icons={NEON_ICONS} />
      </section>

      {/* ============== SEÇÃO 4 — CONTEÚDOS TÉCNICOS (BLOG) — bolinhas EPS ============== */}
      <section className="section section-conteudos-eps" data-testid="section-conteudos">
        <div
          className="conteudos-eps-bg"
          aria-hidden="true"
          style={{ backgroundImage: "url(/assets/bg/eps-bolinhas.jpeg)" }}
        />
        <div className="shell" style={{ position: "relative", zIndex: 2 }}>
          <h2 data-testid="home-h2-11" className="h-section text-reveal" style={{ maxWidth: "32ch" }}>
            {splitWords(tr("Conteúdos técnicos para P&D em matrizes, EVA e E-TPU"))}
          </h2>
          <p data-testid="home-p-12"
            className="body-lg reveal mt-lg"
            style={{ maxWidth: "72ch", color: "var(--cor-texto-muted)" }}
          >{tr("Artigos, cases e materiais técnicos produzidos pelo time da Gi sobre desenvolvimento de matrizes, solados em EVA, E-TPU (Gi Reboot®) e compostos, para apoiar P")}<span data-testid="home-span-13" className="amp">{tr("&")}</span>{tr("D e desenvolvimento de produto em calçados e outras aplicações industriais.")}</p>

          <div className="blog-grid mt-xl">
            {articlesLoading && <p className="body-md" data-testid="home-articles-loading">{tr("Carregando artigos…")}</p>}
            {articlesError && <p className="body-md" role="alert" data-testid="home-articles-error">{tr("Não foi possível carregar os artigos. Tente novamente em instantes.")}</p>}
            {!articlesLoading && !articlesError && artigos.length === 0 && <p className="body-md" data-testid="home-articles-empty">{tr("Nenhum artigo publicado ainda.")}</p>}
            {artigos.map((a, i) => (
              <Link data-testid={`home-link-14-${i}`}
                to={`/artigos/${a.slug}`}
                className={`blog-card artigo-card-appear${a.cover_image ? " blog-card--with-media" : ""}${a.content_format === "html" ? " artigo-card-original" : ""}`}
                style={{ animationDelay: `${i * 80}ms` }}
                key={a.slug || a.title}
                data-cursor={tr("Ler artigo")}
              >
                {a.cover_image ? (
                  <div className="blog-card-media">
                    <img data-testid={`home-img-15-${i}`}
                      src={resolveMediaUrl(a.cover_image)}
                      alt={tr(a.title)}
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="blog-card-body">
                  <span data-testid={`home-span-16-${i}`} className="blog-card-index">{String(i + 1).padStart(2, "0")}</span>
                  <h3 data-testid={`home-h3-17-${i}`} className="blog-card-title">{tr(a.title)}</h3>
                  <p data-testid={`home-p-18-${i}`} className="blog-card-excerpt">{tr(a.excerpt)}</p>
                  <span data-testid={`home-span-19-${i}`} className="link-arrow">{tr("Ler artigo ")}<span data-testid={`home-span-20-${i}`} className="arrow">→</span></span>
                </div>
              </Link>
            ))}
          </div>

          <div className="reveal mt-xl">
            <Link data-testid="home-link-21" to="/artigos" className="link-arrow" data-cursor={tr("Ver")}>{tr("Ver todos os artigos ")}<span data-testid="home-span-22" className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============== SEÇÃO 5 — CONTATO TÉCNICO ============== */}
      <section className="final-cta section">
        <div className="shell final-cta-inner">
          <div className="cta-waves" aria-hidden="true">
            <span data-testid="home-span-23" className="cta-bubble cta-bubble--1" />
            <span data-testid="home-span-24" className="cta-bubble cta-bubble--2" />
            <span data-testid="home-span-25" className="cta-bubble cta-bubble--3" />
          </div>

          <h2 data-testid="home-h2-26" className="h-section text-reveal" style={{ maxWidth: "22ch" }}>
            {splitWords(tr("Falar com a Gi Inovações"))}
          </h2>
          <p data-testid="home-p-27" className="body-lg reveal" style={{ textAlign: "center", maxWidth: "70ch" }}>{tr("Se você está desenvolvendo uma nova linha de calçados ou avaliando o uso de EVA, E-TPU (Gi Reboot®) e compostos em outros componentes industriais, nossa equipe técnica pode apoiar na definição de matrizes, materiais e soluções de solado.")}</p>
          <div className="reveal">
            <Link
              to="/contato"
              className="btn-big"
              data-cursor={tr("Conversar")}
              data-testid="final-cta"
            >{tr("Contato técnico ")}<span aria-hidden>→</span>
            </Link>
          </div>
          <p data-testid="home-p-28" className="body-md reveal" style={{ marginTop: "1.4rem", color: "var(--cor-texto-muted)", textAlign: "center" }}>{tr("Prefere falar direto com o time?")}<br />{tr("E-mail: ")}<a data-testid="home-a-29" href="mailto:contato@giinovacoes.com.br">{tr("contato@giinovacoes.com.br")}</a>{tr(" · Telefone: ")}<a data-testid="home-a-30" href="tel:+555135436151">+55 (51) 3543.6151</a>
          </p>
        </div>
      </section>
    </main>
  );
}
