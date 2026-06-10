import "server-only";

import { loadKanjiDataset } from "@/lib/import/load-kanji-dataset";
import type { Kanji } from "@/lib/mock/db";

export function loadShou1Kanji(): Kanji[] {
  return loadKanjiDataset("shou1");
}
