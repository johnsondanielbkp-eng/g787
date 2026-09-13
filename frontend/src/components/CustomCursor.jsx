import { useEffect, useRef, useState } from "react";

/**
 * Custom cursor that follows the mouse with smooth lerp.
 * Listens to elements with [data-cursor] to update tag text.
 * Renders null on touch/coarse-pointer devices.
 */
export default function CustomCursor() {
  const wrapRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const tagRef = useRef(null);
  const [tag, setTag] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setEnabled(mq.matches);
    const onChange = (e) => setEnabled(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add("has-custom-cursor");

    const state = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    const onMove = (e) => {
      state.x = e.clientX;
      state.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${state.x}px, ${state.y}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${state.x}px, ${state.y}px)`;
      }
      if (tagRef.current) {
        tagRef.current.style.transform = `translate(${state.x}px, ${state.y}px)`;
      }
    };

    const onOver = (e) => {
      const t = e.target.closest("[data-cursor]");
      if (t) {
        setTag(t.getAttribute("data-cursor") || "");
      }
    };
    const onOut = (e) => {
      const t = e.target.closest("[data-cursor]");
      if (t && !t.contains(e.relatedTarget)) {
        setTag("");
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={wrapRef}
      className={`cursor-wrapper ${tag ? "has-tag" : ""}`}
      aria-hidden="true"
      data-testid="custom-cursor"
    >
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
      <div ref={tagRef} className="cursor-tag">{tag}</div>
    </div>
  );
}
