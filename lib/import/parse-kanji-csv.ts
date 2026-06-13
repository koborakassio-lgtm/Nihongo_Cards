import type { Kanji, Vocabulary } from "@/lib/mock/db";

export interface KanjiCsvRow {
  id: string;
  grupo: string;
  ano_escolar: string;
  kanji: string;
  unicode: string;
  radical: string;
  onyomi: string;
  kunyomi: string;
  meaning_pt: string;
  jlpt: string;
  svg_path: string;
  order_in_grade: string;
  vocabulary_1: string;
  reading_1: string;
  meaning_1: string;
  vocabulary_2: string;
  reading_2: string;
  meaning_2: string;
}

export interface KanjiImportResult {
  kanji: Kanji[];
  vocabulary: Vocabulary[];
}

const COLUMN_ALIASES: Record<string, string> = {
  group: "grupo",
  grade: "ano_escolar",
  order: "order_in_grade",
};

const REQUIRED_COLUMNS = [
  "id",
  "grupo",
  "ano_escolar",
  "kanji",
  "unicode",
  "radical",
  "onyomi",
  "meaning_pt",
  "jlpt",
  "svg_path",
  "order_in_grade",
] as const;

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function rowToRecord(headers: string[], values: string[]): KanjiCsvRow {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    record[header] = values[index] ?? "";
  });
  return record as unknown as KanjiCsvRow;
}

function validateRow(row: KanjiCsvRow, lineNumber: number): void {
  for (const column of REQUIRED_COLUMNS) {
    if (column === "onyomi") continue;
    if (!row[column]?.trim()) {
      throw new Error(`Linha ${lineNumber}: coluna obrigatória "${column}" vazia.`);
    }
  }

  if (!row.onyomi?.trim() && !row.kunyomi?.trim()) {
    throw new Error(
      `Linha ${lineNumber}: informe ao menos onyomi ou kunyomi.`
    );
  }

  if (!/^U\+[0-9A-F]{4,5}$/i.test(row.unicode.trim())) {
    throw new Error(`Linha ${lineNumber}: unicode inválido "${row.unicode}".`);
  }

  if (!row.svg_path.startsWith("/kanji/")) {
    throw new Error(`Linha ${lineNumber}: svg_path deve começar com /kanji/.`);
  }

  const codepoint = row.unicode.replace("U+", "").toUpperCase();
  if (!row.svg_path.toUpperCase().includes(codepoint)) {
    throw new Error(
      `Linha ${lineNumber}: svg_path deve usar o codepoint Unicode (${codepoint}).`
    );
  }
}

function buildVocabulary(
  row: KanjiCsvRow,
  kanjiId: string,
  slot: 1 | 2
): Vocabulary | null {
  const word = row[`vocabulary_${slot}`]?.trim();
  const reading = row[`reading_${slot}`]?.trim();
  const meaning = row[`meaning_${slot}`]?.trim();

  if (!word && !reading && !meaning) return null;

  if (!word || !reading || !meaning) {
    throw new Error(
      `Kanji id=${row.id}: vocabulary_${slot} exige word, reading e meaning preenchidos.`
    );
  }

  return {
    id: `v-${kanjiId}-${slot}`,
    kanji_id: kanjiId,
    word,
    reading,
    meaning_pt: meaning,
    priority: slot,
  };
}

export function parseKanjiCsv(content: string): KanjiImportResult {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV deve conter cabeçalho e ao menos uma linha de dados.");
  }

  const rawHeaders = parseCsvLine(lines[0]);
  const headers = rawHeaders.map((header) => COLUMN_ALIASES[header] ?? header);
  const kanjiById = new Map<string, Kanji>();
  const kanjiByCharacter = new Map<string, string>();
  const vocabulary: Vocabulary[] = [];

  for (let i = 1; i < lines.length; i++) {
    const lineNumber = i + 1;
    const row = rowToRecord(headers, parseCsvLine(lines[i]));
    validateRow(row, lineNumber);

    const kanjiId = `kanji-${row.id.trim()}`;
    const character = row.kanji.trim();

    if (kanjiByCharacter.has(character)) {
      throw new Error(
        `Linha ${lineNumber}: kanji duplicado "${character}" (id ${kanjiByCharacter.get(character)} e ${row.id}).`
      );
    }

    const kanjiRecord: Kanji = {
      id: kanjiId,
      grupo: row.grupo.trim(),
      ano_escolar: Number.parseInt(row.ano_escolar, 10),
      kanji: character,
      unicode: row.unicode.trim().toUpperCase(),
      radical: row.radical.trim(),
      onyomi: row.onyomi.trim(),
      kunyomi: row.kunyomi?.trim() ?? "",
      meaning_pt: row.meaning_pt.trim(),
      jlpt: row.jlpt.trim().toUpperCase(),
      svg_path: row.svg_path.trim(),
      order_in_grade: Number.parseInt(row.order_in_grade, 10),
    };

    kanjiById.set(kanjiId, kanjiRecord);
    kanjiByCharacter.set(character, row.id.trim());

    const vocab1 = buildVocabulary(row, kanjiId, 1);
    const vocab2 = buildVocabulary(row, kanjiId, 2);
    if (vocab1) vocabulary.push(vocab1);
    if (vocab2) vocabulary.push(vocab2);
  }

  const kanji = Array.from(kanjiById.values()).sort(
    (a, b) => a.ano_escolar - b.ano_escolar || a.order_in_grade - b.order_in_grade
  );

  return { kanji, vocabulary };
}

export function mergeKanjiImports(
  existing: KanjiImportResult,
  incoming: KanjiImportResult
): KanjiImportResult {
  const kanjiMap = new Map(existing.kanji.map((item) => [item.id, item]));
  const vocabMap = new Map(existing.vocabulary.map((item) => [item.id, item]));
  const characterMap = new Map(existing.kanji.map((item) => [item.kanji, item.id]));

  for (const item of incoming.kanji) {
    const previousId = characterMap.get(item.kanji);
    if (previousId && previousId !== item.id) {
      kanjiMap.delete(previousId);
      for (const [vocabId, vocab] of vocabMap) {
        if (vocab.kanji_id === previousId) vocabMap.delete(vocabId);
      }
    }
    kanjiMap.set(item.id, item);
    characterMap.set(item.kanji, item.id);
  }

  for (const item of incoming.vocabulary) {
    vocabMap.set(item.id, item);
  }

  return {
    kanji: Array.from(kanjiMap.values()).sort(
      (a, b) => a.ano_escolar - b.ano_escolar || a.order_in_grade - b.order_in_grade
    ),
    vocabulary: Array.from(vocabMap.values()).sort(
      (a, b) => a.kanji_id.localeCompare(b.kanji_id) || a.priority - b.priority
    ),
  };
}
