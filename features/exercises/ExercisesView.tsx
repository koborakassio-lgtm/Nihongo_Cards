"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_KANJI, MOCK_VOCABULARY, Kanji, Vocabulary } from "@/lib/mock/db";
import { Check, X, Award, RefreshCw, Star, Zap, ChevronRight } from "lucide-react";

type ExerciseType = "multiple-choice" | "match-kanji" | "match-vocab" | null;

interface MatchItem {
  id: string;
  text: string;
  pairId: string; // ID correspondente para bater o par
  type: "left" | "right";
  isMatched: boolean;
}

export default function ExercisesView() {
  const [activeExercise, setActiveExercise] = useState<ExerciseType>(null);
  
  // Estados para Múltipla Escolha
  const [mcQuestion, setMcQuestion] = useState<Kanji | null>(null);
  const [mcOptions, setMcOptions] = useState<Kanji[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [questionsCount, setQuestionsCount] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  // Estados para Relacionar (Matching)
  const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchItem[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<MatchItem | null>(null);
  const [selectedRight, setSelectedRight] = useState<MatchItem | null>(null);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [matchFinished, setMatchFinished] = useState<boolean>(false);

  // ----------------------------------------
  // GERADORES DE EXERCÍCIOS
  // ----------------------------------------

  // Inicializa Múltipla Escolha
  const generateMultipleChoice = () => {
    if (MOCK_KANJI.length < 4) return;
    
    // Escolhe uma pergunta aleatória
    const questionIndex = Math.floor(Math.random() * MOCK_KANJI.length);
    const question = MOCK_KANJI[questionIndex];
    
    // Gera as opções (a pergunta + 3 distratores)
    const options = [question];
    while (options.length < 4) {
      const randomOption = MOCK_KANJI[Math.floor(Math.random() * MOCK_KANJI.length)];
      if (!options.some((o) => o.id === randomOption.id)) {
        options.push(randomOption);
      }
    }
    
    // Embaralha opções
    options.sort(() => Math.random() - 0.5);
    
    setMcQuestion(question);
    setMcOptions(options);
    setSelectedOptionId(null);
    setIsCorrectAnswer(null);
    setIsAnswered(false);
  };

  // Inicializa Relacionar Kanji -> Tradução
  const generateMatchKanji = () => {
    // Pega até 4 kanjis aleatórios
    const shuffledKanjis = [...MOCK_KANJI].sort(() => Math.random() - 0.5).slice(0, 4);
    
    const left: MatchItem[] = shuffledKanjis.map((k) => ({
      id: `l-${k.id}`,
      text: k.kanji,
      pairId: `r-${k.id}`,
      type: "left" as const,
      isMatched: false
    }));

    const right: MatchItem[] = shuffledKanjis.map((k) => ({
      id: `r-${k.id}`,
      text: k.meaning_pt,
      pairId: `l-${k.id}`,
      type: "right" as const,
      isMatched: false
    })).sort(() => Math.random() - 0.5); // Embaralha a coluna da direita

    setLeftItems(left);
    setRightItems(right);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchScore(0);
    setMatchFinished(false);
  };

  // Inicializa Relacionar Palavra -> Leitura (Vocab)
  const generateMatchVocab = () => {
    const shuffledVocab = [...MOCK_VOCABULARY].sort(() => Math.random() - 0.5).slice(0, 4);
    
    const left: MatchItem[] = shuffledVocab.map((v) => ({
      id: `l-${v.id}`,
      text: v.word,
      pairId: `r-${v.id}`,
      type: "left" as const,
      isMatched: false
    }));

    const right: MatchItem[] = shuffledVocab.map((v) => ({
      id: `r-${v.id}`,
      text: `${v.reading} (${v.meaning_pt})`,
      pairId: `l-${v.id}`,
      type: "right" as const,
      isMatched: false
    })).sort(() => Math.random() - 0.5);

    setLeftItems(left);
    setRightItems(right);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchScore(0);
    setMatchFinished(false);
  };

  // ----------------------------------------
  // LÓGICA DE EVENTOS
  // ----------------------------------------

  // Múltipla Escolha - Resposta
  const handleMcAnswer = (optionId: string) => {
    if (isAnswered || !mcQuestion) return;
    
    setSelectedOptionId(optionId);
    const correct = optionId === mcQuestion.id;
    setIsCorrectAnswer(correct);
    setIsAnswered(true);
    setQuestionsCount((prev) => prev + 1);
    if (correct) {
      setScore((prev) => prev + 1);
      // Voz nativa do japonês para o Kanji acertado
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

  // Relacionar - Seleção de Item
  const handleMatchSelect = (item: MatchItem) => {
    if (item.isMatched) return;

    if (item.type === "left") {
      setSelectedLeft(item);
      // Se já houver um selecionado na direita, checa match
      if (selectedRight) {
        checkMatch(item, selectedRight);
      }
    } else {
      setSelectedRight(item);
      // Se já houver um selecionado na esquerda, checa match
      if (selectedLeft) {
        checkMatch(selectedLeft, item);
      }
    }
  };

  const checkMatch = (left: MatchItem, right: MatchItem) => {
    if (left.pairId === right.id) {
      // Deu match!
      setLeftItems((prev) => prev.map((item) => item.id === left.id ? { ...item, isMatched: true } : item));
      setRightItems((prev) => prev.map((item) => item.id === right.id ? { ...item, isMatched: true } : item));
      setMatchScore((prev) => prev + 1);
      
      // Limpa seleções
      setSelectedLeft(null);
      setSelectedRight(null);
      
      // Fala a palavra em japonês se for Kanji ou Vocab
      if (left.text.length === 1) speak(left.text); // Kanji
      else speak(left.text.split(" ")[0]); // Palavra
    } else {
      // Erro: Reseta a seleção com um efeito visual piscando
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  // Monitora se todos os pares foram relacionados
  useEffect(() => {
    if (activeExercise === "match-kanji" || activeExercise === "match-vocab") {
      if (leftItems.length > 0 && leftItems.every((item) => item.isMatched)) {
        setMatchFinished(true);
      }
    }
  }, [leftItems, activeExercise]);

  const resetAllExercises = () => {
    setActiveExercise(null);
    setScore(0);
    setQuestionsCount(0);
    setMatchFinished(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">Central de Exercícios</h2>
        <p className="text-zinc-500 text-sm">Teste e fixe os seus conhecimentos locais por meio de jogos interativos.</p>
      </div>

      {!activeExercise ? (
        /* Tela de Seleção do Exercício */
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Card 1: Múltipla Escolha */}
          <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-hidden">
            <CardHeader>
              <div className="text-2xl mb-1">🎯</div>
              <CardTitle className="text-base font-bold text-zinc-800 dark:text-zinc-100">Múltipla Escolha</CardTitle>
              <CardDescription className="text-xs">Identifique o significado dos Kanjis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => {
                  setActiveExercise("multiple-choice");
                  setScore(0);
                  setQuestionsCount(0);
                  // Executa a primeira pergunta
                  setTimeout(() => generateMultipleChoice(), 50);
                }} 
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium"
              >
                Jogar
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Relacionar Kanji */}
          <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-hidden">
            <CardHeader>
              <div className="text-2xl mb-1">🔗</div>
              <CardTitle className="text-base font-bold text-zinc-800 dark:text-zinc-100">Relacionar Kanji</CardTitle>
              <CardDescription className="text-xs">Ligue o Kanji à tradução correspondente.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => {
                  setActiveExercise("match-kanji");
                  generateMatchKanji();
                }} 
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium"
              >
                Jogar
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: Relacionar Palavras */}
          <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-hidden">
            <CardHeader>
              <div className="text-2xl mb-1">🗣️</div>
              <CardTitle className="text-base font-bold text-zinc-800 dark:text-zinc-100">Palavra & Leitura</CardTitle>
              <CardDescription className="text-xs">Associe as palavras escritas em Kanji às suas leituras.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => {
                  setActiveExercise("match-vocab");
                  generateMatchVocab();
                }} 
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium"
              >
                Jogar
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : activeExercise === "multiple-choice" ? (
        /* ----------------------------------------
           JOGO 1: MÚLTIPLA ESCOLA
           ---------------------------------------- */
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <Button variant="ghost" size="sm" onClick={resetAllExercises} className="rounded-full">
              Sair
            </Button>
            <div className="flex items-center gap-4 font-semibold">
              <span className="flex items-center text-amber-500"><Star className="h-4 w-4 mr-1 fill-amber-500" /> {score} Acertos</span>
              <span>Pergunta {questionsCount}</span>
            </div>
          </div>

          {mcQuestion && (
            <Card className="border-none shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] bg-white dark:bg-zinc-950 overflow-hidden">
              <CardHeader className="text-center py-10 border-b border-zinc-100/50 dark:border-zinc-900/40">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Qual é a tradução deste Kanji?</span>
                <div className="text-8xl font-bold font-japanese text-zinc-950 dark:text-zinc-50 pt-4 select-none">
                  {mcQuestion.kanji}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {mcOptions.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const isCorrectOption = option.id === mcQuestion.id;
                  
                  let btnVariant: "outline" | "default" = "outline";
                  let btnClass = "w-full justify-start h-12 rounded-xl text-base font-semibold border-zinc-200 transition-all ";

                  if (isAnswered) {
                    if (isCorrectOption) {
                      btnClass += "bg-emerald-50 border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400";
                    } else if (isSelected) {
                      btnClass += "bg-red-50 border-red-500 text-red-700 hover:bg-red-50 dark:bg-red-950/20 dark:text-red-400";
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
                      {isAnswered && isCorrectOption && <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                      {isAnswered && isSelected && !isCorrectOption && <X className="h-5 w-5 text-red-600 dark:text-red-400" />}
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
      ) : (
        /* ----------------------------------------
           JOGOS 2 E 3: RELACIONAR (MATCHING)
           ---------------------------------------- */
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <Button variant="ghost" size="sm" onClick={resetAllExercises} className="rounded-full">
              Sair
            </Button>
            <div className="font-semibold text-zinc-700 dark:text-zinc-300">
              Relacione os pares correspondentes
            </div>
          </div>

          {matchFinished ? (
            <Card className="text-center border-none shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] bg-white dark:bg-zinc-950 py-10 px-6">
              <div className="mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/40 p-4 w-16 h-16 flex items-center justify-center mb-4 text-emerald-600">
                <Check className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Parabéns!</CardTitle>
              <CardDescription className="mt-1">Você relacionou todos os pares com sucesso.</CardDescription>
              <CardContent className="pt-6 flex flex-col gap-3">
                <Button 
                  onClick={activeExercise === "match-kanji" ? generateMatchKanji : generateMatchVocab} 
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-11"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Jogar Novamente
                </Button>
                <Button 
                  onClick={resetAllExercises} 
                  variant="outline" 
                  className="rounded-xl h-11 border-zinc-200"
                >
                  Voltar ao Menu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-6 pt-2">
              {/* Coluna da Esquerda (Japonês) */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block text-center mb-1">Japonês</span>
                {leftItems.map((item) => {
                  const isSelected = selectedLeft?.id === item.id;
                  let cardClass = "w-full p-4 rounded-xl border font-japanese font-bold text-center transition-all cursor-pointer ";
                  
                  if (item.isMatched) {
                    cardClass += "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900 opacity-40 cursor-default";
                  } else if (isSelected) {
                    cardClass += "bg-red-50 border-red-400 text-red-600 dark:bg-red-950/20 dark:border-red-900 shadow-sm";
                  } else {
                    cardClass += "bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-sm dark:bg-zinc-950 dark:border-zinc-900 text-zinc-900 dark:text-zinc-100 text-xl md:text-2xl";
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

              {/* Coluna da Direita (Tradução/Leitura) */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block text-center mb-1">Significado / Leitura</span>
                {rightItems.map((item) => {
                  const isSelected = selectedRight?.id === item.id;
                  let cardClass = "w-full p-4 rounded-xl border text-sm font-semibold text-center transition-all cursor-pointer ";
                  
                  if (item.isMatched) {
                    cardClass += "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900 opacity-40 cursor-default";
                  } else if (isSelected) {
                    cardClass += "bg-red-50 border-red-400 text-red-600 dark:bg-red-950/20 dark:border-red-900 shadow-sm";
                  } else {
                    cardClass += "bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-sm dark:bg-zinc-950 dark:border-zinc-900 text-zinc-800 dark:text-zinc-200 text-sm py-[18px]";
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
