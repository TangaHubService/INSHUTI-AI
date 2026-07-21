import type { Metadata } from "next";
import { Baloo_2, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import { IconSprite } from "@/components/IconSprite";
import { ToastProvider } from "@/lib/useToast";
import { LanguageProvider } from "@/lib/LanguageContext";

const balooDisplay = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});
const interBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

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
    <html lang="en" className={`${balooDisplay.variable} ${interBody.variable} ${plexMono.variable}`}>
      <body>
        <IconSprite />
        <LanguageProvider>
          <ToastProvider>{children}</ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
