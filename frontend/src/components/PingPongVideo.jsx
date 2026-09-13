import { useEffect, useRef } from "react";

/**
 * PingPongVideo — reproduz um vídeo em loop infinito.
 * Recomenda-se usar um arquivo já concatenado (forward + reverse) para
 * um efeito "vai e volta" perfeito e sem travamentos entre navegadores.
 */
export default function PingPongVideo({
  src,
  className = "",
  style = {},
  ...rest
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Chrome/React 19 exigem o atributo HTML muted para autoplay
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    try { video.load(); } catch (e) {}
    tryPlay();
    const t1 = setTimeout(tryPlay, 300);
    const t2 = setTimeout(tryPlay, 1500);

    // Retry em qualquer interação do usuário (fallback iOS)
    const onGesture = () => tryPlay();
    window.addEventListener("touchstart", onGesture, { once: true, passive: true });
    window.addEventListener("click", onGesture, { once: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("click", onGesture);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      style={style}
      src={src}
      muted={true}
      autoPlay
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      disableRemotePlayback
      {...rest}
    />
  );
}
