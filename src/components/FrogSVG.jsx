export default function FrogSVG({ size = 140, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="none"
      style={animate ? { animation: "bob 3.5s ease-in-out infinite" } : {}}>
      <ellipse cx="70" cy="90" rx="44" ry="36" fill="#6db87a"/>
      <ellipse cx="70" cy="65" rx="40" ry="34" fill="#7dcf8b"/>
      <circle cx="48" cy="50" r="17" fill="#4a9457"/><circle cx="92" cy="50" r="17" fill="#4a9457"/>
      <circle cx="48" cy="50" r="12" fill="white"/><circle cx="92" cy="50" r="12" fill="white"/>
      <circle cx="50" cy="50" r="7" fill="#2c2318"/><circle cx="94" cy="50" r="7" fill="#2c2318"/>
      <circle cx="52" cy="47" r="2.5" fill="white"/><circle cx="96" cy="47" r="2.5" fill="white"/>
      <path d="M52 78 Q70 92 88 78" stroke="#4a9457" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <ellipse cx="64" cy="68" rx="3" ry="2" fill="#4a9457"/>
      <ellipse cx="76" cy="68" rx="3" ry="2" fill="#4a9457"/>
      <ellipse cx="70" cy="104" rx="26" ry="16" fill="#9de3a8" opacity="0.4"/>
      <ellipse cx="32" cy="116" rx="16" ry="9" fill="#6db87a"/>
      <ellipse cx="108" cy="116" rx="16" ry="9" fill="#6db87a"/>
    </svg>
  );
}
