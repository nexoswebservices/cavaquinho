// Scraper de cifras em texto do cifraclub.com.br
// Chords estão em tags <strong> no HTML

export interface ChordWithLyric {
  chord: string  // nome normalizado (ex: "Cmaj7")
  lyric: string  // trecho da letra que acompanha o acorde
}

export interface CifraclubResult {
  tom: string
  bpm: number
  chords: ChordWithLyric[]
  pageUrl: string
}

function slugifyCC(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // remove acentos (escape Unicode correto)
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// Extrai apenas o título da música de um título do YouTube
// "Grupo Menos É Mais, NATTAN - Pela Última Vez (Ao Vivo)" → "Pela Última Vez"
function cleanTitulo(titulo: string): string {
  // YouTube: "Artista1, Artista2 - Título (qualifier)"
  // Pegar tudo depois do último " - "
  const dashIdx = titulo.lastIndexOf(" - ")
  const songPart = dashIdx >= 0 ? titulo.slice(dashIdx + 3) : titulo

  return songPart
    .replace(/\s*\(ao vivo[^)]*\)/gi, "")
    .replace(/\s*\(live[^)]*\)/gi, "")
    .replace(/\s*\(acústico[^)]*\)/gi, "")
    .replace(/\s*\(part\.[^)]*\)/gi, "")
    .replace(/\s*\(feat\.[^)]*\)/gi, "")
    .replace(/\s*\(clipe[^)]*\)/gi, "")
    .trim()
}

// Extrai artistas convidados do título YouTube ("…, NATTAN - …" → "nattan")
function extractFeatSlugs(titulo: string): string[] {
  const dashIdx = titulo.lastIndexOf(" - ")
  const artistPart = dashIdx >= 0 ? titulo.slice(0, dashIdx) : ""

  // "Grupo Menos É Mais, NATTAN" → ["nattan"]
  const parts = artistPart.split(",").slice(1)
  return parts.map((p) => slugifyCC(p.trim())).filter((s) => s.length > 0)
}

// Normaliza notação brasileira → parseChordSymbol entende
export function normalizarAcorde(raw: string): string {
  return raw
    .trim()
    .replace(/7M/g, "maj7")
    .replace(/9M/g, "maj9")
}

// Verifica se token parece ser símbolo de acorde
function pareceAcorde(token: string): boolean {
  return /^[A-G][b#]?/.test(token) && token.length < 20 && token.length > 0
}

// Extrai acordes + letra do HTML da página do cifraclub
function extrairDaHtml(html: string): ChordWithLyric[] {
  // Remove scripts e estilos
  const sem = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")

  // Tenta isolar o bloco da cifra
  const blocoMatch =
    sem.match(/<pre[^>]*id=["']?cifra_cnt["']?[^>]*>([\s\S]*?)<\/pre>/i) ||
    sem.match(/<div[^>]*class=["'][^"']*cifra[_-]?cont[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    sem.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)

  const bloco = blocoMatch ? blocoMatch[1] : sem

  const resultado: ChordWithLyric[] = []
  const regex = /<(?:b|strong)[^>]*>([^<]+)<\/(?:b|strong)>([\s\S]*?)(?=<(?:b|strong)|$)/gi
  let m: RegExpExecArray | null

  while ((m = regex.exec(bloco)) !== null) {
    const candidato = m[1].trim()
    const lyricRaw = m[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim()

    if (pareceAcorde(candidato)) {
      resultado.push({
        chord: normalizarAcorde(candidato),
        lyric: lyricRaw.slice(0, 120),
      })
    }
  }

  return resultado
}

function detectarTom(html: string): string {
  const m = html.match(/tom[:\s]+([A-G][b#]?m?)/i) || html.match(/key[:\s]+([A-G][b#]?m?)/i)
  return m ? m[1] : "C"
}

function detectarBpm(html: string): number {
  const m = html.match(/(\d{2,3})\s*bpm/i)
  if (m) return parseInt(m[1])
  if (/pagode|samba/i.test(html)) return 90
  if (/bossa/i.test(html)) return 110
  if (/forró|baião/i.test(html)) return 120
  return 90
}

async function tentarUrl(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CavaquinhoBot/1.0)" },
      redirect: "follow",
    })
    // Considera OK apenas se retornou página real (não redirecionou para home/artista)
    if (!r.ok) return null
    const finalUrl = r.url
    // Se redirecionou para página do artista (sem slug de música), ignora
    const parts = new URL(finalUrl).pathname.split("/").filter(Boolean)
    if (parts.length < 2) return null
    return finalUrl
  } catch {
    return null
  }
}

// Busca o HTML de uma URL e retorna o conteúdo
async function fetchHtml(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CavaquinhoBot/1.0)" },
    })
    if (!r.ok) return null
    return await r.text()
  } catch {
    return null
  }
}

// Encontra URL da cifra no cifraclub
async function encontrarUrlMusica(
  artistaSlug: string,
  tituloSlug: string,
  featSlugs: string[]
): Promise<string | null> {
  const base = `https://www.cifraclub.com.br`
  const semGrupo = artistaSlug.replace(/^grupo-/, "")

  // Candidatos em ordem de prioridade
  const candidatos: string[] = [
    `${base}/${artistaSlug}/${tituloSlug}/`,
    `${base}/${semGrupo}/${tituloSlug}/`,
  ]

  // Com feat artist no slug
  for (const feat of featSlugs) {
    candidatos.push(`${base}/${artistaSlug}/${tituloSlug}-part-${feat}/`)
    candidatos.push(`${base}/${artistaSlug}/${tituloSlug}-feat-${feat}/`)
    candidatos.push(`${base}/${semGrupo}/${tituloSlug}-part-${feat}/`)
  }

  for (const url of candidatos) {
    const found = await tentarUrl(url)
    if (found) {
      console.log(`[cifraclub] URL direta: ${found}`)
      return found
    }
  }

  // Fallback: buscar na página do artista
  console.log(`[cifraclub] tentando via página do artista: ${base}/${artistaSlug}/`)
  const artistaHtml = await fetchHtml(`${base}/${artistaSlug}/`)
  if (artistaHtml) {
    const linkRegex = /href="(\/[a-z0-9-]+\/[a-z0-9-]+\/)"/gi
    const tituloWords = tituloSlug.split("-").filter((w) => w.length > 3)
    let bestMatch: { url: string; score: number } | null = null
    let m: RegExpExecArray | null

    while ((m = linkRegex.exec(artistaHtml)) !== null) {
      const href = m[1]
      const slug = href.split("/").filter(Boolean).pop() ?? ""
      const score = tituloWords.filter((w) => slug.includes(w)).length
      if (score >= Math.min(2, tituloWords.length)) {
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { url: `${base}${href}`, score }
        }
      }
    }

    if (bestMatch) {
      console.log(`[cifraclub] encontrado via artista: ${bestMatch.url} (score=${bestMatch.score})`)
      return bestMatch.url
    }
  }

  return null
}

// Função principal
export async function getCifraclubChords(
  artista: string,
  titulo: string
): Promise<CifraclubResult | null> {
  const tituloLimpo = cleanTitulo(titulo)
  const artistaSlug = slugifyCC(artista)
  const tituloSlug = slugifyCC(tituloLimpo)
  const featSlugs = extractFeatSlugs(titulo)

  console.log(`[cifraclub] artista="${artista}" → slug="${artistaSlug}"`)
  console.log(`[cifraclub] título limpo="${tituloLimpo}" → slug="${tituloSlug}"`)
  console.log(`[cifraclub] feats: [${featSlugs.join(", ")}]`)

  const pageUrl = await encontrarUrlMusica(artistaSlug, tituloSlug, featSlugs)
  if (!pageUrl) {
    console.log(`[cifraclub] não encontrado`)
    return null
  }

  const html = await fetchHtml(pageUrl)
  if (!html) return null

  const chords = extrairDaHtml(html)
  console.log(`[cifraclub] ${chords.length} acordes extraídos de ${pageUrl}`)

  if (chords.length === 0) return null

  return {
    tom: detectarTom(html),
    bpm: detectarBpm(html),
    chords,
    pageUrl,
  }
}
