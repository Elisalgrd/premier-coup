import { Chess } from "../chess/chess.js";
import { moveUci } from "../chess/notation.js";
import { gradeCard, rememberMistake } from "../learn/srs.js";

// before is from the pupil's side; after is from the opponent's side.
export function acceptableCorrection(before, after, mate = false) {
  if (mate) return true;
  if (!before || !after || !Number.isFinite(before.score) || !Number.isFinite(after.score)) return false;
  if (after.type === "mate" && after.score < 0) return true;
  if (before.type === "mate") {
    if (before.score > 0) return false;
    if (after.type !== "mate") return true;
    return after.score >= Math.abs(before.score);
  }
  if (after.type === "mate") return false;
  return before.score + after.score <= 50;
}
export async function checkCorrection(engine, fen, move, bestResult = null) {
  const game = new Chess(fen); moveUci(game, move);
  if (game.isCheckmate()) return { ok: true, mate: true, fen: game.fen() };
  try {
    const before = bestResult || await engine.search(fen, { depth: 12 });
    const after = game.isDraw() ? { type: "cp", score: 0, line: [] } : await engine.search(game.fen(), { depth: 12 });
    if (!before.best || before.depth === 0 || after.depth === 0) throw Error("Analyse indisponible");
    return { ok: acceptableCorrection(before, after), before, after, fen: game.fen() };
  } catch { return { unavailable: true, ok: false }; }
}
export class CorrectionSession {
  constructor(state, record) {
    this.state = state; this.record = record;
    this.moments = record.analysis?.allMoments || [];
    const signature = JSON.stringify(this.moments.map(m => [m.ply, m.fen]));
    if (record.correction?.signature !== signature) record.correction = { signature, index: 0, attempts: {}, helped: {}, results: {} };
    this.run = record.correction;
  }
  fail(moment) { this.run.attempts[moment.ply] = (this.run.attempts[moment.ply] || 0) + 1; }
  help(moment) { this.run.helped[moment.ply] = true; }
  complete(moment, clean) {
    if (Object.hasOwn(this.run.results, moment.ply)) return;
    const card = rememberMistake(this.state, this.record.id, moment);
    gradeCard(this.state, card.id, clean);
    this.run.results[moment.ply] = clean;
  }
  get cleanCount() { return Object.values(this.run.results).filter(Boolean).length; }
}
