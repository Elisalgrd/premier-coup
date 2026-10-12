import { Chess } from "../chess/chess.js";
import { Engine } from "../chess/engine.js";
import { classify, labelMistake } from "../chess/analysis.js";
import { moveUci, describeMove, pieceName } from "../chess/notation.js";
import { friendlyMistake } from "../ui/helpers.js";

export const coachModes = { all: "Gaffes et erreurs", blunders: "Gaffes seulement", off: "Désactivé (mode partie sérieuse)" };
export const coachMode = (mode) => Object.hasOwn(coachModes, mode) ? mode : "all";

export function materialLoss(loss) {
  if (loss >= 800) return "environ la valeur d’une dame";
  if (loss >= 650) return "environ la valeur d’une tour et de deux pions";
  if (loss >= 450) return "environ la valeur d’une tour";
  if (loss >= 250) return "environ la valeur d’une pièce (un cavalier ou un fou)";
  if (loss > 150) return "environ la valeur de deux pions";
  return "environ la valeur d’un pion";
}

export function coachMessage(fen, played, before, after) {
  if (!before?.best || !after || before.best === played) return null;
  const afterGame = new Chess(fen);
  moveUci(afterGame, played);
  if (afterGame.isCheckmate()) return null;
  const cls = classify(before, after);
  if (!cls.severity || cls.severity === "imprécision") return null;
  const bestGame = new Chess(fen), bestMove = moveUci(bestGame, before.best);
  const tag = labelMistake(fen, played, before.best, before, after);
  const lineGame = new Chess(fen), line = [];
  for (const move of before.line?.length ? before.line.slice(0, 5) : [before.best]) {
    try { moveUci(lineGame, move); line.push(move); } catch { break; }
  }
  if (!line.length || line[0] !== before.best) return null;
  const afterFen = afterGame.fen();
  const reply = after.line?.[0] || after.best;
  let replyMove = null;
  if (reply && reply !== "(none)") {
    try { replyMove = moveUci(afterGame, reply); } catch { /* Missing PV is not a made-up threat. */ }
  }
  const risk = cls.sufferedMate
    ? `L’adversaire peut forcer la fin de la partie : ton roi ne pourra plus être sauvé en ${Math.abs(after.score)} coup${Math.abs(after.score) > 1 ? "s" : ""}.`
    : cls.missedMate
      ? "Tu pouvais attaquer le roi sans lui laisser de défense. Cette victoire forcée n’est plus disponible."
      : replyMove
        ? `Après ton coup : ${describeMove(replyMove)} La position se dégrade d’${materialLoss(cls.loss)}.`
        : `Ce coup laisse une meilleure position à l’adversaire : l’écart vaut ${materialLoss(cls.loss)}.`;
  const idea = tag.label === "Capture gratuite ratée" ? " Tu prenais cette pièce sans exposer la tienne à une reprise immédiate."
    : tag.label === "Mat raté" ? " Cette attaque permettait de terminer la partie sans laisser de défense au roi."
    : ["Pièce laissée en prise", "Menace adverse ignorée", "Fourchette subie", "Mat du couloir"].includes(tag.label) ? " Ce coup limitait le danger adverse." : " Compare ensuite la réponse adverse.";
  const opportunity = tag.label === "Capture gratuite ratée" && bestMove.captured
    ? `L’adversaire t’offrait ${["q", "r"].includes(bestMove.captured) ? "sa" : "son"} ${pieceName[bestMove.captured]} en ${bestMove.to}.` : "";
  return { ...cls, ...tag, fen, played, best: before.best, line, reply: replyMove ? reply : null,
    afterFen,
    title: friendlyMistake(tag.label), risk, better: describeMove(bestMove) + idea, opportunity };
}

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
