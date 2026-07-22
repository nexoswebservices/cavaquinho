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

// Localiza o 1º e o 2º " - " do título. Usamos o 1º (não o último) porque
// muitos títulos do YouTube têm um 3º segmento com crédito de compositor,
// ex: "Cartola - AS ROSAS NÃO FALAM - Angenor de Oliveira" — usar o último
// hífen pegaria "Angenor de Oliveira" como se fosse o nome da música.
function acharSeparadores(titulo: string): { first: number; second: number } {
  const first = titulo.indexOf(" - ")
  const second = first >= 0 ? titulo.indexOf(" - ", first + 3) : -1
  return { first, second }
}

// Extrai apenas o título da música de um título do YouTube
// "Grupo Menos É Mais, NATTAN - Pela Última Vez (Ao Vivo)" → "Pela Última Vez"
// "Cartola - AS ROSAS NÃO FALAM - Angenor de Oliveira" → "AS ROSAS NÃO FALAM"
function cleanTitulo(titulo: string): string {
  const { first, second } = acharSeparadores(titulo)
  const songPart =
    first < 0 ? titulo : second >= 0 ? titulo.slice(first + 3, second) : titulo.slice(first + 3)

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
  const { first } = acharSeparadores(titulo)
  const artistPart = first >= 0 ? titulo.slice(0, first) : ""

  // "Grupo Menos É Mais, NATTAN" → ["nattan"]
  const parts = artistPart.split(",").slice(1)
  return parts.map((p) => slugifyCC(p.trim())).filter((s) => s.length > 0)
}

// Extrai o artista principal do título do vídeo ("Cartola - As Rosas Não
// Falam - ..." → "Cartola"). O nome do canal do YouTube (oEmbed author_name)
// não é confiável como artista: costuma ser quem postou o vídeo (cover,
// coletânea, repost), não quem gravou a música.
export function extractArtistaPrincipal(titulo: string): string | null {
  const { first } = acharSeparadores(titulo)
  if (first < 0) return null
  const principal = titulo.slice(0, first).split(",")[0].trim()
  return principal.length > 0 ? principal : null
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

  // O conteúdo da cifra fica sempre num único <pre> dentro de .cifra_cnt.
  // (Regras baseadas em div com class="cifra..." não funcionam: o CifraClub
  // aninha várias divs vazias ali dentro e o primeiro </div> fecha antes de
  // qualquer acorde aparecer.)
  const blocoMatch = sem.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)

  let bloco = blocoMatch ? blocoMatch[1] : sem

  // Remove os blocos de tablatura (<span class="tablatura">...<span class="cnt">...</span></span>):
  // eles repetem os mesmos acordes já capturados na letra e sua "arte" ASCII
  // seria capturada como se fosse trecho de letra.
  bloco = bloco.replace(/<span class="tablatura">[\s\S]*?<\/span>\s*<\/span>/g, " ")

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
  // Estrutura real: <span id="cifra_tom">tom: <a ...>Dm</a></span>
  const m =
    html.match(/id=["']cifra_tom["'][^]*?<a[^>]*>([^<]+)<\/a>/i) ||
    html.match(/tom[:\s]+([A-G][b#]?m?)/i) ||
    html.match(/key[:\s]+([A-G][b#]?m?)/i)
  return m ? m[1].trim() : "C"
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
