"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_HIRAGANA, MOCK_KATAKANA, Hiragana, Katakana } from "@/lib/mock/db";
import { getLocalProgress, updateItemProgress } from "@/services/progress";
import { Volume2, CheckCircle2, Circle, ArrowLeft, RotateCcw } from "lucide-react";

interface KanaStudyProps {
  type: "hiragana" | "katakana";
}

export default function KanaStudy({ type }: KanaStudyProps) {
  const dataset: (Hiragana | Katakana)[] = type === "hiragana" ? MOCK_HIRAGANA : MOCK_KATAKANA;
  const [selectedChar, setSelectedChar] = useState<Hiragana | Katakana | null>(null);
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());

  // Carrega progresso de aprendizado
  const loadProgress = () => {
    const progress = getLocalProgress();
    const learned = progress
      .filter((p) => p.type === type && (p.status === "mastered" || p.status === "reviewing" || p.status === "learning"))
      .map((p) => p.kanji_id);
    setLearnedIds(new Set(learned));
  };

  useEffect(() => {
    loadProgress();
  }, [type]);

  const speak = (char: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(char);
    utterance.lang = "ja-JP";
    utterance.rate = 0.75;
    window.speechSynthesis.speak(utterance);
  };

  const handleLearnStatus = (id: string, knows: boolean) => {
    updateItemProgress(id, type, knows);
    loadProgress();
    // Vai para o próximo automaticamente ou fecha
    const currentIndex = dataset.findIndex((c) => c.id === id);
    if (currentIndex >= 0 && currentIndex < dataset.length - 1) {
      const nextChar = dataset[currentIndex + 1];
      setSelectedChar(nextChar);
      speak(nextChar.character);
    } else {
      setSelectedChar(null);
    }
  };

  const handleSelectChar = (char: Hiragana | Katakana) => {
    setSelectedChar(char);
    speak(char.character);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold capitalize text-zinc-950 dark:text-zinc-50">
            Estudo de {type}
          </h2>
          <p className="text-zinc-500 text-sm">
            {type === "hiragana" 
              ? "O alfabeto fonético principal para palavras nativas do japonês." 
              : "Utilizado para escrever palavras de origem estrangeira e nomes."}
          </p>
        </div>
        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full">
          Progresso: {learnedIds.size} / {dataset.length} ({Math.round((learnedIds.size / dataset.length) * 100) || 0}%)
        </div>
      </div>

      {selectedChar ? (
        /* Modo Flashcard */
        <div className="flex flex-col items-center justify-center py-6">
          <Card className="w-full max-w-md border-none shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedChar(null)} 
                className="text-zinc-500 hover:text-zinc-950 rounded-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao grid
              </Button>
              <span className="text-xs text-zinc-400 capitalize">Cartão de Estudo ({type})</span>
            </div>
            
            <CardContent className="flex flex-col items-center py-12 space-y-8">
              {/* Caractere gigante */}
              <div className="relative flex items-center justify-center w-48 h-48 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100/60 dark:border-zinc-900/40">
                <span className="text-8xl font-bold text-zinc-900 dark:text-zinc-50 font-japanese select-none">
                  {selectedChar.character}
                </span>
                <button 
                  onClick={() => speak(selectedChar.character)}
                  className="absolute bottom-3 right-3 p-2.5 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:scale-105 transition-transform"
                  title="Ouvir Pronúncia"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>

              {/* Informações */}
              <div className="text-center space-y-2">
                <div className="text-4xl font-extrabold text-red-500 tracking-wider uppercase font-sans">
                  {selectedChar.romaji}
                </div>
                <div className="text-zinc-400 text-sm">
                  Pronúncia em romaji
                </div>
              </div>

              {/* Quadro interativo de escrita (Simulado) */}
              <div className="w-full max-w-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/30 text-center">
                <p className="text-xs text-zinc-500 mb-2">Pratique desenhando na tela ou no papel:</p>
                <div className="h-28 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 relative overflow-hidden group cursor-crosshair">
                  <span className="text-zinc-200 dark:text-zinc-800 text-7xl select-none font-japanese font-light pointer-events-none">
                    {selectedChar.character}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-zinc-600 bg-white px-2 py-1 rounded shadow-sm">Desenhe aqui</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 w-full pt-4">
                <Button
                  onClick={() => handleLearnStatus(selectedChar.id, false)}
                  variant="outline"
                  className="flex-1 rounded-xl h-12 border-zinc-200 hover:bg-zinc-50 text-zinc-600 dark:text-zinc-300 dark:border-zinc-800 font-semibold"
                >
                  Ainda não sei
                </Button>
                <Button
                  onClick={() => handleLearnStatus(selectedChar.id, true)}
                  className="flex-1 rounded-xl h-12 bg-red-500 hover:bg-red-600 text-white font-semibold"
                >
                  Já sei!
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Grid de Seleção */
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {dataset.map((char) => {
            const isLearned = learnedIds.has(char.id);
            return (
              <button
                key={char.id}
                onClick={() => handleSelectChar(char)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 hover:scale-105 bg-white dark:bg-zinc-950 ${
                  isLearned
                    ? "border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-[0_2px_10px_rgba(16,185,129,0.04)]"
                    : "border-zinc-100 hover:border-zinc-200 hover:shadow-sm dark:border-zinc-900"
                }`}
              >
                <span className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 font-japanese">
                  {char.character}
                </span>
                <span className="text-xs font-semibold text-zinc-400 mt-1 uppercase tracking-wider">
                  {char.romaji}
                </span>

                {/* Badge de aprendido */}
                {isLearned && (
                  <span className="absolute top-1.5 right-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
