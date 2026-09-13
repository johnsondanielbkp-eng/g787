import { useLocale } from "../i18n/LocaleProvider";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * SustainMarquee — carrossel interativo de cards de sustentabilidade.
 *
 * Comportamento:
 *  - Auto-play contínuo em loop (translateX -50% dos cards duplicados).
 *  - Pausa em: hover, focus, touch, quando setas/pausa forem clicadas.
 *  - Setas ‹ › avançam/voltam um card por vez (com transição suave).
 *  - Botão pausar/retomar alterna o auto-play.
 *  - Cards focáveis via teclado (tabindex) — Enter/Space pausam.
 *  - Suporta arrastar horizontal em touch/mouse (drag-to-scroll).
 */
export default function SustainMarquee({ items = [], icons = [] }) {
  const { tr } = useLocale();
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [manualOffset, setManualOffset] = useState(0); // px offset acumulado
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const dragStateRef = useRef({ dragging: false, startX: 0, startOffset: 0 });

  // Configurações
  const CARD_WIDTH = 480;
  const CARD_GAP = 35; // px (~2.2rem)
  const AUTOPLAY_SPEED = (CARD_WIDTH + CARD_GAP) / 4.5; // px por segundo (~120px/s ≈ 45s/ciclo em desktop)

  const doubled = [...items, ...items];
  const trackWidth = doubled.length * (CARD_WIDTH + CARD_GAP);
  const loopDistance = trackWidth / 2; // metade porque duplicamos

  // Normaliza offset para [-loopDistance, 0]
  const normalize = useCallback((v) => {
    if (loopDistance === 0) return v;
    let x = v % loopDistance;
    if (x > 0) x -= loopDistance;
    return x;
  }, [loopDistance]);

  // Loop de animação
  useEffect(() => {
    const tick = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; // segundos
      lastTsRef.current = ts;

      if (!paused && !dragStateRef.current.dragging) {
        setManualOffset((prev) => normalize(prev - AUTOPLAY_SPEED * dt));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, AUTOPLAY_SPEED, normalize]);

  // Aplica o transform
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${manualOffset}px, 0, 0)`;
    }
  }, [manualOffset]);

  // Drag support (mouse + touch)
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStateRef.current = {
      dragging: true,
      startX: e.clientX,
      startOffset: manualOffset,
    };
    setPaused(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) { /* noop */ }
  };
  const onPointerMove = (e) => {
    if (!dragStateRef.current.dragging) return;
    const dx = e.clientX - dragStateRef.current.startX;
    setManualOffset(normalize(dragStateRef.current.startOffset + dx));
  };
  const onPointerUp = (e) => {
    if (!dragStateRef.current.dragging) return;
    dragStateRef.current.dragging = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) { /* noop */ }
  };

  return (
    <div className="sustain-marquee-wrap" ref={containerRef}>
      <div data-testid="sustain-marquee-div-1"
        className="sustain-marquee sustain-marquee--interactive"
        aria-label={tr("Frentes de sustentabilidade da Gi")}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          if (!dragStateRef.current.dragging) setPaused(false);
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="sustain-marquee-track" ref={trackRef}>
          {doubled.map((item, i) => {
            const tone = ["dark", "light", "green"][i % 3];
            const iconIdx = i % items.length;
            const isClone = i >= items.length;
            return (
              <article data-testid={`sustain-marquee-article-2-${i}`}
                className={`sustain-mq-card sustain-mq-card--${tone}`}
                key={`${item.t}-${i}`}
                aria-hidden={isClone ? "true" : undefined}
                tabIndex={isClone ? -1 : 0}
                role="group"
                data-cursor={tr("Ver")}
                onFocus={() => setPaused(true)}
                onBlur={() => {
                  // Só retoma se nada mais estiver com hover/drag
                  const wrap = containerRef.current;
                  if (wrap && !wrap.matches(":hover") && !dragStateRef.current.dragging) {
                    setPaused(false);
                  }
                }}
              >
                <span className="sustain-mq-icon" aria-hidden="true">
                  {icons[iconIdx]}
                </span>
                <h3 data-testid={`sustain-marquee-h3-3-${i}`} className="sustain-mq-card-title">{tr(item.t)}</h3>
                <p data-testid={`sustain-marquee-p-4-${i}`} className="sustain-mq-card-desc">{tr(item.d)}</p>
              </article>
            );
          })}
        </div>
      </div>

      {/* Controles removidos por escolha do cliente — mantém apenas touch/drag + loop automático */}
    </div>
  );
}
