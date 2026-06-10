"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Kanji } from "@/lib/mock/db";
import type { KanjiDatasetId } from "@/lib/kanji/datasets";
import { isLessonUnlocked } from "@/lib/kanji/lessons";
import {
  getCompletedLessons,
  isLessonCompleted,
  markLessonComplete,
} from "@/services/lesson-progress";
import { ArrowLeft } from "lucide-react";

interface LessonKanjiViewProps {
  datasetId: KanjiDatasetId;
  datasetTitle: string;
  lessonNumber: number;
  orderStart: number;
  orderEnd: number;
  kanji: Kanji[];
}

export default function LessonKanjiView({
  datasetId,
  datasetTitle,
  lessonNumber,
  orderStart,
  orderEnd,
  kanji,
}: LessonKanjiViewProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "redirecting">(
    "loading"
  );

  useEffect(() => {
    const completedLessons = getCompletedLessons(datasetId);
    const unlocked = isLessonUnlocked(lessonNumber, completedLessons);

    if (!unlocked) {
      setStatus("redirecting");
      router.replace(`/study/${datasetId}`);
      return;
    }

    setIsCompleted(isLessonCompleted(datasetId, lessonNumber));
    setStatus("ready");
  }, [datasetId, lessonNumber]);

  const handleComplete = () => {
    markLessonComplete(datasetId, lessonNumber);
    router.push(`/study/${datasetId}`);
  };

  if (status !== "ready") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-400 animate-pulse">
          {status === "redirecting" ? "Redirecionando..." : "Carregando..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-zinc-500 hover:text-zinc-950 rounded-full"
        >
          <Link href={`/study/${datasetId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Link>
        </Button>
        <span className="text-xs font-semibold text-zinc-400">
          {kanji.length} kanji
        </span>
      </div>

      <div>
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
          {datasetTitle}
        </p>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 mt-1">
          Lesson {lessonNumber} ({orderStart}–{orderEnd})
        </h1>
      </div>

      <div className="grid gap-3">
        {kanji.map((entry) => (
          <Card
            key={entry.id}
            className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white dark:bg-zinc-950 overflow-hidden"
          >
            <CardHeader className="pb-2 border-b border-zinc-100/50 dark:border-zinc-900/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  #{entry.order_in_grade}
                </CardTitle>
                <span className="text-3xl font-bold font-japanese text-zinc-950 dark:text-zinc-50">
                  {entry.kanji}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50 capitalize">
                {entry.meaning_pt}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Onyomi
                  </span>
                  <p className="font-japanese text-zinc-700 dark:text-zinc-300">
                    {entry.onyomi || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Kunyomi
                  </span>
                  <p className="font-japanese text-zinc-700 dark:text-zinc-300">
                    {entry.kunyomi || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-2 pb-4">
        <Button
          onClick={handleComplete}
          disabled={isCompleted}
          className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-base disabled:opacity-60"
        >
          {isCompleted ? "Lição concluída" : "Concluir lição"}
        </Button>
      </div>
    </div>
  );
}
