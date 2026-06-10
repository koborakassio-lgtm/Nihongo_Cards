# Nihongo Cards — Contexto para Implementação

> Referência rápida para agentes de IA. Use `@context.md` no início de tarefas para economizar tokens.
> Detalhes completos: `docs/prd.md`, `docs/architecture.md`, `docs/ai_rules.md`, `docs/kanji-dataset.md`.

## O que é

App web para aprender japonês (brasileiros no Japão / estudantes). MVP em desenvolvimento com **dados mock** e **progresso em localStorage**. Futuro: Supabase + PostgreSQL.

**Idioma da UI:** português (pt-BR). **Conteúdo japonês:** vem do banco/mock — nunca traduzir dinamicamente com IA.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript (strict, sem `any`) |
| UI | Tailwind CSS 4 + shadcn/ui (style `radix-nova`) |
| Ícones | lucide-react |
| Pacotes | pnpm (`pnpm-lock.yaml`) |
| Dados (atual) | CSV em `data/` + `lib/data/*.json` (importados) |
| Progresso (atual) | `services/progress.ts` + `services/lesson-progress.ts` → localStorage |

## Estrutura de pastas

```
app/
  layout.tsx                              # Root layout, fonts Geist, lang pt-BR
  page.tsx                                # Shell home: header, nav por abas (activeTab)
  globals.css                             # Tailwind + variáveis CSS
  study/
    layout.tsx                            # Header próprio com logo + link "Início" → /
    [dataset]/page.tsx                    # Lista de lições (ex: /study/shou1)
    [dataset]/lesson/[lessonNumber]/page.tsx  # Estudo de kanji da lição

features/
  dashboard/DashboardView.tsx
  kana/KanaStudy.tsx
  kanji/KanjiLessons.tsx                  # Legado (não usado na nav atual)
  study/
    LessonListView.tsx                    # Lista de lições por dataset
    LessonKanjiView.tsx                   # Estudo kanji dentro de uma lição
  exercises/ExercisesView.tsx

components/ui/                            # shadcn: card, button, dialog, progress, tabs
data/
  kanji.csv                               # Dataset genérico (import legado)
  shou1.csv                               # Shougakko 1º ano — 80 kanji (UTF-8)
lib/
  data/                                   # kanji.json + vocabulary.json (gerados)
  import/
    parse-kanji-csv.ts
    load-kanji-dataset.ts                 # Carrega CSV por dataset (server-only)
    load-shou1.ts
  kanji/
    datasets.ts                           # Registro de datasets (shou1, …)
    lessons.ts                            # Agrupa kanji em lições de 10
    exercise-pool.ts                      # Pool de exercícios por lição
  mock/db.ts                              # Tipos + MOCK_* (kana mock inline)
  utils.ts                                # cn() helper
scripts/
  import-kanji.ts                         # CSV → JSON
services/
  progress.ts                             # Progresso por card (kana/kanji)
  lesson-progress.ts                      # Lições concluídas por dataset
```

## Navegação

### Home (`app/page.tsx`)

Abas via `activeTab` (estado local):

| Aba (`activeTab`) | Componente | Arquivo |
|-------------------|------------|---------|
| `dashboard` | DashboardView | `features/dashboard/DashboardView.tsx` |
| `hiragana` | KanaStudy type="hiragana" | `features/kana/KanaStudy.tsx` |
| `katakana` | KanaStudy type="katakana" | `features/kana/KanaStudy.tsx` |
| `exercises` | ExercisesView | `features/exercises/ExercisesView.tsx` |

**Kanji** não é aba — é `<Link href="/study/shou1">` na nav desktop e mobile.

**Header home:** logo (clique → Painel) + nav de abas + botão **Início** (ícone Home, canto direito) que navega para `/` e reseta `activeTab` para `dashboard`.

### Estudo kanji (`app/study/`)

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/study/[dataset]` | LessonListView | Lista lições do dataset (ex: shou1) |
| `/study/[dataset]/lesson/[n]` | LessonKanjiView | Estudo dos kanji da lição n |

**Header study:** logo → `/` + link texto "Início" → `/`.

Datasets registrados em `lib/kanji/datasets.ts` (atual: `shou1` → `data/shou1.csv`).

## Onde alterar cards da UI

- **Conteúdo de um card** (texto, botões, layout da tela) → arquivo em `features/...`
- **Estilo base do componente Card** (borda, padding) → `components/ui/card.tsx`
- Busca rápida: `Cmd+Shift+F` pelo texto visível do card (ex: `Sequência Diária`, `Múltipla Escolha`)

### Cards principais por tela

**Dashboard** (`DashboardView.tsx`): Sequência Diária, Cartões Estudados, Kanjis Dominados, Em Aprendizado, Progresso Geral.

**Kanji — lição** (`LessonKanjiView.tsx`): card esquerdo "Escrita & Forma" (kanji grande + pronúncia), card direito "Leituras & Vocabulário" (flip para revelar).

**Kana** (`KanaStudy.tsx`): grid de caracteres + card de estudo do caractere selecionado.

**Exercícios** (`ExercisesView.tsx`): Múltipla Escolha, Relacionar Kanji, Palavra & Leitura.

## Dados e tipos (`lib/mock/db.ts`)

```ts
Hiragana | Katakana | Kanji | Vocabulary | Lesson | LessonItem | UserProgress
```

Exports: `MOCK_HIRAGANA`, `MOCK_KATAKANA`, `MOCK_KANJI`, `MOCK_VOCABULARY`, `MOCK_LESSONS`, `MOCK_LESSON_ITEMS`.

Kanji por dataset: carregados em runtime via `loadKanjiDataset(id)` de `data/{csvFile}`.

`Kanji` campos-chave: `kanji`, `onyomi` (katakana, `|`), `kunyomi` (hiragana, `|`), `meaning_pt`, `jlpt` (N5–N1), `order_in_grade`, `svg_path` (`/kanji/{CODEPOINT}.svg`).

**Regras do dataset:** sem tradução/geração por IA em runtime; exercícios só com registros do banco. Ver `docs/kanji-dataset.md`.

## Progresso

### Por card (`services/progress.ts`)

- Chave localStorage: `nihongo_cards_progress`
- Streak: `nihongo_cards_streak`, `nihongo_cards_last_access`
- Status: `new` → `learning` → `reviewing` → `mastered`
- `updateItemProgress(cardId, type, knows)` — usado em Kana e Kanji

### Por lição (`services/lesson-progress.ts`)

- Chave localStorage: `nihongo_cards_completed_lessons`
- `getCompletedLessons(datasetId)`, `markLessonComplete(datasetId, lessonNumber)`
- Lições agrupadas em blocos de 10 kanji (`lib/kanji/lessons.ts`, `LESSON_SIZE = 10`)

## Padrões de código

- Componentes de tela: `"use client"` (usam useState, localStorage, speechSynthesis)
- Páginas de estudo kanji: Server Components que carregam CSV e passam dados às views client
- Imports com alias `@/` (configurado no tsconfig)
- Pronúncia: `window.speechSynthesis` com `lang: "ja-JP"` (função `speak` local em cada view)
- UI: cards com `border-none shadow-[0_4px_20px_...]`, paleta zinc + accent red/orange
- Fonte japonesa: classe `font-japanese` (globals.css)
- Não criar dados fictícios novos fora do mock — seguir `docs/ai_rules.md`

## Estado atual (implementado vs pendente)

| Feature | Status |
|---------|--------|
| Dashboard com stats | ✅ mock/localStorage |
| Hiragana / Katakana study | ✅ |
| Kanji por lições (rotas `/study/...`) | ✅ shou1 (80 kanji) |
| Progresso de lições concluídas | ✅ localStorage |
| Exercícios (3 tipos) | ✅ |
| Botão Início no header | ✅ home + study layout |
| Canvas de escrita kanji | ❌ removido |
| Auth / Supabase | ❌ pendente (`tasks/002-auth.md`) |
| Revisão espaçada real | ❌ básica apenas |
| SVG ordem de traços | ❌ campo existe, UI não |
| Completar frases (exercício 4) | ❌ pendente |
| Datasets além de shou1 | ❌ pendente |

## Comandos

```bash
npm run dev           # http://localhost:3000
npm run build
npm run start         # produção local
npm run lint
npm run import:kanji  # data/kanji.csv → lib/data/*.json
```

Se porta 3000 ocupada: `pkill -f "next dev"` e rodar de novo.

## Como pedir mudanças (economia de tokens)

```
@context.md
@features/study/LessonKanjiView.tsx
Remova X do card "Escrita & Forma". Não altere outros arquivos.
```

- Anexar print da tela + nome do card + `@arquivo` específico
- Uma mudança por pedido, diff mínimo
- Cmd+K no trecho selecionado para edits pequenos

## Tasks de referência

`tasks/001-project-setup.md` … `tasks/006-exercises.md` — backlog por feature.
