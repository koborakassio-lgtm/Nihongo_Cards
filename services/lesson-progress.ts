import type { KanjiDatasetId } from "@/lib/kanji/datasets";

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
