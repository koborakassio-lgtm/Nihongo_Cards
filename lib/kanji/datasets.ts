import type { Kanji, Vocabulary } from "@/lib/mock/db";

export const KANJI_DATASETS = {
  shou1: {
    csvFile: "shou1.csv",
    title: "Shougakko — 1º ano",
    grade: 1,
  },
  shou2: {
    csvFile: "shou2.csv",
    title: "Shougakko — 2º ano",
    grade: 2,
  },
} as const;

export type KanjiDatasetId = keyof typeof KANJI_DATASETS;

export function isKanjiDatasetId(value: string): value is KanjiDatasetId {
  return value in KANJI_DATASETS;
}

export function getKanjiDataset(id: KanjiDatasetId) {
  return KANJI_DATASETS[id];
}

export function filterKanjiByDataset(kanji: Kanji[], id: KanjiDatasetId): Kanji[] {
  const { grade } = getKanjiDataset(id);
  return kanji.filter((k) => k.ano_escolar === grade);
}

export function filterVocabularyByDataset(
  vocabulary: Vocabulary[],
  kanji: Kanji[],
  id: KanjiDatasetId
): Vocabulary[] {
  const kanjiIds = new Set(filterKanjiByDataset(kanji, id).map((k) => k.id));
  return vocabulary.filter((v) => kanjiIds.has(v.kanji_id));
}
