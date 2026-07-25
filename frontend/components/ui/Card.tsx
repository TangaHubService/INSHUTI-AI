import type { ReactNode, HTMLAttributes } from "react";

export function Card({
  className = "",
  children,
  hover = false,
  ...props
}: {
  className?: string;
  children: ReactNode;
  hover?: boolean;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-md border border-[rgba(22,48,44,0.05)] bg-white shadow-card ${
        hover ? "transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-soft" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
