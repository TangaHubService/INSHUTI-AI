import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { IconSprite } from "@/components/IconSprite";
import { ToastProvider } from "@/lib/useToast";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { PwaRegistration } from "@/components/PwaRegistration";

const poppinsDisplay = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const poppinsBody = Poppins({
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
    default: "Inshuti \u2014 A safe place to ask and get support",
    template: "%s \u2014 Inshuti",
  },
  description: "A safe place for young people in Rwanda to ask health questions, learn from reviewed information, and connect with an approved health professional.",
  manifest: "/manifest.webmanifest",
  keywords: ["health", "Rwanda", "sexual health", "reproductive health", "AI assistant", "teen health", "anonymous"],
  openGraph: {
    title: "Inshuti \u2014 A safe place to ask and get support",
    description: "A safe place for young people in Rwanda to ask health questions, learn from reviewed information, and connect with an approved health professional.",
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
    <html lang="en" data-scroll-behavior="smooth" className={`${poppinsDisplay.variable} ${poppinsBody.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body>
        <PwaRegistration />
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
