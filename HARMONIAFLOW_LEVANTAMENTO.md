# HarmoniaFlow — Levantamento Completo para Reconstrução

**App original:** https://outstanding-master-chord-flow.base44.app  
**Plataforma atual:** Base44  
**Destino de reconstrução:** Hostinger  
**Data do levantamento:** 2026-06-09  
**App ID Base44:** `69b2d3997a1398e7452d1d32`

---

## 1. Visão Geral do Produto

O **HarmoniaFlow** é uma plataforma web para músicos com dois pilares principais:

1. **Escola de Música Online** — Módulos de aprendizado com lições teóricas sobre escalas, acordes, cadências e harmonia, com rastreamento de progresso por usuário.
2. **Biblioteca de Cifras** — Banco de cifras (letra + acordes) de músicas do gênero Pagode/Samba/Funk Carioca, com busca, favoritos e organização em repertórios.

---

## 2. Arquitetura de Dados (Entidades)

### 2.1 `UserProgress` — Progresso do Aluno
Rastreia quais lições cada usuário concluiu.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `module_id` | string | ✅ | ID do módulo (ex: `escalas`, `acordes`) |
| `lesson_id` | string | ✅ | ID da lição (ex: `esc-1`, `ac-6`) |
| `completed` | boolean | — | Padrão: `false` |
| `completed_at` | datetime | — | Timestamp da conclusão |

---

### 2.2 `Cifra` — Cifras Musicais
O core do app. **50 cifras cadastradas** (Pagode/Samba/Funk).

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `titulo` | string | ✅ | Nome da música |
| `artista` | string | ✅ | Nome do artista/banda |
| `tom` | string | — | Tom da cifra (ex: `C`, `G`, `D#`) |
| `conteudo` | string | — | Texto completo com letra e acordes |
| `progressao` | string | — | Acordes extraídos para análise (atualmente nulo em todas) |

---

### 2.3 `CifraFavorito` — Favoritos do Usuário
Lista de cifras favoritadas por cada usuário (relação usuário ↔ cifra).

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `cifra_id` | string | ✅ | Referência ao ID da cifra |
| `titulo` | string | ✅ | Título (desnormalizado para display rápido) |
| `artista` | string | — | Artista (desnormalizado) |
| `tom` | string | — | Tom (desnormalizado) |

---

### 2.4 `Repertorio` — Repertórios / Setlists
Permite ao usuário montar listas de músicas para shows/ensaios.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `nome` | string | ✅ | Nome do repertório |
| `descricao` | string | — | Contexto (ex: "Show de samba, roda de choro") |
| `cifras` | array de objetos | — | Lista de cifras com `cifra_id`, `titulo`, `artista`, `tom`, `ordem` |
| `cor` | enum | — | Cor visual: `indigo`, `rose`, `amber`, `emerald`, `sky`, `violet`, `orange` |
| `emoji` | string | — | Emoji representativo do repertório |

---

### 2.5 `User` — Usuários do App
Sistema de autenticação com dois papéis.

| Campo | Tipo | Valores |
|---|---|---|
| `role` | enum | `admin` \| `user` |
| `email` | string | — |
| `full_name` | string | — |

**Usuários registrados (2):**
- `renato.fonseca.alves@gmail.com` — role: **admin**
- `comerciolc29@gmail.com` — role: **user** (cadastrado em 09/04/2026)

---

## 3. Módulos de Aprendizado

Identificados pelo padrão de IDs nos registros de `UserProgress`:

| Módulo ID | Nome | Lições identificadas |
|---|---|---|
| `escalas` | Escalas | `esc-1`, `esc-2`, `esc-6` (mín. 6 lições) |
| `acordes` | Acordes | `ac-6` (mín. 6 lições) |
| `cadencias` | Cadências | `cad-1`, `cad-5` (mín. 5 lições) |
| `harmonia` | Harmonia | `har-6` (mín. 6 lições) |

> O conteúdo das lições estava hardcoded no frontend do Base44 (não em banco de dados), então precisa ser recriado.

---

## 4. Banco de Cifras (50 músicas cadastradas)

### Distribuição por Artista

| Artista | Qtde |
|---|---|
| BELO | 8 |
| GRUPO CLAREOU | 6 |
| DILSINHO | 5 |
| Alexandre Pires | 5 |
| BOM GOSTO | 5 |
| BOKALOKA | 5 |
| DIOGO NOGUEIRA | 3 |
| CHININHA E PRÍNCIPE | 3 |
| Arlindo Cruz | 1 |
| Atitude 67 | 1 |
| BELELEU | 1 |
| TIA NASTÁCIA | 1 |
| Sem artista | 4 |

### Distribuição por Tom

| Tom | Qtde |
|---|---|
| C | 10 |
| F | 7 |
| G | 6 |
| A | 5 |
| D | 5 |
| E | 5 |
| D# | 3 |
| A# | 2 |
| C# | 1 |
| C7+ | 1 |
| Sem tom | 5 |

### Lista Completa das 50 Cifras

| # | Título | Artista | Tom |
|---|---|---|---|
| 1 | Nos Braços da Batucada | Arlindo Cruz | C |
| 2 | Tá na Hora do Sol Nascer | GRUPO CLAREOU | A |
| 3 | Presente do Destino | DILSINHO | D |
| 4 | Piquenique | DILSINHO | A |
| 5 | Flor de Lis | GRUPO CLAREU | C |
| 6 | Ela Me Disse | GRUPO CLAREOU | D# |
| 7 | Dona dos Meus Sonhos | GRUPO CLAREOU | D# |
| 8 | A Voz do Morro | DIOGO NOGUEIRA | A |
| 9 | Papo de Futuro | DILSINHO | F |
| 10 | Quem Vai Chorar Sou Eu | DIOGO NOGUEIRA | E |
| 11 | Desacreditei | — | G |
| 12 | Força Maior | DIOGO NOGUEIRA | F |
| 13 | Filho da Luz | GRUPO CLAREOU | G |
| 14 | O Cara Certo | DILSINHO | G |
| 15 | Dá pra Saber | DILSINHO | F |
| 16 | E Tudo | BELO | D |
| 17 | Imaginação | BELO | C |
| 18 | Eu tenho medo, mas desejo você | — | — |
| 19 | Minha Sina | BOKALOKA | — |
| 20 | Sacanagem Dela | BOM GOSTO | D |
| 21 | 18 Quilates | BOM GOSTO | F |
| 22 | Saideira | — | C7+ |
| 23 | Vi Amor no Seu Olhar | BELO | E |
| 24 | Delírios de Amor | Alexandre Pires | A# |
| 25 | Eu Sou o Samba | Alexandre Pires | C# |
| 26 | Pode Chorar | ALEXANDRE PIRES | C |
| 27 | Shortinho Saint-Tropez | BOKALOKA | F |
| 28 | Desengano | BOKALOKA | C |
| 29 | Agora Perdeu | BOM GOSTO | D |
| 30 | Justiceiro | CHININHA E PRÍNCIPE | D |
| 31 | Buscas e Tares | BELO | F |
| 32 | Patricinha do Olho Azul | BOM GOSTO | E |
| 33 | Minha Fantasia | Alexandre Pires | — |
| 34 | Mundo de Oz | BELO | C |
| 35 | Só Penso no Lar | GRUPO CLAREOU | D# |
| 36 | Valeu pra Aprender | GRUPO CLAREOU | C |
| 37 | Barraqueira | Alexandre Pires | C |
| 38 | De Onde Eu Venho | — | A |
| 39 | Duble de Namorado | CHININHA E PRÍNCIPE | G |
| 40 | Balacobaco | TIA NASTÁCIA | A |
| 41 | Jeito Carinhoso | BOM GOSTO | A# |
| 42 | Londres | CHININHA E PRÍNCIPE | G |
| 43 | Coisas da Vida | BELO | G |
| 44 | Não Foi a Toa | BELO | C |
| 45 | Tá Pensando que Eu Estou de Bobeira | — | F |
| 46 | Que Situação | BOKALOKA | E |
| 47 | Até Me Afogar | BELELEU | — |
| 48 | Casal do Ano Pultão | Atitude 67 | E |
| 49 | Vício | BELO | C |
| 50 | Ela Mexe Comigo | BOKALOKA | — |

---

## 5. Funcionalidades do Sistema

### 5.1 Autenticação
- Login/cadastro com email e senha
- Dois níveis de acesso: **admin** e **user**
- Admin: acesso ao painel de gerenciamento de cifras e usuários
- User: acesso à escola e biblioteca de cifras

### 5.2 Escola de Música (Módulos + Lições)
- 4 módulos: Escalas, Acordes, Cadências, Harmonia
- Cada módulo tem ~6 lições (conteúdo teórico/interativo)
- Botão "Marcar como concluído" por lição
- Barra de progresso por módulo (% de lições concluídas)
- Progresso salvo por usuário no banco

### 5.3 Biblioteca de Cifras
- Listagem de todas as cifras com busca por título/artista
- Filtro por tom
- Visualização da cifra completa (letra + acordes formatados)
- Botão de favoritar/desfavoritar cifra
- Indicador de tom com botão de transposição (presumido pelo campo `tom`)

### 5.4 Favoritos
- Lista pessoal de cifras favoritas por usuário
- Acesso rápido às cifras mais usadas

### 5.5 Repertórios / Setlists
- Criar repertórios nomeados com cor e emoji
- Adicionar/remover cifras ao repertório
- Ordenar músicas dentro do repertório (campo `ordem`)
- Múltiplos repertórios por usuário (ex: "Show de samba", "Roda de choro")

---

## 6. Stack Tecnológica Recomendada para Hostinger

### Frontend
- **React** (Vite) ou **Next.js 14** (App Router)
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes (consistente com o estilo Base44)

### Backend / API
- **Next.js API Routes** (se usar Next.js) — mais simples para Hostinger
- Ou **Node.js + Express** separado

### Banco de Dados
- **MySQL** (incluído nos planos Hostinger) para dados relacionais
- Ou **PlanetScale / Supabase** (PostgreSQL) se preferir gerenciado

### Autenticação
- **NextAuth.js** com credentials provider
- Ou **Clerk** (mais fácil de implementar)

### Hospedagem no Hostinger
- Plano **Business** ou superior (suporta Node.js)
- Ou **VPS** para mais controle
- Deploy via Git (GitHub Actions → Hostinger)

---

## 7. Estrutura de Páginas Sugerida

```
/                        → Landing page / Home
/login                   → Login
/cadastro                → Cadastro
/escola                  → Lista de módulos com progresso
/escola/[modulo]         → Lições do módulo
/escola/[modulo]/[licao] → Conteúdo da lição
/cifras                  → Biblioteca de cifras (busca + filtros)
/cifras/[id]             → Visualização da cifra
/favoritos               → Cifras favoritas do usuário
/repertorios             → Lista de repertórios
/repertorios/[id]        → Visualização/edição do repertório
/admin                   → Painel admin
/admin/cifras            → CRUD de cifras
/admin/usuarios          → Gerenciamento de usuários
```

---

## 8. Prioridades de Reconstrução

| Prioridade | Feature | Complexidade |
|---|---|---|
| 1 | Autenticação (login/cadastro/roles) | Média |
| 2 | Biblioteca de Cifras (listagem + busca + visualização) | Baixa |
| 3 | Sistema de Favoritos | Baixa |
| 4 | Módulos de Aprendizado (conteúdo + progresso) | Alta |
| 5 | Repertórios / Setlists | Média |
| 6 | Painel Admin (CRUD cifras) | Média |
| 7 | Transposição de tom | Alta |

---

## 9. Dados para Migração

- **50 cifras** com conteúdo completo — exportar do Base44 via API antes de encerrar
- **2 usuários** ativos
- **7 registros de progresso** (apenas do admin Renato)
- **Conteúdo das lições** — precisa ser recuperado do frontend Base44 (não está no banco)

### Script de exportação das cifras (Base44 API)
Antes de migrar, exportar as 50 cifras completas via query:
```
Entity: Cifra
Fields: titulo, artista, tom, conteudo, progressao
Limit: 500
```

---

## 10. Observações Finais

- O app estava com **status "error"** no Base44 na data do levantamento — pode estar quebrado
- O campo `progressao` de todas as cifras está **nulo** — provavelmente feature não implementada
- **Repertórios** estão vazios — funcionalidade cadastrada mas não utilizada
- O conteúdo das lições da escola (textos, vídeos, exercícios) está **hardcoded no frontend** do Base44 e precisa ser recuperado acessando o app diretamente
- Gênero musical: foco total em **Pagode / Samba / Funk Carioca** brasileiro

### Referências
- https://hookpad.hooktheory.com/
- https://www.hooktheory.com/theorytab

---

## 11. Status da Reconstrução

**Iniciado em:** 2026-06-09 | **Local:** `c:\Users\renat\Downloads\Hamonico`

### Stack escolhida
- **Next.js 14** (App Router) com `output: "standalone"` (ideal para deploy Node.js no Hostinger)
- **Tailwind CSS** — tema escuro customizado (`#0a0714` / `#120d24`, acentos violeta/indigo/emerald/rose)
- **MySQL** via **Prisma ORM**
- **NextAuth v4** (Credentials Provider + Prisma Adapter, sessão JWT)

### ✅ Já implementado — Módulo "Escola de Música" (foco inicial)

**Banco de dados (`prisma/schema.prisma`)**
- `User` (id, name, email, password, role: admin/user)
- `UserProgress` (userId, moduleId, lessonId, completed, completedAt) — único por (user, módulo, lição)
- Seed inicial cria admin: `admin@harmoniaflow.com` / `admin123`

**Autenticação**
- `/login` e `/cadastro` com formulários funcionais
- `/api/auth/[...nextauth]` (NextAuth) e `/api/auth/register`
- Rotas do app protegidas via `(app)/layout.tsx` (redireciona para `/login` se não autenticado)

**Escola de Música — conteúdo 100% escrito**
- 4 módulos completos com **24 lições** de teoria musical aplicada (`src/lib/escola-content.ts`):
  - **Escalas** (6 lições): conceito de escalas, Maior/Jônica, Menor Natural, Pentatônica Maior, Pentatônica Menor, Modos Gregos
  - **Acordes** (6 lições): Tríades, Tétrades/7ªs, Diminutos/Aumentados, Estendidos (9/11/13), Inversões, Campo Harmônico
  - **Cadências** (5 lições): O que é cadência, Autêntica (V-I), Plagal (IV-I), Interrompida (V-vi), II-V-I (turnaround)
  - **Harmonia** (6 lições): Campo Maior, Campo Menor, Empréstimo Modal, Dominantes Secundários, Progressões no Pagode/Samba, Análise Aplicada
- Cada lição tem: conteúdo em Markdown (renderizado sem dependências externas via `src/lib/markdown.ts`), dicas práticas e acordes de exemplo

**Páginas funcionais**
- `/escola` — dashboard com os 4 módulos, progresso geral e por módulo
- `/escola/[modulo]` — lista de lições com indicador de concluída/próxima
- `/escola/[modulo]/[licao]` — conteúdo da lição + botão "marcar como concluída" + navegação prev/next

**API**
- `GET/POST /api/progress` — lê e grava progresso do usuário autenticado

**Build**
- `npm run build` passou 100% limpo (Next.js 14.2.20, TypeScript sem erros)

### ⏳ Pendente (próximas etapas)
1. **Configurar banco MySQL real** no `.env.local` (atualmente placeholder) e rodar `npm run db:push` + `npm run db:seed`
2. **Testar fluxo completo no navegador** (cadastro → login → escola → marcar lição)
3. **Biblioteca de Cifras** (`/cifras`) — migrar as 50 cifras do Base44 (entidade `Cifra`)
4. **Favoritos** (`/favoritos`) — entidade `CifraFavorito`
5. **Repertórios** (`/repertorios`) — entidade `Repertorio` (vazia no Base44, criar do zero)
6. **Painel Admin** (`/admin`) — CRUD de cifras e usuários
7. **Transposição de tom** nas cifras
8. **Deploy no Hostinger** — usar a saída `.next/standalone`, configurar MySQL e variáveis de ambiente (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)

### Estrutura de arquivos criada
```
Hamonico/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/cadastro/page.tsx
│   │   ├── (app)/layout.tsx
│   │   ├── (app)/escola/page.tsx
│   │   ├── (app)/escola/[modulo]/page.tsx
│   │   ├── (app)/escola/[modulo]/[licao]/page.tsx
│   │   ├── api/auth/[...nextauth]/route.ts
│   │   ├── api/auth/register/route.ts
│   │   ├── api/progress/route.ts
│   │   ├── layout.tsx, page.tsx, providers.tsx, globals.css
│   ├── components/
│   │   ├── escola/ModuleGrid.tsx
│   │   ├── escola/ProgressBar.tsx
│   │   └── escola/LessonActions.tsx
│   │   └── layout/Navbar.tsx
│   ├── lib/
│   │   ├── auth.ts, db.ts, escola-content.ts, markdown.ts
│   └── types/index.ts, next-auth.d.ts
├── package.json, next.config.mjs, tailwind.config.ts, .env.local
```

---

## 12. Feature Proposta: Progressões Interativas (inspirado no Hooktheory)

O **Hookpad** e o **TheoryTab** (Hooktheory) são ferramentas que permitem montar progressões de acordes visualmente, ver a análise em **numerais romanos** e ouvir o resultado tocado. Essa ideia se encaixa perfeitamente no módulo de **Harmonia/Cadências** já escrito (que ensina campo harmônico, cadências e numerais romanos).

### Proposta para o HarmoniaFlow

**12.1 Construtor de Progressões (`/escola/progressoes` ou widget dentro das lições)**
- Grid de acordes do campo harmônico (I, ii, iii, IV, V, vi, vii°) por tom selecionado
- Usuário clica para montar uma sequência (ex: I - vi - IV - V)
- Reprodução em áudio via **Web Audio API** (sem dependências externas — osciladores simples simulando piano/violão)
- Exibe simultaneamente: numerais romanos, cifras no tom escolhido, e nome funcional (Tônica/Subdominante/Dominante)
- Botão "Transpor" — muda o tom e recalcula as cifras automaticamente

**12.2 Análise Automática de Cifras (aplicado à Biblioteca de Cifras)**
- Ao abrir uma cifra, detectar o tom (campo `tom` já existe) e converter os acordes do `conteudo` em numerais romanos
- Exibe, junto da cifra, a "assinatura harmônica" (ex: "I - vi - ii - V7" para o refrão)
- Aproveita diretamente o conteúdo teórico do módulo Harmonia — vira prática aplicada

**12.3 Exercício interativo nas lições de Cadências/Harmonia**
- Nas lições `cad-*` e `har-*`, adicionar um mini player com a progressão de exemplo já tocando (ex: ouvir Dm7→G7→Cmaj7 do II-V-I)
- Reforça o aprendizado teórico com áudio imediato

### Complexidade e prioridade
| Item | Complexidade | Prioridade sugerida |
|---|---|---|
| Construtor de progressões com áudio (12.1) | Alta | Após Cifras e Favoritos |
| Análise automática de cifras (12.2) | Alta (parsing de cifras é não-trivial) | Fase 2 |
| Player de exemplos nas lições (12.3) | Média | Pode entrar já na Escola (reaproveita conteúdo existente) |

### Stack técnica
- **Web Audio API** (nativa do navegador, zero custo, zero dependência)
- Tabela de frequências das notas (já documentado: fórmulas de escalas/acordes nos módulos Escalas e Acordes)
- Lógica de campo harmônico por tom (já documentada na seção Harmonia → Campo Harmônico Maior/Menor)