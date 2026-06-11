import { Kanji, UserProgress } from "@/lib/mock/db";
import {
  getLessonCompletionTotals,
  getStudiedKanjiIds,
} from "@/services/lesson-progress";

const PROGRESS_KEY = "nihongo_cards_progress";

// Recupera todo o progresso do localStorage
export function getLocalProgress(): UserProgress[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Erro ao ler progresso do localStorage:", e);
    return [];
  }
}

// Salva todo o progresso no localStorage
export function saveLocalProgress(progress: UserProgress[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

// Atualiza o progresso para um item específico (Kanji/Hiragana/Katakana)
export function updateItemProgress(
  cardId: string,
  type: 'hiragana' | 'katakana' | 'kanji',
  knows: boolean
): UserProgress {
  const currentProgress = getLocalProgress();
  const existingIdx = currentProgress.findIndex(
    (p) => p.kanji_id === cardId && p.type === type
  );

  let item: UserProgress;

  if (existingIdx >= 0) {
    item = currentProgress[existingIdx];
    if (knows) {
      item.correct_answers += 1;
      if (item.status === "new") item.status = "learning";
      else if (item.status === "learning" && item.correct_answers >= 3) item.status = "reviewing";
      else if (item.status === "reviewing" && item.correct_answers >= 6) item.status = "mastered";
    } else {
      item.wrong_answers += 1;
      item.status = "learning"; // volta a aprender se errar
    }
    
    // Cálculo simples de revisão espaçada básica (horas/dias de intervalo)
    const now = new Date();
    item.last_review = now.toISOString();
    
    let nextReviewDate = new Date();
    if (item.status === "learning") {
      nextReviewDate.setHours(now.getHours() + 4); // Revisa em 4 horas
    } else if (item.status === "reviewing") {
      nextReviewDate.setDate(now.getDate() + 2); // Revisa em 2 dias
    } else if (item.status === "mastered") {
      nextReviewDate.setDate(now.getDate() + 7); // Revisa em 7 dias
    } else {
      nextReviewDate.setMinutes(now.getMinutes() + 30); // 30 minutos
    }
    item.next_review = nextReviewDate.toISOString();

    currentProgress[existingIdx] = item;
  } else {
    // Cria um progresso novo
    const now = new Date();
    let nextReviewDate = new Date();
    
    if (knows) {
      nextReviewDate.setHours(now.getHours() + 4);
    } else {
      nextReviewDate.setMinutes(now.getMinutes() + 10);
    }

    item = {
      id: `p-${type}-${cardId}-${Date.now()}`,
      user_id: "local-user",
      kanji_id: cardId,
      type,
      status: knows ? "learning" : "new",
      correct_answers: knows ? 1 : 0,
      wrong_answers: knows ? 0 : 1,
      last_review: now.toISOString(),
      next_review: nextReviewDate.toISOString()
    };
    currentProgress.push(item);
  }

  saveLocalProgress(currentProgress);
  return item;
}

// Obtém estatísticas gerais para o Dashboard
export interface ProgressStats {
  dailyStreak: number;
  reviewedCardsCount: number;
  studiedKanjisCount: number;
  masteredKanjisCount: number;
  learningKanjisCount: number;
  totalKanjisCount: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
}

export function getProgressStats(allKanji: Kanji[]): ProgressStats {
  const progress = getLocalProgress();
  const totalKanjis = allKanji.length;
  const studiedKanjiIds = getStudiedKanjiIds(allKanji);
  const studiedKanjisCount = studiedKanjiIds.size;
  const { completedLessonsCount, totalLessonsCount } =
    getLessonCompletionTotals(allKanji);

  const kanaReviewedCount = progress.filter(
    (p) => p.type === "hiragana" || p.type === "katakana"
  ).length;
  const reviewedCardsCount = kanaReviewedCount + studiedKanjisCount;

  const masteredKanjisCount = progress.filter(
    (p) => p.type === "kanji" && p.status === "mastered"
  ).length;
  const learningKanjisCount = Math.max(
    0,
    studiedKanjisCount - masteredKanjisCount
  );

  // Streak diário mockado/local
  if (typeof window !== "undefined") {
    const lastAccessStr = localStorage.getItem("nihongo_cards_last_access");
    const todayStr = new Date().toDateString();
    let streak = parseInt(localStorage.getItem("nihongo_cards_streak") || "0", 10);

    if (lastAccessStr !== todayStr) {
      if (lastAccessStr) {
        const lastAccess = new Date(lastAccessStr);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastAccess.toDateString() === yesterday.toDateString()) {
          // Acessou ontem, incrementa streak
          streak += 1;
        } else if (lastAccess.toDateString() !== todayStr) {
          // Perdeu o streak
          streak = 1;
        }
      } else {
        // Primeiro acesso
        streak = 1;
      }
      localStorage.setItem("nihongo_cards_last_access", todayStr);
      localStorage.setItem("nihongo_cards_streak", streak.toString());
    }
    
    return {
      dailyStreak: streak || 1,
      reviewedCardsCount,
      studiedKanjisCount,
      masteredKanjisCount,
      learningKanjisCount,
      totalKanjisCount: totalKanjis,
      completedLessonsCount,
      totalLessonsCount,
    };
  }

  return {
    dailyStreak: 1,
    reviewedCardsCount: 0,
    studiedKanjisCount: 0,
    masteredKanjisCount: 0,
    learningKanjisCount: 0,
    totalKanjisCount: totalKanjis,
    completedLessonsCount: 0,
    totalLessonsCount: 0,
  };
}
