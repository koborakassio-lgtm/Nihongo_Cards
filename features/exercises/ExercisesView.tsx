"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_KANJI, MOCK_VOCABULARY, Kanji, Vocabulary } from "@/lib/mock/db";
import { buildLessonSummaries, type LessonSummary } from "@/lib/kanji/lessons";
import {
  canRunExercise,
  getKanjiPoolForCompletedLessons,
  getKanjiPoolForLesson,
  getVocabularyForKanjiPool,
} from "@/lib/kanji/exercise-pool";
import { getCompletedLessons } from "@/services/lesson-progress";
import { Check, X, RefreshCw, Star, ChevronRight, Lock, CheckCircle2 } from "lucide-react";

const DATASET_ID = "shou1" as const;

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

type ExerciseStep = "select-scope" | "select-type" | "playing";
type ExerciseType = "multiple-choice" | "match-kanji" | "match-vocab" | null;

interface MatchItem {
  id: string;
  text: string;
  pairId: string;
  type: "left" | "right";
  isMatched: boolean;
}

function LessonScopeCard({
  lesson,
  completed,
  tint,
  onSelect,
}: {
  lesson: LessonSummary;
  completed: boolean;
  tint: string;
  onSelect: () => void;
}) {
  if (!completed) {
    return (
      <div
        aria-disabled="true"
        className={[
          "block min-h-[140px] rounded-3xl p-6",
          "shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08)]",
          "opacity-50 cursor-not-allowed",
          tint,
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Lesson {lesson.lessonNumber}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 shrink-0">
            <Lock className="h-3.5 w-3.5" />
            Não concluída
          </span>
        </div>
        <p className="text-base text-zinc-600 dark:text-zinc-300 mt-2">
          Kanji {lesson.orderStart}–{lesson.orderEnd}
        </p>
        <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 mt-1">
          {lesson.kanjiCount} Kanji
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "group block w-full min-h-[140px] rounded-3xl p-6 text-left",
        "shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08)]",
        "transition-all duration-200 ease-out",
        "hover:scale-[1.02] hover:-translate-y-0.5",
        "hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]",
        "active:scale-[0.98]",
        tint,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Lesson {lesson.lessonNumber}
        </p>
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-label="Concluída" />
      </div>
      <p className="text-base text-zinc-600 dark:text-zinc-300 mt-2">
        Kanji {lesson.orderStart}–{lesson.orderEnd}
      </p>
      <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 mt-1">
        {lesson.kanjiCount} Kanji
      </p>
    </button>
  );
}

export default function ExercisesView() {
  const [exerciseStep, setExerciseStep] = useState<ExerciseStep>("select-scope");
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [lessons] = useState<LessonSummary[]>(() => buildLessonSummaries(MOCK_KANJI));

  const [kanjiPool, setKanjiPool] = useState<Kanji[]>([]);
  const [vocabPool, setVocabPool] = useState<Vocabulary[]>([]);
  const [scopeLabel, setScopeLabel] = useState("");

  const [activeExercise, setActiveExercise] = useState<ExerciseType>(null);

  const [mcQuestion, setMcQuestion] = useState<Kanji | null>(null);
  const [mcOptions, setMcOptions] = useState<Kanji[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [questionsCount, setQuestionsCount] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchItem[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<MatchItem | null>(null);
  const [selectedRight, setSelectedRight] = useState<MatchItem | null>(null);
  const [matchFinished, setMatchFinished] = useState<boolean>(false);

  const refreshProgress = useCallback(() => {
    setCompletedLessons(getCompletedLessons(DATASET_ID));
  }, []);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const applyScope = (pool: Kanji[], label: string) => {
    setKanjiPool(pool);
    setVocabPool(getVocabularyForKanjiPool(MOCK_VOCABULARY, pool));
    setScopeLabel(label);
    setExerciseStep("select-type");
  };

  const selectLessonScope = (lessonNumber: number) => {
    const pool = getKanjiPoolForLesson(MOCK_KANJI, lessonNumber);
    applyScope(pool, `Lesson ${lessonNumber}`);
  };

  const selectGeneralReview = () => {
    const pool = getKanjiPoolForCompletedLessons(MOCK_KANJI, completedLessons);
    applyScope(pool, `Revisão geral (${pool.length} kanji)`);
  };

  const generateMultipleChoice = useCallback(() => {
    if (!canRunExercise(kanjiPool)) return;

    const questionIndex = Math.floor(Math.random() * kanjiPool.length);
    const question = kanjiPool[questionIndex];

    const options = [question];
    while (options.length < 4) {
      const randomOption = kanjiPool[Math.floor(Math.random() * kanjiPool.length)];
      if (!options.some((o) => o.id === randomOption.id)) {
        options.push(randomOption);
      }
    }

    options.sort(() => Math.random() - 0.5);

    setMcQuestion(question);
    setMcOptions(options);
    setSelectedOptionId(null);
    setIsAnswered(false);
  }, [kanjiPool]);

  const generateMatchKanji = useCallback(() => {
    if (!canRunExercise(kanjiPool)) return;

    const shuffledKanjis = [...kanjiPool].sort(() => Math.random() - 0.5).slice(0, 4);

    const left: MatchItem[] = shuffledKanjis.map((k) => ({
      id: `l-${k.id}`,
      text: k.kanji,
      pairId: `r-${k.id}`,
      type: "left" as const,
      isMatched: false,
    }));

    const right: MatchItem[] = shuffledKanjis
      .map((k) => ({
        id: `r-${k.id}`,
        text: k.meaning_pt,
        pairId: `l-${k.id}`,
        type: "right" as const,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setLeftItems(left);
    setRightItems(right);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchFinished(false);
  }, [kanjiPool]);

  const generateMatchVocab = useCallback(() => {
    if (!canRunExercise(vocabPool)) return;

    const shuffledVocab = [...vocabPool].sort(() => Math.random() - 0.5).slice(0, 4);

    const left: MatchItem[] = shuffledVocab.map((v) => ({
      id: `l-${v.id}`,
      text: v.word,
      pairId: `r-${v.id}`,
      type: "left" as const,
      isMatched: false,
    }));

    const right: MatchItem[] = shuffledVocab
      .map((v) => ({
        id: `r-${v.id}`,
        text: `${v.reading} (${v.meaning_pt})`,
        pairId: `l-${v.id}`,
        type: "right" as const,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setLeftItems(left);
    setRightItems(right);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchFinished(false);
  }, [vocabPool]);

  const handleMcAnswer = (optionId: string) => {
    if (isAnswered || !mcQuestion) return;

    setSelectedOptionId(optionId);
    const correct = optionId === mcQuestion.id;
    setIsAnswered(true);
    setQuestionsCount((prev) => prev + 1);
    if (correct) {
      setScore((prev) => prev + 1);
      speak(mcQuestion.kanji);
    }
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleMatchSelect = (item: MatchItem) => {
    if (item.isMatched) return;

    if (item.type === "left") {
      setSelectedLeft(item);
      if (selectedRight) {
        checkMatch(item, selectedRight);
      }
    } else {
      setSelectedRight(item);
      if (selectedLeft) {
        checkMatch(selectedLeft, item);
      }
    }
  };

  const checkMatch = (left: MatchItem, right: MatchItem) => {
    if (left.pairId === right.id) {
      setLeftItems((prev) =>
        prev.map((item) => (item.id === left.id ? { ...item, isMatched: true } : item))
      );
      setRightItems((prev) =>
        prev.map((item) => (item.id === right.id ? { ...item, isMatched: true } : item))
      );
      setSelectedLeft(null);
      setSelectedRight(null);

      if (left.text.length === 1) speak(left.text);
      else speak(left.text.split(" ")[0]);
    } else {
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  useEffect(() => {
    if (activeExercise === "match-kanji" || activeExercise === "match-vocab") {
      if (leftItems.length > 0 && leftItems.every((item) => item.isMatched)) {
        setMatchFinished(true);
      }
    }
  }, [leftItems, activeExercise]);

  const backToScope = () => {
    setExerciseStep("select-scope");
    setActiveExercise(null);
    setKanjiPool([]);
    setVocabPool([]);
    setScopeLabel("");
    setScore(0);
    setQuestionsCount(0);
    setMatchFinished(false);
    refreshProgress();
  };

  const backToTypeSelect = () => {
    setExerciseStep("select-type");
    setActiveExercise(null);
    setScore(0);
    setQuestionsCount(0);
    setMatchFinished(false);
  };

  const startExercise = (type: Exclude<ExerciseType, null>) => {
    setActiveExercise(type);
    setExerciseStep("playing");
    setScore(0);
    setQuestionsCount(0);
    setMatchFinished(false);

    if (type === "multiple-choice") {
      setTimeout(() => generateMultipleChoice(), 50);
    } else if (type === "match-kanji") {
      generateMatchKanji();
    } else {
      generateMatchVocab();
    }
  };

  const kanjiReady = canRunExercise(kanjiPool);
  const vocabReady = canRunExercise(vocabPool);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">Central de Exercícios</h2>
        <p className="text-zinc-500 text-sm">
          Pratique apenas os kanji das lições que você já concluiu.
        </p>
      </div>

      {exerciseStep === "select-scope" && (
        <>
          {completedLessons.length === 0 ? (
            <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white dark:bg-zinc-950 text-center py-10 px-6">
              <CardTitle className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                Nenhuma lição concluída ainda
              </CardTitle>
              <CardDescription className="mt-2 max-w-sm mx-auto">
                Complete pelo menos uma lição em Shougakko 1st Grade para desbloquear os exercícios.
              </CardDescription>
              <CardContent className="pt-6">
                <Button asChild className="bg-red-500 hover:bg-red-600 text-white rounded-full">
                  <Link href="/study/shou1">Ir para as lições</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <button
                type="button"
                onClick={selectGeneralReview}
                className={[
                  "group block w-full rounded-3xl p-6 text-left",
                  "bg-gradient-to-r from-red-50 to-orange-50 dark:from-zinc-900 dark:to-orange-950/20",
                  "border border-orange-100/40 dark:border-orange-900/10",
                  "shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08)]",
                  "transition-all duration-200 ease-out",
                  "hover:scale-[1.01] hover:-translate-y-0.5",
                  "hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]",
                  "active:scale-[0.99]",
                ].join(" ")}
              >
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Revisão geral
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  Todos os kanji das {completedLessons.length} lição
                  {completedLessons.length === 1 ? "" : "ões"} concluída
                  {completedLessons.length === 1 ? "" : "s"}
                </p>
              </button>

              <div>
                <h3 className="text-sm font-semibold text-zinc-500 mb-3">
                  Ou escolha uma lição específica
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {lessons.map((lesson, index) => (
                    <LessonScopeCard
                      key={lesson.lessonNumber}
                      lesson={lesson}
                      completed={completedLessons.includes(lesson.lessonNumber)}
                      tint={CARD_TINTS[index % CARD_TINTS.length]}
                      onSelect={() => selectLessonScope(lesson.lessonNumber)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {exerciseStep === "select-type" && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={backToScope} className="rounded-full text-zinc-500">
              Voltar
            </Button>
            <span className="text-xs font-semibold text-zinc-400">{scopeLabel}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-hidden">
              <CardHeader>
                <div className="text-2xl mb-1">🎯</div>
                <CardTitle className="text-base font-bold text-zinc-800 dark:text-zinc-100">Múltipla Escolha</CardTitle>
                <CardDescription className="text-xs">Identifique o significado dos Kanjis.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => startExercise("multiple-choice")}
                  disabled={!kanjiReady}
                  className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  Jogar
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-hidden">
              <CardHeader>
                <div className="text-2xl mb-1">🔗</div>
                <CardTitle className="text-base font-bold text-zinc-800 dark:text-zinc-100">Relacionar Kanji</CardTitle>
                <CardDescription className="text-xs">Ligue o Kanji à tradução correspondente.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => startExercise("match-kanji")}
                  disabled={!kanjiReady}
                  className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  Jogar
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-hidden">
              <CardHeader>
                <div className="text-2xl mb-1">🗣️</div>
                <CardTitle className="text-base font-bold text-zinc-800 dark:text-zinc-100">Palavra & Leitura</CardTitle>
                <CardDescription className="text-xs">Associe palavras em Kanji às suas leituras.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => startExercise("match-vocab")}
                  disabled={!vocabReady}
                  className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  Jogar
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {exerciseStep === "playing" && activeExercise === "multiple-choice" && (
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <Button variant="ghost" size="sm" onClick={backToTypeSelect} className="rounded-full">
              Sair
            </Button>
            <div className="flex items-center gap-4 font-semibold">
              <span className="flex items-center text-amber-500">
                <Star className="h-4 w-4 mr-1 fill-amber-500" /> {score} Acertos
              </span>
              <span>Pergunta {questionsCount}</span>
            </div>
          </div>
          <p className="text-center text-xs text-zinc-400">{scopeLabel}</p>

          {mcQuestion && (
            <Card className="border-none shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] bg-white dark:bg-zinc-950 overflow-hidden">
              <CardHeader className="text-center py-10 border-b border-zinc-100/50 dark:border-zinc-900/40">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
                  Qual é a tradução deste Kanji?
                </span>
                <div className="text-8xl font-bold font-japanese text-zinc-950 dark:text-zinc-50 pt-4 select-none">
                  {mcQuestion.kanji}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {mcOptions.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const isCorrectOption = option.id === mcQuestion.id;

                  let btnClass =
                    "w-full justify-start h-12 rounded-xl text-base font-semibold border-zinc-200 transition-all ";

                  if (isAnswered) {
                    if (isCorrectOption) {
                      btnClass +=
                        "bg-emerald-50 border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400";
                    } else if (isSelected) {
                      btnClass +=
                        "bg-red-50 border-red-500 text-red-700 hover:bg-red-50 dark:bg-red-950/20 dark:text-red-400";
                    } else {
                      btnClass += "opacity-50 border-zinc-100";
                    }
                  } else {
                    btnClass += "hover:bg-zinc-50 hover:border-zinc-300";
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleMcAnswer(option.id)}
                      disabled={isAnswered}
                      className={`flex items-center justify-between px-4 py-3 border rounded-xl w-full text-left font-medium transition-all ${btnClass}`}
                    >
                      <span>{option.meaning_pt}</span>
                      {isAnswered && isCorrectOption && (
                        <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      {isAnswered && isSelected && !isCorrectOption && (
                        <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </button>
                  );
                })}

                {isAnswered && (
                  <div className="pt-4 animate-fade-in">
                    <Button
                      onClick={generateMultipleChoice}
                      className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl h-12 font-medium"
                    >
                      Próxima Pergunta <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {exerciseStep === "playing" &&
        (activeExercise === "match-kanji" || activeExercise === "match-vocab") && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <Button variant="ghost" size="sm" onClick={backToTypeSelect} className="rounded-full">
                Sair
              </Button>
              <div className="font-semibold text-zinc-700 dark:text-zinc-300">
                Relacione os pares correspondentes
              </div>
            </div>
            <p className="text-center text-xs text-zinc-400">{scopeLabel}</p>

            {matchFinished ? (
              <Card className="text-center border-none shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] bg-white dark:bg-zinc-950 py-10 px-6">
                <div className="mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/40 p-4 w-16 h-16 flex items-center justify-center mb-4 text-emerald-600">
                  <Check className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Parabéns!</CardTitle>
                <CardDescription className="mt-1">
                  Você relacionou todos os pares com sucesso.
                </CardDescription>
                <CardContent className="pt-6 flex flex-col gap-3">
                  <Button
                    onClick={
                      activeExercise === "match-kanji" ? generateMatchKanji : generateMatchVocab
                    }
                    className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-11"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> Jogar Novamente
                  </Button>
                  <Button
                    onClick={backToTypeSelect}
                    variant="outline"
                    className="rounded-xl h-11 border-zinc-200"
                  >
                    Voltar ao Menu
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block text-center mb-1">
                    Japonês
                  </span>
                  {leftItems.map((item) => {
                    const isSelected = selectedLeft?.id === item.id;
                    let cardClass =
                      "w-full p-4 rounded-xl border font-japanese font-bold text-center transition-all cursor-pointer ";

                    if (item.isMatched) {
                      cardClass +=
                        "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900 opacity-40 cursor-default";
                    } else if (isSelected) {
                      cardClass +=
                        "bg-red-50 border-red-400 text-red-600 dark:bg-red-950/20 dark:border-red-900 shadow-sm";
                    } else {
                      cardClass +=
                        "bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-sm dark:bg-zinc-950 dark:border-zinc-900 text-zinc-900 dark:text-zinc-100 text-xl md:text-2xl";
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMatchSelect(item)}
                        disabled={item.isMatched}
                        className={cardClass}
                      >
                        {item.text}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block text-center mb-1">
                    Significado / Leitura
                  </span>
                  {rightItems.map((item) => {
                    const isSelected = selectedRight?.id === item.id;
                    let cardClass =
                      "w-full p-4 rounded-xl border text-sm font-semibold text-center transition-all cursor-pointer ";

                    if (item.isMatched) {
                      cardClass +=
                        "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900 opacity-40 cursor-default";
                    } else if (isSelected) {
                      cardClass +=
                        "bg-red-50 border-red-400 text-red-600 dark:bg-red-950/20 dark:border-red-900 shadow-sm";
                    } else {
                      cardClass +=
                        "bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-sm dark:bg-zinc-950 dark:border-zinc-900 text-zinc-800 dark:text-zinc-200 text-sm py-[18px]";
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMatchSelect(item)}
                        disabled={item.isMatched}
                        className={cardClass}
                      >
                        {item.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
