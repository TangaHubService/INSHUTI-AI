import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inshuti",
  description: "A warm, non-judgmental health assistant for young people in Rwanda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
