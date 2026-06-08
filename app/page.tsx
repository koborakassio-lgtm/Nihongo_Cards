"use client";

import React, { useState } from "react";
import DashboardView from "@/features/dashboard/DashboardView";
import KanaStudy from "@/features/kana/KanaStudy";
import KanjiLessons from "@/features/kanji/KanjiLessons";
import ExercisesView from "@/features/exercises/ExercisesView";
import { BookOpen, Award, BarChart3, HelpCircle, Sparkles } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 flex flex-col font-sans transition-colors duration-200">
      {/* Header / Navegação */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-[#FDFDFE]/90 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/90">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-sm shadow-red-500/20">
              <span className="text-white text-xs font-bold font-japanese">日</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-300">
              Nihongo<span className="text-red-500 font-medium">Cards</span>
            </span>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 bg-zinc-100/60 dark:bg-zinc-900/60 p-1.5 rounded-full">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Painel
            </button>
            <button
              onClick={() => setActiveTab("hiragana")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeTab === "hiragana"
                  ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Hiragana
            </button>
            <button
              onClick={() => setActiveTab("katakana")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeTab === "katakana"
                  ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Katakana
            </button>
            <button
              onClick={() => setActiveTab("kanji")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeTab === "kanji"
                  ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Kanji
            </button>
            <button
              onClick={() => setActiveTab("exercises")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeTab === "exercises"
                  ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Exercícios
            </button>
          </nav>

          {/* User Badge / Status */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-900">
              🌸 Modo Local (Mock)
            </span>
          </div>
        </div>
      </header>

      {/* Navegação Mobile (Barra de Abas Inferior) */}
      <nav className="md:hidden fixed bottom-0 left-0 z-50 w-full border-t border-zinc-100 bg-[#FDFDFE]/95 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/95 flex justify-around items-center h-16 py-2 px-3">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center flex-1 text-center transition-colors ${
            activeTab === "dashboard" ? "text-red-500" : "text-zinc-400"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-[10px] font-bold mt-1">Painel</span>
        </button>
        <button
          onClick={() => setActiveTab("hiragana")}
          className={`flex flex-col items-center justify-center flex-1 text-center transition-colors ${
            activeTab === "hiragana" ? "text-red-500" : "text-zinc-400"
          }`}
        >
          <span className="text-base font-bold font-japanese leading-5">あ</span>
          <span className="text-[10px] font-bold mt-0.5">Hiragana</span>
        </button>
        <button
          onClick={() => setActiveTab("katakana")}
          className={`flex flex-col items-center justify-center flex-1 text-center transition-colors ${
            activeTab === "katakana" ? "text-red-500" : "text-zinc-400"
          }`}
        >
          <span className="text-base font-bold font-japanese leading-5">ア</span>
          <span className="text-[10px] font-bold mt-0.5">Katakana</span>
        </button>
        <button
          onClick={() => setActiveTab("kanji")}
          className={`flex flex-col items-center justify-center flex-1 text-center transition-colors ${
            activeTab === "kanji" ? "text-red-500" : "text-zinc-400"
          }`}
        >
          <span className="text-base font-bold font-japanese leading-5">日</span>
          <span className="text-[10px] font-bold mt-0.5">Kanji</span>
        </button>
        <button
          onClick={() => setActiveTab("exercises")}
          className={`flex flex-col items-center justify-center flex-1 text-center transition-colors ${
            activeTab === "exercises" ? "text-red-500" : "text-zinc-400"
          }`}
        >
          <Award className="h-5 w-5" />
          <span className="text-[10px] font-bold mt-1">Exercícios</span>
        </button>
      </nav>

      {/* Conteúdo Principal */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 md:py-10 pb-24 md:pb-10">
        <div className="transition-all duration-300">
          {activeTab === "dashboard" && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === "hiragana" && <KanaStudy type="hiragana" />}
          {activeTab === "katakana" && <KanaStudy type="katakana" />}
          {activeTab === "kanji" && <KanjiLessons />}
          {activeTab === "exercises" && <ExercisesView />}
        </div>
      </main>

      {/* Rodapé */}
      <footer className="hidden md:block w-full border-t border-zinc-100 dark:border-zinc-900 py-6 mt-12 bg-zinc-50/50 dark:bg-zinc-950/20 text-center">
        <div className="mx-auto max-w-5xl px-4 text-xs text-zinc-400 font-medium flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} Nihongo Cards. Criado localmente com propósitos educacionais.</span>
          <div className="flex gap-4">
            <span className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Português - BR</span>
            <span>•</span>
            <span className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Privacidade</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
