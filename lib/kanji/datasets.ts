export const KANJI_DATASETS = {
  shou1: {
    csvFile: "shou1.csv",
    title: "Shougakko 1st Grade",
    grade: 1,
  },
} as const;

export type KanjiDatasetId = keyof typeof KANJI_DATASETS;

export function isKanjiDatasetId(value: string): value is KanjiDatasetId {
  return value in KANJI_DATASETS;
}

export function getKanjiDataset(id: KanjiDatasetId) {
  return KANJI_DATASETS[id];
}
