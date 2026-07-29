import type { ReactNode, HTMLAttributes } from "react";

export function Card({
  className = "",
  children,
  hover = false,
  padding = true,
  ...props
}: {
  className?: string;
  children: ReactNode;
  hover?: boolean;
  padding?: boolean;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`card ${padding ? "p-[22px]" : ""} ${
        hover ? "card-hover" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
