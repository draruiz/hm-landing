// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// The site is served on www (the apex 308-redirects to it). Canonicals, the
// sitemap and JSON-LD must all use this exact origin.
const SITE = "https://www.healthymindspecialists.com";

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      serialize(item) {
        // Internal links and canonicals use no trailing slash (vercel.json
        // redirects /path/ → /path), so the sitemap must match.
        const url =
          item.url === `${SITE}/` ? item.url : item.url.replace(/\/$/, "");
        if (url.includes("/blog/")) {
          return { ...item, url, priority: 0.8, changefreq: "monthly" };
        }
        if (url === `${SITE}/`) {
          return { ...item, url, priority: 1.0, changefreq: "daily" };
        }
        return { ...item, url, priority: 0.6 };
      },
    }),
    mdx(),
  ],
});
