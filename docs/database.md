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

- Fonte: `data/kanji.csv` (UTF-8, versionado)
- Comando: `npm run import:kanji`
- Saída: `lib/data/kanji.json`, `lib/data/vocabulary.json`
- Upsert por `id`, sem kanji duplicados

## Regras

- Nenhuma tradução por IA.
- Banco é a única fonte da verdade.
- SVG e áudio ficam no Storage.
- Exercícios montados apenas a partir dos registros existentes.
