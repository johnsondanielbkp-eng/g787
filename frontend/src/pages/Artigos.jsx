import { useLocale } from "../i18n/LocaleProvider";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listArticles, resolveMediaUrl } from "../lib/api";
import { useReveal, splitWords } from "../lib/useReveal";

export default function Artigos() {
  const { tr } = useLocale();
  useReveal("artigos");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await listArticles();
        if (alive) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setError(true);
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
          ) : error ? (
            <p data-testid="articles-load-error" role="alert" className="body-md">{tr("Não foi possível carregar os artigos. Tente novamente em instantes.")}</p>
          ) : items.length === 0 ? (
            <p data-testid="artigos-p-5" className="body-md" style={{ color: "var(--cor-texto-muted)" }}>{tr("Nenhum artigo publicado ainda.")}</p>
          ) : (
            <div className="artigos-grid">
              {items.map((a, i) => (
                <Link data-testid={`artigos-link-6-${i}`}
                  to={`/artigos/${a.slug}`}
                  key={a.slug}
                  className={`artigo-card artigo-card-appear${a.content_format === "html" ? " artigo-card-original" : ""}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                  data-cursor={tr("Ler")}
                >
                  <div className="artigo-card-media">
                    {a.cover_image ? (
                      <img data-testid={`artigos-img-7-${i}`} src={resolveMediaUrl(a.cover_image)} alt={a.cover_alt || tr(a.title)} loading="lazy" />
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
