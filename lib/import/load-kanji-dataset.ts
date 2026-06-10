import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getKanjiDataset,
  isKanjiDatasetId,
  type KanjiDatasetId,
} from "@/lib/kanji/datasets";
import type { Kanji } from "@/lib/mock/db";
import { parseKanjiCsv } from "@/lib/import/parse-kanji-csv";

export function loadKanjiDataset(id: string): Kanji[] {
  if (!isKanjiDatasetId(id)) {
    throw new Error(`Unknown kanji dataset: ${id}`);
  }

  const { csvFile } = getKanjiDataset(id as KanjiDatasetId);
  const csvPath = join(process.cwd(), "data", csvFile);
  const content = readFileSync(csvPath, "utf-8");
  return parseKanjiCsv(content).kanji;
}
