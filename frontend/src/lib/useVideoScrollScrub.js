/**
 * useVideoScrollScrub
 * ==================================================================
 * Hook reutilizável — transforma um elemento <video> em uma
 * timeline visual pilotada pelo scroll do usuário.
 *
 *  - Enquanto o scroll acontece dentro do range definido, o
 *    `currentTime` do vídeo é escrubado (com lag/smoothness controlado).
 *  - O elemento container é pinado durante o scrub e liberado ao final.
 *  - Em mobile (pointer:coarse ou <768px) o hook não pina — retorna
 *    silenciosamente (você pode usar autoplay+loop como fallback).
 *
 * Pré-requisitos:
 *  - GSAP + ScrollTrigger já registrados no projeto
 *  - Vídeo com KEYFRAME em (praticamente) todos os frames para seek
 *    fluido. Recomendo re-codificar com `-g 1 -keyint_min 1` (H.264)
 *    ou equivalente para VP9.
 *  - O <video> deve estar mudo (`muted`), `playsInline` e `preload="auto"`.
 *
 * Uso:
 *   const videoRef = useRef(null);
 *   const wrapRef = useRef(null);
 *   useVideoScrollScrub({
 *     videoRef,
 *     triggerRef: wrapRef,        // opcional (default = videoRef)
 *     pxPerSecond: 320,           // controla o "tamanho" do pin
 *     scrub: 0.6,                 // lag do scrub (0.1 - 1.2 são bons)
 *     start: "top top",
 *     enabled: !isMobile,         // opcional (default true)
 *   });
 *
 * Retorna:
 *   { destroy: () => void, refresh: () => void, trigger: ScrollTrigger | null }
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useVideoScrollScrub({
  videoRef,
  triggerRef,
  pxPerSecond = 320,
  scrub = 0.6,
  start = "top top",
  pinSpacing = true,
  enabled = true,
  onReady,
} = {}) {
  const stateRef = useRef({ tween: null, trigger: null, cleanup: null });

  useEffect(() => {
    if (!enabled) return;
    const video = videoRef?.current;
    const trigger = (triggerRef && triggerRef.current) || video;
    if (!video || !trigger) return;

    let built = false;
    let scrubTween = null;
    let scrubTrigger = null;

    const build = () => {
      if (built) return;
      const dur = video.duration;
      if (!isFinite(dur) || dur <= 0) return;
      built = true;
      try { video.currentTime = 0; } catch (e) {}

      const scrollLen = Math.round(dur * pxPerSecond);
      scrubTween = gsap.fromTo(
        video,
        { currentTime: 0 },
        {
          currentTime: dur,
          ease: "none",
          scrollTrigger: {
            trigger,
            start,
            end: `+=${scrollLen}`,
            pin: true,
            pinSpacing,
            scrub,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        }
      );
      scrubTrigger = scrubTween.scrollTrigger;
      stateRef.current.tween = scrubTween;
      stateRef.current.trigger = scrubTrigger;
      ScrollTrigger.refresh();
      onReady && onReady({ trigger: scrubTrigger, tween: scrubTween });
    };

    // Prepara o vídeo (mudo, pausado no frame 0)
    video.muted = true;
    video.loop = false;
    video.autoplay = false;
    video.playsInline = true;
    video.pause();
    try { video.currentTime = 0; } catch (e) {}

    const onMeta = () => build();
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("loadeddata", onMeta);
    video.addEventListener("canplay", onMeta);

    // Destrava buffer com play()->pause() imediato (imperceptível, mas
    // essencial p/ browsers que ignoram preload="auto" sem gesture).
    try { video.load(); } catch (e) {}
    const unlock = () => {
      const p = video.play();
      if (p && p.then) {
        p.then(() => { video.pause(); video.currentTime = 0; }).catch(() => {});
      } else {
        try { video.pause(); video.currentTime = 0; } catch (e) {}
      }
    };
    const unlockT = setTimeout(unlock, 0);

    if (video.readyState >= 1 && isFinite(video.duration) && video.duration > 0) {
      build();
    }

    const cleanup = () => {
      clearTimeout(unlockT);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("loadeddata", onMeta);
      video.removeEventListener("canplay", onMeta);
      if (scrubTween) {
        scrubTween.scrollTrigger && scrubTween.scrollTrigger.kill();
        scrubTween.kill();
      } else if (scrubTrigger) {
        scrubTrigger.kill();
      }
      stateRef.current = { tween: null, trigger: null, cleanup: null };
    };
    stateRef.current.cleanup = cleanup;

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, pxPerSecond, scrub, start, pinSpacing]);

  return {
    destroy: () => stateRef.current.cleanup && stateRef.current.cleanup(),
    refresh: () => ScrollTrigger.refresh(),
    get trigger() { return stateRef.current.trigger; },
  };
}

export default useVideoScrollScrub;
