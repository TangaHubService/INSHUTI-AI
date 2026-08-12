import Link from "next/link";

// Canonical stat-tile shape across every portal, extracted from the
// teenager dashboard's original `Stat` component. `bare` renders without its
// own card chrome for contexts like the dashboard's shared bordered strip
// (where several stats sit inside one container separated by dividers);
// otherwise it renders as a standalone `.card` tile.
export function StatCard({
  icon,
  iconColor = "#146661",
  value,
  label,
  helper,
  helperColor,
  href,
  actionLabel,
  bare = false,
}: {
  icon: string;
  iconColor?: string;
  value: string | number;
  label: string;
  helper?: string;
  helperColor?: string;
  href?: string;
  actionLabel?: string;
  bare?: boolean;
}) {
  const content = (
    <div className={`flex min-w-0 items-center gap-3 ${bare ? "px-4 py-4 lg:border-r lg:border-line lg:last:border-r-0" : "p-5"}`}>
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${iconColor}18`, color: iconColor }}
      >
        <svg width="21" height="21"><use href={`#${icon}`} /></svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[21px] font-bold leading-none text-ink">{value}</div>
        <div className="mt-1 truncate text-xs text-ink-soft">{label}</div>
        {helper && (
          <div className="mt-1 text-[10.5px] font-semibold" style={{ color: helperColor ?? iconColor }}>
            {helper}
          </div>
        )}
        {href && actionLabel && (
          <Link href={href} className="mt-[14px] inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-teal-700 transition hover:gap-2.5">
            {actionLabel}
            <svg width="13" height="13"><use href="#i-arrow" /></svg>
          </Link>
        )}
      </div>
    </div>
  );

  if (bare) return content;
  return <div className="card">{content}</div>;
}
