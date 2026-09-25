import type { ReactNode } from "react";

export function DashboardHeader({
  eyebrow,
  title,
  body,
  actions,
}: {
  eyebrow: string;
  title: string;
  body: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 border-b border-line pb-6">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-coral-dark">{eyebrow}</p>
      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[32px] leading-[1.12] text-teal-900 sm:text-[36px]">{title}</h1>
          <p className="mt-2 max-w-[68ch] text-[15px] leading-7 text-ink-soft">{body}</p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}
