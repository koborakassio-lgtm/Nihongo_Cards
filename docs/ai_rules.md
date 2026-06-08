# AI DEVELOPMENT RULES

## Arquitetura

- Next.js App Router
- TypeScript Strict
- Nunca utilizar any
- Componentes reutilizáveis

## Banco

- Nunca gerar dados fictícios
- Nunca traduzir dinamicamente
- Todo conteúdo vem do banco
- Kanji importados de `data/kanji.csv` — ver `docs/kanji-dataset.md`
- Nunca traduzir, gerar vocabulário, significados ou exercícios com IA em runtime

## Storage

SVG:
public/kanji/

Áudio:
Supabase Storage

Nunca armazenar SVG ou áudio no PostgreSQL.

## Frontend

Priorizar Server Components.

## Exercícios

Gerar automaticamente a partir de:
- kanji
- vocabulary
- lessons
- lesson_items

## Organização

/services
/components
/lib
/types
/hooks
/actions

Seguir Clean Architecture.
