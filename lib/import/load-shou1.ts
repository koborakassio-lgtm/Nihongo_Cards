import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Kanji } from "@/lib/mock/db";
import { parseKanjiCsv } from "@/lib/import/parse-kanji-csv";

const CSV_PATH = join(process.cwd(), "data/shou1.csv");

export function loadShou1Kanji(): Kanji[] {
  const content = readFileSync(CSV_PATH, "utf-8");
  return parseKanjiCsv(content).kanji;
}
