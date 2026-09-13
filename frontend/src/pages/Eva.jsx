import { useLocale } from "../i18n/LocaleProvider";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Viewer3D from "../components/Viewer3D";
import Viewer3DCarousel from "../components/Viewer3DCarousel";
import MouseTrail from "../components/MouseTrail";
import { useReveal, splitWords } from "../lib/useReveal";

// 3 fotos usadas no trail do hero — mesmas da colagem original
const EVA_HERO_IMAGES = [
  "/assets/eva-hero/hero-1.jpg",
  "/assets/eva-hero/hero-2.webp",
  "/assets/eva-hero/hero-3.webp",
  "/assets/eva-hero/hero-4.webp",
  "/assets/eva-hero/hero-5.webp",
];

// Cópia 100% fiel ao .txt aprovado pelo cliente — página guarda-chuva
// "Soluções em EVA" com três âncoras: solados, chinelos e compostos.

export default function Eva() {
  const { tr } = useLocale();
  useReveal("eva");
  const location = useLocation();
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

  // Scroll suave para a âncora #id quando a URL mudar
  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (!id) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash, location.key]);

  return (
    <main data-testid="eva-page" className="prod-page">
      {/* HERO — fullscreen com tom azulado (mesmo da página Empresa) */}
      <section className="prod-hero prod-hero--fulltrail prod-hero--blue">
        {/* Zona de trail cobre TODO o hero — fotos aparecem seguindo o cursor por toda a área */}
        <div
          className="prod-hero-trail prod-hero-trail--full trail-zone"
          ref={heroTrailRef}
          data-testid="eva-hero-trail"
        >
          <MouseTrail
            zoneRef={heroTrailRef}
            images={EVA_HERO_IMAGES}
            autoStart={true}
          />
        </div>
        <div className="shell prod-hero-grid">
          <div className="prod-hero-text prod-hero-text--overlay">
            <h1 data-testid="eva-h1-1" className="h-hero text-reveal">
              {splitWords(tr("Soluções em EVA"))}
            </h1>
            <div className="prod-anchor-nav reveal">
              <a href="#solados-em-eva" data-testid="anchor-solados">{tr("Solados em EVA")}</a>
              <a href="#chinelos-em-eva" data-testid="anchor-chinelos">{tr("Chinelos em EVA")}</a>
              <a href="#compostos-em-eva" data-testid="anchor-compostos">{tr("Compostos em EVA")}</a>
            </div>
          </div>
        </div>
      </section>

      {/* SOLADOS */}
      <section className="section prod-block" id="solados-em-eva">
        <div className="shell shell-narrow prod-wide-canvas">
          <h2 data-testid="eva-h2-2" className="h-section text-reveal prod-wide-title">
            {splitWords(tr("Solados em EVA"))}
          </h2>
          <div className="prod-wide-3d reveal">
            <Viewer3DCarousel
              showCatalogLink={false}
              items={[
                { url: "/assets/3d/NY90.glb",       label: "NY90" },
                { url: "/assets/3d/LL20.glb",       label: "LL20" },
                { url: "/assets/3d/PHILLIS.glb",    label: "PHILLIS" },
                { url: "/assets/3d/PR11.glb",       label: "PR11" },
                { url: "/assets/3d/RETRO.glb",      label: "RETRO" },
                { url: "/assets/3d/GI002.glb",      label: "GI002" },
                { url: "/assets/3d/GI005.glb",      label: "GI005" },
                { url: "/assets/3d/GI007.glb",      label: "GI007" },
                { url: "/assets/3d/GI011.glb",      label: "GI011" },
                { url: "/assets/3d/138.glb",        label: "138" },
                { url: "/assets/3d/ATTRACTION.glb", label: "ATTRACTION" },
                { url: "/assets/3d/BUMPER.glb",     label: "BUMPER" },
                { url: "/assets/3d/ENERGY.glb",     label: "ENERGY" },
                { url: "/assets/3d/EVOLUTION.glb",  label: "EVOLUTION" },
              ]}
            />
          </div>
          <div className="prod-wide-cols">
            <div className="prod-wide-col">
              <p data-testid="eva-p-3" className="body-lg reveal">{tr("Solados injetados em EVA para linhas casuais, esportivas, infantis e de segurança, com controle de densidade, dureza e acabamento para garantir conforto na pisada e repetibilidade em produção.")}</p>
              <a data-testid="eva-a-4" href="/contato" className="viewer-catalog-link prod-wide-catalog reveal" data-cursor={tr("Ver catálogo")}>{tr("Ver nosso catálogo completo")}</a>
            </div>
            <div className="prod-wide-col">
              <h3 data-testid="eva-h3-5" className="h-sub reveal">{tr("Onde se encaixam melhor")}</h3>
              <ul className="prod-bullets reveal">
                <li>{tr("Calçados casuais para uso diário.")}</li>
                <li>{tr("Linhas esportivas com foco em amortecimento e estabilidade.")}</li>
                <li>{tr("Calçados infantis e de segurança que pedem leveza e conforto.")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CHINELOS */}
      <section className="section prod-block prod-block--blue" id="chinelos-em-eva">
        <div className="shell shell-narrow prod-wide-canvas">
          <h2 data-testid="eva-h2-6" className="h-section text-reveal prod-wide-title">
            {splitWords(tr("Chinelos em EVA"))}
          </h2>
          <div className="prod-wide-3d reveal">
            <Viewer3DCarousel
              showCatalogLink={false}
              items={[
                { url: "/assets/3d/AI33.glb",    label: "AI33" },
                { url: "/assets/3d/DIAMOND.glb", label: "Gi Diamond" },
                { url: "/assets/3d/GI017.glb",   label: "Gi 017" },
                { url: "/assets/3d/GI016.glb",   label: "GI016" },
              ]}
            />
          </div>
          <div className="prod-wide-cols">
            <div className="prod-wide-col">
              <p data-testid="eva-p-7" className="body-lg reveal">{tr("Bases e solados em EVA para chinelos, com foco em conforto, leveza e acabamento, para marcas que precisam de volume com padrão estável de qualidade.")}</p>
              <a data-testid="eva-a-8" href="/contato" className="viewer-catalog-link prod-wide-catalog reveal" data-cursor={tr("Ver catálogo")}>{tr("Ver nosso catálogo completo")}</a>
            </div>
            <div className="prod-wide-col">
              <h3 data-testid="eva-h3-9" className="h-sub reveal">{tr("Onde se encaixam melhor")}</h3>
              <ul className="prod-bullets reveal">
                <li>{tr("Chinelos casuais para uso diário.")}</li>
                <li>{tr("Linhas promocionais com custo competitivo.")}</li>
                <li>{tr("Linhas de marca própria com foco em conforto e acabamento.")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* COMPOSTOS */}
      <section className="section prod-block pessoas-hero-inverted" id="compostos-em-eva">
        <div className="shell shell-narrow prod-split prod-split--left prod-split--wide-media">
          <div className="prod-split-img reveal">
            <img data-testid="eva-img-10" src="/assets/solucoes/composto-eva.jpg" alt={tr("Compostos em EVA da Gi")} loading="lazy" decoding="async" />
            <span data-testid="eva-span-11" className="prod-split-tag">{tr("04 · Compostos")}</span>
          </div>
          <div className="prod-split-text">
            <h2 data-testid="eva-h2-12" className="h-section text-reveal">{splitWords(tr("Compostos em EVA"))}</h2>
            <p data-testid="eva-p-13" className="body-lg reveal mt-md">{tr("Compostos em EVA desenvolvidos para uso interno da Gi e para parceiros estratégicos, com formulações ajustadas ao tipo de aplicação e ao processo de injeção do cliente.")}</p>
            <h3 data-testid="eva-h3-14" className="h-sub reveal mt-xl">{tr("Onde se encaixam melhor")}</h3>
            <ul className="prod-bullets reveal">
              <li>{tr("Produção de solados e chinelos em plantas próprias.")}</li>
              <li>{tr("Linhas com requisitos específicos de densidade e dureza.")}</li>
              <li>{tr("Projetos com conteúdo reciclado (Recovery) ou de origem renovável (Green).")}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section className="section prod-cta">
        <div className="shell shell-narrow text-center">
          <h2 data-testid="eva-h2-15" className="h-section text-reveal">
            {splitWords(tr("Falar com a equipe técnica sobre soluções em EVA"))}
          </h2>
          <p data-testid="eva-p-16" className="body-lg reveal mt-md" style={{ maxWidth: "62ch", margin: "1.2rem auto 2rem" }}>{tr("Se você está desenvolvendo uma nova linha de calçados ou precisa avaliar compostos em EVA para sua produção, a equipe técnica da Gi pode apoiar na definição de desenho, parâmetros e formulações.")}</p>
          <Link to="/contato" className="btn-outline reveal" data-testid="eva-cta-contato">{tr("Contato técnico")}</Link>
        </div>
      </section>
    </main>
  );
}
