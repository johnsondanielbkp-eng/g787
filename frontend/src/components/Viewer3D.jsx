import { useId } from "react";
import { useLocale } from "../i18n/LocaleProvider";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

/**
 * 3D viewer com:
 *  - Cache global de modelos parseados
 *  - Cor + intensidade compartilhada entre TODOS os viewers (store global)
 *  - Renderização on-demand + pausa fora da viewport
 *  - Carregamento LAZY: só baixa o modelo quando o viewer entra em vista
 *  - Botões de navegação (girar/zoom) recolhíveis
 */

// -------- Cache global de modelos --------
const MODEL_CACHE = new Map();
const LOADING_PROMISES = new Map();

function loadModelCached(modelUrl) {
  if (MODEL_CACHE.has(modelUrl)) {
    return Promise.resolve(MODEL_CACHE.get(modelUrl).clone(true));
  }
  if (LOADING_PROMISES.has(modelUrl)) {
    return LOADING_PROMISES.get(modelUrl).then((r) => r.clone(true));
  }
  const isObj = /\.obj(\?|$)/i.test(modelUrl);
  const p = new Promise((resolve, reject) => {
    if (isObj) {
      const objLoader = new OBJLoader();
      objLoader.load(
        modelUrl,
        (obj) => { MODEL_CACHE.set(modelUrl, obj); LOADING_PROMISES.delete(modelUrl); resolve(obj); },
        undefined,
        (err) => { LOADING_PROMISES.delete(modelUrl); reject(err); }
      );
    } else {
      const loader = new GLTFLoader();
      const draco = new DRACOLoader();
      draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
      draco.setDecoderConfig({ type: "js" });
      loader.setDRACOLoader(draco);
      loader.load(
        modelUrl,
        (gltf) => { MODEL_CACHE.set(modelUrl, gltf.scene); LOADING_PROMISES.delete(modelUrl); resolve(gltf.scene); },
        undefined,
        (err) => { LOADING_PROMISES.delete(modelUrl); reject(err); }
      );
    }
  });
  LOADING_PROMISES.set(modelUrl, p);
  return p.then((r) => r.clone(true));
}

// -------- Store global de cor/intensidade (compartilhado entre viewers) --------
let _sharedColor = { color: "#f5f7fa", intensity: 15 };
const _colorListeners = new Set();
const sharedColorStore = {
  subscribe(cb) { _colorListeners.add(cb); return () => _colorListeners.delete(cb); },
  getSnapshot() { return _sharedColor; },
  set(next) {
    _sharedColor = { ..._sharedColor, ...next };
    _colorListeners.forEach((cb) => cb());
  },
};

export default function Viewer3D({
  label = "Gi Reboot® · E-TPU",
  modelUrl = "/assets/3d/gi-sole.glb",
}) {
  const { tr } = useLocale();
  const instanceId = useId();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const materialRef = useRef(null);
  const orbitRef = useRef(null);
  const invalidateRef = useRef(() => {});
  const [hintHidden, setHintHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inViewport, setInViewport] = useState(false);

  // Estado compartilhado de cor
  const shared = useSyncExternalStore(sharedColorStore.subscribe, sharedColorStore.getSnapshot, sharedColorStore.getSnapshot);
  const color = shared.color;
  const intensity = shared.intensity;

  const [pickerOpen, setPickerOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);

  // Aplica cor + intensidade quando muda
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    const c = new THREE.Color(color);
    mat.color.copy(c);
    mat.emissive.copy(c);
    mat.emissiveIntensity = (intensity / 100) * 0.9;
    mat.needsUpdate = true;
    invalidateRef.current();
  }, [color, intensity]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let width = wrap.clientWidth;
    let height = wrap.clientHeight;

    const isCoarse =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches;

    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(0, 12, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isCoarse,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarse ? 1 : 1.5));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xf2f4ff, 2.2);
    key.position.set(6, 10, 4); scene.add(key);
    const fill = new THREE.DirectionalLight(0x88b6ff, 0.9);
    fill.position.set(-7, 4, -4); scene.add(fill);
    const bottomFill = new THREE.DirectionalLight(0xffffff, 0.8);
    bottomFill.position.set(0, -10, 0); scene.add(bottomFill);

    // Aplica cor atual no material inicial
    const current = sharedColorStore.getSnapshot();
    const initColor = new THREE.Color(current.color);
    const soleMat = new THREE.MeshStandardMaterial({
      color: initColor,
      roughness: 0.45,
      metalness: 0.08,
      emissive: initColor,
      emissiveIntensity: (current.intensity / 100) * 0.9,
      flatShading: false,
    });
    materialRef.current = soleMat;

    const soleGroup = new THREE.Group();
    scene.add(soleGroup);

    let needsRender = true;
    let visible = false; // só começa a renderizar quando visível
    const invalidate = () => { needsRender = true; };
    invalidateRef.current = invalidate;

    let disposed = false;
    let modelLoadStarted = false;

    const startModelLoad = () => {
      if (modelLoadStarted || disposed) return;
      modelLoadStarted = true;
      setLoading(true);
      loadModelCached(modelUrl)
        .then((root) => {
          if (disposed) return;
          root.traverse((obj) => {
            if (obj.isMesh) {
              obj.material = soleMat;
              if (!obj.geometry.attributes.normal) obj.geometry.computeVertexNormals();
              obj.frustumCulled = true;
            }
          });
          const box = new THREE.Box3().setFromObject(root);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const longest = Math.max(size.x, size.y, size.z);
          const s = 14 / longest;
          root.position.sub(center).multiplyScalar(s);
          root.scale.setScalar(s);
          root.rotation.set(0, 0, 0);
          soleGroup.add(root);
          setLoading(false);
          invalidate();
        })
        .catch((err) => {
          console.error("Falha ao carregar modelo 3D:", err);
          setLoading(false);
        });
    };

    const orbit = {
      azimuth: 0.6, polar: 0.95, radius: 22,
      tAzimuth: 0.6, tPolar: 0.95, tRadius: 22,
      minRadius: 6, maxRadius: 48,
      minPolar: 0.05, maxPolar: Math.PI - 0.05,
      autoRotate: true, autoSpeed: 0.0035,
      idleAt: performance.now(),
      isDragging: false, isPinching: false,
      pinchStartDist: 0, pinchStartRadius: 22,
      lastX: 0, lastY: 0,
      rotSpeed: isCoarse ? 0.0045 : 0.006,
      rotSpeedY: isCoarse ? 0.0038 : 0.005,
    };
    orbitRef.current = orbit;

    const pointers = new Map();
    const getPointersArr = () => Array.from(pointers.values());
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const setIdle = () => { orbit.idleAt = performance.now(); orbit.autoRotate = false; invalidate(); };
    const pauseScroll = () => window.__lenis?.stop?.();
    const resumeScroll = () => window.__lenis?.start?.();

    const onPointerDown = (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      canvas.setPointerCapture?.(e.pointerId);
      pauseScroll();
      setHintHidden(true);
      if (pointers.size === 1) {
        orbit.isDragging = true; orbit.isPinching = false; orbit.autoRotate = false;
        orbit.lastX = e.clientX; orbit.lastY = e.clientY;
      } else if (pointers.size === 2) {
        orbit.isDragging = false; orbit.isPinching = true;
        const [p1, p2] = getPointersArr();
        orbit.pinchStartDist = distance(p1, p2);
        orbit.pinchStartRadius = orbit.tRadius;
      }
      invalidate();
    };
    const onPointerMove = (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (orbit.isPinching && pointers.size === 2) {
        const [p1, p2] = getPointersArr();
        const d = distance(p1, p2);
        if (orbit.pinchStartDist > 0) {
          const scale = orbit.pinchStartDist / d;
          orbit.tRadius = Math.max(orbit.minRadius, Math.min(orbit.maxRadius, orbit.pinchStartRadius * scale));
        }
      } else if (orbit.isDragging && pointers.size === 1) {
        const dx = e.clientX - orbit.lastX;
        const dy = e.clientY - orbit.lastY;
        orbit.lastX = e.clientX; orbit.lastY = e.clientY;
        orbit.tAzimuth -= dx * orbit.rotSpeed;
        orbit.tPolar -= dy * orbit.rotSpeedY;
        orbit.tPolar = Math.max(orbit.minPolar, Math.min(orbit.maxPolar, orbit.tPolar));
      }
      invalidate();
    };
    const onPointerUp = (e) => {
      pointers.delete(e.pointerId);
      canvas.releasePointerCapture?.(e.pointerId);
      if (pointers.size === 0) {
        orbit.isDragging = false; orbit.isPinching = false;
        orbit.idleAt = performance.now(); resumeScroll();
      } else if (pointers.size === 1) {
        orbit.isPinching = false; orbit.isDragging = true;
        const [p] = getPointersArr();
        orbit.lastX = p.x; orbit.lastY = p.y;
      }
    };
    const onWheel = (e) => {
      e.preventDefault();
      orbit.tRadius += e.deltaY * 0.015;
      orbit.tRadius = Math.max(orbit.minRadius, Math.min(orbit.maxRadius, orbit.tRadius));
      setIdle(); setHintHidden(true);
    };
    const onTouchStart = (e) => { if (e.touches.length >= 1) e.preventDefault(); };
    const onGesture = (e) => e.preventDefault();

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("gesturestart", onGesture);
    canvas.addEventListener("gesturechange", onGesture);
    canvas.addEventListener("gestureend", onGesture);

    const onWrapEnter = (e) => { if (e.pointerType === "mouse") pauseScroll(); };
    const onWrapLeave = (e) => { if (e.pointerType === "mouse") resumeScroll(); };
    wrap.addEventListener("pointerenter", onWrapEnter);
    wrap.addEventListener("pointerleave", onWrapLeave);

    // Lazy-load: começa a baixar só quando entra em vista
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          setInViewport(visible);
          if (visible) {
            startModelLoad();
            invalidate();
          }
        });
      },
      { threshold: 0.05, rootMargin: "200px 0px" }
    );
    io.observe(wrap);

    let rafId;
    const EPS = 0.0001;
    const animate = () => {
      if (visible && !orbit.isDragging && performance.now() - orbit.idleAt > 3000) {
        orbit.autoRotate = true;
      }
      if (visible && orbit.autoRotate) {
        orbit.tAzimuth += orbit.autoSpeed;
        needsRender = true;
      }
      const dA = (orbit.tAzimuth - orbit.azimuth) * 0.08;
      const dP = (orbit.tPolar - orbit.polar) * 0.08;
      const dR = (orbit.tRadius - orbit.radius) * 0.08;
      if (Math.abs(dA) > EPS || Math.abs(dP) > EPS || Math.abs(dR) > EPS) {
        orbit.azimuth += dA; orbit.polar += dP; orbit.radius += dR;
        needsRender = true;
      }
      if (visible && needsRender) {
        const r = orbit.radius;
        const sinP = Math.sin(orbit.polar);
        camera.position.x = r * sinP * Math.sin(orbit.azimuth);
        camera.position.z = r * sinP * Math.cos(orbit.azimuth);
        camera.position.y = r * Math.cos(orbit.polar);
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        needsRender = false;
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    const resize = () => {
      width = wrap.clientWidth; height = wrap.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      invalidate();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      window.__lenis?.start?.();
      wrap.removeEventListener("pointerenter", onWrapEnter);
      wrap.removeEventListener("pointerleave", onWrapLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("gesturestart", onGesture);
      canvas.removeEventListener("gesturechange", onGesture);
      canvas.removeEventListener("gestureend", onGesture);
      soleMat.dispose();
      renderer.dispose();
    };
  }, [modelUrl]);

  // Botões de controle
  const rotateBy = (dA) => {
    const o = orbitRef.current; if (!o) return;
    o.tAzimuth += dA; o.autoRotate = false; o.idleAt = performance.now();
    setHintHidden(true); invalidateRef.current();
  };
  const tiltBy = (dP) => {
    const o = orbitRef.current; if (!o) return;
    o.tPolar = Math.max(o.minPolar, Math.min(o.maxPolar, o.tPolar + dP));
    o.autoRotate = false; o.idleAt = performance.now();
    setHintHidden(true); invalidateRef.current();
  };
  const zoomBy = (dR) => {
    const o = orbitRef.current; if (!o) return;
    o.tRadius = Math.max(o.minRadius, Math.min(o.maxRadius, o.tRadius + dR));
    o.autoRotate = false; o.idleAt = performance.now();
    setHintHidden(true); invalidateRef.current();
  };
  const resetView = () => {
    const o = orbitRef.current; if (!o) return;
    o.tAzimuth = 0.6; o.tPolar = 0.95; o.tRadius = 22;
    o.autoRotate = true; o.idleAt = performance.now();
    invalidateRef.current();
  };

  return (
    <div className="viewer-3d-frame" data-testid={instanceId + "-" + ("viewer-3d-frame")}>
    <div
      className="viewer-3d-container"
      ref={wrapRef}
      data-cursor={tr("Girar 360°")}
      data-testid={instanceId + "-" + ("viewer-3d")}
    >
      <canvas data-testid={`${instanceId}-viewer3-d-canvas-1`} ref={canvasRef} id={`${instanceId}-canvas`} />
      <span data-testid={`${instanceId}-viewer3-d-span-2`} className="viewer-badge">{tr(label)}</span>

      {loading && inViewport && (
        <div className="viewer-loading" data-testid={instanceId + "-" + ("viewer-loading")}>{tr("Carregando modelo…")}</div>
      )}
    </div>

    {/* Painel de controles (cor + controles de câmera) — FORA do canvas */}
    <div className="viewer-side-panel viewer-side-panel--below">
        {/* COR */}
        <div
          className={`viewer-color-plus ${pickerOpen ? "is-open" : ""}`}
          data-testid={instanceId + "-" + ("viewer-color-plus")}
        >
          <button
            type="button"
            className="viewer-plus-trigger"
            onClick={() => setPickerOpen((v) => !v)}
            aria-expanded={pickerOpen}
            aria-label={tr("Personalizar cor")}
            data-cursor={tr(pickerOpen ? "Fechar" : "Personalizar")}
            data-testid={instanceId + "-" + ("viewer-plus-trigger")}
          >
            <span className="plus-dot" style={{ background: color }} aria-hidden />
            <span data-testid={`${instanceId}-viewer3-d-span-3`} className="plus-label">
              <span data-testid={`${instanceId}-viewer3-d-span-4`} className="plus-sign">+</span>
              <span data-testid={`${instanceId}-viewer3-d-span-5`}>{tr("Cor")}</span>
            </span>
          </button>

          {pickerOpen && (
            <div data-testid={`${instanceId}-viewer3-d-div-6`} className="viewer-plus-panel" role="dialog" aria-label={tr("Selecionar cor e intensidade")}>
              <div className="plus-row">
                <label data-testid={`${instanceId}-viewer3-d-label-7`} className="plus-field plus-field--color">
                  <span data-testid={`${instanceId}-viewer3-d-span-8`} className="plus-field-label">{tr("Cor")}</span>
                  <span data-testid={`${instanceId}-viewer3-d-span-9`} className="plus-color-input-wrap" style={{ background: color }}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => sharedColorStore.set({ color: e.target.value })}
                      data-testid={instanceId + "-" + ("viewer-color-input")}
                      aria-label={tr("Espectro de cor RGB")}
                    />
                  </span>
                  <span data-testid={`${instanceId}-viewer3-d-span-10`} className="plus-hex">{color.toUpperCase()}</span>
                </label>
              </div>
              <div className="plus-row">
                <label data-testid={`${instanceId}-viewer3-d-label-11`} className="plus-field plus-field--range">
                  <span data-testid={`${instanceId}-viewer3-d-span-12`} className="plus-field-label">
                    <span data-testid={`${instanceId}-viewer3-d-span-13`}>{tr("Intensidade")}</span>
                    <span data-testid={`${instanceId}-viewer3-d-span-14`} className="plus-field-value">{intensity}%</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={intensity}
                    onChange={(e) => sharedColorStore.set({ intensity: parseInt(e.target.value, 10) })}
                    data-testid={instanceId + "-" + ("viewer-intensity-input")}
                    aria-label={tr("Intensidade da cor")}
                    style={{
                      background: `linear-gradient(90deg, ${color} 0%, ${color} ${intensity}%, rgba(255,255,255,0.12) ${intensity}%, rgba(255,255,255,0.12) 100%)`,
                    }}
                  />
                </label>
              </div>
              <div className="plus-row plus-row--actions">
                <button
                  type="button"
                  className="plus-reset"
                  onClick={() => sharedColorStore.set({ color: "#f5f7fa", intensity: 15 })}
                  data-cursor={tr("Resetar")}
                  data-testid={instanceId + "-" + ("viewer-color-reset")}
                >{tr("Resetar")}</button>
              </div>
            </div>
          )}
        </div>

        {/* CONTROLES (colapsáveis) */}
        <div className={`viewer-controls-wrap ${controlsOpen ? "is-open" : ""}`}>
          <button
            type="button"
            className="viewer-controls-trigger"
            onClick={() => setControlsOpen((v) => !v)}
            aria-expanded={controlsOpen}
            aria-label={tr(controlsOpen ? "Fechar controles" : "Abrir controles")}
            data-cursor={tr(controlsOpen ? "Fechar" : "Controles")}
            data-testid={instanceId + "-" + ("viewer-controls-toggle")}
          >
            <span className="ctrl-icon" aria-hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M4.93 4.93l2.83 2.83" />
                <path d="M16.24 16.24l2.83 2.83" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="M4.93 19.07l2.83-2.83" />
                <path d="M16.24 7.76l2.83-2.83" />
              </svg>
            </span>
            <span data-testid={`${instanceId}-viewer3-d-span-15`} className="plus-label">
              <span data-testid={`${instanceId}-viewer3-d-span-16`} className="plus-sign">+</span>
              <span data-testid={`${instanceId}-viewer3-d-span-17`}>{tr("Controles")}</span>
            </span>
          </button>

          {controlsOpen && (
            <div className="viewer-controls" data-testid={instanceId + "-" + ("viewer-controls")}>
              <button type="button" className="viewer-ctrl-btn" onClick={() => rotateBy(-0.6)} aria-label={tr("Girar para a esquerda")} data-testid={instanceId + "-" + ("ctrl-rotate-left")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <polyline points="3 4 3 10 9 10" />
                </svg>
              </button>
              <button type="button" className="viewer-ctrl-btn" onClick={() => rotateBy(0.6)} aria-label={tr("Girar para a direita")} data-testid={instanceId + "-" + ("ctrl-rotate-right")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-3-6.7" />
                  <polyline points="21 4 21 10 15 10" />
                </svg>
              </button>
              <button type="button" className="viewer-ctrl-btn" onClick={() => tiltBy(-0.35)} aria-label={tr("Inclinar para cima")} data-testid={instanceId + "-" + ("ctrl-tilt-up")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
              <button type="button" className="viewer-ctrl-btn" onClick={() => tiltBy(0.35)} aria-label={tr("Inclinar para baixo")} data-testid={instanceId + "-" + ("ctrl-tilt-down")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <button type="button" className="viewer-ctrl-btn" onClick={() => zoomBy(-3)} aria-label={tr("Aproximar zoom")} data-testid={instanceId + "-" + ("ctrl-zoom-in")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                  <line x1="20" y1="20" x2="16.5" y2="16.5" />
                </svg>
              </button>
              <button type="button" className="viewer-ctrl-btn" onClick={() => zoomBy(3)} aria-label={tr("Afastar zoom")} data-testid={instanceId + "-" + ("ctrl-zoom-out")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                  <line x1="20" y1="20" x2="16.5" y2="16.5" />
                </svg>
              </button>
              <button type="button" className="viewer-ctrl-btn viewer-ctrl-btn--reset" onClick={resetView} aria-label={tr("Reset da visão")} data-testid={instanceId + "-" + ("ctrl-reset")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9" />
                  <polyline points="3 4 3 10 9 10" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
