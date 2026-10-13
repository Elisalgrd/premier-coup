import { Chess } from "./chess.js";
import { moveUci, sanFr } from "./notation.js";
import { rememberMistake } from "../learn/srs.js";
import { mistakeMessage } from "./mistake-text.js";
import { mistakeQuestion } from "./mistake-questions.js";
export { classify, labelMistake, centipawns } from "./mistake-core.js";
export const hasCompleteAnalysis = record => Array.isArray(record.analysis?.allMoments);
export async function analyzeGame(
  record,
  engine,
  { depth = 12, onProgress = () => {}, state = null, signal = null } = {},
) {
  const g = new Chess(record.initialFen),
    moments = [], inaccuracies = [], actual = new Map(),
    total = record.moves.filter(
      (m, i) =>
        (i % 2 === 0 ? g.turn() : g.turn() === "w" ? "b" : "w") ===
        record.color,
    ).length;
  let n = 0;
  for (let i = 0; i < record.moves.length; i++) {
    if (signal?.aborted) throw Error("Analyse annulée.");
    const move = record.moves[i],
      fen = g.fen(),
      side = g.turn(),
      made = moveUci(g, move);
    if (side !== record.color) continue;
    actual.set(i + 1, { fen, played: move });
    onProgress(n, total);
    const before = await engine.search(fen, { depth });
    if (signal?.aborted) throw Error("Analyse interrompue.");
    let after;
    if (g.isCheckmate()) after = { type: "mate", score: 0, line: [] };
    else if (g.isDraw()) after = { type: "cp", score: 0, line: [] };
    else after = await engine.search(g.fen(), { depth });
    if (signal?.aborted) throw Error("Analyse interrompue.");
    const message = mistakeMessage(fen, move, before, after, { includeInaccuracies: true });
    if (message) {
      const moment = { ...message, ply: i + 1, playedSan: sanFr(made.san) };
      (message.severity === "imprécision" ? inaccuracies : moments).push(moment);
    }
    n++;
    onProgress(n, total);
  }
  if (signal?.aborted) throw Error("Analyse interrompue.");
  const byPly = new Map(moments.map(m => [m.ply, m]));
  for (const alert of record.alerts || []) {
    const played = actual.get(alert.ply);
    // A taken-back branch stays in the coach history, never in the actual replay.
    if (!alert.retracted && played?.fen === alert.fen && played.played === alert.played && !byPly.has(alert.ply))
      byPly.set(alert.ply, { ...alert, question: alert.question || mistakeQuestion(alert.label) });
  }
  const allMoments = [...byPly.values()].sort((a, b) => a.ply - b.ply);
  moments.sort((a, b) => b.loss - a.loss);
  const result = {
    depth,
    at: Date.now(),
    moments: moments.slice(0, 5),
    allMoments, inaccuracies: inaccuracies.filter(m => !byPly.has(m.ply)),
    analyzedMoves: n,
  };
  record.analysis = result;
  if (state) {
    for (const m of result.allMoments)
      rememberMistake(state, record.id, m);
  }
  return result;
}
