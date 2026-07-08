/**
 * Script de indexação: scrapa todos os posts de partitura de nandinhocavaco.com.br
 * e salva metadados (artista, título do post, URL) no PartituraIndex do DB.
 *
 * Uso: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/index-partituras.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const BASE = "https://www.nandinhocavaco.com.br"
const DELAY_MS = 300

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; CavaquinhoBot/1.0)" },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

function extractLabels(html: string): string[] {
  const labels = new Set<string>()
  // Blogger sidebar label links: href='/search/label/...' or full URL
  const regex = /href=["'](?:https:\/\/www\.nandinhocavaco\.com\.br)?\/search\/label\/([^"'?#]+)["']/g
  let m
  while ((m = regex.exec(html)) !== null) {
    try {
      labels.add(decodeURIComponent(m[1]))
    } catch {
      // skip malformed
    }
  }
  return Array.from(labels).sort()
}

function extractPosts(html: string, artista: string): Array<{ postTitulo: string; postUrl: string }> {
  const posts: Array<{ postTitulo: string; postUrl: string }> = []
  const seen = new Set<string>()

  // Blogger post title links: <h3 class='post-title ...'><a href='...'>Title</a>
  const regex = /<h[123][^>]*(?:post-title|entry-title)[^>]*>[\s\S]*?<a[^>]+href=['"]([^'"]+)['"][^>]*>([\s\S]+?)<\/a>/gi
  let m
  while ((m = regex.exec(html)) !== null) {
    const url = m[1].trim()
    const title = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
    if (!seen.has(url) && url.includes(BASE)) {
      seen.add(url)
      posts.push({ postTitulo: title, postUrl: url })
    }
  }

  // Fallback: any link with /YYYY/MM/ pattern in post body
  if (posts.length === 0) {
    const re2 = /<a[^>]+href=['"]([^'"]+\/\d{4}\/\d{2}\/[^'"]+\.html)['"][^>]*>([^<]{10,})<\/a>/gi
    while ((m = re2.exec(html)) !== null) {
      const url = m[1].trim()
      const title = m[2].trim()
      if (!seen.has(url)) {
        seen.add(url)
        posts.push({ postTitulo: title, postUrl: url })
      }
    }
  }

  return posts
}

async function indexLabel(artista: string): Promise<number> {
  const encoded = encodeURIComponent(artista)
  const url = `${BASE}/search/label/${encoded}`

  let html: string
  try {
    html = await fetchHtml(url)
  } catch (e) {
    console.error(`  ERRO ao buscar ${url}: ${e}`)
    return 0
  }

  const posts = extractPosts(html, artista)
  let saved = 0

  for (const post of posts) {
    try {
      await prisma.partituraIndex.upsert({
        where: { postUrl: post.postUrl },
        create: { artista, postTitulo: post.postTitulo, postUrl: post.postUrl },
        update: { artista, postTitulo: post.postTitulo },
      })
      saved++
    } catch (e) {
      console.error(`  ERRO ao salvar ${post.postUrl}: ${e}`)
    }
  }

  return saved
}

async function main() {
  console.log("=== Indexando partituras de nandinhocavaco.com.br ===\n")

  // 1. Buscar lista de artistas/labels do sidebar
  console.log("Buscando lista de artistas do sidebar...")
  const homePage = await fetchHtml(BASE)
  const labels = extractLabels(homePage)
  console.log(`Encontrados ${labels.length} artistas/labels\n`)

  let totalPosts = 0
  let totalArtists = 0

  for (const artista of labels) {
    // Pular labels não-artistas (ex: "Partitura" que é o label principal)
    if (artista.toLowerCase() === "partitura") continue

    process.stdout.write(`  ${artista}... `)
    const count = await indexLabel(artista)
    console.log(`${count} posts`)
    totalPosts += count
    if (count > 0) totalArtists++
    await sleep(DELAY_MS)
  }

  console.log(`\n=== CONCLUÍDO ===`)
  console.log(`Artistas com posts: ${totalArtists}`)
  console.log(`Total de posts indexados: ${totalPosts}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
