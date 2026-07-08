# Cavaquinho — Levantamento e Status do Projeto

**App original (Base44):** `69b2d3997a1398e7452d1d32` ("HarmoniaFlow" / "Samba de Raiz")  
**App reconstruído:** https://cavaquinho.nexoswebservices.com  
**Repositório local:** `c:\Users\renat\Downloads\Hamonico`  
**Data do levantamento inicial:** 2026-06-09  
**Última atualização:** 2026-07-03

---

## 1. Status Geral

**✅ 14 MÓDULOS LIVE — ÁUDIO, PARTITURA, ARPEJOS, IMPROVISOS, CIFRAS, PARTITURAS, CONTEÚDO EXPANDIDO + PROGRESSÕES AVANÇADAS**

| Fase | Feature | Status |
|---|---|---|
| 1 | Cifras + Favoritos + Repertórios | ✅ Live (576 cifras, 112 artistas, transposição, acordes clicáveis, play tab) |
| 2 | Análise Harmônica | ✅ Live (+ fluxo cifra→análise→progressões) |
| 3 | Progressões (unificada) | ✅ Live (campo harmônico c/ tensões + cadências + sequências + formação + ciclo de quintas) |
| 4 | Treino de Cadências | ✅ Live (9 padrões c/ exemplos de músicas, integrado em /progressoes) |
| 5 | Quiz | ✅ Live (10 tipos: graus, cadências, funções, tensões, SubV) |
| 6 | Meu Progresso (gamificação) | ✅ Live (em `/escola/meu-progresso`) |
| 7 | Análise Visual TheoryTab | ✅ Live (blocos coloridos por função) |
| 8 | Formação de Acordes + Sampler | ✅ Live (19 tipos, 3 formas, partitura VexFlow, som real cavaquinho) |
| 9 | Metrônomo + Afinador | ✅ Live (flutuante, acessível em todas as páginas) |
| 10 | Arpejos | ✅ Live (8 padrões + arpejos do campo harmônico, partitura + tablatura) |
| 11 | Improvisos | ✅ Live (12 escalas, 8 frases, backing tracks, braço inteiro) |
| 12 | Cifras Interativas | ✅ Live (transposição, acordes clicáveis, auto-scroll, play tab) |
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
**576 cifras** extraídas dos PDFs de cadernos musicais.
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
│       ├── cifras.json                  ← 576 cifras (extraídas dos PDFs)
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
│   │   ├── layout/Navbar.tsx                 ← 6 links: Escola | Cifras | Progressões | Arpejos | Improvisos | Análise
│   │   ├── ui/
│   │   │   ├── Metronomo.tsx                 ← Painel flutuante com tabs Metrônomo | Afinador
│   │   │   ├── Afinador.tsx                  ← Detecção de pitch via microfone (autocorrelação)
│   │   │   └── PlayButton.tsx                ← Botão play reutilizável (Web Audio)
│   │   ├── escola/
│   │   │   ├── EscolaSubNav.tsx
│   │   │   ├── ModuleGrid.tsx, ProgressBar.tsx, LessonActions.tsx
│   │   ├── cifras/
│   │   │   ├── ChordSheet.tsx                ← Acordes clicáveis, transposição, play tab, 212+ formatos
│   │   │   ├── ChordTooltip.tsx              ← Tooltip com braço + play ao clicar acorde
│   │   │   ├── CifraControls.tsx             ← Barra sticky: tom, fonte, auto-scroll
│   │   │   ├── CifraAnalise.tsx              ← TheoryTab: blocos coloridos por função
│   │   │   ├── CifraTabs.tsx                 ← Tabs Cifra | Análise + transposição compartilhada
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

### 6.3 Cifras Interativas — 576 músicas, 112 artistas
- **Base expandida:** extraídas de 2 PDFs (SAMBA RAIZ 319p + PAGODES ATUAIS 307p) via `scripts/extract-cifras.py`
- **Fontes:** Cartola, Clara Nunes, Alcione, Noel Rosa, Pixinguinha, Belo, Ferrugem, Thiaguinho, Turma do Pagode, Sorriso Maroto, Xande de Pilares...
- `/cifras` — **agrupadas por artista A-Z** com busca por música ou artista
- `/cifras/[id]` — **duas tabs**:
  - **Cifra**: ChordSheet com acordes clicáveis, controle de fonte
  - **Análise Harmônica**: visualização TheoryTab com blocos coloridos
- **Transposição de tom**: botões −/+ para transpor todos os acordes em tempo real, preservando espaçamento e qualidade. Botão "Original" para resetar. Análise Harmônica também transpõe.
- **Acordes clicáveis**: clique em qualquer acorde → tooltip com diagrama do braço do cavaquinho (BracoCavaquinho) + botão play com som real (sampler)
- **Auto-scroll**: botão toggle + slider de velocidade, para prática mãos-livres
- **Barra de controles sticky**: tom, tamanho de fonte, auto-scroll — fixa abaixo da navbar
- **Play nas tablaturas**: botão ▶ verde ao lado de cada linha de tablatura, toca as notas em sequência via sampler
- **Reconhecimento de 212+ formatos de acorde**: A7M, F#m7b5, E7#9, G7+, B5+7, Em7/-5, C#7/b9, etc.
- **Base limpa**: 576 cifras separadas (128 extraídas de concatenações), 21 símbolos soltos removidos

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

### Navbar principal (7 links)
| Link | Rota | Escopo |
|---|---|---|
| Escola | `/escola` | 28 lições em 4 módulos, Quiz (10 tipos), Meu Progresso |
| Cifras | `/cifras` | 576 cifras interativas com transposição, acordes clicáveis, play tab |
| Progressões | `/progressoes` | Campo harmônico c/ tensões, cadências, sequências, formação, ciclo de quintas (6 tabs) |
| Arpejos | `/arpejos` | 8 padrões + arpejos do campo harmônico, partitura, tablatura, play |
| Improvisos | `/improvisos` | 12 escalas, 8 frases, exercícios, backing tracks (4 tabs) |
| Partituras | `/partituras` | Ensino (6 lições + quiz), visualizador ABC, gerador cifra→partitura, exercícios (4 tabs) |
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
