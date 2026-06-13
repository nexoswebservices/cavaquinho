// Conversor simples de Markdown para HTML sem dependências externas
export function renderMarkdown(md: string): string {
  let html = md
    // Cabeçalhos
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    // Negrito e itálico
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Código inline
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    // Blocos de código
    .replace(/```[\w]*\n([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Blockquote
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Linhas horizontais
    .replace(/^---$/gm, "<hr>")
    // Tabelas simples
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      if (row.replace(/[-|:\s]/g, "").length === 0) return ""
      const cells = row.split("|").map((c: string) => c.trim())
      const isHeader = false
      return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join("")}</tr>`
    })
    // Listas não ordenadas
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    // Listas ordenadas
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Parágrafos
    .replace(/\n\n/g, "</p><p>")

  // Envolve tabelas em <table>
  html = html.replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, (m) => {
    const rows = m.trim().split("\n").filter(Boolean)
    const [header, ...body] = rows
    if (!header) return m
    const theader = header.replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>")
    return `<table><thead>${theader}</thead><tbody>${body.join("")}</tbody></table>`
  })

  return `<p>${html}</p>`
}
