# Cavaquinho — Levantamento e Status do Projeto

**App original (Base44):** `69b2d3997a1398e7452d1d32` ("HarmoniaFlow" / "Samba de Raiz")  
**App reconstruído:** https://cavaquinho.nexoswebservices.com  
**Repositório local:** `c:\Users\renat\Downloads\Hamonico`  
**Data do levantamento inicial:** 2026-06-09  
**Última atualização:** 2026-06-25

---

## 1. Status Geral

**✅ TODAS AS 6 FASES + ANÁLISE VISUAL + BASE EXPANDIDA + FERRAMENTAS DE ÁUDIO**

| Fase | Feature | Status |
|---|---|---|
| 1 | Cifras + Favoritos + Repertórios | ✅ Live (448 cifras, 88 artistas) |
| 2 | Análise Harmônica | ✅ Live (+ fluxo cifra→análise→progressões) |
| 3 | Progressões (unificada) | ✅ Live (campo harmônico + cadências + sequências + formação de acordes) |
| 4 | Treino de Cadências | ✅ Live (9 padrões, integrado em /progressoes) |
| 5 | Quiz | ✅ Live (em `/escola/quiz`) |
| 6 | Meu Progresso (gamificação) | ✅ Live (em `/escola/meu-progresso`) |
| 7 | Análise Visual TheoryTab | ✅ Live (blocos coloridos por função) |
| 8 | Formação de Acordes + Sampler | ✅ Live (19 tipos, 3 formas, som real cavaquinho) |
| 9 | Metrônomo + Afinador | ✅ Live (flutuante, acessível em todas as páginas) |

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
| Deploy | Vercel (auto-deploy no push para `main`) |
| Domínio | `cavaquinho.nexoswebservices.com` |

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
| **Vercel** | Auto-deploy no push para `main` | Hosting do app Next.js |
| **MySQL (Hostinger)** | `srv1804.hstgr.io:3306` / `u828037891_cavaquinho` | Banco de dados de produção |
| **Domínio** | `cavaquinho.nexoswebservices.com` | DNS configurado na Vercel |

### Fluxo de deploy
```
Código local → git push origin main → Vercel build automático → Live em ~2 min
```

### Seed de dados (cifras)
```bash
# Rodar seed contra produção (bash)
DATABASE_URL="mysql://u828037891_cavaquinho:I9c3UhVlw5pMdiWCqoMb@srv1804.hstgr.io:3306/u828037891_cavaquinho" \
  npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
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
| favoritos | CifraFavorito[] |
| repertorios | Repertorio[] |

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

### 4.3 `Cifra`
**448 cifras** extraídas dos PDFs de cadernos musicais.
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| titulo | String |
| artista | String? |
| tom | String? |
| conteudo | String (@db.Text) |
| progressao | String? (@db.Text) |
| createdAt | DateTime |

### 4.4 `CifraFavorito`
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| userId / cifraId | String |
| createdAt | DateTime |
| @@unique([userId, cifraId]) | |

### 4.5 `Repertorio`
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| userId | String |
| nome / descricao | String |
| cor | String (default: "violet") |
| emoji | String (default: "🎵") |
| createdAt / updatedAt | DateTime |

### 4.6 `RepertorioItem`
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| repertorioId / cifraId | String |
| ordem | Int (default: 0) |
| @@unique([repertorioId, cifraId]) | |

---

## 5. Estrutura de Arquivos

```
Hamonico/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                          ← deleteMany + createMany em batch
│   └── data/
│       ├── cifras.json                  ← 448 cifras (extraídas dos PDFs)
│       └── cifras.ts
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
│   │   │   ├── cifras/page.tsx               ← Lista agrupada por artista A-Z
│   │   │   ├── cifras/[id]/page.tsx          ← Tabs: Cifra | Análise Harmônica
│   │   │   ├── cifras/repertorios/page.tsx
│   │   │   ├── cifras/repertorios/[id]/page.tsx
│   │   │   ├── analise/page.tsx              ← Aceita ?p= query param
│   │   │   ├── progressoes/page.tsx          ← Página unificada com 5 tabs
│   │   │   ├── progressoes/[slug]/page.tsx   ← Detalhe de sequência com músicas
│   │   │   ├── biblioteca/page.tsx           ← Redirect → /progressoes
│   │   │   ├── cadencias/page.tsx            ← Redirect → /progressoes
│   │   │   ├── quiz/page.tsx                 ← redirect → /escola/quiz
│   │   │   └── estudos/page.tsx              ← redirect → /escola/meu-progresso
│   │   ├── api/ (...)
│   │   ├── layout.tsx, page.tsx, providers.tsx, globals.css
│   ├── components/
│   │   ├── layout/Navbar.tsx                 ← 3 links: Escola | Progressões | Análise
│   │   ├── ui/
│   │   │   ├── Metronomo.tsx                 ← Painel flutuante com tabs Metrônomo | Afinador
│   │   │   ├── Afinador.tsx                  ← Detecção de pitch via microfone (autocorrelação)
│   │   │   └── PlayButton.tsx                ← Botão play reutilizável (Web Audio)
│   │   ├── escola/
│   │   │   ├── EscolaSubNav.tsx
│   │   │   ├── ModuleGrid.tsx, ProgressBar.tsx, LessonActions.tsx
│   │   ├── cifras/
│   │   │   ├── ChordSheet.tsx                ← Estilo CifraClub + controle de fonte
│   │   │   ├── CifraAnalise.tsx              ← TheoryTab: blocos coloridos por função
│   │   │   ├── CifraTabs.tsx                 ← Tabs Cifra | Análise Harmônica
│   │   │   ├── CifraList.tsx                 ← Agrupado por artista A-Z + busca
│   │   │   ├── CifraFavoriteButton.tsx, AddToRepertorioButton.tsx
│   │   │   ├── NovoRepertorioForm.tsx, DeleteRepertorioButton.tsx
│   │   │   └── RepertorioItens.tsx
│   │   ├── analise/
│   │   │   └── AnalisadorHarmonico.tsx       ← Preload via ?p=, salvar nas progressões
│   │   ├── biblioteca/
│   │   │   └── CampoHarmonico.tsx
│   │   ├── progressoes/
│   │   │   ├── ProgressaoCard.tsx            ← Cards com grau/acorde/notas formadoras
│   │   │   ├── MusicaAnalise.tsx             ← Análise de música por seções
│   │   │   ├── FormacaoAcordes.tsx           ← Enciclopédia: 19 tipos × 12 notas × 3 formas
│   │   │   └── BracoCavaquinho.tsx           ← Diagrama SVG do braço (D-G-B-D)
│   │   ├── cadencias/
│   │   │   └── TreinoCadencias.tsx
│   │   └── quiz/
│   │       └── QuizGame.tsx
│   ├── lib/
│   │   ├── auth.ts, db.ts
│   │   ├── escola-content.ts                 ← 24 lições (cavaquinho)
│   │   ├── markdown.ts, teoria.ts, quiz.ts
│   │   ├── sampler.ts                        ← Engine Web Audio API (pitch-shift, playChord)
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
- **4 módulos, 24 lições** de teoria musical para **cavaquinho**/samba
- Tablaturas de 4 cordas (D-G-B-D) — sem referências a violão
- Sub-navegação: Lições | Quiz | Meu Progresso via `EscolaSubNav`
- Progresso por módulo, barra geral, botão "Marcar como concluída"

### 6.3 Cifras — 448 músicas, 88 artistas
- **Base expandida:** extraídas de 2 PDFs (SAMBA RAIZ 319p + PAGODES ATUAIS 307p) via `scripts/extract-cifras.py`
- **Fontes:** Cartola, Clara Nunes, Alcione, Noel Rosa, Pixinguinha, Belo, Ferrugem, Thiaguinho, Turma do Pagode, Sorriso Maroto, Xande de Pilares...
- `/cifras` — **agrupadas por artista A-Z** com busca por música ou artista
- `/cifras/[id]` — **duas tabs**:
  - **Cifra**: ChordSheet estilo CifraClub (acordes acima das letras, seções estilizadas, controle de fonte)
  - **Análise Harmônica**: visualização TheoryTab com blocos coloridos

### 6.4 Fluxo Cifra → Análise → Progressões
Fluxo completo implementado e testado em produção:

```
Cifra (/cifras/[id])
  └→ Tab "Análise Harmônica"
       ├─ Progressão: Cm | C7 | Fm | G7 | G# | G#7
       ├─ Blocos coloridos por função (tônica, subdominante, dominante, secundária, modal)
       ├─ Tonalidade detectada com confiança %
       ├─ Resumo: acordes, % diatônicos, dom. secundárias, empréstimos modais
       └→ Botão "Abrir no Analisador →"
            └→ /analise?p=Cm+C7+Fm+G7+G#+G#7  (auto-analisa)
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

### 6.7 Progressões (`/progressoes`) — Página Unificada com 5 Tabs

Unificação das antigas páginas `/biblioteca`, `/cadencias` e `/progressoes` em uma única página com tabs:

| Tab | Conteúdo |
|-----|----------|
| **Campo Harmônico** | 12 notas × maior/menor, 7 acordes diatônicos, 8 progressões comuns transpostas, tabela de intervalos e graus |
| **Cadências** | 9 padrões de treino (merge das 8 cadências + Ciclo de Quintas), seletor de tonalidade, embaralhar, descrições e dicas, campo harmônico inline |
| **Sequências** | 5 sequências com nomes descritivos (Roda de Samba, Passeio Diatônico, Dominante Secundária, Cadeia de Dominantes, Ciclo Completo), cards com grau/acorde/notas formadoras em C maior, link para detalhe com músicas |
| **Formação de Acordes** | 19 tipos de acorde × 12 notas raiz, fórmula + notas + intervalos, 3 formas com diagrama SVG do braço do cavaquinho (D-G-B-D), play com som real de cavaquinho via Web Audio API |
| **Minhas Progressões** | Progressões salvas do Analisador Harmônico (localStorage) |

- `/biblioteca` e `/cadencias` redirecionam para `/progressoes`
- `/progressoes/[slug]` — detalhe de cada sequência com seletor de tom, busca, e análise por música

### 6.8 Formação de Acordes + Sampler de Cavaquinho
- **19 tipos de acorde:** Maior, Menor, Dim, Aug, 7, m7, maj7, dim7, m7(b5), Sus4, Sus2, 6, m6, 9, m9, 11, 13, Add9, Power(5)
- **Cálculo dinâmico:** fórmula, notas e intervalos calculados em tempo real para qualquer raiz + tipo
- **3 formas** com voicings diferentes no braço do cavaquinho
- **Diagrama SVG do braço** (`BracoCavaquinho.tsx`): 4 cordas D-G-B-D, trastes, pontos com nome da nota, corda solta (O) / muda (X)
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

### 6.11 Quiz (`/escola/quiz`)
- 10 perguntas dinâmicas, 7 tipos, feedback imediato, estrelas

### 6.12 Meu Progresso (`/escola/meu-progresso`)
- XP, níveis, ranks, conquistas — calculados do UserProgress

---

## 7. Navegação

### Navbar principal (3 links)
| Link | Rota | Escopo |
|---|---|---|
| Escola | `/escola` | Lições, Quiz, Meu Progresso (sub-nav) |
| Progressões | `/progressoes` | Campo harmônico, cadências, sequências, formação de acordes, minhas progressões (5 tabs) |
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
| `/cifras` | `/cifras` (mantido) |
| `/quiz` | `/escola/quiz` |
| `/estudos` | `/escola/meu-progresso` |

### API Routes
| Rota | Métodos | Auth | Descrição |
|---|---|---|---|
| `/api/auth/[...nextauth]` | NextAuth | — | Login/session |
| `/api/auth/register` | POST | — | Cadastro |
| `/api/progress` | GET, POST | 401 | Progresso nas lições |
| `/api/cifras/[id]/favorito` | POST, DELETE | 401 | Favoritar/desfavoritar |
| `/api/repertorios` | GET, POST | 401 | Listar/criar repertórios |
| `/api/repertorios/[id]` | DELETE | 401 | Excluir repertório |
| `/api/repertorios/[id]/itens` | POST, DELETE, PATCH | 401 | Gerenciar músicas |

---

## 8. Banco de Cifras (448 músicas)

### Origem dos dados
| Fonte | Páginas | Cifras | Gênero |
|---|---|---|---|
| `SAMBA RAIZ.pdf` | 319 | 196 | Samba clássico (Cartola, Clara Nunes, Noel Rosa...) |
| `PAGODES ATUAIS..pdf` | 307 | 252 | Pagode contemporâneo (Ferrugem, Thiaguinho, Belo...) |
| **Total (dedup)** | **626** | **448** | **88 artistas** |

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
- **API:** `initSampler()`, `playNote(note, octave)`, `playChord(notes)`, `stopAll()`
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

### Notações brasileiras reconhecidas
`m7(5-)`, `7M`, `7+`, `º`, `ø`, `aug`, `6(9)`, `7(5+)`, `7(13-)`, `/bass`

---

## 10. Itens Pendentes / Roadmap

### Funcionalidades pendentes
- **Transposição de tom** nas cifras
- **Painel Admin** (CRUD de cifras e usuários)
- **Área de Usuário** (perfil, trocar senha)
- **Campo `progressao`** auto-extraído do conteúdo das cifras
- **HookTheory Hookpad-style** — editor interativo de progressões adaptado ao cavaquinho
- **Reativar login** após avaliação da comunidade
- **Novos módulos na Escola** — aguardando conteúdo dos cursos Hotmart (Layon Bacelar)
- **Melhoria do formato das cifras** — padronizar para formato CifraClub canônico (acordes posicionados sobre sílabas)
- **Ampliar base de samples** — mais velocidades, mais oitavas para melhor cobertura

### Histórico de revisões
| Data | Mudanças |
|---|---|
| 2026-06-17 | Login desativado, biblioteca dinâmica, escola consolidada, conteúdo cavaquinho, cifras CifraClub, navbar simplificado |
| 2026-06-17 | Análise Visual TheoryTab (blocos coloridos por função) nas cifras |
| 2026-06-17 | Cifras agrupadas por artista A-Z com busca |
| 2026-06-17 | Fluxo cifra→análise→analisador→biblioteca com ?p= query e salvar progressão |
| 2026-06-18 | Base expandida: 448 cifras de 88 artistas (extraídas dos PDFs SAMBA RAIZ + PAGODES ATUAIS) |
| 2026-06-22 | Unificação /biblioteca + /cadencias + /progressoes em página única com 4 tabs |
| 2026-06-22 | Sequências renomeadas: Roda de Samba, Passeio Diatônico, Dominante Secundária, Cadeia de Dominantes, Ciclo Completo |
| 2026-06-22 | Cards de sequência com grau, acorde e notas formadoras |
| 2026-06-22 | Navbar simplificada: 3 links (Escola, Progressões, Análise) |
| 2026-06-22 | Tab Formação de Acordes: 19 tipos, sampler real de cavaquinho (17 WAVs), diagrama SVG do braço |
| 2026-06-24 | Metrônomo flutuante: BPM 40-220, tap tempo, volume, 4 compassos |
| 2026-06-24 | Afinador integrado: detecção de pitch via microfone, gauge visual, 4 cordas D-G-B-D |

---

## 11. Credenciais e Acessos

| Recurso | Valor |
|---|---|
| App live | https://cavaquinho.nexoswebservices.com |
| Admin | admin@harmoniaflow.com / admin123 |
| DB host | srv1804.hstgr.io:3306 / u828037891_cavaquinho |
| Vercel | deploy automático no push para `main` |
| Branch | `main` |
| PDFs fonte | `C:\Users\renat\Downloads\Harmonico\SAMBA RAIZ.pdf` (319p) |
| | `C:\Users\renat\Downloads\Harmonico\PAGODES ATUAIS ..pdf` (307p) |
| Samples fonte | `C:\Users\renat\Downloads\Hamonico\PACK SAMPLES CAVAQUINHO - Kitdepontos.COm.Br.zip` |

### Referências externas salvas
| Referência | Uso futuro |
|---|---|
| [HookTheory TheoryTab](https://www.hooktheory.com/theorytab) | Modelo para visualização de progressões sobre cifras |
| [HookTheory Hookpad](https://www.hooktheory.com/hookpad) | Modelo para editor interativo de progressões |
| [CifraClub formato cavaco](https://www.cifraclub.com.br/) | Referência de formato de apresentação de cifras |
| Cursos Hotmart (Layon Bacelar) | Conteúdo para novos módulos na Escola (pendente acesso) |
