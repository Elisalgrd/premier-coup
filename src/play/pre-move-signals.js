import { Chess } from "../chess/chess.js";
import { moveUci, value } from "../chess/notation.js";
import { endangeredPieces, withTurn } from "../chess/vision.js";
import { centipawns } from "../chess/mistake-core.js";

export const defaultSignals = level => Number(level) <= 5;
export function detectSignal({ fen, previousFen = null, lastMove = null, currentScore = null, previousScore = null }) {
  if (!previousFen || !lastMove || !currentScore) return null;
  const game = new Chess(fen), before = new Chess(previousFen), side = game.turn(), enemy = side === "w" ? "b" : "w";
  if (before.turn() !== enemy) return null;
  const old = new Set(endangeredPieces(before, side));
  const newThreat = endangeredPieces(game, side).some(s => !old.has(s));
  const targets = (g, square) => g.board().flat().filter(p => p?.color === side && (value[p.type] >= 3 || p.type === "k") && g.attackers(p.square, enemy).includes(square)).map(p => p.square);
  const nowTargets = targets(game, lastMove.slice(2,4)), oldTargets = targets(before, lastMove.slice(0,2));
  const fork = nowTargets.length >= 2 && nowTargets.some(s => !oldTargets.includes(s));
  let mateThreat = false;
  if (!game.isCheck()) {
    const attack = withTurn(game, enemy);
    mateThreat = attack.moves({verbose:true}).some(m => m.san.endsWith("#"));
  }
  if (game.isCheck() || newThreat || fork || mateThreat) return { kind: "threat", text: "⚠ Son dernier coup menace quelque chose." };
  const free = game.moves({verbose:true}).some(m => {
    if (!m.captured) return false;
    const after = new Chess(fen); after.move(m);
    return !after.isAttacked(m.to, enemy);
  });
  const gain = previousScore && centipawns(currentScore) + centipawns(previousScore) >= 200;
  if (free || gain || (currentScore.type === "mate" && currentScore.score > 0)) return { kind: "opportunity", text: "💡 Il y a une occasion à saisir." };
  return null;
}
export function signalStats(signals = []) {
  const stats = { opportunity: { total: 0, success: 0, pending: 0 }, threat: { total: 0, success: 0, pending: 0 } };
  for (const s of signals.filter(s => !s.retracted && (s.played || s.success != null))) {
    const item = stats[s.kind]; if (!item) continue;
    item.total++; if (s.success === true) item.success++; if (s.success == null) item.pending++;
  }
  return stats;
}
export function signalSummary(signals) {
  const s = signalStats(signals), pending = s.opportunity.pending + s.threat.pending;
  if (!s.opportunity.total && !s.threat.total) return "";
  return `Signaux : ${s.opportunity.total} occasion${s.opportunity.total > 1 ? "s" : ""}, ${s.opportunity.success} saisie${s.opportunity.success > 1 ? "s" : ""}. ${s.threat.total} menace${s.threat.total > 1 ? "s" : ""}, ${s.threat.success} parée${s.threat.success > 1 ? "s" : ""}.${pending ? ` ${pending} réponse${pending > 1 ? "s" : ""} reste${pending > 1 ? "nt" : ""} à vérifier dans l’analyse.` : ""}`;
}
