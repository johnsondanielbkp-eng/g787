import { useEffect, useRef } from "react";
import { FACTORY_IMAGES } from "../data/factoryImages";

// Mouse trail da seção "Passos firmes e leves" (Home).
// As fotos vêm do array FACTORY_IMAGES em src/data/factoryImages.js.
// Caso ainda não haja fotos suficientes da Gi, completa com placeholders.
const PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=480&h=600&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=600&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=480&h=600&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=460&h=580&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=480&h=600&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=440&h=550&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=480&h=600&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1624365168968-f283d506adc3?w=500&h=620&q=75&auto=format&fit=crop",
];

const DEFAULT_IMAGES =
  FACTORY_IMAGES.length >= 4
    ? FACTORY_IMAGES
    : [...FACTORY_IMAGES, ...PLACEHOLDERS];

/**
 * Mouse-trail of images CONFINED to `zoneRef`.
 * Spawns thumbnails as the user moves the cursor. Optionally `autoStart` triggers
 * a sequence of images on viewport entry to teach the interaction.
 */
export default function MouseTrail({ zoneRef, images = DEFAULT_IMAGES, autoStart = false }) {
  const layerRef = useRef(null);

  useEffect(() => {
    const zone = zoneRef?.current;
    const layer = layerRef.current;
    if (!zone || !layer) return;

    let last = 0;
    let idx = 0;
    const COOLDOWN = 220;
    const LIFETIME = 2200;

    const spawn = (x, y, rotJitter = 10) => {
      const rect = zone.getBoundingClientRect();
      // ignore edges
      const margin = 30;
      if (
        x < margin ||
        y < margin ||
        x > rect.width - margin ||
        y > rect.height - margin
      ) {
        return;
      }

      const img = document.createElement("img");
      img.src = images[idx % images.length];
      const isColor = idx % 3 !== 2;
      idx++;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.className = isColor ? "trail-img trail-img--color" : "trail-img";

      const rot = (Math.random() - 0.5) * rotJitter;
      img.style.left = `${x}px`;
      img.style.top = `${y}px`;
      img.style.setProperty("--rotation", `${rot}deg`);
      img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(0.85)`;

      layer.appendChild(img);
      requestAnimationFrame(() => {
        img.classList.add("visible");
        img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(1)`;
      });

      setTimeout(() => {
        img.classList.remove("visible");
        img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(0.9)`;
        setTimeout(() => img.remove(), 700);
      }, LIFETIME);
    };

    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // ===== MOBILE / TOUCH: spawn aleatório contínuo (não há cursor) =====
    // Quando a seção entra na viewport, dispara fotos em posições randômicas
    // a cada ~1.4s. Cada foto vive ~2.2s, então em média 2-3 ficam visíveis.
    let mobileLoop = null;
    let mobileIO = null;
    if (!isFinePointer) {
      const startMobileSpawn = () => {
        const tick = () => {
          const rect = zone.getBoundingClientRect();
          const margin = 60;
          const x = margin + Math.random() * (rect.width - margin * 2);
          const y = margin + Math.random() * (rect.height - margin * 2);
          spawn(x, y, 16);
        };
        tick(); // primeira imagem imediata
        mobileLoop = setInterval(tick, 1400);
      };
      mobileIO = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !mobileLoop) startMobileSpawn();
          else if (!entry.isIntersecting && mobileLoop) {
            clearInterval(mobileLoop);
            mobileLoop = null;
          }
        },
        { threshold: 0.25 }
      );
      mobileIO.observe(zone);
    }

    // ===== Auto-spawn CONTÍNUO no desktop (pausa quando o cursor interage) =====
    // Enquanto o usuário não mexe o mouse, imagens ficam pipocando em posições
    // randômicas. Assim que o cursor entra em movimento, o auto-spawn pausa e
    // o cursor assume; quando fica ocioso ~1.2s, o auto-spawn retorna.
    let autoLoop = null;
    let idleTimer = null;
    let autoIO = null;
    let isVisible = false;
    const AUTO_INTERVAL = 1400;
    const IDLE_DELAY = 1200;

    const autoTick = () => {
      const rect = zone.getBoundingClientRect();
      const margin = 60;
      const x = margin + Math.random() * (rect.width - margin * 2);
      const y = margin + Math.random() * (rect.height - margin * 2);
      spawn(x, y, 16);
    };
    const startAutoLoop = () => {
      if (autoLoop || !isVisible) return;
      autoTick();
      autoLoop = setInterval(autoTick, AUTO_INTERVAL);
    };
    const stopAutoLoop = () => {
      if (autoLoop) {
        clearInterval(autoLoop);
        autoLoop = null;
      }
    };

    if (autoStart && isFinePointer) {
      autoIO = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
          if (isVisible) startAutoLoop();
          else stopAutoLoop();
        },
        { threshold: 0.25 }
      );
      autoIO.observe(zone);
    }

    // ===== Mouse move (apenas em pointers finos) =====
    const onMove = (e) => {
      if (!isFinePointer) return;
      // marca como "mexido" para o hint sumir
      zone.dataset.cursorMoved = "1";
      // pausa o auto-spawn enquanto o cursor está ativo
      stopAutoLoop();
      // agenda retorno do auto-spawn após inatividade
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => startAutoLoop(), IDLE_DELAY);
      const rect = zone.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();
      if (now - last < COOLDOWN) return;
      last = now;
      spawn(x, y);
    };

    const onLeave = () => {
      const imgs = layer.querySelectorAll(".trail-img.visible");
      imgs.forEach((im) => im.classList.remove("visible"));
      // ao sair da zona, retoma o auto-spawn quase imediatamente
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => startAutoLoop(), 400);
    };

    zone.addEventListener("mousemove", onMove);
    zone.addEventListener("mouseleave", onLeave);
    return () => {
      zone.removeEventListener("mousemove", onMove);
      zone.removeEventListener("mouseleave", onLeave);
      if (mobileLoop) clearInterval(mobileLoop);
      if (mobileIO) mobileIO.disconnect();
      if (autoLoop) clearInterval(autoLoop);
      if (idleTimer) clearTimeout(idleTimer);
      if (autoIO) autoIO.disconnect();
    };
  }, [zoneRef, images, autoStart]);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 2,
      }}
    />
  );
}
