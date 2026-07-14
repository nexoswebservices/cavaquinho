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
    .map((url) => url.replace(/\/s\d+(-[a-z])?\//, "/s16000/").replace(/=s\d+(-[a-z])?$/, "=s16000"))
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

  let raw: string
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 8192,
      system: `Você é especialista em leitura de partituras e transcrição para cavaquinho (afinação D4-G4-B4-D5).
Responda SOMENTE com JSON válido, sem markdown, sem texto extra.`,
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
              text: `Esta é a partitura de "${titulo}" por ${artista}, transcrita para cavaquinho.

A partitura mostra a MELODIA NOTA A NOTA que o cavaquinho executa, com cifras de acompanhamento acima do pentagrama.

TAREFA: Transcreva cada nota da melodia. Cada item em "acordes" = UMA nota individual da melodia.

Retorne exatamente este JSON:
{
  "tom": "C",
  "bpm": 120,
  "compasso": "4/4",
  "medidas": [
    {
      "numero": 1,
      "letra": "trecho da letra cantada nesta medida (vazio se intro/instrumental)",
      "acordes": [
        {
          "batida": 1,
          "acorde": "C",
          "duration": "8",
          "notas": ["E"],
          "tab": [2, -1, -1, -1]
        }
      ]
    }
  ]
}

Regras CRÍTICAS:
- notas: array com APENAS UMA nota da melodia (NÃO os tons do acorde)
  - É a nota que o músico toca na corda, não o voicing
  - Use sempre sharps: C#, D#, F#, G#, A#. Nunca bemóis.
  - Exemplos corretos: ["G"], ["E"], ["C#"], ["D"]
  - Exemplos ERRADOS: ["G","B","D"], ["C","E","G"] ← esses são acordes, não use
- tab: [D4fret, G4fret, B4fret, D5fret]
  - Apenas UMA corda tem fret ≥ 0, as outras = -1
  - Afinação: D4(corda mais grossa)=0, G4=0, B4=0, D5(mais fina)=0
  - Exemplo nota G: se tocar na corda G4 solta = [-1, 0, -1, -1]
- duration: "w"=4 beats, "h"=2 beats, "q"=1 beat, "8"=0.5 beat, "16"=0.25 beat
- acorde: a cifra que aparece ACIMA desta nota na partitura
- batida: posição rítmica no compasso (1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5...)
- Inclua TODAS as notas de TODOS os compassos visíveis
- Para passagens rápidas (colcheias/semicolcheias): liste CADA nota separadamente`,
            },
          ],
        },
      ],
    })

    raw = (message.content[0] as { type: string; text: string }).text.trim()
  } catch {
    return null
  }

  try {
    const jsonStr = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim()
    const parsed = JSON.parse(jsonStr)
    // Validar que tem medidas com pelo menos algumas notas
    if (!Array.isArray(parsed.medidas) || parsed.medidas.length < 2) return null
    return parsed
  } catch {
    return null
  }
}
