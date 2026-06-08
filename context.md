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
| Dados (atual) | `lib/mock/db.ts` + `lib/data/*.json` (importados de CSV) |
| Progresso (atual) | `services/progress.ts` → localStorage |

## Estrutura de pastas

```
app/
  layout.tsx          # Root layout, fonts Geist, lang pt-BR
  page.tsx            # Shell: header, nav, troca de abas (activeTab)
  globals.css         # Tailwind + variáveis CSS

features/             # Uma view por aba (toda lógica de tela aqui)
  dashboard/DashboardView.tsx
  kana/KanaStudy.tsx
  kanji/KanjiLessons.tsx
  exercises/ExercisesView.tsx

components/ui/        # shadcn: card, button, dialog, progress, tabs
data/
  kanji.csv           # Fonte manual dos kanji (UTF-8, versionado)
lib/
  data/               # kanji.json + vocabulary.json (gerados pelo import)
  import/             # parse-kanji-csv.ts
  mock/db.ts          # Tipos + MOCK_* (kanji/vocab vêm do JSON importado)
  utils.ts            # cn() helper
scripts/
  import-kanji.ts     # CSV → JSON
services/
  progress.ts         # getLocalProgress, updateItemProgress, getProgressStats
```

## Mapa aba → arquivo

| Aba (`activeTab`) | Componente | Arquivo |
|-------------------|------------|---------|
| `dashboard` | DashboardView | `features/dashboard/DashboardView.tsx` |
| `hiragana` | KanaStudy type="hiragana" | `features/kana/KanaStudy.tsx` |
| `katakana` | KanaStudy type="katakana" | `features/kana/KanaStudy.tsx` |
| `kanji` | KanjiLessons | `features/kanji/KanjiLessons.tsx` |
| `exercises` | ExercisesView | `features/exercises/ExercisesView.tsx` |

Navegação e header: `app/page.tsx` (não está em `features/`).

## Onde alterar cards da UI

- **Conteúdo de um card** (texto, botões, layout da tela) → arquivo em `features/...`
- **Estilo base do componente Card** (borda, padding) → `components/ui/card.tsx`
- Busca rápida: `Cmd+Shift+F` pelo texto visível do card (ex: `Sequência Diária`, `Múltipla Escolha`)

### Cards principais por tela

**Dashboard** (`DashboardView.tsx`): Sequência Diária, Cartões Estudados, Kanjis Dominados, Em Aprendizado, Progresso Geral.

**Kanji** (`KanjiLessons.tsx`): card esquerdo "Escrita & Forma" (kanji grande + pronúncia), card direito "Leituras & Vocabulário" (flip para revelar).

**Kana** (`KanaStudy.tsx`): grid de caracteres + card de estudo do caractere selecionado.

**Exercícios** (`ExercisesView.tsx`): Múltipla Escolha, Relacionar Kanji, Palavra & Leitura.

## Dados e tipos (`lib/mock/db.ts`)

```ts
Hiragana | Katakana | Kanji | Vocabulary | Lesson | LessonItem | UserProgress
```

Exports: `MOCK_HIRAGANA`, `MOCK_KATAKANA`, `MOCK_KANJI`, `MOCK_VOCABULARY`, `MOCK_LESSONS`, `MOCK_LESSON_ITEMS`.

`MOCK_KANJI` / `MOCK_VOCABULARY` vêm de `lib/data/*.json`, gerados por `data/kanji.csv`.

`Kanji` campos-chave: `kanji`, `onyomi` (katakana, `|`), `kunyomi` (hiragana, `|`), `meaning_pt`, `jlpt` (N5–N1), `svg_path` (`/kanji/{CODEPOINT}.svg`).

**Regras do dataset:** sem tradução/geração por IA em runtime; exercícios só com registros do banco. Ver `docs/kanji-dataset.md`.

## Progresso (`services/progress.ts`)

- Chave localStorage: `nihongo_cards_progress`
- Streak: `nihongo_cards_streak`, `nihongo_cards_last_access`
- Status: `new` → `learning` → `reviewing` → `mastered`
- `updateItemProgress(cardId, type, knows)` — usado em Kana e Kanji

## Padrões de código

- Componentes de tela: `"use client"` (usam useState, localStorage, speechSynthesis)
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
| Kanji lessons (lista + estudo + flip) | ✅ |
| Canvas de escrita kanji | ❌ removido (era `KanjiCanvas.tsx`) |
| Exercícios (3 tipos) | ✅ |
| Auth / Supabase | ❌ pendente (`tasks/002-auth.md`) |
| Revisão espaçada real | ❌ básica apenas |
| SVG ordem de traços | ❌ campo existe, UI não |
| Completar frases (exercício 4) | ❌ pendente |

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
@features/kanji/KanjiLessons.tsx
Remova X do card "Escrita & Forma". Não altere outros arquivos.
```

- Anexar print da tela + nome do card + `@arquivo` específico
- Uma mudança por pedido, diff mínimo
- Cmd+K no trecho selecionado para edits pequenos

## Tasks de referência

`tasks/001-project-setup.md` … `tasks/006-exercises.md` — backlog por feature.
