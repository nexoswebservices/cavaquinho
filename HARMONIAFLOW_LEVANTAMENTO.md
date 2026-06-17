# Cavaquinho — Levantamento e Status do Projeto

**App original (Base44):** `69b2d3997a1398e7452d1d32` ("HarmoniaFlow" / "Samba de Raiz")  
**App reconstruído:** https://cavaquinho.nexoswebservices.com  
**Repositório local:** `c:\Users\renat\Downloads\Hamonico`  
**Data do levantamento inicial:** 2026-06-09  
**Última atualização:** 2026-06-17

---

## 1. Status Geral

**✅ TODAS AS 6 FASES IMPLEMENTADAS E DEPLOYADAS EM PRODUÇÃO**

| Fase | Feature | Status |
|---|---|---|
| 1 | Cifras + Favoritos + Repertórios | ✅ Live (estilo CifraClub) |
| 2 | Análise Harmônica | ✅ Live |
| 3 | Biblioteca (Campo Harmônico) | ✅ Live (progressões dinâmicas) |
| 4 | Treino de Cadências | ✅ Live |
| 5 | Quiz | ✅ Live (em `/escola/quiz`) |
| 6 | Meu Progresso (gamificação) | ✅ Live (em `/escola/meu-progresso`) |

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
| Deploy | Vercel (auto-deploy no push para `main`) |
| Domínio | `cavaquinho.nexoswebservices.com` |

---

## 3. Arquitetura de Dados (Prisma Schema atual)

### 3.1 `User`
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

### 3.2 `UserProgress`
Progresso nas lições da Escola.
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| userId | String |
| moduleId | String |
| lessonId | String |
| completed | Boolean (default: false) |
| completedAt | DateTime? |
| @@unique([userId, moduleId, lessonId]) | |

### 3.3 `Cifra`
**65 cifras** importadas do Base44.
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| titulo | String |
| artista | String? |
| tom | String? |
| conteudo | String (@db.Text) |
| progressao | String? (@db.Text) |
| createdAt | DateTime |

### 3.4 `CifraFavorito`
Favoritos por usuário.
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| userId | String |
| cifraId | String |
| createdAt | DateTime |
| @@unique([userId, cifraId]) | |

### 3.5 `Repertorio`
Setlists personalizados por usuário.
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| userId | String |
| nome | String |
| descricao | String? |
| cor | String (default: "violet") |
| emoji | String (default: "🎵") |
| createdAt / updatedAt | DateTime |

### 3.6 `RepertorioItem`
Cifras dentro de um repertório, com ordem.
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| repertorioId | String |
| cifraId | String |
| ordem | Int (default: 0) |
| @@unique([repertorioId, cifraId]) | |

---

## 4. Estrutura de Arquivos

```
Hamonico/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── data/
│       ├── cifras.json     ← 65 cifras exportadas do Base44
│       └── cifras.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── cadastro/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx                    ← Navbar (sem auth gate)
│   │   │   ├── escola/page.tsx               ← Dashboard + sub-nav
│   │   │   ├── escola/[modulo]/page.tsx
│   │   │   ├── escola/[modulo]/[licao]/page.tsx
│   │   │   ├── escola/quiz/page.tsx          ← Quiz (dentro da Escola)
│   │   │   ├── escola/meu-progresso/page.tsx ← XP, nível, conquistas
│   │   │   ├── cifras/page.tsx
│   │   │   ├── cifras/[id]/page.tsx
│   │   │   ├── cifras/repertorios/page.tsx
│   │   │   ├── cifras/repertorios/[id]/page.tsx
│   │   │   ├── analise/page.tsx
│   │   │   ├── biblioteca/page.tsx           ← "use client", progressões dinâmicas
│   │   │   ├── cadencias/page.tsx
│   │   │   ├── quiz/page.tsx                 ← redirect → /escola/quiz
│   │   │   └── estudos/page.tsx              ← redirect → /escola/meu-progresso
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── auth/register/route.ts
│   │   │   ├── progress/route.ts
│   │   │   ├── cifras/[id]/favorito/route.ts
│   │   │   ├── repertorios/route.ts
│   │   │   ├── repertorios/[id]/route.ts
│   │   │   └── repertorios/[id]/itens/route.ts
│   │   ├── layout.tsx, page.tsx, providers.tsx, globals.css
│   ├── components/
│   │   ├── layout/Navbar.tsx                 ← Nav simplificado (5 links)
│   │   ├── escola/
│   │   │   ├── EscolaSubNav.tsx              ← Tabs: Lições | Quiz | Meu Progresso
│   │   │   ├── ModuleGrid.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── LessonActions.tsx             ← Suporta isLoggedIn prop
│   │   ├── cifras/
│   │   │   ├── ChordSheet.tsx                ← Estilo CifraClub + controle de fonte
│   │   │   ├── CifraList.tsx
│   │   │   ├── CifraFavoriteButton.tsx
│   │   │   ├── AddToRepertorioButton.tsx
│   │   │   ├── NovoRepertorioForm.tsx
│   │   │   ├── DeleteRepertorioButton.tsx
│   │   │   └── RepertorioItens.tsx
│   │   ├── analise/
│   │   │   └── AnalisadorHarmonico.tsx
│   │   ├── biblioteca/
│   │   │   └── CampoHarmonico.tsx            ← Recebe nota/mode via props
│   │   ├── cadencias/
│   │   │   └── TreinoCadencias.tsx
│   │   └── quiz/
│   │       └── QuizGame.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── escola-content.ts    ← 24 lições (conteúdo adaptado ao cavaquinho)
│   │   ├── markdown.ts          ← Parser MD sem dependências
│   │   ├── teoria.ts            ← Engine de teoria musical
│   │   └── quiz.ts              ← Gerador de perguntas
│   └── types/
│       ├── index.ts
│       └── next-auth.d.ts
├── .env.local                   ← Placeholder (não versionado)
├── .env.production.local        ← Credenciais reais Hostinger (não versionado)
├── package.json
├── next.config.mjs
└── tailwind.config.ts
```

---

## 5. Funcionalidades Implementadas

### 5.1 Autenticação (modo público ativo)
- `/login` e `/cadastro` com email + senha (bcryptjs)
- NextAuth v4 (JWT), role: `admin` | `user`
- **Modo público temporário:** Rotas `(app)/*` acessíveis sem login
  - Conteúdo visível para todos (escola, cifras, biblioteca, quiz, análise, cadências)
  - Ações de usuário (favoritar, repertórios, marcar lição) requerem login
  - Botões de ação redirecionam para `/login` se não autenticado
  - Navbar mostra "Entrar" para visitantes anônimos, "Sair" + nome para logados
- APIs mantêm 401 para requests sem session

### 5.2 Escola de Música
- **4 módulos, 24 lições** de teoria musical aplicada ao **cavaquinho**/samba:
  - **Escalas** (6 lições): conceito, Maior, Menor Natural, Pentatônica Maior e Menor, Modos Gregos
  - **Acordes** (6 lições): Tríades, Tétrades/7ªs, Diminutos/Aumentados, Extendidos, Inversões, Campo Harmônico
  - **Cadências** (5 lições): conceito, Autêntica V-I, Plagal IV-I, Interrompida V-vi, ii-V-I
  - **Harmonia** (6 lições): Campo Maior, Campo Menor, Empréstimo Modal, Dominantes Secundários, Progressões no Pagode, Análise Aplicada
- Conteúdo em Markdown renderizado por parser próprio (sem biblioteca externa)
- **Tablaturas de 4 cordas** (afinação D-G-B-D do cavaquinho) — sem referências a violão
- Barra de progresso por módulo + progresso geral
- Botão "Marcar como concluída" persiste no banco via `POST /api/progress` (requer login)
- Navegação prev/next entre lições
- **Sub-navegação consolidada**: tabs Lições | Quiz | Meu Progresso via `EscolaSubNav`

### 5.3 Cifras (Fase 1) — Estilo CifraClub
- **65 cifras** importadas do Base44 (Pagode/Samba/Funk Carioca), seedadas na DB
- `/cifras` — lista com busca em tempo real (título/artista), seção "⭐ Favoritas" no topo, contagem
- `/cifras/[id]` — exibição com `ChordSheet` reformulado:
  - **Acordes posicionados acima das letras** (detecta pares acorde+letra)
  - Acordes standalone (intros, pontes) em violeta
  - Seções ([Intro], [Refrão]) como headers estilizados com borda
  - Linhas de tablatura em verde (emerald)
  - **Controle de tamanho de fonte** (+/−, range 10-22px)
  - Layout limpo: fundo `#0d0920`, espaçamento generoso, rounded-2xl
- Botão favoritar (☆/★) persiste via `POST/DELETE /api/cifras/[id]/favorito` (requer login)
- Dropdown "+ Repertório" (requer login) — visitantes veem link "Entrar para favoritar"
- Breadcrumb, badge de tom, link Meus repertórios

### 5.4 Repertórios (Fase 1)
- `/cifras/repertorios` — lista em cards coloridos (7 cores, emoji personalizável), contagem de músicas
- Formulário inline "Novo repertório" com emoji, nome, descrição, seletor de cor (dots coloridos)
- Botão excluir com confirmação nativa
- `/cifras/repertorios/[id]` — lista ordenável com botões ▲/▼ (PATCH `/api/repertorios/[id]/itens`) e ✕ por música

### 5.5 Análise Harmônica (Fase 2) — `src/lib/teoria.ts`
- `/analise` — textarea livre + botão Analisar (Ctrl+Enter)
- Engine client-side: parse de acordes brasileiros (m7(5-), 7M, 7+, º, ø, 6(9), aug, sus, slash), scoring de 24 tonalidades (12 maior + 12 menor)
- Top 6 tonalidades como botões clicáveis com % de confiança, selecionável
- Tabela de graus: acorde original → grau (I, ii, V7, viiº, V7/vi...) → função (Tônica, Dominante, Dominante secundária, Empréstimo modal...)
- Detecção de cadências: ii-V7-I, V7-I, IV-I, V7-vi, andaluza, etc.
- Botão "Carregar exemplo" (Nos Braços da Batucada)

### 5.6 Biblioteca (Fase 3) — Progressões Dinâmicas
- `/biblioteca` — página `"use client"`, referência rápida em três seções interligadas:
  1. **Campo Harmônico interativo**: 12 notas × maior/menor → 7 acordes diatônicos coloridos por função (Tônica = violeta, Subdominante = sky, Dominante = âmbar)
  2. **Progressões comuns do samba/pagode**: 8 padrões com graus — **exemplos transpostos automaticamente** para a tonalidade selecionada (ex: selecionar G → "Em G: G – C – D7 – G")
  3. **Tabela de graus**: nome, função e **exemplo no tom selecionado** (atualiza dinamicamente)
- Estado `nota`/`mode` compartilhado entre as 3 seções (controlado pelo componente pai)
- `CampoHarmonico.tsx` recebe `nota`/`mode`/`onNotaChange`/`onModeChange` como props
- Função `buildExemplo()` usa `campoHarmonico()` de `teoria.ts` para transpor progressões

### 5.7 Treino de Cadências (Fase 4)
- `/cadencias` — drill client-side, zero DB
- 8 padrões de progressão: ii-V7-I, I-IV-V7-I, I-vi-IV-V, I-V-vi-IV, I-I7-IV-IVm, i-VII-VI-V7, i-iv-V7-i, I-bVII-IV-I
- 12 tonalidades clicáveis + botão **Embaralhar** (tonalidade + progressão aleatórios)
- Mostra os acordes reais calculados para a tonalidade selecionada
- Descrição didática + dica de prática por padrão
- Campo harmônico completo da tonalidade inline como referência

### 5.8 Quiz (Fase 5)
- `/escola/quiz` — 10 perguntas geradas dinamicamente por `src/lib/quiz.ts`
- 7 tipos de questão gerados com parâmetros aleatórios: V7, ii, IV, vi, qual grau é X, completar campo, identificar cadência
- 4 opções múltipla escolha, feedback imediato (verde/vermelho), explicação didática
- Barra de progresso + contagem de acertos durante o jogo
- Tela de resultado com estrelas (≥90% = 3, ≥70% = 2, ≥50% = 1), resumo de cada pergunta, botão "Jogar novamente"
- Acessível via sub-nav da Escola (tab "Quiz")

### 5.9 Meu Progresso / Gamificação (Fase 6)
- `/escola/meu-progresso` — XP e nível calculados do `UserProgress` existente (sem colunas novas no banco)
- **15 XP por lição** concluída; **100 XP = 1 nível**
- Ranks: Iniciante (1-2), Aprendiz (3-5), Músico (6-9), Mestre (10+)
- Barra de progresso para o próximo nível
- Sugestão de "próxima lição" não concluída com botão "Estudar agora"
- Módulos com estrelas (0-3) e barra individual
- 6 conquistas: Primeiro Acorde, Em Ritmo, Módulo Completo, Harmonia Total, Mestre do Cavaquinho, Cifrador
- Acessível via sub-nav da Escola (tab "Meu Progresso")
- Exibe mensagem "Faça login para acompanhar seu progresso" para visitantes anônimos

---

## 6. Navegação

### Navbar principal (5 links)
| Link | Rota | Escopo |
|---|---|---|
| Escola | `/escola` | Lições, Quiz, Meu Progresso (com sub-nav) |
| Cifras | `/cifras` | Cifras, favoritos, repertórios |
| Análise | `/analise` | Analisador harmônico |
| Biblioteca | `/biblioteca` | Campo harmônico, progressões, graus |
| Cadências | `/cadencias` | Treino de progressões |

### Sub-nav da Escola (tabs)
| Tab | Rota |
|---|---|
| Lições | `/escola` |
| Quiz | `/escola/quiz` |
| Meu Progresso | `/escola/meu-progresso` |

### Rotas completas

| Rota | Tipo | Descrição |
|---|---|---|
| `/login` | server | Formulário de login |
| `/cadastro` | server | Formulário de cadastro |
| `/escola` | server + DB | Dashboard com módulos, progresso e sub-nav |
| `/escola/[modulo]` | server + DB | Lista de lições do módulo |
| `/escola/[modulo]/[licao]` | server + DB | Conteúdo da lição + marcar concluída |
| `/escola/quiz` | client-only | Quiz de teoria musical |
| `/escola/meu-progresso` | server + DB | XP, nível, conquistas |
| `/cifras` | server + DB | Lista com busca e favoritos |
| `/cifras/[id]` | server + DB | Cifra estilo CifraClub + favoritar + repertório |
| `/cifras/repertorios` | server + DB | Meus repertórios + criar novo |
| `/cifras/repertorios/[id]` | server + DB | Detalhes + reordenar + remover músicas |
| `/analise` | client-only | Analisador harmônico livre |
| `/biblioteca` | client-only | Campo harmônico + progressões dinâmicas + graus |
| `/cadencias` | client-only | Drill de progressões por tonalidade |
| `/quiz` | redirect | → `/escola/quiz` |
| `/estudos` | redirect | → `/escola/meu-progresso` |

### API Routes
| Rota | Métodos | Auth | Descrição |
|---|---|---|---|
| `/api/auth/[...nextauth]` | NextAuth | — | Login/session |
| `/api/auth/register` | POST | — | Cadastro |
| `/api/progress` | GET, POST | 401 sem login | Progresso nas lições |
| `/api/cifras/[id]/favorito` | POST, DELETE | 401 sem login | Favoritar/desfavoritar |
| `/api/repertorios` | GET, POST | 401 sem login | Listar/criar repertórios |
| `/api/repertorios/[id]` | DELETE | 401 sem login | Excluir repertório |
| `/api/repertorios/[id]/itens` | POST, DELETE, PATCH | 401 sem login | Adicionar/remover/reordenar músicas |

---

## 7. Banco de Dados (Produção)

- **Host:** `srv1804.hstgr.io:3306`
- **DB:** `u828037891_cavaquinho`
- **Tabelas criadas:** User, UserProgress, Cifra, CifraFavorito, Repertorio, RepertorioItem
- **65 cifras** seedadas com conteúdo completo
- **Admin seed:** `admin@harmoniaflow.com` / `admin123`

### Comandos para replicar (local ou produção)
```bash
# Aplicar schema
DATABASE_URL="..." npx prisma db push

# Popular cifras (seed)
DATABASE_URL="..." npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

---

## 8. Banco de Cifras (65 músicas)

### Distribuição por Artista

| Artista | Qtde |
|---|---|
| BOM GOSTO | 8 |
| BELO | 8 |
| BOKALOKA | 6 |
| GRUPO CLAREOU / GRUPO CLAREU | 6 |
| DILSINHO | 5 |
| Alexandre Pires / ALEXANDRE PIRES | 5 |
| CHININHA E PRINCIPE | 4 |
| DIOGO NOGUEIRA | 3 |
| Atitude 67 / ATITUDE 67 | 3 |
| Arlindo Cruz | 1 |
| BELELEU | 1 |
| TIA NASTÁCIA | 1 |
| Sem artista identificado | 4 |

### Distribuição por Tom

| Tom | Qtde |
|---|---|
| C | 11 |
| D | 6 |
| F | 6 |
| G | 6 |
| A | 5 |
| E | 5 |
| D# | 3 |
| A# | 3 |
| Eb / B7+ / C7+ / C# / Em | 1 cada |
| Sem tom | 4 |

---

## 9. `src/lib/teoria.ts` — Engine de Teoria Musical

Módulo client-side reutilizado em `/analise`, `/biblioteca` e `/cadencias`.

### Funções exportadas
| Função | Descrição |
|---|---|
| `parseChord(token)` | Parseia acorde brasileiro → `{root, quality, original}` |
| `parseProgression(text)` | Tokeniza texto livre → array de `Chord` |
| `detectKey(chords)` | Scoring em 24 tonalidades → `KeyResult[]` ordenado por score |
| `analyzeDegrees(chords, key)` | Graus, função e diatônico/não-diatônico por acorde |
| `detectCadences(degrees)` | Detecta padrões ii-V-I, V7-I, IV-I, deceptiva, etc. |
| `campoHarmonico(root, mode)` | 7 acordes diatônicos com grau, exemplo e label |
| `normNote(n)` | Normaliza enarmônicos para sustenidos (Bb→A#, Eb→D#...) |

### Qualidades suportadas
`M` (maior), `m` (menor), `d7` (dominante 7ª), `dim` (diminuto), `hdim` (meio-dim / ø), `aug` (aumentado), `sus` (suspensa)

### Notações brasileiras reconhecidas
`m7(5-)`, `7M`, `7+`, `º`, `ø`, `aug`, `6(9)`, `7(5+)`, `7(13-)`, `/bass` (slash chords ignoram o baixo)

---

## 10. Itens Pendentes / Revisões

### Funcionalidades não implementadas
- **Transposição de tom** nas cifras (muda `tom` e transpõe acordes do `conteudo`)
- **Painel Admin** (CRUD de cifras e usuários)
- **Área de Usuário** (perfil, trocar senha)
- **Campo `progressao`** das cifras (campo nulo no Base44 — precisaria ser preenchido manualmente ou auto-extraído do `conteudo`)
- **HookTheory-style features** (referência salva): visualização TheoryTab de progressões sobre cifras, Hookpad-style editor de progressões adaptado ao cavaquinho
- **Reativar login** após avaliação da comunidade

### Revisões aplicadas (2026-06-17)
- **Login desativado temporariamente** — modo read-only público para avaliação da comunidade. Favoritos, repertórios e progresso requerem login.
- **Biblioteca dinâmica** — progressões e tabela de graus atualizam conforme tonalidade selecionada no campo harmônico.
- **Escola consolidada** — Quiz e Meu Progresso agora são sub-abas de `/escola` (com sub-nav). Rotas antigas `/quiz` e `/estudos` redirecionam.
- **Conteúdo adaptado ao cavaquinho** — tablaturas convertidas de 6 cordas (violão) para 4 cordas (D-G-B-D). Referências a "violão" substituídas por "cavaquinho".
- **Cifras estilo CifraClub** — ChordSheet reformulado: acordes posicionados acima das letras, seções estilizadas, tabs em destaque, controle de tamanho de fonte.
- **Navbar simplificado** — 5 links (Escola, Cifras, Análise, Biblioteca, Cadências) + Entrar/Sair.
- **Referência HookTheory** — salva para implementação futura (TheoryTab + Hookpad adaptados ao cavaquinho).

---

## 11. Credenciais e Acessos

| Recurso | Valor |
|---|---|
| App live | https://cavaquinho.nexoswebservices.com |
| Admin | admin@harmoniaflow.com / admin123 |
| DB host | srv1804.hstgr.io:3306 / u828037891_cavaquinho |
| Vercel | deploy automático no push para `main` |
| Branch atual | `main` |
