"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getProgressStats, ProgressStats } from "@/services/progress";
import { MOCK_KANJI } from "@/lib/mock/db";
import { Flame, BookOpen, CheckCircle, GraduationCap, ArrowRight, Sparkles } from "lucide-react";

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({ setActiveTab }: DashboardViewProps) {
  const [stats, setStats] = useState<ProgressStats | null>(null);

  useEffect(() => {
    setStats(getProgressStats(MOCK_KANJI));
  }, []);

  if (!stats) return <div className="text-center py-10">Carregando painel...</div>;

  const studiedPercentage =
    stats.totalKanjisCount > 0
      ? Math.round((stats.studiedKanjisCount / stats.totalKanjisCount) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner de Boas-Vindas */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 p-6 md:p-8 dark:from-zinc-900 dark:to-orange-950/20 border border-orange-100/40 dark:border-orange-900/10">
        <div className="absolute right-4 top-4 text-orange-200/50 dark:text-orange-900/20">
          <Sparkles className="h-24 w-24" />
        </div>
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
            Nihongo Cards 🇯🇵
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Bem-vindo ao seu aprendizado de Japonês!
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
            Pratique Hiragana, Katakana, Kanjis escolares e faça revisões inteligentes para memorizar de forma definitiva.
          </p>
          <div className="pt-2">
            <Button
              asChild
              className="bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-all shadow-sm hover:shadow"
            >
              <Link href="/study">
                Iniciar Lições <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Streak */}
        <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:scale-[1.02] transition-transform duration-200 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Sequência Diária</CardTitle>
            <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-950/30">
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.dailyStreak} {stats.dailyStreak === 1 ? 'Dia' : 'Dias'}</div>
            <CardDescription className="text-xs text-zinc-400 mt-1">Mantenha o hábito diariamente!</CardDescription>
          </CardContent>
        </Card>

        {/* Card 2: Revisões */}
        <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:scale-[1.02] transition-transform duration-200 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Cartões Estudados</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-950/30">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.reviewedCardsCount}</div>
            <CardDescription className="text-xs text-zinc-400 mt-1">Caracteres tentados no total</CardDescription>
          </CardContent>
        </Card>

        {/* Card 3: Kanjis Dominados */}
        <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:scale-[1.02] transition-transform duration-200 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Kanjis Dominados</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-950/30">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.masteredKanjisCount}</div>
            <CardDescription className="text-xs text-zinc-400 mt-1">Kanjis totalmente fixados</CardDescription>
          </CardContent>
        </Card>

        {/* Card 4: Kanjis em Aprendizado */}
        <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:scale-[1.02] transition-transform duration-200 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Em Aprendizado</CardTitle>
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-950/30">
              <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.learningKanjisCount}</div>
            <CardDescription className="text-xs text-zinc-400 mt-1">Kanjis ativos na memória</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Progresso de Kanji Geral */}
      <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Progresso Geral de Kanji</CardTitle>
          <CardDescription>
            Kanji estudados de um total de {stats.totalKanjisCount} disponíveis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-zinc-600 dark:text-zinc-400">Kanji estudados</span>
            <span className="text-red-500">{studiedPercentage}%</span>
          </div>
          <Progress value={studiedPercentage} className="h-3 bg-zinc-100 dark:bg-zinc-900" />
          <div className="flex justify-between text-xs text-zinc-400 pt-1">
            <span>{stats.studiedKanjisCount} estudados</span>
            <span>{stats.totalKanjisCount} kanji no total</span>
          </div>
          <p className="text-xs text-zinc-500 pt-1">
            {stats.masteredKanjisCount} dominados · {stats.completedLessonsCount} de{" "}
            {stats.totalLessonsCount} lições concluídas
          </p>
        </CardContent>
      </Card>

      {/* Ações Rápidas de Estudo */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">O que você gostaria de estudar hoje?</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab("hiragana")}
            className="h-20 justify-start px-6 border-zinc-100 hover:border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:bg-zinc-50 text-left font-medium rounded-xl"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-red-500">あ</span>
              <div>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">Hiragana</div>
                <div className="text-xs text-zinc-400 font-normal">Silabário principal</div>
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setActiveTab("katakana")}
            className="h-20 justify-start px-6 border-zinc-100 hover:border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:bg-zinc-50 text-left font-medium rounded-xl"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-red-500">ア</span>
              <div>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">Katakana</div>
                <div className="text-xs text-zinc-400 font-normal">Palavras estrangeiras</div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            asChild
            className="h-20 justify-start px-6 border-zinc-100 hover:border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:bg-zinc-50 text-left font-medium rounded-xl"
          >
            <Link href="/study">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-red-500">日</span>
                <div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">Kanji</div>
                  <div className="text-xs text-zinc-400 font-normal">Shougakko 1º e 2º ano</div>
                </div>
              </div>
            </Link>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setActiveTab("exercises")}
            className="h-20 justify-start px-6 border-zinc-100 hover:border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:bg-zinc-50 text-left font-medium rounded-xl"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-red-500">✍️</span>
              <div>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">Exercícios</div>
                <div className="text-xs text-zinc-400 font-normal">Fixar aprendizado</div>
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
