import type { Kanji, Vocabulary } from "@/lib/mock/db";
import { getKanjiForLesson } from "@/lib/kanji/lessons";

export function getKanjiPoolForLesson(
  kanjiList: Kanji[],
  lessonNumber: number
): Kanji[] {
  return getKanjiForLesson(kanjiList, lessonNumber);
}

export function getKanjiPoolForCompletedLessons(
  kanjiList: Kanji[],
  completedLessons: number[]
): Kanji[] {
  const seen = new Set<string>();
  const pool: Kanji[] = [];

  for (const lesson of [...completedLessons].sort((a, b) => a - b)) {
    for (const kanji of getKanjiForLesson(kanjiList, lesson)) {
      if (!seen.has(kanji.id)) {
        seen.add(kanji.id);
        pool.push(kanji);
      }
    }
  }

  return pool;
}

export function getVocabularyForKanjiPool(
  vocabulary: Vocabulary[],
  kanjiPool: Kanji[]
): Vocabulary[] {
  const kanjiIds = new Set(kanjiPool.map((k) => k.id));
  return vocabulary.filter((v) => kanjiIds.has(v.kanji_id));
}

export function canRunExercise(pool: unknown[], minItems = 4): boolean {
  return pool.length >= minItems;
}
