export function ShareBars({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return <p className="text-[14px] leading-6 text-ink-soft">No language activity in this view yet.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const pct = Math.round((item.value / total) * 100);
        return (
          <div key={item.label}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="font-semibold text-ink">{item.label}</span>
              <span className="text-ink-soft">{item.value} · {pct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-2">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: item.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
