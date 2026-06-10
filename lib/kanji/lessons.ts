import type { Kanji } from "@/lib/mock/db";

export const LESSON_SIZE = 10;

export function getLessonFromOrder(order: number): number {
  return Math.floor((order - 1) / LESSON_SIZE) + 1;
}

export function getKanjiForLesson(kanjiList: Kanji[], lesson: number): Kanji[] {
  return kanjiList
    .filter((k) => getLessonFromOrder(k.order_in_grade) === lesson)
    .sort((a, b) => a.order_in_grade - b.order_in_grade);
}

export function getTotalLessons(kanjiCount: number): number {
  if (kanjiCount <= 0) return 0;
  return Math.ceil(kanjiCount / LESSON_SIZE);
}

export function getLessonOrderRange(
  lesson: number,
  totalKanji: number
): { start: number; end: number } {
  const start = (lesson - 1) * LESSON_SIZE + 1;
  const end = Math.min(lesson * LESSON_SIZE, totalKanji);
  return { start, end };
}

export interface LessonSummary {
  lessonNumber: number;
  orderStart: number;
  orderEnd: number;
  kanjiCount: number;
}

export function isLessonUnlocked(
  lessonNumber: number,
  completedLessons: number[]
): boolean {
  if (lessonNumber <= 1) return true;
  return completedLessons.includes(lessonNumber - 1);
}

export function buildLessonSummaries(kanjiList: Kanji[]): LessonSummary[] {
  const totalKanji = kanjiList.length;
  const totalLessons = getTotalLessons(totalKanji);

  return Array.from({ length: totalLessons }, (_, index) => {
    const lessonNumber = index + 1;
    const { start, end } = getLessonOrderRange(lessonNumber, totalKanji);
    const kanjiCount = getKanjiForLesson(kanjiList, lessonNumber).length;

    return {
      lessonNumber,
      orderStart: start,
      orderEnd: end,
      kanjiCount,
    };
  });
}
