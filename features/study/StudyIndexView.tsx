import Link from "next/link";
import { KANJI_DATASETS, type KanjiDatasetId } from "@/lib/kanji/datasets";
import { getTotalLessons } from "@/lib/kanji/lessons";

const CARD_TINTS = [
  "bg-orange-50 dark:bg-orange-950/20",
  "bg-sky-50 dark:bg-sky-950/20",
  "bg-emerald-50 dark:bg-emerald-950/20",
  "bg-violet-50 dark:bg-violet-950/20",
] as const;

interface DatasetSummary {
  id: KanjiDatasetId;
  title: string;
  totalKanji: number;
  totalLessons: number;
}

interface StudyIndexViewProps {
  datasets: DatasetSummary[];
}

export default function StudyIndexView({ datasets }: StudyIndexViewProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
          Kanji — Shougakko
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Escolha o ano escolar para começar as lições.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {datasets.map((dataset, index) => {
          const tint = CARD_TINTS[index % CARD_TINTS.length];
          const config = KANJI_DATASETS[dataset.id];

          return (
            <Link
              key={dataset.id}
              href={`/study/${dataset.id}`}
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
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {config.title}
              </p>
              <p className="text-base text-zinc-600 dark:text-zinc-300 mt-2">
                {dataset.totalLessons}{" "}
                {dataset.totalLessons === 1 ? "lição" : "lições"} · {dataset.totalKanji} kanji
              </p>
              <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 mt-1">
                {dataset.totalKanji} kanji do {dataset.id === "shou1" ? "1º" : "2º"} ano
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function buildDatasetSummaries(
  counts: Record<KanjiDatasetId, number>
): DatasetSummary[] {
  return (Object.keys(KANJI_DATASETS) as KanjiDatasetId[]).map((id) => ({
    id,
    title: KANJI_DATASETS[id].title,
    totalKanji: counts[id],
    totalLessons: getTotalLessons(counts[id]),
  }));
}
