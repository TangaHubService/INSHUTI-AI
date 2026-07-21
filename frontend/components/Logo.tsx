import Image from "next/image";

export function Logo({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.jpeg"
      alt="Inshuti"
      width={size}
      height={size}
      className={`inline-flex object-contain ${className ?? ""}`}
      priority
    />
  );
}
