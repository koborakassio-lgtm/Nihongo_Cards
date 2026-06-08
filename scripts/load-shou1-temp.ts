import { loadShou1Kanji } from "../lib/import/load-shou1";

const kanji = loadShou1Kanji();

console.log("Total records loaded:", kanji.length);
console.log("First record:", kanji[0]);
console.log("Last record:", kanji[kanji.length - 1]);
