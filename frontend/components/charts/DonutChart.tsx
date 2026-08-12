import type { ReactNode } from "react";

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

// Unifies the 3 separate hand-rolled conic-gradient donuts (teenager
// dashboard's "topic journey" wheel, professional's consultations overview,
// my-space's topic donut) into one component with two stop-computation
// modes:
//  - "proportional" (default): segment size = value / total, a normal pie.
//  - "equal": every datum gets an identical-size segment regardless of
//    value — used by the teenager dashboard's "topics explored" wheel,
//    where the wheel always shows all 6 topics and only the legend number
//    conveys how much each was used.
export function DonutChart({
  data,
  mode = "proportional",
  size = 128,
  centerLabel,
  centerValue,
  showLegend = true,
  legendItem,
}: {
  data: DonutDatum[];
  mode?: "proportional" | "equal";
  size?: number;
  centerLabel?: string;
  centerValue?: string | number;
  showLegend?: boolean;
  legendItem?: (item: DonutDatum) => ReactNode;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const shareOf = (item: DonutDatum) => (mode === "equal" ? 100 / data.length : total ? (item.value / total) * 100 : 0);
  const stops = data.map((item, index) => {
    const start = data.slice(0, index).reduce((sum, prior) => sum + shareOf(prior), 0);
    return `${item.color} ${start}% ${start + shareOf(item)}%`;
  });

  return (
    <div className="flex items-center gap-5">
      <div
        className="relative shrink-0 rounded-full"
        style={{ width: size, height: size, background: stops.length ? `conic-gradient(${stops.join(",")})` : "#EDF1EF" }}
      >
        {(centerLabel || centerValue !== undefined) && (
          <div className="absolute inset-[16%] flex flex-col items-center justify-center rounded-full bg-white text-center">
            {centerValue !== undefined && <span className="text-2xl font-bold leading-none text-ink">{centerValue}</span>}
            {centerLabel && <span className="mt-1 text-[10px] text-ink-soft">{centerLabel}</span>}
          </div>
        )}
      </div>
      {showLegend && (
        <div className="min-w-0 flex-1 space-y-2">
          {data.map((item) =>
            legendItem ? (
              <div key={item.label}>{legendItem(item)}</div>
            ) : (
              <div key={item.label} className="flex items-center gap-2 text-[10.5px]">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
                <span className="min-w-0 flex-1 truncate text-ink-soft">{item.label}</span>
                <b className="text-ink">{item.value}</b>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
