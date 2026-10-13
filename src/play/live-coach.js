import { Chess } from "../chess/chess.js";
import { Engine } from "../chess/engine.js";
import { mistakeMessage as coachMessage } from "../chess/mistake-text.js";
export { mistakeMessage as coachMessage, materialLoss } from "../chess/mistake-text.js";
import { moveUci, describeMove, pieceName } from "../chess/notation.js";
import { friendlyMistake } from "../ui/helpers.js";

export const coachModes = { all: "Gaffes et erreurs", blunders: "Gaffes seulement", off: "Désactivé (mode partie sérieuse)" };
export const coachMode = (mode) => Object.hasOwn(coachModes, mode) ? mode : "all";

export class LiveCoach {
  constructor({ mode = "all", mobile = false, engineFactory = () => new Engine() } = {}) {
    this.mode = coachMode(mode);
    this.options = { depth: 12, ...(mobile ? { maxTime: 700 } : {}) };
    this.factory = engineFactory;
    this.cache = new Map();
    this.closed = false;
  }
  prepare(fen) {
    if (this.closed || this.mode === "off") return Promise.resolve(null);
    if (!this.cache.has(fen)) {
      const task = (async () => {
        try { this.engine ??= this.factory(); return await this.engine.search(fen, this.options); }
        catch { return null; }
      })();
      this.cache.set(fen, task);
      if (this.cache.size > 48) this.cache.delete(this.cache.keys().next().value);
    }
    return this.cache.get(fen);
  }
  async afterMove(fen, played) {
    if (this.closed || this.mode === "off") return null;
    try {
      const afterGame = new Chess(fen);
      moveUci(afterGame, played);
      const beforeTask = this.prepare(fen);
      const afterTask = afterGame.isGameOver()
        ? Promise.resolve({ type: afterGame.isCheckmate() ? "mate" : "cp", score: 0, line: [] })
        : this.prepare(afterGame.fen());
      const [before, after] = await Promise.all([beforeTask, afterTask]);
      if (this.closed) return null;
      const message = coachMessage(fen, played, before, after);
      return this.mode === "blunders" && message?.severity !== "gaffe" ? null : message;
    } catch { return null; }
  }
  close() { this.closed = true; this.engine?.close(); this.cache.clear(); }
}

export function coachSummary(alerts = []) {
  const counts = new Map();
  for (const alert of alerts) {
    const item = counts.get(alert.label) || { count: 0, label: alert.label, entryId: alert.entryId };
    item.count++;
    counts.set(alert.label, item);
  }
  return { total: alerts.length, repeated: [...counts.values()].sort((a, b) => b.count - a.count)[0] || null };
}
