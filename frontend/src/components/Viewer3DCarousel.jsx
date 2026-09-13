import { useId } from "react";
import { useLocale } from "../i18n/LocaleProvider";
import { useState, useCallback } from "react";
import Viewer3D from "./Viewer3D";

/**
 * Viewer3DCarousel
 * Setas alinhadas com os dots na barra inferior.
 */
export default function Viewer3DCarousel({ items = [], catalogUrl = "/contato", showCatalogLink = true }) {
  const { tr } = useLocale();
  const instanceId = useId();
  const [idx, setIdx] = useState(() => Math.max(0, items.findIndex((item) => item.url)));
  const total = items.length;
  const current = items[idx] || items[0];

  const move = useCallback((direction) => setIdx((i) => {
    for (let step = 1; step <= total; step++) {
      const candidate = (i + direction * step + total) % total;
      if (items[candidate].url) return candidate;
    }
    return i;
  }), [items, total]);
  const next = () => move(1);
  const prev = () => move(-1);

  if (!current?.url) return null;

  return (
    <div className="viewer-carousel-wrap">
      <div className="viewer-carousel-layout">
        <div className="viewer-carousel" data-testid={instanceId + "-" + ("viewer-carousel")}>
        <Viewer3D
          key={current.url}
          label={current.label}
          modelUrl={current.url}
        />

      {/* Barra inferior: seta · dots · seta */}
      <div className="viewer-navbar" aria-hidden="false">
        <button
          type="button"
          className="viewer-nav viewer-nav--prev"
          onClick={prev}
          aria-label={tr("Modelo anterior")}
          data-testid={instanceId + "-" + ("viewer-prev")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="viewer-dots">
          {items.map((it, i) => (
            <button
              key={it.label}
              type="button"
              className={`viewer-dot ${i === idx ? "is-active" : ""}`}
              disabled={!it.url}
              onClick={() => setIdx(i)}
              aria-label={tr(`Ver ${it.label}`)}
              data-testid={instanceId + "-" + (`viewer-dot-${i}`)}
            />
          ))}
        </div>

        <button
          type="button"
          className="viewer-nav viewer-nav--next"
          onClick={next}
          aria-label={tr("Próximo modelo")}
          data-testid={instanceId + "-" + ("viewer-next")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
        </div>

        {/* Lista clicável de modelos ao lado do canvas */}
        <aside className="viewer-model-list" aria-label={tr("Lista de modelos")}>
          <div className="viewer-model-list__header">
            <span data-testid={`${instanceId}-viewer3-d-carousel-span-1`} className="viewer-model-list__eyebrow">{tr("Modelos")}</span>
            <span data-testid={`${instanceId}-viewer3-d-carousel-span-2`} className="viewer-model-list__count">
              {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
          <ul data-testid={`${instanceId}-viewer3-d-carousel-ul-3`} className="viewer-model-list__items" role="listbox">
            {items.map((it, i) => (
              <li data-testid={`${instanceId}-viewer3-d-carousel-li-4-${i}`} key={it.label} role="option" aria-selected={i === idx} aria-disabled={!it.url}>
                <button
                  type="button"
                  className={`viewer-model-item ${i === idx ? "is-active" : ""}`}
                  disabled={!it.url}
                  title={!it.url ? tr("Modelo 3D indisponível") : undefined}
                  onClick={() => setIdx(i)}
                  data-cursor={tr(`Ver ${it.label}`)}
                  data-testid={instanceId + "-" + (`viewer-model-item-${i}`)}
                >
                  <span data-testid={`${instanceId}-viewer3-d-carousel-span-5-${i}`} className="viewer-model-item__num">{String(i + 1).padStart(2, "0")}</span>
                  <span data-testid={`${instanceId}-viewer3-d-carousel-span-6-${i}`} className="viewer-model-item__name">
                    {tr(it.label)}
                    {!it.url && <small data-testid={`${instanceId}-model-unavailable-${i}`} className="viewer-model-unavailable">{tr("Indisponível")}</small>}
                  </span>
                  <span className="viewer-model-item__arrow" aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Link para catálogo completo */}
      {showCatalogLink && (
        <a
          href={catalogUrl}
          className="viewer-catalog-link"
          data-cursor={tr("Ver catálogo")}
          data-testid={instanceId + "-" + ("viewer-catalog-link")}
        >{tr("Ver nosso catálogo completo")}</a>
      )}
    </div>
  );
}
