// Extracted from the teenager dashboard's hand-drawn SVG activity chart —
// a gridlined line/area chart over a fixed set of labeled points.
export function LineChart({ data, ariaLabel }: { data: { label: string; value: number }[]; ariaLabel?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = data.length > 1 ? 276 / (data.length - 1) : 0;
  const points = data.map((d, i) => `${12 + i * step},${90 - (d.value / max) * 65}`).join(" ");

  return (
    <svg viewBox="0 0 300 110" className="h-[145px] w-full overflow-visible" role="img" aria-label={ariaLabel}>
      {[25, 50, 75, 100].map((y) => (
        <line key={y} x1="10" x2="292" y1={y} y2={y} stroke="#E9E5DD" strokeWidth="1" />
      ))}
      <defs>
        <linearGradient id="line-chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#31A879" stopOpacity=".25" />
          <stop offset="1" stopColor="#31A879" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`12,100 ${points} ${12 + (data.length - 1) * step},100`} fill="url(#line-chart-fill)" />
      <polyline points={points} fill="none" stroke="#209B6B" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={12 + i * step} cy={90 - (d.value / max) * 65} r="3.5" fill="white" stroke="#209B6B" strokeWidth="2" />
          <text x={12 + i * step} y="108" textAnchor="middle" fontSize="8" fill="#687975">{d.label}</text>
        </g>
      ))}
    </svg>
  );
}
