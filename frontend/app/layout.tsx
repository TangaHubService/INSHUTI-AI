import type { Metadata, Viewport } from "next";
import { Baloo_2, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import { IconSprite } from "@/components/IconSprite";
import { ToastProvider } from "@/lib/useToast";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

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
  title: {
    default: "Inshuti \u2014 Your Health Companion",
    template: "%s \u2014 Inshuti",
  },
  description: "A warm, non-judgmental AI health assistant for young people in Rwanda. Free, anonymous, and bilingual.",
  keywords: ["health", "Rwanda", "sexual health", "reproductive health", "AI assistant", "teen health", "anonymous"],
  openGraph: {
    title: "Inshuti \u2014 Your Health Companion",
    description: "A warm, non-judgmental AI health assistant for young people in Rwanda. Free, anonymous, and bilingual.",
    type: "website",
    locale: "en_RW",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF8F3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${balooDisplay.variable} ${interBody.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body>
        <IconSprite />
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>{children}</ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
