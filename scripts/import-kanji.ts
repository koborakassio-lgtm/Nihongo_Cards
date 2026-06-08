import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  mergeKanjiImports,
  parseKanjiCsv,
  type KanjiImportResult,
} from "../lib/import/parse-kanji-csv";

const ROOT = resolve(import.meta.dirname, "..");
const CSV_ARG = process.argv[2] ?? "data/shou1.csv";
const CSV_PATH = resolve(ROOT, CSV_ARG);
const KANJI_OUT = resolve(ROOT, "lib/data/kanji.json");
const VOCAB_OUT = resolve(ROOT, "lib/data/vocabulary.json");

function loadExisting(): KanjiImportResult {
  if (!existsSync(KANJI_OUT) || !existsSync(VOCAB_OUT)) {
    return { kanji: [], vocabulary: [] };
  }

  return {
    kanji: JSON.parse(readFileSync(KANJI_OUT, "utf-8")) as KanjiImportResult["kanji"],
    vocabulary: JSON.parse(readFileSync(VOCAB_OUT, "utf-8")) as KanjiImportResult["vocabulary"],
  };
}

function main(): void {
  if (!existsSync(CSV_PATH)) {
    throw new Error(`Arquivo não encontrado: ${CSV_PATH}`);
  }

  const csv = readFileSync(CSV_PATH, "utf-8");
  const incoming = parseKanjiCsv(csv);
  const merge = process.argv.includes("--merge");
  const dataset = merge ? mergeKanjiImports(loadExisting(), incoming) : incoming;

  mkdirSync(resolve(ROOT, "lib/data"), { recursive: true });
  writeFileSync(KANJI_OUT, `${JSON.stringify(dataset.kanji, null, 2)}\n`, "utf-8");
  writeFileSync(VOCAB_OUT, `${JSON.stringify(dataset.vocabulary, null, 2)}\n`, "utf-8");

  console.log(`Importados ${incoming.kanji.length} kanji de ${CSV_ARG}.`);
  console.log(`Total no dataset: ${dataset.kanji.length} kanji, ${dataset.vocabulary.length} vocabulários.`);
  console.log(`→ ${KANJI_OUT}`);
  console.log(`→ ${VOCAB_OUT}`);
}

main();
