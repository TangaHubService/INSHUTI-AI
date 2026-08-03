import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Inshuti — Your Health Companion",
    short_name: "Inshuti",
    description: "Private, youth-friendly health information and professional support in Rwanda.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F3",
    theme_color: "#146661",
    orientation: "portrait-primary",
    categories: ["health", "education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
