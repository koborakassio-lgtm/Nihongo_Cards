import StudyIndexView, { buildDatasetSummaries } from "@/features/study/StudyIndexView";
import { KANJI_DATASETS, type KanjiDatasetId } from "@/lib/kanji/datasets";
import { loadKanjiDataset } from "@/lib/import/load-kanji-dataset";

export const dynamic = "force-dynamic";

export default function StudyIndexPage() {
  const counts = {} as Record<KanjiDatasetId, number>;

  for (const id of Object.keys(KANJI_DATASETS) as KanjiDatasetId[]) {
    counts[id] = loadKanjiDataset(id).length;
  }

  return <StudyIndexView datasets={buildDatasetSummaries(counts)} />;
}
