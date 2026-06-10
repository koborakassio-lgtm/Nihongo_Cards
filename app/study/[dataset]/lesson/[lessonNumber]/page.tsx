import { notFound } from "next/navigation";
import LessonKanjiView from "@/features/study/LessonKanjiView";
import { getKanjiDataset, isKanjiDatasetId } from "@/lib/kanji/datasets";
import {
  getKanjiForLesson,
  getLessonOrderRange,
  getTotalLessons,
} from "@/lib/kanji/lessons";
import { loadKanjiDataset } from "@/lib/import/load-kanji-dataset";

export const dynamic = "force-dynamic";

interface StudyLessonPageProps {
  params: Promise<{ dataset: string; lessonNumber: string }>;
}

export default async function StudyLessonPage({ params }: StudyLessonPageProps) {
  const { dataset, lessonNumber: lessonNumberParam } = await params;

  if (!isKanjiDatasetId(dataset)) {
    notFound();
  }

  const lessonNumber = Number(lessonNumberParam);
  if (!Number.isInteger(lessonNumber) || lessonNumber < 1) {
    notFound();
  }

  const datasetConfig = getKanjiDataset(dataset);
  const kanji = loadKanjiDataset(dataset);
  const totalLessons = getTotalLessons(kanji.length);

  if (lessonNumber > totalLessons) {
    notFound();
  }

  const lessonKanji = getKanjiForLesson(kanji, lessonNumber);
  const { start, end } = getLessonOrderRange(lessonNumber, kanji.length);

  return (
    <LessonKanjiView
      datasetId={dataset}
      datasetTitle={datasetConfig.title}
      lessonNumber={lessonNumber}
      orderStart={start}
      orderEnd={end}
      kanji={lessonKanji}
    />
  );
}
