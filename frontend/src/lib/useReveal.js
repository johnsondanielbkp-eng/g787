import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "../i18n/LocaleProvider";

gsap.registerPlugin(ScrollTrigger);

/**
 * Applies a staggered reveal animation to every `.reveal` and `.text-reveal`
 * element on mount. Uses IntersectionObserver to guarantee in-view triggers
 * fire reliably on initial load (Lenis + ScrollTrigger can race).
 */
export function useReveal(dep) {
  const { locale } = useLocale();
  useEffect(() => {
    let revertFns = [];

    const ctx = gsap.context(() => {
      // ---- TEXT REVEAL (word by word) ----
      const textEls = gsap.utils.toArray(".text-reveal");
      textEls.forEach((el) => {
        const inners = el.querySelectorAll(".word > span");
        if (!inners.length) {
          el.classList.add("is-ready");
          return;
        }
        gsap.set(inners, { yPercent: 110 });
        // libera visibility só DEPOIS de setar o pré-estado — sem FOUC
        el.classList.add("is-ready");

        const play = () => {
          gsap.to(inners, {
            yPercent: 0,
            duration: 1.05,
            ease: "power3.out",
            stagger: 0.05,
          });
        };

        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                play();
                io.disconnect();
              }
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
        );
        io.observe(el);
        revertFns.push(() => io.disconnect());
      });

      // ---- GENERIC REVEAL ----
      const revealEls = gsap.utils.toArray(".reveal");
      revealEls.forEach((el) => {
        gsap.set(el, { autoAlpha: 0, y: 60 });

        const play = () => {
          gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
          });
        };

        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                play();
                io.disconnect();
              }
            });
          },
          { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
        );
        io.observe(el);
        revertFns.push(() => io.disconnect());
      });
    });

    const t = setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      clearTimeout(t);
      revertFns.forEach((fn) => fn());
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, locale]);
}

/** Split text into per-word reveal markup. */
export function splitWords(text) {
  return text.split(/\s+/).map((w, i) => {
    // Se a palavra contiver "&", envolvê-lo em <span class="amp"> para
    // usar uma fonte serif clássica (o & da Archivo parece um "E" cursivo).
    const hasAmp = w.includes("&");
    const parts = hasAmp ? w.split(/(&)/g) : [w];
    return (
      <span className="word" key={`${w}-${i}`}>
        <span>
          {parts.map((p, k) =>
            p === "&" ? (
              <span className="amp" key={k}>&amp;</span>
            ) : (
              <span key={k}>{p}</span>
            )
          )}
          {"\u00A0"}
        </span>
      </span>
    );
  });
}

/** Wrap ampersands (&) in <span class="amp"> for typographic consistency. */
export function withAmp(text) {
  if (!text || !text.includes("&")) return text;
  const parts = text.split(/(&)/g);
  return parts.map((p, i) =>
    p === "&" ? (
      <span className="amp" key={i}>&amp;</span>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}
