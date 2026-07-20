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
      model: "claude-opus-4-8",
      max_tokens: 4096,
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
              text: `Esta é a partitura de "${titulo}" por ${artista}.

TAREFA: Leia apenas os SÍMBOLOS DE ACORDE escritos acima do pentagrama em cada compasso.

Retorne exatamente este JSON:
{
  "tom": "C",
  "bpm": 90,
  "compasso": "4/4",
  "medidas": [
    {
      "numero": 1,
      "letra": "",
      "acordes": [
        { "batida": 1, "acorde": "C",  "duration": "w", "notas": ["C"], "tab": [0,0,0,0] },
        { "batida": 3, "acorde": "Dm7","duration": "h", "notas": ["D"], "tab": [0,0,0,0] }
      ]
    }
  ]
}

Regras:
- Leia SOMENTE os símbolos de acorde acima do pentagrama (ex: C, Dm7, F/G, E7, Fmaj7)
- Se o compasso tem UM acorde → duration "w" (4 beats), batida 1
- Se tem DOIS acordes → duration "h" (2 beats) cada, batidas 1 e 3
- Se tem TRÊS → duration "q" para cada um, batidas 1, 2, 3
- "notas" e "tab" são placeholders — coloque a fundamental do acorde em "notas" e zeros em "tab"
- "letra" deixe vazio ""
- tom: tonalidade da música (ex: "C" para Dó maior, "Am" para Lá menor)
- bpm: estime pelo gênero (pagode ~90, samba ~100, baião ~110)
- Inclua TODOS os compassos visíveis na imagem, em ordem`,
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
