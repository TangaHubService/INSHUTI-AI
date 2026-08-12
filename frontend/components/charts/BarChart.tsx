// Single canonical color cycle for bar charts with no explicit per-item
// color — replaces the two previously-duplicated copies of this exact array
// in admin/dashboard and government pages.
export const TOPIC_BAR_COLORS = ["bg-coral", "bg-teal-600", "bg-gold", "bg-teal-700", "bg-coral-dark", "bg-teal-100"];

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

// Unifies the vertical flex-height bar chart (admin dashboard, government
// topic engagement) and the horizontal proportional-width bar list
// (teenager dashboard "Top topics") into one component.
export function BarChart({
  data,
  orientation = "vertical",
  height = 160,
}: {
  data: BarDatum[];
  orientation?: "vertical" | "horizontal";
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (orientation === "horizontal") {
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="grid grid-cols-[105px_1fr_28px] items-center gap-2 text-[10.5px]">
            <span className="truncate text-ink">{item.label}</span>
            <div className="h-2 rounded-full bg-paper-2">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: item.color ?? "#146661",
                  width: `${item.value ? Math.max(18, (item.value / Math.max(1, total)) * 100) : 0}%`,
                }}
              />
            </div>
            <span className="text-right font-semibold text-ink">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3.5" style={{ height }}>
      {data.map((item, index) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-full w-full items-end">
            {item.color ? (
              <div className="w-full rounded-t-lg transition-all" style={{ backgroundColor: item.color, height: `${(item.value / max) * 100}%` }} />
            ) : (
              <div className={`w-full rounded-t-lg transition-all ${TOPIC_BAR_COLORS[index % TOPIC_BAR_COLORS.length]}`} style={{ height: `${(item.value / max) * 100}%` }} />
            )}
          </div>
          <div className="text-center text-[11px] font-semibold text-ink-soft">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// Thin gradient-filled progress row — professional portal's "top conditions"
// style (distinct from BarChart's flat-color horizontal bars). `barPercent`
// lets the filled width diverge from the displayed percent (the original
// design pads the bar +10 for visual weight while the label shows the real
// number) — defaults to `percent` when omitted.
export function ProgressRow({ label, percent, barPercent, color, fade }: { label: string; percent: number; barPercent?: number; color: string; fade: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10.5px] text-ink-soft">
        <span>{label}</span>
        <b className="text-ink">{percent}%</b>
      </div>
      <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-paper-2">
        <div className="h-full rounded-full" style={{ width: `${barPercent ?? percent}%`, background: `linear-gradient(90deg,${color},${fade})` }} />
      </div>
    </div>
  );
}
