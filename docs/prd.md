# Japanese Study Cards

## Product Vision

Japanese Study Cards é uma plataforma web para aprendizado do idioma japonês,
focada principalmente em brasileiros residentes no Japão e estudantes estrangeiros.

Toda informação exibida ao usuário virá do banco de dados.
Nenhum conteúdo será traduzido dinamicamente por IA.

## Objetivos

- Aprender Hiragana
- Aprender Katakana
- Aprender Kanji do Shōgakkō
- Aprender Kanji do Chūgakkō
- Aprender vocabulário
- Estudar leituras ON e KUN
- Revisão espaçada

## Stack

Frontend:
- Next.js (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui

Backend:
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

Deploy:
- Vercel

## MVP

### Login
- Cadastro
- Login
- Recuperação de senha

### Dashboard
- Sequência diária
- Cartões revisados
- Kanjis aprendidos
- Progresso geral

### Cartões
Mostrar:
- Kanji
- ON'yomi
- KUN'yomi
- Vocabulário principal
- Tradução
- SVG da ordem dos traços

Botões:
- Conheço
- Ainda não sei

### Exercícios

1. Múltipla escolha
2. Relacionar Kanji e Tradução
3. Relacionar Palavra e Leitura
4. Completar Frases

Os exercícios serão gerados automaticamente a partir do banco de dados.

### Revisão Espaçada

Estados:
- Novo
- Aprendendo
- Revisando
- Dominado

## Conteúdo

- Hiragana
- Katakana
- Kanji Shōgakkō (1º ao 6º)
- Kanji Chūgakkō (1º ao 3º)

Total esperado: 2136 Jōyō Kanji.

## Filosofia

Toda inteligência do sistema está na base de dados.
A IA será utilizada apenas durante o desenvolvimento.
