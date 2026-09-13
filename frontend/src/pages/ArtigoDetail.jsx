import { useLocale } from "../i18n/LocaleProvider";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getArticle, listArticles, resolveMediaUrl } from "../lib/api";
import { renderArticleContent } from "../lib/markdown";
import { useReveal, splitWords } from "../lib/useReveal";

function formatDate(iso, locale) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

export default function ArtigoDetail() {
  const { tr, locale } = useLocale();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Re-run reveal after article loads (dynamic content)
  useReveal(article?.id || slug || "artigo-load");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setNotFound(false);
    (async () => {
      try {
        const [a, all] = await Promise.all([getArticle(slug), listArticles()]);
        if (!alive) return;
        setArticle(a);
        setRelated((all || []).filter((x) => x.slug !== slug).slice(0, 3));
      } catch (err) {
        if (alive) setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  const html = useMemo(() => renderArticleContent(article?.content || "", article?.content_format), [article]);

  if (loading) {
    return (
      <main className="page page-artigo">
        <section className="section"><div className="shell"><p data-testid="artigo-detail-p-1" className="body-md" style={{ color: "var(--cor-texto-muted)" }}>{tr("Carregando…")}</p></div></section>
      </main>
    );
  }
  if (notFound || !article) {
    return (
      <main className="page page-artigo">
        <section className="section">
          <div className="shell">
            <h1 data-testid="artigo-detail-h1-2" className="h-section">{tr("Artigo não encontrado")}</h1>
            <p data-testid="artigo-detail-p-3" className="body-md" style={{ color: "var(--cor-texto-muted)" }}>{tr("O artigo que você tentou acessar não está disponível.")}</p>
            <div className="reveal mt-lg">
              <button data-testid="artigo-detail-button-4" onClick={() => navigate("/artigos")} className="btn-big" data-cursor={tr("Voltar")}>{tr("Ver todos os artigos ")}<span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page page-artigo">
      <article className={`artigo-post${article.content_format === "html" ? " artigo-post-original" : ""}`} lang={article.source_url ? "pt-BR" : undefined} data-testid="article-post">
        <header className="section artigo-post-header">
          <div className="shell shell-narrow">
            <div className="artigo-post-breadcrumbs reveal">
              <Link data-testid="artigo-detail-link-5" to="/">{tr("Início")}</Link>
              <span aria-hidden> / </span>
              <Link data-testid="artigo-detail-link-6" to="/artigos">{tr("Artigos")}</Link>
            </div>
            {article.category ? (
              <span data-testid="artigo-detail-span-7" className="eyebrow reveal" style={{ marginTop: ".8rem" }}>{tr(article.category)}</span>
            ) : null}
            <h1 data-testid="artigo-detail-h1-8" className="h-hero text-reveal" style={{ maxWidth: "28ch" }}>
              {splitWords(tr(article.title))}
            </h1>
            {article.excerpt && article.content_format !== "html" ? (
              <p data-testid="artigo-detail-p-9" className="body-lg reveal" style={{ maxWidth: "70ch", color: "var(--cor-texto-muted)" }}>
                {tr(article.excerpt)}
              </p>
            ) : null}
            <div className="artigo-post-meta reveal">
              <span data-testid="artigo-detail-span-10">{tr(article.author || "Equipe Gi Inovações")}</span>
              <span aria-hidden>·</span>
              <span data-testid="artigo-detail-span-11">{formatDate(article.created_at, locale)}</span>
              {article.read_time ? (<><span aria-hidden>·</span><span data-testid="artigo-detail-span-12">{tr(article.read_time)}{tr(" de leitura")}</span></>) : null}
            </div>
          </div>
        </header>

        {article.cover_image ? (
          <div className="artigo-post-cover reveal">
            <div className="shell shell-narrow">
              <div className="artigo-post-cover-frame">
                <img data-testid="artigo-detail-img-13" src={resolveMediaUrl(article.cover_image)} alt={article.cover_alt || tr(article.title)} loading="lazy" />
              </div>
            </div>
          </div>
        ) : null}

        <div className="section artigo-post-body">
          <div className="shell shell-narrow">
            <div
              className="artigo-prose reveal"
              data-testid="article-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section artigo-related">
          <div className="shell">
            <h2 data-testid="artigo-detail-h2-14" className="h-section text-reveal" style={{ maxWidth: "22ch" }}>
              {splitWords(tr("Outros artigos"))}
            </h2>
            <div className="artigos-grid mt-xl">
              {related.map((r, i) => (
                <Link data-testid={`artigo-detail-link-15-${i}`}
                  to={`/artigos/${r.slug}`}
                  key={r.slug}
                  className={`artigo-card artigo-card-appear${r.content_format === "html" ? " artigo-card-original" : ""}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                  data-cursor={tr("Ler")}
                >
                  <div className="artigo-card-media">
                    {r.cover_image ? (
                      <img data-testid={`artigo-detail-img-16-${i}`} src={resolveMediaUrl(r.cover_image)} alt={r.cover_alt || tr(r.title)} loading="lazy" />
                    ) : (
                      <div className="artigo-card-media-empty" aria-hidden />
                    )}
                    <span data-testid={`artigo-detail-span-17-${i}`} className="artigo-card-index">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="artigo-card-body">
                    {r.category ? <span data-testid={`artigo-detail-span-18-${i}`} className="artigo-card-cat">{tr(r.category)}</span> : null}
                    <h3 data-testid={`artigo-detail-h3-19-${i}`} className="artigo-card-title">{tr(r.title)}</h3>
                    <p data-testid={`artigo-detail-p-20-${i}`} className="artigo-card-excerpt">{tr(r.excerpt)}</p>
                    <span data-testid={`artigo-detail-span-21-${i}`} className="link-arrow">{tr("Ler artigo ")}<span data-testid={`artigo-detail-span-22-${i}`} className="arrow">→</span></span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="reveal mt-xl">
              <Link data-testid="artigo-detail-link-23" to="/artigos" className="link-arrow" data-cursor={tr("Ver")}>{tr("Ver todos os artigos ")}<span data-testid="artigo-detail-span-24" className="arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
