# Cavaquinho — Levantamento e Status do Projeto

**App original (Base44):** `69b2d3997a1398e7452d1d32` ("HarmoniaFlow" / "Samba de Raiz")  
**App reconstruído:** https://cavaquinho.nexoswebservices.com  
**Repositório local:** `c:\Users\renat\Downloads\Hamonico`  
**Data do levantamento inicial:** 2026-06-09  
**Última atualização:** 2026-07-21

---

## 0. Protocolo de Entrega (Standing Instruction)

> **Obrigatório antes de qualquer entrega ao usuário**

### 0.1 Fluxo de revisão interna

```
1. REVISAR o que foi pedido vs o que foi implementado
   └─ Listar explicitamente cada requisito e confirmar se está presente

2. CONECTAR via Playwright ao site em produção
   └─ npx vercel --prod (se deploy manual necessário)
   └─ Aguardar build completar e verificar status

3. TESTAR cada funcionalidade entregue no site live:
   └─ Navegar para a rota relevante
   └─ Verificar layout, dados, interatividade
   └─ Inspecionar console para erros (browser_evaluate ou log file)
   └─ DOM check quando o visual não for suficiente (browser_evaluate)

4. SE FALHAR ou houver condição em falta:
   └─ Identificar a causa raiz (não apenas o sintoma)
   └─ Corrigir no código local
   └─ Re-deploy e re-testar até passar

5. REPORTAR ao usuário apenas após confirmação visual no live
```

### 0.2 Comandos de verificação padrão

```bash
# Deploy manual (quando auto-deploy Vercel não estiver funcionando)
npx vercel --prod

# Verificar status de deployments
npx vercel ls --scope nexoswebservices-projects

# Verificar container DOM de um componente (via Playwright browser_evaluate)
# Exemplo: checar se PartituraCompleta está no DOM
document.querySelector('[class*="bg-\\[#080512\\]"]')?.children.length

# Verificar layout real da seção
const p = Array.from(document.querySelectorAll('p')).find(e => e.textContent?.includes('medidas'))
p?.nextElementSibling?.className
```

### 0.3 Checklist de entrega Músicas/Player

| Item | Como verificar |
|---|---|
| Página /musicas carrega | Screenshot via Playwright |
| Cards de músicas geradas aparecem | Ver seção "MÚSICAS GERADAS" |
| Player /musicas/[id] abre | Clicar no card e screenshot |
| YouTube iframe presente | Snapshot: iframe com "Player de vídeo do YouTube" |
| PartituraCompleta renderiza (não MedidaCard) | `browser_evaluate`: container class deve ser `rounded-xl border...bg-[#080512]`, children = nº de linhas (não nº de medidas) |
| Controles visíveis | BPM, Velocidade, Início, Vista toggle |
| Sem erros críticos no console | Verificar log file do Playwright |

### 0.4 Problemas de deploy conhecidos e soluções

**Problema 1 (2026-07-08):** Vercel não fazia auto-deploy do GitHub após pushes.
- **Solução:** `npx vercel --prod` manual, ou reconectar o repositório GitHub nas configurações do projeto Vercel.

**Problema 2 (2026-07-08 a 2026-07-19):** Site `cavaquinho.nexoswebservices.com` servia código antigo com botões ♡🔄🗑 flutuantes mesmo após o código ter sido limpo no repositório.
- **Causa raiz:** O domínio apontava para um deployment antigo de um projeto Vercel diferente (pessoal, deletado). O registo TXT `_vercel.nexoswebservices.com` tinha o token do projeto antigo.
- **Solução aplicada (2026-07-19):**
  1. Identificado que o DNS está no **Hostinger** (SOA: `dns.hostinger.com`)
  2. Actualizado TXT `_vercel` via hPanel Hostinger: token `7d0b61d455a36be71a62` → `93af89d543d9da862e4d`
  3. Acionada verificação via API Vercel → `"verified": true`
  4. buildId `CBG58XtOAXSTX8p3py-wo` confirmado idêntico nos dois domínios

**Problema 3 (cache webpack):** Build antigo servia chunks em cache mesmo com código novo.
- **Solução:** build script em `package.json` limpa `.next/` antes de cada build:
  ```json
  "build": "prisma generate && node -e \"try{require('fs').rmSync('.next',{recursive:true,force:true})}catch(e){}\" && next build"
  ```

---

## 1. Status Geral

**✅ 14 MÓDULOS LIVE — PLAYER INTERATIVO IA, ÁUDIO, PARTITURA, ARPEJOS, IMPROVISOS, PROGRESSÕES AVANÇADAS**

| Fase | Feature | Status |
|---|---|---|
| 1 | **Músicas (player AI)** | ✅ Live — YouTube URL → CifraClub (texto) → validação → tab → player sincronizado com vídeo |
| 2 | Análise Harmônica | ✅ Live (+ fluxo análise→progressões) |
| 3 | Progressões (unificada) | ✅ Live (campo harmônico c/ tensões + cadências + sequências + formação + ciclo de quintas) |
| 4 | Treino de Cadências | ✅ Live (9 padrões c/ exemplos de músicas, integrado em /progressoes) |
| 5 | Quiz | ✅ Live (10 tipos: graus, cadências, funções, tensões, SubV) |
| 6 | Meu Progresso (gamificação) | ✅ Live (em `/escola/meu-progresso`) |
| 7 | Análise Visual TheoryTab | ✅ Live (blocos coloridos por função) |
| 8 | Formação de Acordes + Sampler | ✅ Live (19 tipos, 3 formas, partitura VexFlow, som real cavaquinho) |
| 9 | Metrônomo + Afinador | ✅ Live (flutuante, acessível em todas as páginas) |
| 10 | Arpejos | ✅ Live (8 padrões + arpejos do campo harmônico, partitura + tablatura) |
| 11 | Improvisos | ✅ Live (12 escalas, 8 frases, backing tracks, braço inteiro) |
| 12 | ~~Cifras Interativas~~ | 🗑️ **Removida** — substituída pelo player /musicas com geração AI |
| 13 | Partituras | ✅ Live (ensino, visualizador ABC, gerador cifra→partitura, exercícios) |
| 14 | Conteúdo Expandido | ✅ Live (tensões, funções, SubV, acordes sus, campos combinados, ciclo de quintas, menores harm/mel, +4 progressões avançadas) |

**Modo atual:** Acesso público read-only (login desativado para avaliação da comunidade)

---

## 2. Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14.2.20 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS (tema escuro `#0a0714` / `#120d24`, violeta) |
| ORM | Prisma 5.x |
| Banco de dados | MySQL (Hostinger `srv1804.hstgr.io`) |
| Autenticação | NextAuth v4 (credentials + Prisma Adapter, JWT) — temporariamente bypass |
| Áudio | Web Audio API (sampler + metrônomo + afinador) |
| Fonte de cifras | CifraClub scraping (texto — primário); `claude-opus-4-8` Vision via partitura-vision.ts (offline/admin) |
| Player sync | YouTube iframe API (`YT.Player`, `getCurrentTime`, `setPlaybackRate`) |
| Deploy | Vercel — projeto `nexoswebservices-projects/cavaquinho` (auto-deploy no push para `main`) |
| Domínio | `cavaquinho.nexoswebservices.com` (CNAME → cname.vercel-dns.com, TXT `_vercel` token `93af89d543d9da862e4d`, verificado 2026-07-19) |

---

## 3. Modo de Trabalho e Conexões Remotas

### Ambiente de desenvolvimento
- **Repositório local:** `c:\Users\renat\Downloads\Hamonico` (Windows 10)
- **IDE:** VS Code com extensão Claude Code
- **AI assistant:** Claude Sonnet 4.6 via Claude Code CLI
- **Branch:** `main` (deploy contínuo via Vercel)

### Conexões remotas ativas
| Serviço | Endereço | Uso |
|---|---|---|
| **Vercel** | `nexoswebservices-projects/cavaquinho` — auto-deploy no push `main` | Hosting do app Next.js |
| **MySQL (Hostinger)** | `srv1804.hstgr.io:3306` / `u828037891_cavaquinho` | Banco de dados de produção |
| **Domínio** | `cavaquinho.nexoswebservices.com` | CNAME → `cname.vercel-dns.com`; DNS gerido no **Hostinger** (hpanel.hostinger.com, conta nexoswebservices@gmail.com); TXT `_vercel` token `93af89d543d9da862e4d` verificado 2026-07-19 |
| **Anthropic API** | `claude-haiku-4-5-20251001` | Geração de tabs estruturadas a partir de título/artista |

### Fluxo de deploy
```
Código local → git push origin main → Vercel build automático → Live em ~2 min
```

### Seed de dados
```bash
# Cria apenas o usuário admin (seed.ts simplificado — cifras removidas)
DATABASE_URL="mysql://u828037891_cavaquinho:I9c3UhVlw5pMdiWCqoMb@srv1804.hstgr.io:3306/u828037891_cavaquinho" \
  npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### Schema push (Hostinger não suporta shadow DB)
```bash
# Usar em vez de prisma migrate dev:
npx prisma db push --accept-data-loss
```

### Ferramentas de verificação
- **Playwright MCP** — navegador automatizado para testar o site em produção (screenshots, cliques, snapshots)
- **rtk (Rust Token Killer)** — proxy de CLI para economia de tokens no Claude Code
- **pymupdf** — extração de cifras dos PDFs de cadernos musicais
- **lameenc** — encoding MP3 para samples de cavaquinho (usado no script de conversão)

### Workflow típico de desenvolvimento
1. Claude Code planeja (plan mode) → usuário aprova
2. Implementação com build check (`npx next build`)
3. Commit + push → deploy automático
4. Verificação visual via Playwright no site live
5. Iteração baseada em feedback do usuário

---

## 4. Arquitetura de Dados (Prisma Schema atual)

### 4.1 `User`
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| name | String? |
| email | String (unique) |
| password | String? |
| role | String (default: "user") |
| createdAt | DateTime |
| progress | UserProgress[] |
| savedStudos | EstudoSalvo[] |

### 4.2 `UserProgress`
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| userId | String |
| moduleId | String |
| lessonId | String |
| completed | Boolean (default: false) |
| completedAt | DateTime? |
| @@unique([userId, moduleId, lessonId]) | |

### 4.3 `Estudo` *(novo — substituiu Cifra)*
Tab gerada por IA a partir de URL YouTube.
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| titulo | String |
| artista | String |
| youtubeId | String (@unique) |
| tom | String |
| bpm | Int |
| compasso | String (default: "4/4") |
| introSecs | Float (default: 0) — offset do slider, salvo por música |
| tabData | Json — `{ medidas: Medida[] }` completo |
| createdAt / updatedAt | DateTime |
| salvos | EstudoSalvo[] |
| @@index([artista]) | |

### 4.4 `EstudoSalvo` *(novo)*
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| userId / estudoId | String |
| createdAt | DateTime |
| @@unique([userId, estudoId]) | |

### Formato `tabData.medidas[]`
```typescript
interface Medida {
  numero: number        // 1-based
  letra: string         // letra da música nesta medida
  acordes: {
    batida: number      // 1 | 2 | 3 | 4
    acorde: string      // "Cm7", "G7"
    duration: string    // "w" | "h" | "q" | "8"
    notas: string[]     // ["C","Eb","G","Bb"] — sempre sharps
    tab: number[]       // [D4_fret, G4_fret, B4_fret, D5_fret]
  }[]
}
```

### 4.5 `PartituraIndex` *(índice de partituras do nandinhocavaco.com.br)*
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| artista | String |
| postTitulo | String |
| postUrl | String (@unique) |
| createdAt | DateTime |

Populado via endpoint admin `/api/admin/seed-partitura` (temporário) e script `scripts/index-partituras.ts`. Usado por `searchPartituraIndex()` para encontrar a URL da partitura a exibir no player.

> **Modelos removidos em 2026-07-08:** `Cifra`, `CifraFavorito`, `Repertorio`, `RepertorioItem`

---

## 5. Estrutura de Arquivos

```
Hamonico/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                          ← cria apenas usuário admin (cifras removidas)
├── public/
│   └── samples/
│       └── cavaquinho/                  ← 17 samples WAV de cavaquinho real (~4.4MB)
│           ├── D3.wav, D4.wav, D5.wav   ← 3 oitavas de Ré
│           ├── E3.wav, E4.wav, E5.wav   ← 3 oitavas de Mi
│           ├── F#3.wav, F#4.wav, F#5.wav
│           ├── G3.wav, G#3.wav
│           ├── A3.wav, A#3.wav
│           ├── B3.wav, B4.wav
│           ├── C#4.wav, C#5.wav
│           └── map.json                 ← Mapeamento nota→arquivo
├── scripts/
│   ├── extract-cifras.py               ← Extrator Python dos PDFs
│   └── convert-samples.py              ← WAV 24-bit stereo → WAV 16-bit mono
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── cadastro/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx                    ← Navbar + Metrônomo/Afinador flutuante
│   │   │   ├── escola/page.tsx               ← Dashboard + sub-nav
│   │   │   ├── escola/[modulo]/page.tsx
│   │   │   ├── escola/[modulo]/[licao]/page.tsx
│   │   │   ├── escola/quiz/page.tsx
│   │   │   ├── escola/meu-progresso/page.tsx
│   │   │   ├── musicas/page.tsx              ← Input URL + listas "Minhas salvas" / "Músicas geradas"
│   │   │   ├── musicas/[id]/page.tsx         ← Player completo (busca Estudo do DB)
│   │   │   ├── analise/page.tsx              ← Aceita ?p= query param
│   │   │   ├── progressoes/page.tsx          ← Página unificada com 6 tabs
│   │   │   ├── progressoes/[slug]/page.tsx   ← Detalhe de sequência com músicas
│   │   │   ├── biblioteca/page.tsx           ← Redirect → /progressoes
│   │   │   ├── cadencias/page.tsx            ← Redirect → /progressoes
│   │   │   ├── quiz/page.tsx                 ← redirect → /escola/quiz
│   │   │   └── estudos/page.tsx              ← redirect → /escola/meu-progresso
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── auth/register/route.ts
│   │   │   ├── progress/route.ts
│   │   │   ├── musicas/
│   │   │   │   ├── route.ts                  ← GET: listar estudos
│   │   │   │   ├── generate/route.ts         ← POST: URL → oEmbed → CifraClub → 3 checkpoints → DB
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts              ← PATCH: update introSecs
│   │   │   │       └── salvar/route.ts       ← POST/DELETE: salvar na lista do user
│   │   ├── layout.tsx, page.tsx, providers.tsx, globals.css
│   ├── components/
│   │   ├── layout/Navbar.tsx                 ← 6 links: Escola | Músicas | Progressões | Arpejos | Improvisos | Análise
│   │   ├── ui/
│   │   │   ├── Metronomo.tsx                 ← Painel flutuante com tabs Metrônomo | Afinador
│   │   │   ├── Afinador.tsx                  ← Detecção de pitch via microfone (autocorrelação)
│   │   │   └── PlayButton.tsx                ← Botão play reutilizável (Web Audio)
│   │   ├── escola/
│   │   │   ├── EscolaSubNav.tsx
│   │   │   ├── ModuleGrid.tsx, ProgressBar.tsx, LessonActions.tsx
│   │   ├── musicas/
│   │   │   ├── GerarMusica.tsx               ← Input URL + botão Gerar (client)
│   │   │   ├── MusicasList.tsx               ← Grid de cards de músicas
│   │   │   ├── MusicaPlayer.tsx              ← Estado central do player (polling, sync)
│   │   │   ├── YoutubeEmbed.tsx              ← YouTube iframe API wrapper (YT.Player)
│   │   │   ├── MedidaCard.tsx                ← 1 medida: acordes + hover BracoCavaquinho
│   │   │   ├── PartituraCompleta.tsx         ← Layout contínuo: linhas de 4 medidas (VexFlow + TAB SVG + letra)
│   │   │   └── PlayerControls.tsx            ← Speed, intro slider, view toggle
│   │   ├── analise/
│   │   │   └── AnalisadorHarmonico.tsx       ← Preload via ?p=, salvar nas progressões
│   │   ├── biblioteca/
│   │   │   └── CampoHarmonico.tsx
│   │   ├── progressoes/
│   │   │   ├── ProgressaoCard.tsx            ← Cards com grau/acorde/notas formadoras
│   │   │   ├── MusicaAnalise.tsx             ← Análise de música por seções
│   │   │   ├── FormacaoAcordes.tsx           ← Enciclopédia: 19 tipos × 12 notas × 3 formas
│   │   │   └── BracoCavaquinho.tsx           ← Diagrama SVG do braço (D-G-B-D)
│   │   ├── arpejos/
│   │   │   └── BracoArpejo.tsx               ← Braço com sequência numerada
│   │   ├── improvisos/
│   │   │   └── BracoEscala.tsx               ← Braço inteiro (trastes 0-12) com escala
│   │   ├── partitura/
│   │   │   ├── PartituraView.tsx             ← Renderizador VexFlow (pentagrama)
│   │   │   ├── TablaturaView.tsx             ← Tablatura SVG 4 cordas
│   │   │   └── PartituraComTab.tsx           ← Combo partitura + tablatura
│   │   ├── cadencias/
│   │   │   └── TreinoCadencias.tsx
│   │   └── quiz/
│   │       └── QuizGame.tsx
│   ├── lib/
│   │   ├── auth.ts, db.ts
│   │   ├── escola-content.ts                 ← 28 lições (cavaquinho)
│   │   ├── markdown.ts, teoria.ts, quiz.ts
│   │   ├── transpose.ts                      ← Transposição de acordes (preserva espaçamento)
│   │   ├── sampler.ts                        ← Engine Web Audio API (playNote, playChord, playArpejo, playBackingTrack)
│   │   ├── cavaquinho-tab.ts                 ← chord-to-tab por fórmulas D-G-B-D; notação brasileira (7M=maj7, X9=dom7)
│   │   ├── cifraclub-scraper.ts              ← Scrape CifraClub: busca URL + extrai chords de <strong>; normaliza notação BR
│   │   ├── letras-scraper.ts                 ← Scrape de letra via lrclib.net (fetchLetra)
│   │   ├── partitura-search.ts               ← Busca fuzzy no índice nandinhocavaco.com.br (take:50, strip accents)
│   │   ├── partitura-vision.ts               ← Baixa PNG do Blogger (s1600) + claude-opus-4-8 Vision — uso offline/admin
│   │   ├── arpejos-data.ts                   ← 8 padrões de arpejo
│   │   ├── escalas-data.ts                   ← 12 escalas (pentatônicas, blues, modos)
│   │   ├── frases-data.ts                    ← 8 frases curadas com partitura + tablatura
│   │   └── progressions-data.ts / .json      ← 5 sequências com músicas analisadas
│   └── types/
│       ├── index.ts
│       └── next-auth.d.ts
├── .env.local / .env.production.local        ← Não versionados
├── package.json, next.config.mjs, tailwind.config.ts
```

---

## 6. Funcionalidades Implementadas

### 6.1 Autenticação (modo público ativo)
- `/login` e `/cadastro` com email + senha (bcryptjs)
- NextAuth v4 (JWT), role: `admin` | `user`
- **Modo público temporário:** todo conteúdo acessível sem login
- Ações (favoritar, repertórios, progresso) requerem login — botões redirecionam para `/login`
- Navbar: "Entrar" para anônimos, "Sair" + nome para logados
- APIs mantêm 401 para requests sem session

### 6.2 Escola de Música
- **4 módulos, 28 lições** de teoria musical para **cavaquinho**/samba
- Módulos: Escalas (6), Acordes (7, +ac-7 Sus/Alterados), Cadências (5), Harmonia (10, +SubV, +Campos Combinados, +har-2b Menor Harmônico, +har-2c Menor Melódico)
- Tablaturas de 4 cordas (D-G-B-D) — sem referências a violão
- Sub-navegação: Lições | Quiz | Meu Progresso via `EscolaSubNav`
- **Quiz com 10 tipos**: graus, cadências, campo, completar + funções harmônicas, tensões, dominante substituto
- Progresso por módulo, barra geral, botão "Marcar como concluída"

### 6.3 Músicas — Player Interativo AI (estilo Songsterr) *(novo — substituiu Cifras)*

**Pipeline de geração (cifraclub-first, com checkpoints de validação):**
```
1. Usuário cola URL do YouTube em /musicas
2. Extrai youtubeId via regex
3. Cache check: prisma.estudo.findUnique({ where: { youtubeId } })
   → HIT: retorna id sem nova geração
4. YouTube oEmbed → titulo + artista (sem API key)
5. Em paralelo:
   ├── CifraClub scraping → cifra em texto (fonte primária)
   ├── nandinhocavaco.com.br índice → postUrl (para exibição da partitura original)
   └── lrclib.net → letra (complementar)
6. CHECKPOINT 1: CifraClub encontrou a música?
   → NÃO: retorna erro 422 claro (não salva, não alucina)
7. CHECKPOINT 2: cada acorde passa por parseChordSymbol()?
   → Acordes inválidos são descartados; se restarem < 3 → erro 422
8. CHECKPOINT 3: chordToTab() gera frets válidos (0–12)?
   → Acordes com tab inválida descartados
9. Monta tabData: acordes validados + letra do CifraClub + partituraUrl
10. prisma.estudo.create(...)
11. Retorna { id, source: "cifraclub", medidas: N, partituraUrl }
```

**Decisões de arquitetura (2026-07-21):**
- Claude Haiku removido do pipeline principal — alucinava extensões jazz (C7+/9, Am7/9) mesmo quando a partitura mostrava C simples
- Claude Vision (Opus) movido para uso offline/admin — funciona localmente mas timeout em serverless Vercel (10–60s)
- CifraClub texto é confiável, rápido, sem alucinação — chords em `<strong>` tags no HTML
- Partitura do nandinhocavaco.com.br continua indexada e é exibida como imagem de referência para o aluno
- Notação brasileira normalizada: `7M → maj7`, `X9/X11 → dom7`, `Xm9 → min7`
- `cleanTitulo()` extrai só o título após o último " - " no título do YouTube
- `extractFeatSlugs()` gera variantes de URL com "part-ARTIST" para colaborações

**Player `/musicas/[id]`:**
- **Vídeo YouTube** embutido via iframe API (`YT.Player`) ao lado dos controles
- **Partitura contínua** (estilo Songsterr): medidas fluem em linhas de 4, scroll vertical
  - VexFlow por linha (todos os acordes da linha em uma única canvas)
  - TAB 4 cordas (D5/B4/G4/D4) mostrando todos os frets por acorde
  - Letra da música por medida
- **Sincronização**: polling 100ms → `getCurrentTime` → beat → medida ativa (highlight violeta)
- **Slider de intro** (0–120s): ajusta offset do início, salvo via PATCH no DB (debounce 1s)
- **Velocidade**: 0.5x / 0.75x / 1x / 1.25x via `setPlaybackRate`
- **Vista toggle**: Partitura + Tab / Só Tab
- **Hover acorde → BracoCavaquinho**: diagrama do shape correto em tooltip
- **Clique acorde → sampler**: toca as notas reais
- **Cache-first**: mesma URL YouTube nunca re-chama Claude

### 6.4 Fluxo Análise → Progressões
*(Anteriormente integrado às Cifras; continua funcionando via /analise)*

```
/analise (textarea ou ?p= query param)
  └→ Progressão: Cm | C7 | Fm | G7 | G# | G#7
       ├─ Tabela de graus em C menor
       ├─ Cadências detectadas
       └→ Botão "Salvar na Biblioteca"
            └→ /progressoes → tab "Minhas Progressões"
                 ├─ Progressão salva (localStorage)
                 ├─ Botão "Analisar" (volta ao analisador)
                 └─ Botão "✕" (remover)
```

### 6.5 Análise Harmônica Visual (TheoryTab)
- `CifraAnalise.tsx` — componente client-side na tab de cada cifra
- Extrai todos os acordes do conteúdo da cifra
- Detecta tonalidade (usa `tom` da cifra como ponto de partida se disponível)
- **Blocos coloridos por função harmônica:**
  - Tônica = violeta, Subdominante = sky, Dominante = âmbar
  - Dominante secundária = laranja, Empréstimo modal = rosa
  - Sensível = rose, Não identificado = slate
- Resumo harmônico: total acordes, % diatônicos, secundárias, modais
- Cadências detectadas com label

### 6.6 Analisador Harmônico (`/analise`)
- Textarea + botão Analisar (Ctrl+Enter)
- **Aceita `?p=` query param** para pré-carregar progressão (vindo das cifras)
- Engine client-side: 24 tonalidades, graus, cadências
- **Botão "Salvar nas Progressões"** (persiste em localStorage)
- Link "Ver nas Progressões →" após salvar

### 6.7 Progressões (`/progressoes`) — Página Unificada com 6 Tabs

Unificação das antigas páginas `/biblioteca`, `/cadencias` e `/progressoes` em uma única página com tabs:

| Tab | Conteúdo |
|-----|----------|
| **Campo Harmônico** | 12 notas × maior/menor, 7 acordes com **função harmônica** (Tônica/Sub/Dom) e **tensões disponíveis** (9, 11, 13, etc.), **12 progressões comuns** com exemplos de músicas reais (inclui Dom. Sec. E7, Samba com Empréstimo, Samba Completo, Sub. Trítono), tabela de intervalos |
| **Cadências** | **13 padrões de treino** com exemplos de músicas, seletor de tonalidade, embaralhar, dicas (inclui progressões com dominantes secundários e SubV) |
| **Sequências** | 5 sequências com nomes descritivos, cards com grau/acorde/notas formadoras, link para detalhe com músicas |
| **Formação de Acordes** | 19 tipos × 12 notas, fórmula + notas + intervalos, 3 formas com braço SVG, **partitura VexFlow**, play com sampler |
| **Ciclo de Quintas** | SVG interativo com 12 notas maiores + relativas menores, clique mostra campo harmônico com funções |
| **Minhas Progressões** | Progressões salvas do Analisador Harmônico (localStorage) |

- `/biblioteca` e `/cadencias` redirecionam para `/progressoes`
- `/progressoes/[slug]` — detalhe de cada sequência com seletor de tom, busca, e análise por música

### 6.8 Formação de Acordes + Sampler de Cavaquinho
- **19 tipos de acorde:** Maior, Menor, Dim, Aug, 7, m7, maj7, dim7, m7(b5), Sus4, Sus2, 6, m6, 9, m9, 11, 13, Add9, Power(5)
- **Cálculo dinâmico:** fórmula, notas e intervalos calculados em tempo real para qualquer raiz + tipo
- **3 formas** com voicings diferentes no braço do cavaquinho
- **Diagrama SVG do braço** (`BracoCavaquinho.tsx`): 4 cordas D-G-B-D, trastes, pontos com nome da nota, corda solta (O) / muda (X). **Voicings fórmula-based** derivados do "Dicionário básico de acordes" (Betto Correa) — 3 famílias major (C-shape, E-shape, barre), 3 minor (Cm, Em, Am), 3 dom7. Acorde D=\[4,2,3,4\], G=\[5,4,3,5\], etc.
- **Sampler real** (`sampler.ts`): 17 samples WAV extraídos do pack Kitdepontos, Web Audio API, pitch-shift para cobertura cromática completa (notas faltantes C, D#, F cobertas via playbackRate ≤ 1 semitom)
- **PlayButton** reutilizável: lazy loading do AudioContext, ícone com animação

### 6.9 Metrônomo + Afinador (flutuante)
Botão flutuante no canto inferior direito, acessível em todas as páginas do app:

**Metrônomo:**
- BPM 40–220, slider + botões −/+
- Tap Tempo (detecta BPM por toques)
- Controle de volume (ref em tempo real)
- Compassos: 4/4, 3/4, 2/4, 6/8
- Indicadores visuais de beat (acento no 1º tempo)
- Som via Web Audio API (oscilador)

**Afinador:**
- Detecção de pitch via microfone (getUserMedia + autocorrelação)
- 4 cordas do cavaquinho: D4 (293.66Hz), B3 (246.94Hz), G3 (196Hz), D3 (146.83Hz)
- Gauge visual SVG com agulha (−50 a +50 cents)
- Indicador de cor: verde (≤5 cents), amarelo (≤15), vermelho (>15)
- Status "Afinado!" quando ≤5 cents da nota alvo

### 6.10 Sequências Harmônicas — 5 com Músicas Reais
| Sequência | Graus | Tipo | Músicas |
|---|---|---|---|
| Roda de Samba | I – vi – ii – V7 | Fundamental | 1 |
| Passeio Diatônico | I – V – vi – iii – IV – iii – ii – V7 | Intermediária | 4 |
| Dominante Secundária | I – V7/vi – vi – v – I7 – IV – V7 – I | Com Dom. Secundária | 3 |
| Cadeia de Dominantes | I – V7/ii – ii – V7 – v – I7 – IV – V7 – I | Dom. Secundárias | 2 |
| Ciclo Completo | I – viiø – V7/vi – vi – v – I7 – IV – iv – iii – V7/ii – ii – V7 | Avançada | 2 |

### 6.11 Arpejos (`/arpejos`)
- **8 padrões**: Ascendente, Descendente, Alternado, Sweep Up/Down, Quebrado, Samba, Pagode
- **8 tipos de acorde**: Maior, Menor, 7, m7, 7M, Dim, Aum, m7(b5)
- **12 notas** × 6 opções de BPM (60-160)
- **Diagrama do braço** (`BracoArpejo.tsx`): posições numeradas com cores por ordem de execução
- **Partitura VexFlow + Tablatura** renderizadas em tempo real para cada padrão/acorde
- **Play arpejo**: toca notas em sequência no tempo do BPM via `playArpejo()` do sampler
- Descrição + dica de execução para cada padrão
- **Arpejos do Campo Harmônico**: 7 graus diatônicos com play, cores por função (Tônica/Sub/Dom)

### 6.12 Improvisos (`/improvisos`) — 4 tabs

**Tab Escalas:**
- **12 escalas**: Pentatônica Maior/Menor, Blues, Jônica, Dórica, Frígia, Lídia, Mixolídia, Eólica, Lócria, Menor Harmônica, Menor Melódica
- **Braço inteiro** (`BracoEscala.tsx`): trastes 0-12, todas as posições da escala, tônica destacada em roxo
- Notas, descrição, uso comum, acordes compatíveis

**Tab Frases ("Quadradinhos"):**
- **8 frases curadas**: pentatônicas, blues, samba fill, dórica, mixolídia, cromática, menor harmônica
- **Partitura VexFlow + Tablatura** para cada frase
- Play button, nível (Iniciante/Intermediário/Avançado), músicas de referência, dica de execução

**Tab Exercícios:**
- Guia passo a passo para combinar escalas + frases + backing tracks

**Tab Backing Tracks:**
- **5 progressões**: ii-V-I, I-IV-V-I, I-vi-IV-V, Roda de Samba, Blues 12 compassos
- **Play em loop** via `playBackingTrack()` do sampler
- Controle de BPM, escala sugerida

### 6.13 Partitura (transversal — VexFlow)
- **PartituraView**: renderiza pentagrama com clave de sol, notas com duração, acidentes
- **TablaturaView**: 4 linhas SVG (cordas D-G-B-D) com números de trastes
- **PartituraComTab**: combo partitura + tablatura alinhadas (usado em Arpejos e Improvisos)

### 6.14 Quiz (`/escola/quiz`)
- 10 perguntas dinâmicas, 7 tipos, feedback imediato, estrelas

### 6.15 Meu Progresso (`/escola/meu-progresso`)
- XP, níveis, ranks, conquistas — calculados do UserProgress

---

## 7. Navegação

### Navbar principal (6 links)
| Link | Rota | Escopo |
|---|---|---|
| Escola | `/escola` | 28 lições em 4 módulos, Quiz (10 tipos), Meu Progresso |
| Músicas | `/musicas` | Player AI estilo Songsterr — YouTube URL → partitura + TAB + letra sincronizadas |
| Progressões | `/progressoes` | Campo harmônico c/ tensões, cadências, sequências, formação, ciclo de quintas (6 tabs) |
| Arpejos | `/arpejos` | 8 padrões + arpejos do campo harmônico, partitura, tablatura, play |
| Improvisos | `/improvisos` | 12 escalas, 8 frases, exercícios, backing tracks (4 tabs) |
| Análise | `/analise` | Analisador harmônico (aceita ?p=) |

### Elemento flutuante
| Elemento | Posição | Escopo |
|---|---|---|
| Metrônomo / Afinador | Canto inferior direito | Todas as páginas do app |

### Redirects
| URL antiga | Destino |
|---|---|
| `/biblioteca` | `/progressoes` |
| `/cadencias` | `/progressoes` |
| `/quiz` | `/escola/quiz` |
| `/estudos` | `/escola/meu-progresso` |

### API Routes
| Rota | Métodos | Auth | Descrição |
|---|---|---|---|
| `/api/auth/[...nextauth]` | NextAuth | — | Login/session |
| `/api/auth/register` | POST | — | Cadastro |
| `/api/progress` | GET, POST | 401 | Progresso nas lições |
| `/api/musicas` | GET | — | Listar estudos públicos |
| `/api/musicas/generate` | POST | — | URL YouTube → CifraClub → 3 checkpoints → Estudo (cache-first, sem IA no caminho principal) |
| `/api/musicas/[id]` | PATCH | — | Atualizar introSecs (debounce 1s) |
| `/api/musicas/[id]/salvar` | POST, DELETE | 401 | Salvar/remover da lista pessoal |

---

## 8. Banco de Cifras (576 músicas)

### Origem dos dados
| Fonte | Páginas | Cifras | Gênero |
|---|---|---|---|
| `SAMBA RAIZ.pdf` | 319 | ~250 | Samba clássico (Cartola, Clara Nunes, Noel Rosa...) |
| `PAGODES ATUAIS..pdf` | 307 | ~326 | Pagode contemporâneo (Ferrugem, Thiaguinho, Belo...) |
| **Total (dedup + separação)** | **626** | **576** | **112 artistas** |

### Qualidade dos dados (auditoria 2026-06-27)
| Verificação | Resultado |
|---|---|
| Cifras encavaladas (2+ músicas) | **0** (84 separadas em 128 novas cifras) |
| Notas/acordes perdidos | **0** (212+ formatos reconhecidos) |
| Cifras sem acordes | **0** |
| Conteúdo muito curto | **0** |
| Símbolos soltos removidos | **21** |

### Top artistas por quantidade
| Artista | Qtde | | Artista | Qtde |
|---|---|---|---|---|
| Turma do Pagode | 16 | | Belo | 14 |
| Ferrugem | 12 | | Xande de Pilares | 12 |
| Clara Nunes | 11 | | Sorriso Maroto | 11 |
| Mumuzinho | 11 | | Thiaguinho | 10 |
| Agepê | 10 | | Alcione | 10 |
| Cartola | 10 | | Dona Ivone Lara | 10 |
| Pixote | 10 | | Diogo Nogueira | 9 |

### Script de extração
`scripts/extract-cifras.py` — usa pymupdf para extrair texto dos PDFs, corrige encoding, normaliza artistas (88 nomes canônicos), deduplica, gera `cifras.json`.

---

## 9. Engine de Áudio

### 9.1 `src/lib/sampler.ts` — Sampler de Cavaquinho
- **Fonte:** Pack Kitdepontos.com.br (17 samples WAV 24-bit stereo → 16-bit mono)
- **Conversão:** `scripts/convert-samples.py` (Python, lameenc)
- **Notas amostradas:** C#, D, E, F#, G, G#, A, A#, B (9 de 12 cromáticas)
- **Cobertura completa:** C, D#, F via pitch-shift (playbackRate, max 1 semitom)
- **Oitavas:** 3 a 5 (D/E/F# têm 3 oitavas, B/C# têm 2, restante 1)
- **API:** `initSampler()`, `playNote(note, octave)`, `playChord(notes)`, `playArpejo(notes, bpm, pattern)`, `playBackingTrack(chords, bpm, beatsPerChord)`, `stopAll()`
- **Lazy loading:** AudioContext criado no primeiro clique (respeita autoplay policy)

### 9.2 `src/lib/teoria.ts` — Engine de Teoria Musical
Módulo client-side reutilizado em `/analise`, `/progressoes` e `CifraAnalise`.

| Função | Descrição |
|---|---|
| `parseChord(token)` | Parseia acorde brasileiro → `{root, quality, original}` |
| `parseProgression(text)` | Tokeniza texto livre → array de `Chord` |
| `detectKey(chords)` | Scoring em 24 tonalidades → `KeyResult[]` |
| `analyzeDegrees(chords, key)` | Graus, função e diatônico/não-diatônico |
| `detectCadences(degrees)` | Detecta ii-V-I, V7-I, IV-I, deceptiva, etc. |
| `campoHarmonico(root, mode)` | 7 acordes diatônicos com grau e label |
| `normNote(n)` | Normaliza enarmônicos (Bb→A#, Eb→D#) |

### Notações brasileiras reconhecidas (212+ formatos)
**Básicas:** `m`, `7`, `m7`, `7M` (maj7), `dim`, `º`, `ø`, `aug`, `+`, `sus4`, `sus2`, `6`, `add9`
**Extensões:** `7/9`, `7/11`, `7/13`, `9`, `11`, `13`, `6/9`, `4(7/9)`
**Alterações:** `7#9`, `7b9`, `7#5`, `7b5`, `7b13`, `7/-5`, `7/-9`, `7/-13`, `5+`, `5-`
**Compostas:** `m7b5`, `m7(b5)`, `m7(5-)`, `m7/-5`, `m7M`, `dim7`, `º7`, `5+7`
**Com baixo:** `/A`, `/Bb`, `/C#`, etc.
**Parênteses:** `(9/11)`, `(b5)`, `(5-)`, `(7/9)`

---

## 10. Itens Pendentes / Roadmap

### Funcionalidades implementadas recentemente (removidas do pendente)
- ~~Transposição de tom nas cifras~~ ✅ (2026-06-25)
- ~~Melhoria do formato das cifras~~ ✅ (2026-06-26, acordes clicáveis, play tab, auto-scroll)
- ~~Arpejos~~ ✅ (2026-06-25)
- ~~Improvisos~~ ✅ (2026-06-25)
- ~~Partitura~~ ✅ (2026-06-25, VexFlow)
- ~~Metrônomo + Afinador~~ ✅ (2026-06-24)
- ~~Módulo Partituras~~ ✅ (2026-06-27, 4 tabs: ensino, visualizador ABC, gerador, exercícios)
- ~~Tensões e funções no campo harmônico~~ ✅ (2026-06-28)
- ~~Exemplos de músicas nas progressões~~ ✅ (2026-06-28)
- ~~Novas lições: SubV, Acordes Sus, Campos Combinados~~ ✅ (2026-06-28)
- ~~Quiz expandido: funções, tensões, SubV~~ ✅ (2026-06-28)
- ~~Ciclo de Quintas interativo~~ ✅ (2026-06-28)
- ~~Arpejos vinculados ao campo harmônico~~ ✅ (2026-06-28)
- ~~Modos gregos com tablatura (Dórico + Mixolídio)~~ ✅ (2026-06-28)
- ~~Diagramas de acordes corretos (BracoCavaquinho formula-based)~~ ✅ (2026-07-01)
- ~~Shapes min7 corrigidos pelo Dicionário Betto Correa (1ª e 2ª formas)~~ ✅ (2026-07-03)
- ~~Fix dim Ab°: C°-shape [0,1,0,0] em vez de E°-shape [6,4,3,6]~~ ✅ (2026-07-03)
- ~~4 novas progressões avançadas (Dom. Sec. E7, Samba Empréstimo, Samba Completo, SubV)~~ ✅ (2026-07-01)
- ~~har-2b: Campo Harmônico Menor Harmônico~~ ✅ (2026-07-01)
- ~~har-2c: Campo Harmônico Menor Melódico~~ ✅ (2026-07-01)

### Funcionalidades pendentes
- **Verificação dos diminutos restantes** — F#dim, Gdim, Adim, Bdim e demais shapes calculados pelo algoritmo precisam ser comparados com referências (usuário confirmou que apenas Fdim [3,1,0,3] está correto)
- **Painel Admin** (CRUD de cifras e usuários)
- **Área de Usuário** (perfil, trocar senha)
- **Campo `progressao`** auto-extraído do conteúdo das cifras
- **HookTheory Hookpad-style** — editor interativo de progressões adaptado ao cavaquinho
- **Reativar login** após avaliação da comunidade
- **Ampliar base de samples** — mais velocidades, mais oitavas para melhor cobertura
- **Cifras modelo CifraClub** — acordes posicionados sobre sílabas específicas (requer reestruturação do conteudo)
- **Importação de partituras** — importar MusicXML/ABC para visualização no VexFlow
- **Mais frases de improviso** — expandir de 8 para 30+ frases curadas

### Histórico de revisões
| Data | Mudanças |
|---|---|
| 2026-06-17 | Login desativado, biblioteca dinâmica, escola consolidada, conteúdo cavaquinho, cifras CifraClub, navbar simplificado |
| 2026-06-17 | Análise Visual TheoryTab (blocos coloridos por função) nas cifras |
| 2026-06-17 | Cifras agrupadas por artista A-Z com busca |
| 2026-06-17 | Fluxo cifra→análise→analisador→biblioteca com ?p= query e salvar progressão |
| 2026-06-18 | Base expandida: 576 cifras de 112 artistas (extraídas dos PDFs SAMBA RAIZ + PAGODES ATUAIS) |
| 2026-06-22 | Unificação /biblioteca + /cadencias + /progressoes em página única com 4 tabs |
| 2026-06-22 | Sequências renomeadas: Roda de Samba, Passeio Diatônico, Dominante Secundária, Cadeia de Dominantes, Ciclo Completo |
| 2026-06-22 | Cards de sequência com grau, acorde e notas formadoras |
| 2026-06-22 | Navbar simplificada: 3 links (Escola, Progressões, Análise) |
| 2026-06-22 | Tab Formação de Acordes: 19 tipos, sampler real de cavaquinho (17 WAVs), diagrama SVG do braço |
| 2026-06-24 | Metrônomo flutuante: BPM 40-220, tap tempo, volume, 4 compassos |
| 2026-06-24 | Afinador integrado: detecção de pitch via microfone, gauge visual, 4 cordas D-G-B-D |
| 2026-06-25 | Módulo Arpejos: 8 padrões, braço numerado, partitura VexFlow + tablatura, playArpejo |
| 2026-06-25 | Módulo Improvisos: 12 escalas no braço inteiro, 8 frases curadas, backing tracks, exercícios |
| 2026-06-25 | Partitura transversal: VexFlow (PartituraView) + TablaturaView + PartituraComTab |
| 2026-06-25 | Rebuild Cifras: transposição de tom, acordes clicáveis com tooltip (braço + play), auto-scroll, CifraControls sticky |
| 2026-06-25 | Navbar 5 links: Escola, Progressões, Arpejos, Improvisos, Análise |
| 2026-06-26 | Cifras de volta ao menu (6 links), play nas tablaturas, 212+ formatos de acorde reconhecidos |
| 2026-06-26 | Separação de 84 cifras concatenadas: 448→576 cifras, 88→112 artistas |
| 2026-06-26 | Fix INLINE_CHORD_RE para acordes com + (G7+, A7+), tooltip com parser robusto |
| 2026-06-27 | Revisão profunda: 0 cifras encavaladas, 0 notas perdidas, 21 símbolos soltos limpos |
| 2026-06-27 | Fix tab mista com acordes, partitura na Formação de Acordes |
| 2026-06-27 | Módulo Partituras: ensino (6 lições + quiz), visualizador ABC, gerador cifra→partitura, exercícios |
| 2026-06-27 | Fix artistas duplicados (7 variantes) e acordes 7+ (Fmaj7, não aug) |
| 2026-06-28 | Melhorias de conteúdo (3 sprints): tensões/funções no campo, músicas nas progressões |
| 2026-06-28 | +3 lições: har-7 Dominante Substituto, har-8 Campos Combinados, ac-7 Sus e Alterados |
| 2026-06-28 | Quiz expandido: +3 tipos (função harmônica, tensões, SubV). Total: 10 tipos |
| 2026-06-28 | Ciclo de Quintas interativo (SVG, nova tab em /progressoes) |
| 2026-06-28 | Arpejos do Campo Harmônico (7 graus com play em /arpejos) |
| 2026-06-28 | Modos gregos expandidos: tablatura Dórico + Mixolídio no cavaquinho |
| 2026-07-01 | Fix diagramas de acordes: voicings fórmula-based derivados do Dicionário Betto Correa (C-shape, E-shape, barre, Cm, Em, Am, dom7) |
| 2026-07-01 | +4 progressões avançadas: Dom. Sec. E7, Samba com Empréstimo, Samba Completo, Com Sub. Trítono (PADROES + PROGRESSOES_COMUNS) |
| 2026-07-01 | buildExemplo extendido: índices -4 (V7/vi), -5 (V7/ii), -6 (SubV) para cálculo dinâmico por tonalidade |
| 2026-07-01 | +2 lições Harmonia: har-2b (Menor Harmônico) e har-2c (Menor Melódico) — total 28 lições, Harmonia com 10 |
| 2026-07-03 | Fix shapes min7 (1ª forma): Cm7 hard-coded [5,3,1,5], Dm7 hard-coded [0,2,1,3] (Betto Correa) |
| 2026-07-03 | Fix shapes min7 (2ª forma): Cm7 [5,5,4,5], Dm7 [3,5,3,7], Em7 [5,7,5,9], Gm7 [5,3,6,7], Am7 [7,5,8,9] (Betto Correa) |
| 2026-07-03 | Fix exibição "cortando o Si na nona casa": Em7 e Am7 2ª formas hard-coded eliminam open strings, diagrama compacto a partir da 5ª casa |
| 2026-07-03 | Fix dim Ab° (R=8): C°-shape [0,1,0,0] em vez de E°-shape [6,4,3,6]; E°-shape restrito a R=5..7 |
| 2026-07-08 | **Pivot Cifras → Músicas (Player Interativo AI)**: removidos Cifra/CifraFavorito/Repertorio/RepertorioItem do schema |
| 2026-07-08 | Novos models: `Estudo` (youtubeId unique, tabData JSON, introSecs) + `EstudoSalvo` (userId+estudoId unique) |
| 2026-07-08 | Pipeline: URL YouTube → oEmbed → Claude Haiku (max_tokens 8192) → JSON medidas → DB (cache-first por youtubeId) |
| 2026-07-08 | Player `/musicas/[id]`: YouTube iframe API, polling 100ms `getCurrentTime` → medida ativa, scroll automático |
| 2026-07-08 | Layout partitura contínua (PartituraCompleta): linhas de 4 medidas, VexFlow multi-stave + TAB SVG 4 cordas + letra |
| 2026-07-08 | Hover acorde → BracoCavaquinho tooltip; clique → sampler; slider intro 0–120s; velocidade 0.5x–1.25x; salvar ♡ |
| 2026-07-08 | Vercel deploy configurado: projeto `nexoswebservices-projects/cavaquinho`, domínio `cavaquinho.nexoswebservices.com` |
| 2026-07-08 | ANTHROPIC_API_KEY configurada em Vercel (Production/Preview/Development) e `.env.local` |
| 2026-07-08 | DNS Hostinger: TXT `_vercel` + CNAME `cavaquinho` → `cname.vercel-dns.com` (verificado) |
| 2026-07-09 | **Pipeline partitura-first (H-E)**: `PartituraIndex` model no schema (artista, postTitulo, postUrl) |
| 2026-07-09 | Índice populado: script `scripts/index-partituras.ts` scrapu 240 labels → **2.396 posts** de nandinhocavaco.com.br |
| 2026-07-09 | `src/lib/partitura-search.ts`: busca fuzzy no índice por título+artista (OR de palavras significativas, score ranking) |
| 2026-07-09 | `src/lib/partitura-vision.ts`: baixa PNG do Blogger CDN (s16000) → `claude-sonnet-5` Vision → tabData JSON |
| 2026-07-09 | generate/route.ts atualizado: tenta partitura (`source: "partitura"`) antes de Claude texto (`source: "claude"`) |
| 2026-07-09 | tsconfig.json: exclui `scripts/` do build Next.js; scripts/tsconfig.json separado para execução local |
| 2026-07-13 | Levantamento muted.io: roadmap de melhorias visuais (Círculo de Quintas 3 anéis, braço interativo, pentatônica 5 posições) — registado na Secção 12 |
| 2026-07-15 | Feat: `src/lib/letras-scraper.ts` — scrape de letra via lrclib.net; integrado no pipeline generate em paralelo com busca partitura |
| 2026-07-15 | Feat: `src/lib/cavaquinho-tab.ts` — engine chord-to-tab por fórmulas D-G-B-D; aplicado no fallback Claude-texto via `applyFormulasTabs()` |
| 2026-07-15 | Guard mínimo 4 medidas para aceitar resultado do Vision; sem guard a Vision retornava 1–2 medidas em imagens sem partitura |
| 2026-07-15 | Build script: `rmSync('.next', {recursive:true,force:true})` antes de `next build` — evita servir chunks em cache de build anterior |
| 2026-07-19 | Fix domínio: TXT `_vercel.nexoswebservices.com` actualizado no Hostinger hPanel (token `7d0b61d455a36be71a62` → `93af89d543d9da862e4d`); Vercel domain `verified: true`; domínio customizado confirma buildId `CBG58XtOAXSTX8p3py-wo` igual ao vercel.app |
| 2026-07-19 | MusicaPlayer limpo: botões ♡🔄🗑 flutuantes (`fixed bottom-6 right-6`) confirmados removidos no deployment activo |
| 2026-07-20 | Fix `searchPartituraIndex`: `take:50` (era 10 — cortava entradas com muitos resultados do mesmo artista); OR query com todas as palavras (não só 2 primeiras); `stripAccents()` no scoring (ultima=última); strip pontuação das palavras ("mais,"→"mais") |
| 2026-07-20 | Debug Vision: imagem reduzida s16000→s1600; `maxDuration=60` na rota generate; logging detalhado `[vision]` e `[generate]` para diagnóstico em produção |
| 2026-07-21 | **Diagnóstico definitivo do player errado:** Vision timeout em Vercel (10-60s) → cai no Haiku → Haiku alucina C7+/9, Am7/9, tom G errado, 14 medidas; partitura real lida diretamente mostra C, Dm7, Fmaj7, F/G, E7, F6, Gsus4 em 41 compassos |
| 2026-07-21 | **Refactor pipeline: CifraClub-first com 3 checkpoints de validação** |
| 2026-07-21 | — `src/lib/cifraclub-scraper.ts` (NOVO): busca URL via slug+feat variants, extrai acordes de `<strong>` tags, normaliza notação brasileira (7M→maj7, X9→dom7), `cleanTitulo()` extrai só título após " - " do título YouTube, `extractFeatSlugs()` para "/pela-ultima-vez-part-nattan/" |
| 2026-07-21 | — `cavaquinho-tab.ts`: `parseChordSymbol` estendido: `7M→maj7` (notação BR), `X9/X11/X13→dom7`, `Xm9/Xm11→min7` |
| 2026-07-21 | — `generate/route.ts` reescrito: remove Haiku e Vision do caminho principal; 3 checkpoints (`getCifraclubChords` → `parseChordSymbol` → `chordToTab`); erro 422 claro se cifra não encontrada ou acordes insuficientes; armazena `partituraUrl` e `fonte` no tabData |
| 2026-07-21 | — Vision (`partitura-vision.ts`) mantido mas movido para uso offline/admin — correto localmente, problemático em serverless |

---

## 11. Credenciais e Acessos

| Recurso | Valor |
|---|---|
| App live | https://cavaquinho.nexoswebservices.com |
| Admin | admin@harmoniaflow.com / admin123 |
| DB host | srv1804.hstgr.io:3306 / u828037891_cavaquinho |
| Vercel | deploy automático no push para `main` (`nexoswebservices-projects/cavaquinho`) |
| Branch | `main` |
| ANTHROPIC_API_KEY | em `.env.local`, `.env.production.local` e Vercel env vars (Production/Preview/Development) |
| PDFs fonte | `C:\Users\renat\Downloads\Harmonico\SAMBA RAIZ.pdf` (319p) |
| | `C:\Users\renat\Downloads\Harmonico\PAGODES ATUAIS ..pdf` (307p) |
| Samples fonte | `C:\Users\renat\Downloads\Hamonico\PACK SAMPLES CAVAQUINHO - Kitdepontos.COm.Br.zip` |

### Referências externas salvas
| Referência | Uso futuro |
|---|---|
| [HookTheory TheoryTab](https://www.hooktheory.com/theorytab) | Modelo para visualização de progressões sobre cifras |
| [HookTheory Hookpad](https://www.hooktheory.com/hookpad) | Modelo para editor interativo de progressões |
| [CifraClub formato cavaco](https://www.cifraclub.com.br/) | Referência de formato de apresentação de cifras |
| [muted.io Circle of Fifths](https://muted.io/circle-of-fifths/) | Referência visual para seção `/harmonia` — ver Seção 12 |

---

## 12. Melhorias Futuras — Inspiração muted.io

> Levantamento feito em 2026-07-13 após visita ao [muted.io](https://muted.io).
> **Não implementar agora** — registrado para roadmap futuro.

### 12.1 Círculo de Quintas Visual Avançado (nova rota `/harmonia` ou melhoria de `/progressoes`)

**Referência:** https://muted.io/circle-of-fifths/

O muted.io tem um SVG interativo com 3 anéis concêntricos:
- Anel externo: 12 tonalidades maiores (com rótulo de função: tônica I, dominante V, subdominante IV, mediante vi, etc.)
- Anel médio: 12 relativas menores
- Anel interno: armaduras de clave (# e b)
- Toggle Maior ↔ Menor (Iônico ↔ Eólico)
- Clique em qualquer fatia = seleciona a tônica e ilumina as relações

**O que adaptar para o Cavaquinho:**
- Ao clicar em uma fatia (ex: Sol maior), exibir ao lado os **7 acordes diatônicos com o BracoCavaquinho** de cada um
- Iluminar as 3 fatias do "triângulo básico" do samba: I (tônica), IV (subdominante), V7 (dominante)
- Botão "Tocar campo harmônico" → sampler toca os 7 acordes em sequência
- Integrar com `/progressoes` — clicar num tom gera a progressão básica

**Implementação sugerida:**
```
src/components/progressoes/CirculoQuintasAvancado.tsx
- SVG puro com 36 fatias (12 × 3 anéis)
- Estado: tonicaSelecionada (string), modo ("maior"|"menor")
- Reutiliza: campoHarmonico() de teoria.ts, BracoCavaquinho, sampler
```

**Diferencial vs. o que já existe:** o Ciclo de Quintas atual em `/progressoes` (tab 5) já é interativo mas mostra apenas os 12 tons como bolinhas clicáveis. A versão muted.io-inspirada teria os **3 anéis concêntricos** com funções harmônicas visíveis diretamente no círculo.

---

### 12.2 Acordes na Tonalidade — Cards com Braço (melhoria de `/progressoes`)

**Referência:** https://muted.io/chords-in-keys/

Cards para cada grau diatônico (I ii iii IV V vi vii°) mostrando:
- Grau romano + nome da função (Tônica, Subdominante, Dominante)
- Nome do acorde na tonalidade selecionada
- Notas formadoras (ex: C E G)
- **BracoCavaquinho** já integrado — shape do acorde
- Botão play → sampler toca o acorde
- Expansão para 7ª: I7M, ii7, iii7... com tensões disponíveis

**O que já temos:** a tab "Campo Harmônico" em `/progressoes` já mostra os 7 graus com função e tensões, mas sem o BracoCavaquinho embutido em cada card. A melhoria seria adicionar o diagrama de forma inline/expandível.

---

### 12.3 Braço do Cavaquinho Interativo — Escala Visual (melhoria de `/improvisos`)

**Referência:** https://muted.io/guitar-fretboard/ / https://muted.io/ukulele-fretboard/

Braço completo (trastes 0–12, 4 cordas D-G-B-D) onde:
- Seletor de escala + tom → ilumina todas as notas no braço
- Cor diferente por grau (tônica = roxo, 2ª = azul, 3ª = verde...)
- Clique em qualquer nota → toca via sampler
- Toggle: mostrar nome da nota / mostrar número do dedo / mostrar grau

**O que já temos:** `BracoEscala.tsx` em `/improvisos` já faz isso, mas com layout fixo e sem interação nota a nota (só mostra o padrão). A versão avançada permitiria **clicar nota por nota** e ver o nome/grau em tempo real.

---

### 12.4 Pentatônica Exploratória (nova aba em `/improvisos`)

**Referência:** https://muted.io/pentatonic/

Mostra as **5 posições da pentatônica menor** no braço inteiro do cavaquinho, cada posição numa cor diferente, com botões para navegar entre elas. Muito relevante para samba/pagode.

---

### 12.5 Progressões Contextualizadas ao Samba (melhoria de `/progressoes`)

**Referência:** https://muted.io/chord-progressions/

O muted.io lista progressões genéricas (I–V–vi–IV, ii–V–I...). A versão Cavaquinho teria:
- "Progressões clássicas do samba/pagode" com nomes em português
- Exemplos de músicas reais que usam cada progressão (já temos isso!)
- Player: toca a progressão no tom selecionado via sampler

---

### Resumo de prioridade

| Feature | Esforço | Impacto | Prioridade |
|---|---|---|---|
| Círculo de Quintas 3 anéis (12.1) | Médio (SVG novo + lógica existente) | Alto | ⭐⭐⭐ |
| Campo Harmônico com BracoCavaquinho inline (12.2) | Baixo (reutiliza componentes) | Alto | ⭐⭐⭐ |
| Braço interativo nota a nota (12.3) | Médio | Médio | ⭐⭐ |
| Pentatônica 5 posições (12.4) | Baixo | Médio | ⭐⭐ |
| Progressões do samba com player (12.5) | Baixo (já existe base) | Alto | ⭐⭐⭐ |
| Cursos Hotmart (Layon Bacelar) | Conteúdo para novos módulos na Escola (pendente acesso) |
