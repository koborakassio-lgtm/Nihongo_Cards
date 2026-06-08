"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MOCK_LESSONS, 
  MOCK_LESSON_ITEMS, 
  MOCK_KANJI, 
  MOCK_VOCABULARY, 
  Kanji, 
  Lesson, 
  Vocabulary 
} from "@/lib/mock/db";
import { getLocalProgress, updateItemProgress } from "@/services/progress";
import { Volume2, ArrowLeft, Eye, RefreshCw, CheckCircle2, ChevronRight, Award } from "lucide-react";

export default function KanjiLessons() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentKanjiIndex, setCurrentKanjiIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [lessonKanjis, setLessonKanjis] = useState<Kanji[]>([]);
  const [learnedCount, setLearnedCount] = useState<number>(0);
  const [lessonFinished, setLessonFinished] = useState<boolean>(false);

  // Carrega contagem global de aprendizados para a listagem
  const [progressMap, setProgressMap] = useState<Map<string, string>>(new Map());

  const loadGlobalProgress = () => {
    const progress = getLocalProgress();
    const map = new Map<string, string>();
    progress.forEach((p) => {
      if (p.type === 'kanji') {
        map.set(p.kanji_id, p.status);
      }
    });
    setProgressMap(map);
  };

  useEffect(() => {
    loadGlobalProgress();
  }, [selectedLesson, lessonFinished]);

  // Ao selecionar uma lição, carrega seus Kanjis correspondentes
  const handleSelectLesson = (lesson: Lesson) => {
    const items = MOCK_LESSON_ITEMS.filter((item) => item.lesson_id === lesson.id);
    const kanjis = items
      .map((item) => MOCK_KANJI.find((k) => k.id === item.kanji_id))
      .filter((k): k is Kanji => !!k);
    
    setLessonKanjis(kanjis);
    setSelectedLesson(lesson);
    setCurrentKanjiIndex(0);
    setIsFlipped(false);
    setLessonFinished(false);
    
    if (kanjis.length > 0) {
      speak(kanjis[0].kanji);
    }
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.7;
    window.speechSynthesis.speak(utterance);
  };

  const handleLearnStatus = (knows: boolean) => {
    const activeKanji = lessonKanjis[currentKanjiIndex];
    if (!activeKanji) return;

    // Atualiza progresso local
    updateItemProgress(activeKanji.id, "kanji", knows);

    // Próximo card ou encerra lição
    if (currentKanjiIndex < lessonKanjis.length - 1) {
      setIsFlipped(false);
      const nextIndex = currentKanjiIndex + 1;
      setCurrentKanjiIndex(nextIndex);
      // Foca e pronuncia o próximo após um breve delay para suavidade
      setTimeout(() => {
        speak(lessonKanjis[nextIndex].kanji);
      }, 300);
    } else {
      setLessonFinished(true);
    }
  };

  const getKanjisForLesson = (lessonId: string) => {
    const items = MOCK_LESSON_ITEMS.filter((item) => item.lesson_id === lessonId);
    return items
      .map((item) => MOCK_KANJI.find((k) => k.id === item.kanji_id))
      .filter((k): k is Kanji => !!k);
  };

  const getVocabulariesForKanji = (kanjiId: string): Vocabulary[] => {
    return MOCK_VOCABULARY.filter((v) => v.kanji_id === kanjiId);
  };

  if (selectedLesson) {
    if (lessonFinished) {
      /* Tela de Sucesso ao Finalizar Lição */
      return (
        <div className="flex flex-col items-center justify-center py-12 animate-fade-in max-w-md mx-auto">
          <Card className="w-full text-center border-none shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] bg-white dark:bg-zinc-950 overflow-hidden">
            <CardHeader className="bg-gradient-to-b from-red-50 to-white dark:from-red-950/10 dark:to-zinc-950 pt-10 pb-6">
              <div className="mx-auto rounded-full bg-red-100 dark:bg-red-950 p-4 w-16 h-16 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Lição Concluída!
              </CardTitle>
              <CardDescription>
                Você concluiu a lição: <b>{selectedLesson.title}</b>
              </CardDescription>
            </CardHeader>
            <CardContent className="py-8 px-6 space-y-6">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Bom trabalho! Todos os {lessonKanjis.length} Kanjis desta lição foram estudados e revisados. O seu progresso de repetição espaçada foi atualizado localmente.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {lessonKanjis.map((k) => (
                  <div key={k.id} className="flex flex-col items-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-japanese">{k.kanji}</span>
                    <span className="text-xs text-zinc-400 mt-1 truncate max-w-full capitalize">{k.meaning_pt}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={() => handleSelectLesson(selectedLesson)} 
                  variant="outline" 
                  className="rounded-xl h-11 border-zinc-200 text-zinc-700 dark:border-zinc-800"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Estudar Novamente
                </Button>
                <Button 
                  onClick={() => setSelectedLesson(null)} 
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-medium"
                >
                  Voltar para Lições
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const activeKanji = lessonKanjis[currentKanjiIndex];
    const vocabList = activeKanji ? getVocabulariesForKanji(activeKanji.id) : [];
    const progressPercent = Math.round(((currentKanjiIndex) / lessonKanjis.length) * 100);

    return (
      /* Tela do Flashcard de Kanji */
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedLesson(null)} 
            className="text-zinc-500 hover:text-zinc-950 rounded-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div className="text-xs font-semibold text-zinc-400">
            {selectedLesson.title} — Kanji {currentKanjiIndex + 1} de {lessonKanjis.length}
          </div>
        </div>

        {/* Barra de Progresso da Lição */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Progresso da Lição</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-zinc-100 dark:bg-zinc-900" />
        </div>

        {activeKanji && (
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            {/* LADO A: Desenho / Visual */}
            <Card className="flex-1 border-none shadow-[0_4px_20px_rgba(0,0,0,0.04)] bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-hidden">
              <CardHeader className="pb-2 border-b border-zinc-100/50 dark:border-zinc-900/40 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Escrita & Forma</CardTitle>
                  <CardDescription className="text-xs">Visualize a forma do kanji</CardDescription>
                </div>
                <button 
                  onClick={() => speak(activeKanji.kanji)}
                  className="p-2 rounded-full bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 hover:scale-105 border border-zinc-100 dark:border-zinc-800 transition-all text-zinc-600 dark:text-zinc-400"
                  title="Pronunciar"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-6 flex-1 justify-center space-y-4">
                {/* Kanji Gigante */}
                <div className="text-7xl md:text-8xl font-bold font-japanese text-zinc-950 dark:text-zinc-50 select-none pb-2">
                  {activeKanji.kanji}
                </div>
              </CardContent>
            </Card>

            {/* LADO B: Leitura / Significado */}
            <Card className="flex-1 border-none shadow-[0_4px_20px_rgba(0,0,0,0.04)] bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-hidden">
              <CardHeader className="pb-2 border-b border-zinc-100/50 dark:border-zinc-900/40">
                <CardTitle className="text-sm font-bold text-zinc-700 dark:text-zinc-300 font-sans">Leituras & Vocabulário</CardTitle>
                <CardDescription className="text-xs">Tradução e exemplos em japonês</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                {!isFlipped ? (
                  /* Lado oculto (Frente) */
                  <div className="flex flex-col items-center justify-center h-full space-y-4 py-8">
                    <p className="text-zinc-500 text-sm text-center">Tente lembrar do significado, leituras ON e KUN e exemplos de palavras.</p>
                    <Button 
                      onClick={() => {
                        setIsFlipped(true);
                        speak(activeKanji.kanji);
                      }} 
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full font-medium"
                    >
                      <Eye className="h-4 w-4 mr-2" /> Revelar Significado
                    </Button>
                  </div>
                ) : (
                  /* Lado revelado (Verso) */
                  <div className="space-y-5 animate-fade-in text-left">
                    {/* Significado */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Significado</span>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 capitalize">
                        {activeKanji.meaning_pt}
                      </div>
                    </div>

                    {/* Leituras */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Onyomi (ON)</span>
                        <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-300 font-japanese">
                          {activeKanji.onyomi}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Kunyomi (KUN)</span>
                        <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-300 font-japanese">
                          {activeKanji.kunyomi}
                        </div>
                      </div>
                    </div>

                    {/* Vocabulários */}
                    {vocabList.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Palavras de Exemplo</span>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {vocabList.map((v) => (
                            <div 
                              key={v.id} 
                              onClick={() => speak(v.word)}
                              className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors"
                            >
                              <div>
                                <span className="font-japanese font-bold text-base text-zinc-900 dark:text-zinc-50">{v.word}</span>
                                <span className="text-zinc-400 text-xs font-japanese font-medium ml-2">({v.reading})</span>
                              </div>
                              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{v.meaning_pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Botões de Ação do Progresso (Sempre visíveis, mas estimulam revelar primeiro) */}
                <div className="flex gap-3 pt-6 border-t border-zinc-100/50 dark:border-zinc-900/40">
                  <Button
                    onClick={() => handleLearnStatus(false)}
                    variant="outline"
                    className="flex-1 rounded-xl h-11 border-zinc-200 text-zinc-600 dark:border-zinc-850 dark:text-zinc-400 hover:bg-zinc-50 font-medium"
                  >
                    Ainda não sei
                  </Button>
                  <Button
                    onClick={() => handleLearnStatus(true)}
                    className="flex-1 rounded-xl h-11 bg-red-500 hover:bg-red-600 text-white font-medium"
                  >
                    Eu conheço!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  /* Listagem de Lições */
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">Lições de Kanji</h2>
        <p className="text-zinc-500 text-sm">Aprenda os ideogramas japoneses organizados por lições escolares do Shōgakkō.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MOCK_LESSONS.map((lesson) => {
          const kanjis = getKanjisForLesson(lesson.id);
          // Calcula quantos kanjis dessa lição o usuário já "aprendeu" (status !== 'new' e já revisou)
          const totalInLesson = kanjis.length;
          const masteredInLesson = kanjis.filter((k) => {
            const status = progressMap.get(k.id);
            return status === "mastered" || status === "reviewing";
          }).length;
          const percent = totalInLesson > 0 ? Math.round((masteredInLesson / totalInLesson) * 100) : 0;

          return (
            <Card 
              key={lesson.id} 
              className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:scale-[1.01] transition-transform duration-200 bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-hidden"
            >
              <CardHeader className="pb-3 bg-gradient-to-r from-zinc-50/50 to-white dark:from-zinc-900/30 dark:to-zinc-950 border-b border-zinc-100/40 dark:border-zinc-900/10">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                  Lição {lesson.lesson_number} • Ano {lesson.grade}º Shōgakkō
                </span>
                <CardTitle className="text-lg font-bold text-zinc-800 dark:text-zinc-100 pt-1">
                  {lesson.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Visualização rápida dos Kanjis da lição */}
                <div className="flex gap-2.5">
                  {kanjis.map((k) => {
                    const status = progressMap.get(k.id);
                    const isMastered = status === "mastered";
                    const isLearning = status === "learning" || status === "reviewing";
                    return (
                      <div 
                        key={k.id} 
                        className={`h-11 w-11 rounded-lg flex items-center justify-center border font-japanese font-bold text-lg select-none ${
                          isMastered 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400" 
                            : isLearning
                            ? "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400"
                            : "bg-zinc-50 border-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:border-zinc-900 dark:text-zinc-300"
                        }`}
                        title={`${k.kanji} - ${k.meaning_pt}`}
                      >
                        {k.kanji}
                      </div>
                    );
                  })}
                </div>

                {/* Progresso de Conclusão */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                    <span>Dominados: {masteredInLesson} / {totalInLesson}</span>
                    <span>{percent}%</span>
                  </div>
                  <Progress value={percent} className="h-1.5 bg-zinc-100 dark:bg-zinc-900" />
                </div>

                <Button 
                  onClick={() => handleSelectLesson(lesson)} 
                  className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium mt-2 shadow-sm"
                >
                  Estudar esta Lição <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
