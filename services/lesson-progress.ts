import {
  KANJI_DATASETS,
  filterKanjiByDataset,
  type KanjiDatasetId,
} from "@/lib/kanji/datasets";
import { buildLessonSummaries, getKanjiForLesson } from "@/lib/kanji/lessons";
import type { Kanji } from "@/lib/mock/db";

const LESSON_PROGRESS_KEY = "nihongo_cards_completed_lessons";

type LessonProgressStore = Partial<Record<KanjiDatasetId, number[]>>;

function readStore(): LessonProgressStore {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(LESSON_PROGRESS_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as LessonProgressStore;
  } catch (e) {
    console.error("Erro ao ler progresso de lições do localStorage:", e);
    return {};
  }
}

function writeStore(store: LessonProgressStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(store));
}

export function getCompletedLessons(datasetId: KanjiDatasetId): number[] {
  const store = readStore();
  const lessons = store[datasetId] ?? [];
  return [...lessons].sort((a, b) => a - b);
}

export function isLessonCompleted(
  datasetId: KanjiDatasetId,
  lessonNumber: number
): boolean {
  return getCompletedLessons(datasetId).includes(lessonNumber);
}

export function markLessonComplete(
  datasetId: KanjiDatasetId,
  lessonNumber: number
): number[] {
  const store = readStore();
  const current = store[datasetId] ?? [];

  if (!current.includes(lessonNumber)) {
    store[datasetId] = [...current, lessonNumber].sort((a, b) => a - b);
    writeStore(store);
  }

  return store[datasetId] ?? [];
}

export function getStudiedKanjiIds(allKanji: Kanji[]): Set<string> {
  const studied = new Set<string>();

  for (const datasetId of Object.keys(KANJI_DATASETS) as KanjiDatasetId[]) {
    const datasetKanji = filterKanjiByDataset(allKanji, datasetId);
    const completedLessons = getCompletedLessons(datasetId);

    for (const lessonNumber of completedLessons) {
      for (const entry of getKanjiForLesson(datasetKanji, lessonNumber)) {
        studied.add(entry.id);
      }
    }
  }

  return studied;
}

export function getLessonCompletionTotals(allKanji: Kanji[]): {
  completedLessonsCount: number;
  totalLessonsCount: number;
} {
  let completedLessonsCount = 0;
  let totalLessonsCount = 0;

  for (const datasetId of Object.keys(KANJI_DATASETS) as KanjiDatasetId[]) {
    const datasetKanji = filterKanjiByDataset(allKanji, datasetId);
    const lessons = buildLessonSummaries(datasetKanji);
    totalLessonsCount += lessons.length;
    completedLessonsCount += getCompletedLessons(datasetId).length;
  }

  return { completedLessonsCount, totalLessonsCount };
}
