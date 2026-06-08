// Tipos baseados no esquema do banco de dados (docs/database.md, docs/kanji-dataset.md)

import kanjiDataset from "@/lib/data/kanji.json";
import vocabularyDataset from "@/lib/data/vocabulary.json";

export interface Hiragana {
  id: string;
  character: string;
  romaji: string;
  svg_path: string;
}

export interface Katakana {
  id: string;
  character: string;
  romaji: string;
  svg_path: string;
}

export interface Kanji {
  id: string;
  grupo: string; // ex: "Kyoiku"
  ano_escolar: number; // 1 a 6 (Shōgakkō), ou 7+ (Chūgakkō)
  kanji: string;
  unicode: string;
  radical: string;
  onyomi: string; // Leituras ON em katakana, separadas por |
  kunyomi: string; // Leituras KUN em hiragana, separadas por |
  meaning_pt: string;
  jlpt: string; // N5, N4, N3, N2, N1
  svg_path: string;
  order_in_grade: number;
}

export interface Vocabulary {
  id: string;
  kanji_id: string;
  word: string;
  reading: string;
  meaning_pt: string;
  priority: number;
}

export interface Lesson {
  id: string;
  title: string;
  grade: number;
  lesson_number: number;
}

export interface LessonItem {
  id: string;
  lesson_id: string;
  kanji_id: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  kanji_id: string; // ou card_id
  type: 'hiragana' | 'katakana' | 'kanji';
  status: 'new' | 'learning' | 'reviewing' | 'mastered';
  correct_answers: number;
  wrong_answers: number;
  last_review: string | null;
  next_review: string | null;
}

// DADOS MOCKADOS REAIS (Educacionais)

export const MOCK_HIRAGANA: Hiragana[] = [
  { id: "h1", character: "あ", romaji: "a", svg_path: "/hiragana/a.svg" },
  { id: "h2", character: "い", romaji: "i", svg_path: "/hiragana/i.svg" },
  { id: "h3", character: "う", romaji: "u", svg_path: "/hiragana/u.svg" },
  { id: "h4", character: "え", romaji: "e", svg_path: "/hiragana/e.svg" },
  { id: "h5", character: "お", romaji: "o", svg_path: "/hiragana/o.svg" },
  { id: "h6", character: "か", romaji: "ka", svg_path: "/hiragana/ka.svg" },
  { id: "h7", character: "き", romaji: "ki", svg_path: "/hiragana/ki.svg" },
  { id: "h8", character: "く", romaji: "ku", svg_path: "/hiragana/ku.svg" },
  { id: "h9", character: "け", romaji: "ke", svg_path: "/hiragana/ke.svg" },
  { id: "h10", character: "こ", romaji: "ko", svg_path: "/hiragana/ko.svg" }
];

export const MOCK_KATAKANA: Katakana[] = [
  { id: "k1", character: "ア", romaji: "a", svg_path: "/katakana/a.svg" },
  { id: "k2", character: "イ", romaji: "i", svg_path: "/katakana/i.svg" },
  { id: "k3", character: "ウ", romaji: "u", svg_path: "/katakana/u.svg" },
  { id: "k4", character: "エ", romaji: "e", svg_path: "/katakana/e.svg" },
  { id: "k5", character: "オ", romaji: "o", svg_path: "/katakana/o.svg" }
];

// Importados de data/kanji.csv via `npm run import:kanji`
export const MOCK_KANJI: Kanji[] = kanjiDataset as Kanji[];
export const MOCK_VOCABULARY: Vocabulary[] = vocabularyDataset as Vocabulary[];

export const MOCK_LESSONS: Lesson[] = [
  { id: "l1", title: "Shōgakkō 1º ano", grade: 1, lesson_number: 1 },
];

export const MOCK_LESSON_ITEMS: LessonItem[] = MOCK_KANJI.map((item, index) => ({
  id: `li${index + 1}`,
  lesson_id: "l1",
  kanji_id: item.id,
}));
