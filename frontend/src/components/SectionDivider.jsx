/**
 * Pequeno divisor gráfico entre seções da home.
 * Mantém ritmo visual da marca: triângulo + linha + dot em azul-teal.
 */
export default function SectionDivider({ variant = "default" }) {
  if (variant === "wide") {
    return (
      <div className="section-divider" aria-hidden="true">
        <svg viewBox="0 0 420 64" preserveAspectRatio="xMidYMid meet">
          <path className="sd-line" d="M0 32 L160 32" />
          <polygon className="sd-tri" points="170,22 188,32 170,42" />
          <circle className="sd-dot" cx="210" cy="32" r="3" />
          <polygon className="sd-tri" points="250,22 232,32 250,42" />
          <path className="sd-line" d="M260 32 L420 32" />
        </svg>
      </div>
    );
  }
  return (
    <div className="section-divider" aria-hidden="true">
      <svg viewBox="0 0 320 64" preserveAspectRatio="xMidYMid meet">
        <path className="sd-line" d="M0 32 L130 32" />
        <polygon className="sd-tri" points="140,24 156,32 140,40" />
        <circle className="sd-dot" cx="172" cy="32" r="2.6" />
        <path className="sd-line" d="M188 32 L320 32" />
      </svg>
    </div>
  );
}
