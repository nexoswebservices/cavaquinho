import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * Extrai URLs de imagens de partitura de um post do Blogger (nandinhocavaco.com.br).
 * Retorna URLs do CDN do Blogger em resolução máxima (s16000), filtrando logos e capas.
 */
export async function fetchPartituraImageUrls(postUrl: string): Promise<string[]> {
  const res = await fetch(postUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; CavaquinhoBot/1.0)" },
  })
  if (!res.ok) return []
  const html = await res.text()

  const regex = /https:\/\/blogger\.googleusercontent\.com\/img\/[^\s"'<>]+/g
  const raw = html.match(regex) ?? []

  const normalized = raw
    .map((url) => url.replace(/\/s\d+(-[a-z])?\//, "/s1600/").replace(/=s\d+(-[a-z])?$/, "=s1600"))
    .filter((url) => {
      const u = url.toLowerCase()
      // Excluir logos, capas, banners e imagens de sidebar
      if (u.includes("favicon") || u.includes("avatar")) return false
      if (u.includes("-capa.") || u.includes("_capa.")) return false
      if (u.includes("banner")) return false
      if (u.includes("nandinhocavaco-capa")) return false
      if (u.includes("partituras-de-pagode")) return false
      if (u.includes("meucavaquinho")) return false
      if (u.includes("linhas-espa")) return false
      return true
    })
    .filter((url, i, arr) => arr.indexOf(url) === i)

  return normalized
}

/**
 * Lê uma partitura PNG via Claude Vision e retorna tabData com melodia nota a nota.
 */
export async function extractTabFromPartituraImage(
  imagemUrl: string,
  titulo: string,
  artista: string
): Promise<Record<string, unknown> | null> {
  let buffer: ArrayBuffer
  try {
    const imgRes = await fetch(imagemUrl)
    if (!imgRes.ok) return null
    buffer = await imgRes.arrayBuffer()
  } catch {
    return null
  }

  // Detectar tipo real da imagem pela URL
  const mediaType = /\.(jpg|jpeg)/i.test(imagemUrl) ? "image/jpeg" : "image/png"
  const base64 = Buffer.from(buffer).toString("base64")

  console.log(`[vision] imagem: ${imagemUrl.slice(-80)}, tamanho: ${buffer.byteLength} bytes`)

  let raw: string
  try {
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 8192,
      system: `Você é especialista em leitura de partituras. Responda SOMENTE com JSON válido, sem markdown, sem texto extra.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `Esta imagem deveria ser a partitura de "${titulo}" por ${artista}.

PASSO 0 — Confira antes de qualquer coisa: esta imagem contém um PENTAGRAMA com notas musicais de verdade (cabeças de nota sobre linhas/espaços)? Se for uma foto, capa, logo, ou qualquer coisa que NÃO seja uma pauta musical, responda apenas:
{"temPartitura": false}
Não invente acordes nem notas nesse caso — é preferível dizer que não há partitura do que inventar conteúdo.

Se REALMENTE houver uma pauta com notas, sua tarefa é ler como um músico lendo à primeira vista: para cada compasso, transcreva a sequência de NOTAS DE VERDADE escritas no pentagrama (a posição da cabeça da nota na pauta = a altura; a figura da nota = a duração). O símbolo de cifra escrito ACIMA do pentagrama (se houver) é só uma referência harmônica pro instrumento de base — anote-o separadamente, ele NÃO substitui a leitura das notas.

Retorne exatamente este JSON:
{
  "temPartitura": true,
  "tom": "Dm",
  "bpm": 90,
  "compasso": "4/4",
  "medidas": [
    {
      "numero": 1,
      "letra": "",
      "acordeReferencia": "Dm",
      "eventos": [
        { "nota": "D", "octave": 4, "duration": "q" },
        { "nota": "F", "octave": 4, "duration": "q" },
        { "nota": "A", "octave": 4, "duration": "h" }
      ]
    }
  ]
}

Regras:
- "eventos": a sequência real de notas escritas no compasso, na ordem em que aparecem — pitch (nota + oitava, ex: "D" oitava 4 = Ré da 4ª oitava) e duração (VexFlow: "w"=semibreve, "h"=mínima, "q"=semínima, "8"=colcheia, "16"=semicolcheia)
- Se o compasso for só acompanhamento/comping (sem melodia distinta desenhada, só o símbolo do acorde), retorne 1 evento com a fundamental do acorde e duration "w"
- "acordeReferencia": o símbolo de cifra escrito acima do compasso, se houver (ex: "Dm7", "F/G", "E7") — omita o campo se não houver cifra escrita ali
- "letra": trecho da letra sob esse compasso, se houver (deixe "" se não houver ou não for legível)
- tom: tonalidade da música (ex: "C" para Dó maior, "Dm" para Ré menor)
- bpm: estime pelo gênero (pagode ~90, samba ~100, baião ~110)
- Inclua TODOS os compassos visíveis na imagem, em ordem
- Nunca invente notas ou acordes que não estão de fato desenhados na imagem`,
            },
          ],
        },
      ],
    })

    raw = (message.content[0] as { type: string; text: string }).text.trim()
    console.log(`[vision] resposta: ${raw.slice(0, 120)}`)
  } catch (err) {
    console.error(`[vision] erro Anthropic: ${err instanceof Error ? err.message : String(err)}`)
    return null
  }

  try {
    const jsonStr = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim()
    const parsed = JSON.parse(jsonStr)

    if (parsed.temPartitura === false) {
      console.log(`[vision] a imagem não é uma partitura (${imagemUrl.slice(-40)})`)
      return null
    }
    if (!Array.isArray(parsed.medidas) || parsed.medidas.length < 2) {
      console.error(`[vision] JSON inválido ou medidas insuficientes: ${parsed.medidas?.length ?? 0}`)
      return null
    }
    console.log(`[vision] OK: ${parsed.medidas.length} medidas, tom=${parsed.tom}`)
    return parsed
  } catch (err) {
    console.error(`[vision] parse JSON erro: ${err instanceof Error ? err.message : String(err)}, raw: ${raw.slice(0, 200)}`)
    return null
  }
}
