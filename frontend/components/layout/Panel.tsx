import type { ReactNode } from "react";

// Canonical dashboard-widget wrapper, extracted from the teenager dashboard's
// local `Panel` helper and unified with the professional portal's
// `DashboardCard` + `SectionTitle` pair (via the optional `titleIcon`).
export function Panel({
  id,
  title,
  titleIcon,
  titleIconColor = "#146661",
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
}: {
  id?: string;
  title: string;
  titleIcon?: string;
  titleIconColor?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section id={id} className={`rounded-2xl border border-line/70 bg-white shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
        <div className="flex items-center gap-3">
          {titleIcon && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-100" style={{ color: titleIconColor }}>
              <svg width="16" height="16"><use href={`#${titleIcon}`} /></svg>
            </span>
          )}
          <div>
            <h2 className="text-[15px] font-bold text-ink">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-ink-soft">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
