import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Suraj — Author & Bookstore",
    short_name: "Suraj Books",
    description: "Discover and order books directly from the author.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fff5e1",
    theme_color: "#c93a22",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
