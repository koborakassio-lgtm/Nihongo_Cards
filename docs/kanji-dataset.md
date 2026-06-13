# Kanji Dataset Specification

## Purpose

This application uses a completely static educational database.

No AI translation or content generation is allowed during runtime.

The dataset will be imported from CSV files.

One row represents one kanji.

---

## Dataset Scope

Include:

- Hiragana
- Katakana
- Shōgakkō Kanji (1st to 6th grade)
- Chūgakkō Kanji (1st to 3rd grade)

Target:

Approximately 2136 Jōyō Kanji.

---

## CSV Structure

Columns:

| Column | Description |
|--------|-------------|
| `id` | Unique numeric ID |
| `grupo` | `Shougakko` or `Chugakko` |
| `ano_escolar` | Grade year (1–6 Shōgakkō, 7–9 Chūgakkō) |
| `kanji` | Character |
| `unicode` | e.g. `U+4E00` |
| `radical` | Radical character |
| `onyomi` | ON readings in Katakana, pipe-separated (`イチ\|イツ`) |
| `kunyomi` | KUN readings in Hiragana, pipe-separated (`ひと\|ひとつ`) |
| `meaning_pt` | Portuguese meaning (manually reviewed) |
| `jlpt` | JLPT level (`N5`–`N1`) |
| `svg_path` | `/kanji/{CODEPOINT}.svg` using Unicode codepoint |
| `order_in_grade` | Order within grade curriculum |
| `vocabulary_1` | Primary vocabulary word |
| `reading_1` | Reading for vocabulary_1 |
| `meaning_1` | Portuguese meaning for vocabulary_1 |
| `vocabulary_2` | Secondary vocabulary word |
| `reading_2` | Reading for vocabulary_2 |
| `meaning_2` | Portuguese meaning for vocabulary_2 |

Source files (por ano escolar):

| Arquivo | Conteúdo |
|---------|----------|
| [`data/shou1.csv`](../data/shou1.csv) | Shougakko 1º ano — 80 kanji |
| [`data/shou2.csv`](../data/shou2.csv) | Shougakko 2º ano — 159 kanji |
| [`data/shou3.csv`](../data/shou3.csv) | Shougakko 3º ano — 200 kanji |
| [`data/shou4.csv`](../data/shou4.csv) | Shougakko 4º ano — 201 kanji |
| [`data/kanji.csv`](../data/kanji.csv) | Dataset genérico (legado) |

Registro de datasets ativos: [`lib/kanji/datasets.ts`](../lib/kanji/datasets.ts).

Cabeçalho CSV aceito (aliases mapeados em `parse-kanji-csv.ts`):

| Coluna CSV | Alias aceito | Campo interno |
|------------|--------------|---------------|
| `group` | — | `grupo` (`Shougakko`) |
| `grade` | — | `ano_escolar` |
| `order` | — | `order_in_grade` |

---

## Example

```
id: 1
grupo: Shougakko
ano_escolar: 1
kanji: 一
unicode: U+4E00
radical: 一
onyomi: イチ|イツ
kunyomi: ひと|ひとつ
meaning_pt: um
jlpt: N5
svg_path: /kanji/4E00.svg
order_in_grade: 1
vocabulary_1: 一つ
reading_1: ひとつ
meaning_1: um objeto
vocabulary_2: 一人
reading_2: ひとり
meaning_2: uma pessoa
```

---

## Rules

- ON readings must use Katakana.
- KUN readings must use Hiragana.
- Portuguese translations should be manually reviewed.
- Prefer vocabulary actually taught in Japanese schools.
- Do not create artificial examples.
- SVG path must use the Unicode codepoint.
- Duplicate kanji are forbidden.
- CSV encoding must be UTF-8.

---

## Application Rules

The application must never:

- translate kanji dynamically;
- generate vocabulary using AI;
- generate meanings using AI;
- generate exercises using AI.

Exercises are assembled only from existing database records.

The database is the single source of truth.

---

## Import Strategy

### Import único (substitui tudo)

```bash
npm run import:kanji -- data/shou1.csv
```

### Import com merge (adicionar novo ano)

```bash
npm run import:kanji -- data/shou2.csv --merge
```

Isso **mescla** o CSV informado com o conteúdo existente em `lib/data/kanji.json` e `lib/data/vocabulary.json`, sem apagar registros de outros anos.

Saída:

- `lib/data/kanji.json` — normalized kanji records
- `lib/data/vocabulary.json` — vocabulary extracted from CSV columns

Behavior:

- Supports thousands of records.
- Upserts by `id` — re-importing overwrites existing records safely.
- Rejects duplicate `kanji` characters within the same import.
- Validates required fields and UTF-8 encoding.
- `unicode` must use `U+` prefix (e.g. `U+4E00`).

The CSV files are maintained manually and version controlled.

Future Supabase import should use the same normalized JSON shape.

---

## Adding a New Grade Dataset

Checklist for Shougakko 3rd grade and beyond:

1. **Create CSV** — copy `shou1.csv` header; use unique `id` values across all grades; set `group=Shougakko`, `grade=N`, `order=1..N`.
2. **Register dataset** in `lib/kanji/datasets.ts`:
   ```ts
   shou4: {
     csvFile: "shou4.csv",
     title: "Shougakko — 4º ano",
     grade: 4,
   },
   ```
3. **Validate** — parser must succeed without duplicate kanji characters.
4. **Import with merge** — `npm run import:kanji -- data/shou4.csv --merge`
5. **Verify routes** — `/study/shou4`, `/study/shou4/lesson/1`; exercises year selector picks it up automatically.

### Runtime vs JSON

| Consumer | Data source |
|----------|-------------|
| `/study/[dataset]` pages | CSV via `loadKanjiDataset(id)` (server) |
| Exercises, dashboard stats | `MOCK_KANJI` from `lib/data/kanji.json` (client) |

Both must stay in sync: always run `--merge` import after editing a grade CSV.
