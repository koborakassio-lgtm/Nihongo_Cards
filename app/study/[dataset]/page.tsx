import { notFound } from "next/navigation";
import LessonListView from "@/features/study/LessonListView";
import { getKanjiDataset, isKanjiDatasetId } from "@/lib/kanji/datasets";
import { buildLessonSummaries } from "@/lib/kanji/lessons";
import { loadKanjiDataset } from "@/lib/import/load-kanji-dataset";

export const dynamic = "force-dynamic";

interface StudyDatasetPageProps {
  params: Promise<{ dataset: string }>;
}

export default async function StudyDatasetPage({ params }: StudyDatasetPageProps) {
  const { dataset } = await params;

  if (!isKanjiDatasetId(dataset)) {
    notFound();
  }

  const datasetConfig = getKanjiDataset(dataset);
  const kanji = loadKanjiDataset(dataset);
  const lessons = buildLessonSummaries(kanji);

  return (
    <LessonListView
      datasetId={dataset}
      title={datasetConfig.title}
      totalKanji={kanji.length}
      lessons={lessons}
    />
  );
}
