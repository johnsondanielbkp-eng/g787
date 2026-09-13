import { useLocale } from "../i18n/LocaleProvider";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listArticles, resolveMediaUrl } from "../lib/api";
import { useReveal, splitWords } from "../lib/useReveal";

const FALLBACK = [
  {
    slug: "e-tpu-eva-projeto",
    title: "Quando faz sentido usar E-TPU (Gi Reboot®) junto com EVA no seu projeto",
    excerpt:
      "Entenda em quais tipos de calçados e componentes industriais o E-TPU complementa o EVA, aumentando conforto e durabilidade sem complicar o processo produtivo.",
    category: "E-TPU",
    cover_image: "/assets/solucoes/gi-reboot-etpu.jpg",
    read_time: "6 min",
  },
  {
    slug: "matrizes-solados-eva-esportivos",
    title: "Como escolher matrizes e solados em EVA para linhas esportivas e casuais",
    excerpt:
      "Pontos técnicos que P&D e desenvolvimento de produto precisam considerar ao definir matrizes e solados em EVA para tênis e calçados casuais.",
    category: "Matrizes",
    cover_image: "/assets/solucoes/Fabrica-solados.webp",
    read_time: "7 min",
  },
  {
    slug: "linhas-sustentaveis-recovery-green",
    title: "Linhas sustentáveis em EVA: o que muda com Recovery e Green",
    excerpt:
      "Como funcionam os compostos com conteúdo reciclado e de origem renovável e onde eles se encaixam em linhas de calçados e outros componentes.",
    category: "Sustentabilidade",
    cover_image: "/assets/solucoes/Solado-pneu.webp",
    read_time: "5 min",
  },
];

export default function Artigos() {
  const { tr } = useLocale();
  useReveal("artigos");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await listArticles();
        if (alive) setItems(Array.isArray(data) && data.length ? data : FALLBACK);
      } catch {
        if (alive) setItems(FALLBACK);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <main className="page page-artigos">
      <section className="section artigos-hero">
        <div className="shell">
          <span data-testid="artigos-span-1" className="eyebrow reveal">{tr("Conteúdos técnicos")}</span>
          <h1 data-testid="artigos-h1-2" className="h-hero text-reveal" style={{ maxWidth: "28ch" }}>
            {splitWords(tr("Artigos técnicos da Gi Inovações"))}
          </h1>
          <p data-testid="artigos-p-3" className="body-lg reveal" style={{ maxWidth: "72ch", color: "var(--cor-texto-muted)" }}>{tr("Materiais produzidos pelo time da Gi sobre desenvolvimento de matrizes, solados em EVA, E-TPU (Gi Reboot®) e compostos — para apoiar P&D e desenvolvimento de produto em calçados e outras aplicações industriais.")}</p>
        </div>
      </section>

      <section className="section artigos-listagem">
        <div className="shell">
          {loading ? (
            <p data-testid="artigos-p-4" className="body-md" style={{ color: "var(--cor-texto-muted)" }}>{tr("Carregando artigos…")}</p>
          ) : items.length === 0 ? (
            <p data-testid="artigos-p-5" className="body-md" style={{ color: "var(--cor-texto-muted)" }}>{tr("Nenhum artigo publicado ainda.")}</p>
          ) : (
            <div className="artigos-grid">
              {items.map((a, i) => (
                <Link data-testid={`artigos-link-6-${i}`}
                  to={`/artigos/${a.slug}`}
                  key={a.slug}
                  className="artigo-card artigo-card-appear"
                  style={{ animationDelay: `${i * 80}ms` }}
                  data-cursor={tr("Ler")}
                >
                  <div className="artigo-card-media">
                    {a.cover_image ? (
                      <img data-testid={`artigos-img-7-${i}`} src={resolveMediaUrl(a.cover_image)} alt={tr(a.title)} loading="lazy" />
                    ) : (
                      <div className="artigo-card-media-empty" aria-hidden />
                    )}
                    <span data-testid={`artigos-span-8-${i}`} className="artigo-card-index">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="artigo-card-body">
                    {a.category ? <span data-testid={`artigos-span-9-${i}`} className="artigo-card-cat">{tr(a.category)}</span> : null}
                    <h3 data-testid={`artigos-h3-10-${i}`} className="artigo-card-title">{tr(a.title)}</h3>
                    <p data-testid={`artigos-p-11-${i}`} className="artigo-card-excerpt">{tr(a.excerpt)}</p>
                    <span data-testid={`artigos-span-12-${i}`} className="link-arrow">{tr("Ler artigo ")}<span data-testid={`artigos-span-13-${i}`} className="arrow">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
