"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Lock } from "lucide-react";
import { isLessonUnlocked } from "@/lib/kanji/lessons";
import type { LessonSummary } from "@/lib/kanji/lessons";
import type { KanjiDatasetId } from "@/lib/kanji/datasets";
import { getCompletedLessons } from "@/services/lesson-progress";

const CARD_TINTS = [
  "bg-orange-50 dark:bg-orange-950/20",
  "bg-sky-50 dark:bg-sky-950/20",
  "bg-emerald-50 dark:bg-emerald-950/20",
  "bg-violet-50 dark:bg-violet-950/20",
  "bg-rose-50 dark:bg-rose-950/20",
  "bg-amber-50 dark:bg-amber-950/20",
  "bg-teal-50 dark:bg-teal-950/20",
  "bg-indigo-50 dark:bg-indigo-950/20",
] as const;

interface LessonListViewProps {
  datasetId: KanjiDatasetId;
  title: string;
  totalKanji: number;
  lessons: LessonSummary[];
}

function LessonCardContent({
  lesson,
  completed,
  locked,
}: {
  lesson: LessonSummary;
  completed: boolean;
  locked: boolean;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          📚 Lição {lesson.lessonNumber}
        </p>
        {completed && (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-label="Concluída" />
        )}
        {locked && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 shrink-0">
            <Lock className="h-3.5 w-3.5" />
            Bloqueada
          </span>
        )}
      </div>
      <p className="text-base text-zinc-600 dark:text-zinc-300 mt-2">
        Kanji {lesson.orderStart}–{lesson.orderEnd}
      </p>
      <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 mt-1">
        {lesson.kanjiCount} kanji
      </p>
    </>
  );
}

export default function LessonListView({
  datasetId,
  title,
  totalKanji,
  lessons,
}: LessonListViewProps) {
  const pathname = usePathname();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const refreshProgress = useCallback(() => {
    setCompletedLessons(getCompletedLessons(datasetId));
  }, [datasetId]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress, pathname]);

  const lessonLabel = lessons.length === 1 ? "lição" : "lições";
  const completedCount = completedLessons.length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
          {title}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {lessons.length} {lessonLabel} · {totalKanji} kanji
        </p>
        <p className="text-sm text-zinc-400 mt-0.5">
          {completedCount} de {lessons.length} lições concluídas
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {lessons.map((lesson, index) => {
          const completed = completedLessons.includes(lesson.lessonNumber);
          const unlocked = isLessonUnlocked(lesson.lessonNumber, completedLessons);
          const tint = CARD_TINTS[index % CARD_TINTS.length];

          if (!unlocked) {
            return (
              <div
                key={lesson.lessonNumber}
                aria-disabled="true"
                className={[
                  "block min-h-[140px] rounded-3xl p-6",
                  "shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08)]",
                  "opacity-50 cursor-not-allowed",
                  tint,
                ].join(" ")}
              >
                <LessonCardContent lesson={lesson} completed={false} locked />
              </div>
            );
          }

          return (
            <Link
              key={lesson.lessonNumber}
              href={`/study/${datasetId}/lesson/${lesson.lessonNumber}`}
              className={[
                "group block min-h-[140px] rounded-3xl p-6",
                "shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08)]",
                "transition-all duration-200 ease-out",
                "hover:scale-[1.02] hover:-translate-y-0.5",
                "hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]",
                "active:scale-[0.98]",
                tint,
              ].join(" ")}
            >
              <LessonCardContent lesson={lesson} completed={completed} locked={false} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
