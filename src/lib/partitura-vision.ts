import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * Extrai URLs de imagens de partitura de um post do Blogger (nandinhocavaco.com.br).
 * Retorna URLs do CDN do Blogger em resolução máxima (s16000).
 */
export async function fetchPartituraImageUrls(postUrl: string): Promise<string[]> {
  const res = await fetch(postUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; CavaquinhoBot/1.0)" },
  })
  if (!res.ok) return []
  const html = await res.text()

  // Blogger CDN URLs — normalizar para s16000 (resolução máxima)
  const regex = /https:\/\/blogger\.googleusercontent\.com\/img\/[^\s"'<>]+/g
  const raw = html.match(regex) ?? []

  const normalized = raw
    .map((url) => url.replace(/\/s\d+(-[a-z])?\//, "/s16000/").replace(/=s\d+(-[a-z])?$/, "=s16000"))
    .filter((url) => !url.includes("favicon") && !url.includes("avatar"))
    .filter((url, i, arr) => arr.indexOf(url) === i) // deduplicate

  return normalized
}

/**
 * Lê uma partitura PNG via Claude Vision e retorna tabData estruturado.
 * Usa claude-sonnet-5 para maior precisão na leitura de notação musical.
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

  const base64 = Buffer.from(buffer).toString("base64")

  let raw: string
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 8192,
      system: `Você é especialista em leitura de partituras para cavaquinho (afinação D4-G4-B4-D5).
Responda SOMENTE com JSON válido, sem markdown, sem texto extra.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: base64 },
            },
            {
              type: "text",
              text: `Esta é a partitura de "${titulo}" por ${artista} para cavaquinho.

Leia a notação e extraia a cifra estruturada COMPLETA. Retorne exatamente este JSON:
{
  "tom": "string (ex: C, Am, G, Dm)",
  "bpm": number,
  "compasso": "4/4",
  "medidas": [
    {
      "numero": 1,
      "letra": "texto da letra nesta medida (vazio se instrumental)",
      "acordes": [
        {
          "batida": 1,
          "acorde": "Cm7",
          "duration": "h",
          "notas": ["C","Eb","G","Bb"],
          "tab": [5, 3, 1, 5]
        }
      ]
    }
  ]
}

Regras:
- tab: 4 frets [corda D4, G4, B4, D5], valores 0-12
- duration: "w"=4 beats, "h"=2 beats, "q"=1 beat, "8"=0.5 beat
- notas: sempre sharps (C#, D#, F#, G#, A#), nunca bemóis
- Inclua TODAS as medidas da partitura na imagem
- Se a partitura mostrar cifras (ex: Cm7, G7), use-as diretamente`,
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
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}
