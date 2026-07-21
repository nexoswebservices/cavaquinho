// Scraper de cifras em texto do cifraclub.com.br
// Chords estão em tags <b> ou <strong> no HTML

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
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

// Remove sufixos comuns do título para encontrar a música
function cleanTitulo(titulo: string): string {
  return titulo
    .replace(/\s*\(ao vivo[^)]*\)/gi, "")
    .replace(/\s*\(live[^)]*\)/gi, "")
    .replace(/\s*\(acústico[^)]*\)/gi, "")
    .replace(/\s*\(part\.[^)]*\)/gi, "")
    .replace(/\s*\(feat\.[^)]*\)/gi, "")
    .replace(/\s*ft\.\s*.*/gi, "")
    .replace(/,\s*[A-Z][A-Z\s]+$/, "") // Remove "NATTAN" após vírgula no título
    .trim()
}

// Normaliza notação brasileira e estrangeira para parseChordSymbol
export function normalizarAcorde(raw: string): string {
  return raw
    .trim()
    // Notação brasileira: 7M → maj7
    .replace(/7M/g, "maj7")
    .replace(/9M/g, "maj9")
    // Cifraclub usa "m" minúsculo para menor
    // Sem mudança necessária, parseChordSymbol já trata
}

// Detecta se um token é um símbolo de acorde válido
function parece_acorde(token: string): boolean {
  return /^[A-G][b#]?/.test(token) && token.length < 20
}

// Extrai acordes e letras do HTML do cifraclub
function extrairDaHtml(html: string): ChordWithLyric[] {
  // Remove scripts e estilos
  const semScripts = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")

  // Extrai o bloco da cifra: entre as tags <pre> ou div#cifra_cnt
  const blocoMatch =
    semScripts.match(/<pre[^>]*id=["']?cifra_cnt["']?[^>]*>([\s\S]*?)<\/pre>/i) ||
    semScripts.match(/<div[^>]*class=["'][^"']*cifra[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    semScripts.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)

  const bloco = blocoMatch ? blocoMatch[1] : semScripts

  // Encontra todos os acordes em <b> ou <strong>
  const resultado: ChordWithLyric[] = []
  const regex = /<(?:b|strong)[^>]*>([^<]+)<\/(?:b|strong)>([\s\S]*?)(?=<(?:b|strong)|$)/gi
  let match: RegExpExecArray | null

  while ((match = regex.exec(bloco)) !== null) {
    const candidato = match[1].trim()
    const lyricRaw = match[2]
      .replace(/<[^>]+>/g, " ") // remove tags HTML
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim()

    if (parece_acorde(candidato)) {
      resultado.push({
        chord: normalizarAcorde(candidato),
        lyric: lyricRaw.slice(0, 120),
      })
    }
  }

  return resultado
}

// Detecta o tom da página do cifraclub (aparece como "Tom: C" ou similar)
function detectarTom(html: string): string {
  const match =
    html.match(/tom[:\s]+([A-G][b#]?m?)/i) ||
    html.match(/key[:\s]+([A-G][b#]?m?)/i)
  return match ? match[1] : "C"
}

// Estima BPM por gênero a partir do HTML da página
function detectarBpm(html: string): number {
  const match = html.match(/(\d{2,3})\s*bpm/i)
  if (match) return parseInt(match[1])
  if (/pagode|samba/i.test(html)) return 90
  if (/bossa/i.test(html)) return 110
  if (/forró|baião/i.test(html)) return 120
  return 90
}

// Tenta encontrar URL da música no cifraclub via página do artista
async function encontrarUrlMusica(
  artistaSlug: string,
  tituloLimpo: string
): Promise<string | null> {
  const tituloSlug = slugifyCC(tituloLimpo)

  // Tentativa 1: URL direta
  const candidatos = [
    `https://www.cifraclub.com.br/${artistaSlug}/${tituloSlug}/`,
    `https://www.cifraclub.com.br/${artistaSlug.replace(/^grupo-/, "")}/${tituloSlug}/`,
  ]

  for (const url of candidatos) {
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; CavaquinhoBot/1.0)" },
      })
      if (r.ok) return url
    } catch {
      // continua
    }
  }

  // Tentativa 2: buscar na página do artista
  try {
    const artistaUrl = `https://www.cifraclub.com.br/${artistaSlug}/`
    const r = await fetch(artistaUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CavaquinhoBot/1.0)" },
    })
    if (!r.ok) return null
    const html = await r.text()

    // Encontrar links de músicas que batem com o título
    const linkRegex = /href="(\/[^"]+\/[^"]+\/)"[^>]*>([^<]+)/gi
    let m: RegExpExecArray | null
    const tituloNorm = slugifyCC(tituloLimpo)

    while ((m = linkRegex.exec(html)) !== null) {
      const href = m[1]
      const linkSlug = href.split("/").filter(Boolean).pop() ?? ""
      // Verifica se o slug do link contém as palavras principais do título
      const palavras = tituloNorm.split("-").filter((w) => w.length > 3)
      const match = palavras.filter((p) => linkSlug.includes(p)).length
      if (match >= Math.min(2, palavras.length)) {
        return `https://www.cifraclub.com.br${href}`
      }
    }
  } catch {
    // continua
  }

  return null
}

// Função principal: busca acordes do cifraclub para uma música
export async function getCifraclubChords(
  artista: string,
  titulo: string
): Promise<CifraclubResult | null> {
  const tituloLimpo = cleanTitulo(titulo)
  const artistaSlug = slugifyCC(artista)

  console.log(`[cifraclub] buscando: "${tituloLimpo}" / "${artista}" (slug: ${artistaSlug})`)

  const pageUrl = await encontrarUrlMusica(artistaSlug, tituloLimpo)
  if (!pageUrl) {
    console.log(`[cifraclub] música não encontrada`)
    return null
  }

  console.log(`[cifraclub] URL encontrada: ${pageUrl}`)

  let html: string
  try {
    const r = await fetch(pageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CavaquinhoBot/1.0)" },
    })
    if (!r.ok) return null
    html = await r.text()
  } catch {
    return null
  }

  const chords = extrairDaHtml(html)
  console.log(`[cifraclub] ${chords.length} acordes extraídos`)

  if (chords.length === 0) return null

  return {
    tom: detectarTom(html),
    bpm: detectarBpm(html),
    chords,
    pageUrl,
  }
}
