# Database

## Tabelas

users

kanji
- id
- grupo
- ano_escolar
- kanji
- unicode
- radical
- onyomi
- kunyomi
- meaning_pt
- jlpt
- svg_path
- order_in_grade

vocabulary
- id
- kanji_id
- word
- reading
- meaning_pt
- priority

hiragana
- id
- character
- romaji
- svg_path

katakana
- id
- character
- romaji
- svg_path

lessons
- id
- title
- grade
- lesson_number

lesson_items
- id
- lesson_id
- kanji_id

user_progress
- id
- user_id
- kanji_id
- status
- correct_answers
- wrong_answers
- last_review
- next_review

daily_review
- id
- user_id
- date
- completed

## Importação CSV (Kanji)

Especificação completa: [`kanji-dataset.md`](kanji-dataset.md)

- Fontes por ano: `data/shou1.csv`, `data/shou2.csv`, … (UTF-8, versionados)
- Comando padrão: `npm run import:kanji`
- Merge (novo ano): `npm run import:kanji -- data/shouN.csv --merge`
- Saída: `lib/data/kanji.json`, `lib/data/vocabulary.json`
- Upsert por `id`, sem kanji duplicados no mesmo import
- Registro de datasets: `lib/kanji/datasets.ts`

## Progresso local (MVP — localStorage)

Dois stores integrados no dashboard:

| Chave | Serviço | Conteúdo |
|-------|---------|----------|
| `nihongo_cards_progress` | `services/progress.ts` | Progresso por card (hiragana, katakana, kanji) |
| `nihongo_cards_completed_lessons` | `services/lesson-progress.ts` | Lições concluídas por dataset (`shou1`, `shou2`, …) |
| `nihongo_cards_streak` | `services/progress.ts` | Sequência diária |
| `nihongo_cards_last_access` | `services/progress.ts` | Último acesso (streak) |

Status kanji em `user_progress`: `new` → `learning` → `reviewing` → `mastered`.

Kanji estudados (dashboard) vêm de lições concluídas; dominados exigem acertos repetidos via exercícios ou revisão.

## Regras

- Nenhuma tradução por IA.
- Banco é a única fonte da verdade.
- SVG e áudio ficam no Storage.
- Exercícios montados apenas a partir dos registros existentes.
