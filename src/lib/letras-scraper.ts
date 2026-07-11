// Scraper de letra para letras.mus.br (fallback: CifraClub /letra/)
// Retorna letra plain com seções identificadas

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9",
  "Cache-Control": "no-cache",
}

export interface LetraSection {
  name: string
  lines: string[]
  chords: string[]   // acordes únicos desta seção (de CifraClub)
}

export interface LetraResult {
  titulo: string
  artista: string
  tom: string
  source: "letras.mus.br" | "cifraclub"
  sections: LetraSection[]
  allChords: string[]
  plainLyrics: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

// Limpa título removendo sufixos comuns do YouTube
function cleanTitle(title: string): string {
  return title
    .replace(/\s*[\(\[][^)\]]*(?:official|clipe|video|vídeo|lyric|letra|ao vivo|live|HD|4K|ft\.?|feat\.?)[^)\]]*[\)\]]/gi, "")
    .replace(/\s*-\s*(Official\s+(?:Video|Music|Lyric)|Clipe\s+Oficial|Video\s+Oficial|Videoclipe|Lyric\s+Video)$/i, "")
    .trim()
}

// ─── letras.mus.br ────────────────────────────────────────────────────────────

async function fetchLetrasMusBr(artista: string, titulo: string): Promise<LetraResult | null> {
  const artistSlug = slugify(artista)
  const songSlug = slugify(titulo)
  const url = `https://www.letras.mus.br/${artistSlug}/${songSlug}/`

  let html: string
  try {
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return null
    html = await res.text()
  } catch {
    return null
  }

  // letras.mus.br coloca a letra em <div class="lyric-original"> ou <article class="lyric">
  const lyricMatch =
    html.match(/<div[^>]*class="[^"]*lyric-original[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ??
    html.match(/<div[^>]*id="[^"]*lyric[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ??
    html.match(/<article[^>]*class="[^"]*lyric[^"]*"[^>]*>([\s\S]*?)<\/article>/i)

  if (!lyricMatch) return null

  const raw = lyricMatch[1]

  // Extrair seções: <h2> ou <span class="subtitle"> marcam cabeçalhos
  const sections: LetraSection[] = []
  let currentSection: LetraSection = { name: "Início", lines: [], chords: [] }

  // Dividir por <p> (cada parágrafo = estrofe/seção)
  const paragraphs = raw.split(/<\/p>|<br\s*\/?>(?=\s*<br)/gi).map((p) =>
    p.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim()
  ).filter(Boolean)

  if (paragraphs.length === 0) return null

  for (const para of paragraphs) {
    const lines = para.split(/\n+/).map((l) => l.trim()).filter(Boolean)

    // Detectar cabeçalho de seção (linha curta entre colchetes ou toda em maiúsculas)
    if (lines.length === 1 && (lines[0].startsWith("[") || lines[0] === lines[0].toUpperCase())) {
      if (currentSection.lines.length > 0) sections.push(currentSection)
      currentSection = { name: lines[0].replace(/[\[\]]/g, "").trim(), lines: [], chords: [] }
    } else {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection)
        currentSection = { name: `Estrofe ${sections.length + 1}`, lines: [], chords: [] }
      }
      currentSection.lines.push(...lines)
    }
  }
  if (currentSection.lines.length > 0) sections.push(currentSection)

  if (sections.length === 0 || sections.every((s) => s.lines.length === 0)) return null

  const plainLyrics = sections.map((s) => s.lines.join("\n")).join("\n\n")

  return {
    titulo,
    artista,
    tom: "",
    source: "letras.mus.br",
    sections,
    allChords: [],
    plainLyrics,
  }
}

// ─── CifraClub /letra/ ────────────────────────────────────────────────────────

async function fetchCifraClub(artista: string, titulo: string): Promise<LetraResult | null> {
  const artistSlug = slugify(artista)
  const songSlug = slugify(titulo)
  const url = `https://www.cifraclub.com.br/${artistSlug}/${songSlug}/letra/`

  let html: string
  try {
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return null
    html = await res.text()
  } catch {
    return null
  }

  // CifraClub /letra/ tem o conteúdo num <div> ou <article> com a letra
  const bodyMatch =
    html.match(/<div[^>]*class="[^"]*letra[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ??
    html.match(/<div[^>]*id="[^"]*letra[^"]*"[^>]*>([\s\S]*?)<\/div>/i)

  if (!bodyMatch) return null

  const raw = bodyMatch[1]
  const paragraphs = raw.split(/<\/p>|<br\s*\/?>(?=\s*<br)/gi).map((p) =>
    p.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim()
  ).filter(Boolean)

  if (paragraphs.length === 0) return null

  const sections: LetraSection[] = paragraphs.map((p, i) => ({
    name: `Parte ${i + 1}`,
    lines: p.split(/\n+/).map((l) => l.trim()).filter(Boolean),
    chords: [],
  }))

  return {
    titulo,
    artista,
    tom: "",
    source: "cifraclub",
    sections,
    allChords: [],
    plainLyrics: paragraphs.join("\n\n"),
  }
}

// ─── Export público ───────────────────────────────────────────────────────────

export async function fetchLetra(artista: string, titulo: string): Promise<LetraResult | null> {
  const cleanT = cleanTitle(titulo)
  return (await fetchLetrasMusBr(artista, cleanT)) ?? (await fetchCifraClub(artista, cleanT))
}
