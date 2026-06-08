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

Source file: [`data/kanji.csv`](../data/kanji.csv)

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

Run:

```bash
pnpm import:kanji
```

This reads `data/kanji.csv` and writes:

- `lib/data/kanji.json` — normalized kanji records
- `lib/data/vocabulary.json` — vocabulary extracted from CSV columns

Behavior:

- Supports thousands of records.
- Upserts by `id` — re-importing overwrites existing records safely.
- Rejects duplicate `kanji` characters.
- Validates required fields and UTF-8 encoding.

The CSV file is maintained manually and version controlled.

Future Supabase import should use the same normalized JSON shape.
