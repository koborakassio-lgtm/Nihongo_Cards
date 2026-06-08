import { loadShou1Kanji } from "@/lib/import/load-shou1";
import type { Kanji } from "@/lib/mock/db";

export const dynamic = "force-dynamic";

export default function DebugKanjiPage() {
  let kanji: Kanji[] = [];
  let error: string | null = null;

  try {
    kanji = loadShou1Kanji();
  } catch (err) {
    error = err instanceof Error ? err.message : "Erro ao carregar shou1.csv";
  }

  if (error) {
    return (
      <main>
        <h1>Debug: shou1.csv kanji</h1>
        <p>Erro ao carregar o dataset:</p>
        <pre>{error}</pre>
      </main>
    );
  }

  return (
    <main>
      <h1>Debug: shou1.csv kanji ({kanji.length} records)</h1>
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Kanji</th>
            <th>Meaning (Portuguese)</th>
            <th>Onyomi</th>
            <th>Kunyomi</th>
          </tr>
        </thead>
        <tbody>
          {kanji.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.order_in_grade}</td>
              <td>{entry.kanji}</td>
              <td>{entry.meaning_pt}</td>
              <td>{entry.onyomi}</td>
              <td>{entry.kunyomi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
