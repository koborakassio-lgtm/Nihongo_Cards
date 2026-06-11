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
    page.tsx                              # Índice: escolha do ano escolar
    [dataset]/page.tsx                    # Lista de lições (ex: /study/shou1)
    [dataset]/lesson/[lessonNumber]/page.tsx  # Estudo de kanji da lição

features/
  dashboard/DashboardView.tsx
  kana/KanaStudy.tsx
  kanji/KanjiLessons.tsx                  # Legado (não usado na nav atual)
  study/
    StudyIndexView.tsx                    # Cards de escolha shou1 / shou2
    LessonListView.tsx                    # Lista de lições por dataset
    LessonKanjiView.tsx                   # Estudo kanji dentro de uma lição
  exercises/ExercisesView.tsx

components/ui/                            # shadcn: card, button, dialog, progress, tabs
data/
  kanji.csv                               # Dataset genérico (import legado)
  shou1.csv                               # Shougakko 1º ano — 80 kanji (UTF-8)
  shou2.csv                               # Shougakko 2º ano — 159 kanji (UTF-8)
lib/
  data/                                   # kanji.json + vocabulary.json (gerados)
  import/
    parse-kanji-csv.ts
    load-kanji-dataset.ts                 # Carrega CSV por dataset (server-only)
    load-shou1.ts                         # Wrapper legado → loadKanjiDataset("shou1")
  kanji/
    datasets.ts                           # Registro de datasets + filtros por grade
    lessons.ts                            # Agrupa kanji em lições de 10
    exercise-pool.ts                      # Pool de exercícios por lição
  mock/db.ts                              # Tipos + MOCK_* (kana mock inline)
  utils.ts                                # cn() helper
scripts/
  import-kanji.ts                         # CSV → JSON (suporta --merge)
services/
  progress.ts                             # Progresso por card + stats do dashboard
  lesson-progress.ts                      # Lições concluídas + kanji estudados
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

**Kanji** não é aba — é `<Link href="/study">` na nav desktop e mobile.

**Header home:** logo (clique → Painel) + nav de abas + botão **Início** (ícone Home, canto direito) que navega para `/` e reseta `activeTab` para `dashboard`.

### Estudo kanji (`app/study/`)

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/study` | StudyIndexView | Escolha do ano (shou1, shou2, …) |
| `/study/[dataset]` | LessonListView | Lista lições do dataset |
| `/study/[dataset]/lesson/[n]` | LessonKanjiView | Estudo dos kanji da lição n |

**Header study:** logo → `/` + link texto "Início" → `/`.

Datasets registrados em `lib/kanji/datasets.ts`:

| ID | CSV | Título UI | Grade | Kanji | Lições |
|----|-----|-----------|-------|-------|--------|
| `shou1` | `shou1.csv` | Shougakko — 1º ano | 1 | 80 | 8 |
| `shou2` | `shou2.csv` | Shougakko — 2º ano | 2 | 159 | 16 |

Total em `lib/data/kanji.json` após merge: **239 kanji**.

### Exercícios (`ExercisesView`)

Fluxo em 4 passos: **escolher ano → escolher lição/revisão geral → escolher tipo → jogar**.

Tipos: Múltipla Escolha, Relacionar Kanji, Palavra & Leitura. Só lições **concluídas** do dataset selecionado entram no pool.

## Onde alterar cards da UI

- **Conteúdo de um card** (texto, botões, layout da tela) → arquivo em `features/...`
- **Estilo base do componente Card** (borda, padding) → `components/ui/card.tsx`
- Busca rápida: `Cmd+Shift+F` pelo texto visível do card (ex: `Sequência Diária`, `Múltipla Escolha`)

### Cards principais por tela

**Dashboard** (`DashboardView.tsx`): Sequência Diária, Cartões Estudados, Kanjis Dominados, Em Aprendizado, Progresso Geral de Kanji.

**Estudo — índice** (`StudyIndexView.tsx`): cards tintados por ano escolar.

**Kanji — lições** (`LessonListView.tsx`): cards `📚 Lição N` com bloqueio sequencial.

**Kanji — lição** (`LessonKanjiView.tsx`): cards por kanji (significado, onyomi, kunyomi) + botão "Concluir lição".

**Kana** (`KanaStudy.tsx`): grid de caracteres + card de estudo do caractere selecionado.

**Exercícios** (`ExercisesView.tsx`): seletor de ano, lições concluídas, Múltipla Escolha, Relacionar Kanji, Palavra & Leitura.

## Dados e tipos (`lib/mock/db.ts`)

```ts
Hiragana | Katakana | Kanji | Vocabulary | Lesson | LessonItem | UserProgress
```

Exports: `MOCK_HIRAGANA`, `MOCK_KATAKANA`, `MOCK_KANJI`, `MOCK_VOCABULARY`, `MOCK_LESSONS`, `MOCK_LESSON_ITEMS`.

### Dois caminhos de dados para kanji

| Caminho | Fonte | Usado em |
|---------|--------|----------|
| Estudo (`/study/...`) | CSV via `loadKanjiDataset(id)` em runtime | Lições, cards de lição, progresso de lições |
| Exercícios + Dashboard stats | `lib/data/kanji.json` via `MOCK_KANJI` | ExercisesView, getProgressStats |

Após adicionar um ano, rodar import com merge (ver `docs/kanji-dataset.md`).

`Kanji` campos-chave: `kanji`, `onyomi` (katakana, `|`), `kunyomi` (hiragana, `|`), `meaning_pt`, `jlpt` (N5–N1), `order_in_grade`, `ano_escolar`, `svg_path` (`/kanji/{CODEPOINT}.svg`).

**Regras do dataset:** sem tradução/geração por IA em runtime; exercícios só com registros do banco. Ver `docs/kanji-dataset.md`.

## Progresso

Dois stores localStorage **integrados** no dashboard via `getProgressStats(MOCK_KANJI)`.

### Por card (`services/progress.ts`)

- Chave: `nihongo_cards_progress`
- Streak: `nihongo_cards_streak`, `nihongo_cards_last_access`
- Status kanji: `new` → `learning` (1 acerto) → `reviewing` (3 acertos) → `mastered` (6 acertos)
- `updateItemProgress(cardId, type, knows)` — usado em Kana, conclusão de lição e acertos em exercícios

### Por lição (`services/lesson-progress.ts`)

- Chave: `nihongo_cards_completed_lessons` (objeto `{ shou1: [1,2], shou2: [1], … }`)
- `getCompletedLessons(datasetId)`, `markLessonComplete(datasetId, lessonNumber)`
- `getStudiedKanjiIds(allKanji)` — kanji únicos de lições concluídas (todos os datasets)
- `getLessonCompletionTotals(allKanji)` — totais agregados de lições
- Lições agrupadas em blocos de 10 kanji (`lib/kanji/lessons.ts`, `LESSON_SIZE = 10`)

### Sincronização lição → dashboard

Ao concluir lição (`LessonKanjiView.handleComplete`):
1. `markLessonComplete(datasetId, lessonNumber)`
2. Para cada kanji da lição: `updateItemProgress(id, "kanji", true)`

### Métricas do dashboard (`ProgressStats`)

| Campo | Origem |
|-------|--------|
| `studiedKanjisCount` | Kanji de lições concluídas |
| `masteredKanjisCount` | Status `mastered` em card progress |
| `learningKanjisCount` | Estudados − dominados |
| `reviewedCardsCount` | Kana tentados + kanji estudados |
| `completedLessonsCount` / `totalLessonsCount` | Soma entre todos os datasets |
| Barra "Progresso Geral" | `studiedKanjisCount / totalKanjisCount` |

## Adicionar um novo ano escolar (ex: shou3)

1. Criar `data/shou3.csv` (mesmo cabeçalho de `shou1.csv`, `group=Shougakko`, `unicode=U+XXXX`)
2. Registrar em `lib/kanji/datasets.ts` (`shou3`, grade 3, título pt-BR)
3. Importar: `npm run import:kanji -- data/shou3.csv --merge`
4. Rotas `/study/shou3` funcionam automaticamente; atualizar `StudyIndexView` se necessário (lê `KANJI_DATASETS` dinamicamente)
5. Exercícios: dataset aparece no seletor de ano automaticamente

## Padrões de código

- Componentes de tela: `"use client"` (usam useState, localStorage, speechSynthesis)
- Páginas de estudo kanji: Server Components que carregam CSV e passam dados às views client
- Imports com alias `@/` (configurado no tsconfig)
- Pronúncia: `window.speechSynthesis` com `lang: "ja-JP"` (função `speak` local em cada view)
- UI: cards com `border-none shadow-[0_4px_20px_...]`, paleta zinc + accent red/orange
- Fonte japonesa: classe `font-japanese` (globals.css)
- Textos de UI em **pt-BR** (Lição, lições, kanji — não "Lesson")
- Não criar dados fictícios novos fora do mock — seguir `docs/ai_rules.md`

## Estado atual (implementado vs pendente)

| Feature | Status |
|---------|--------|
| Dashboard com stats unificados | ✅ lições + cartões |
| Hiragana / Katakana study | ✅ |
| Kanji por lições (rotas `/study/...`) | ✅ shou1 (80) + shou2 (159) |
| Índice `/study` (escolha do ano) | ✅ |
| Progresso de lições concluídas | ✅ localStorage, por dataset |
| Exercícios (3 tipos) | ✅ seletor de ano |
| Botão Início no header | ✅ home + study layout |
| UI pt-BR nas telas de estudo | ✅ |
| Canvas de escrita kanji | ❌ removido |
| Auth / Supabase | ❌ pendente (`tasks/002-auth.md`) |
| Revisão espaçada real | ❌ básica apenas |
| SVG ordem de traços | ❌ campo existe, UI não |
| Completar frases (exercício 4) | ❌ pendente |
| shou3–shou6 / Chūgakkō | ❌ pendente |

## Comandos

```bash
npm run dev           # http://localhost:3000
npm run build
npm run start         # produção local
npm run lint
npm run import:kanji  # data/shou1.csv → lib/data/*.json (padrão)
npm run import:kanji -- data/shou2.csv --merge  # mescla sem apagar anos anteriores
```

Se porta 3000 ocupada: `pkill -f "next dev"` e rodar de novo.

## Como pedir mudanças (economia de tokens)

```
@context.md
@features/study/LessonKanjiView.tsx
Altere X no card de kanji. Não altere outros arquivos.
```

- Anexar print da tela + nome do card + `@arquivo` específico
- Uma mudança por pedido, diff mínimo
- Cmd+K no trecho selecionado para edits pequenos

## Tasks de referência

`tasks/001-project-setup.md` … `tasks/006-exercises.md` — backlog por feature.
