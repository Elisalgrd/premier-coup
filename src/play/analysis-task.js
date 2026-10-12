import { analyzeGame } from "../chess/analysis.js";
const tasks = new WeakMap();

export const pendingAnalyses = (state) => state.games.filter((g) => !g.analysis);

export function pendingAnalysisCard(state) {
  const games = pendingAnalyses(state);
  if (!games.length) return "";
  const interrupted = games.some((g) => ["running", "interrupted"].includes(g.analysisStatus));
  return `<a class="notice-good analysis-pending" href="#train/import"><strong>${games.length} partie${games.length > 1 ? "s" : ""} à analyser →</strong>${interrupted ? "<span>Analyse interrompue, reprendre →</span>" : "<span>Retrouve tes erreurs pour les retravailler.</span>"}</a>`;
}

// A pending game is consumed only by a fully completed analysis.
export async function analyzePendingGame(record, engine, { save, ...options }) {
  const ticket = {};
  tasks.set(record, ticket);
  record.analysisStatus = "running";
  await save();
  try {
    const result = await analyzeGame(record, engine, options);
    record.autoAnalyze = false;
    record.analysisStatus = "complete";
    await save();
    return result;
  } catch (error) {
    if (tasks.get(record) === ticket) {
      record.analysisStatus = "interrupted";
      await save();
    }
    throw error;
  }
}
