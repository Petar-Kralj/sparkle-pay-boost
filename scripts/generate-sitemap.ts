// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs"
import { resolve } from "path"

const BASE_URL = "https://sparkle-pay-boost.lovable.app"
const SUPABASE_URL = "https://vjkadblreenkijjxhbjv.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqa2FkYmxyZWVua2lqanhoYmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NjIyMzcsImV4cCI6MjA5MDEzODIzN30.VY2Qz5NllfHIPruSdrf2x-Fnqj1Nav5vLT5BIrS6kiQ"

interface SitemapEntry {
  path: string
  lastmod?: string
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: string
}

async function fetchBlogPosts(): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,updated_at&published=eq.true&order=published_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )
    if (!res.ok) throw new Error(`Supabase returned ${res.status}`)
    const posts = await res.json()
    return (posts || []).map((post: { slug: string; updated_at: string }) => ({
      path: `/blog/${post.slug}`,
      lastmod: post.updated_at ? post.updated_at.split("T")[0] : undefined,
      changefreq: "weekly" as const,
      priority: "0.8",
    }))
  } catch (err) {
    console.error("Failed to fetch blog posts for sitemap:", err)
    return []
  }
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  )

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n")
}

async function main() {
  const entries: SitemapEntry[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/blog", changefreq: "weekly", priority: "0.9" },
  ]

  const blogEntries = await fetchBlogPosts()
  entries.push(...blogEntries)

  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries))
  console.log(`sitemap.xml written (${entries.length} entries)`)
}

main()
