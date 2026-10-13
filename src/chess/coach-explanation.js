import { Chess } from "./chess.js";
import { moveUci, pieceName, value } from "./notation.js";
import { coachWords } from "../play/coach-words.js";

const own = p => (["r", "q"].includes(p) ? "ta " : "ton ") + pieceName[p];
const their = p => (["r", "q"].includes(p) ? "sa " : "son ") + pieceName[p];
const noun = p => (["r", "q"].includes(p) ? "La " : "Le ") + pieceName[p];
export function simpleMove(move, mine = true) {
  if (!move) return "";
  if (/[kq]/.test(move.flags)) return mine ? "Tu mets ton roi à l’abri avec ta tour." : "L’adversaire met son roi à l’abri avec sa tour.";
  let text = mine ? `Tu déplaces ${own(move.piece)}` : `L’adversaire déplace ${their(move.piece)}`;
  if (move.captured) text = mine ? `${noun(move.piece)} que tu joues prend ${their(move.captured)}` : `${noun(move.piece)} adverse prend ${own(move.captured)}`;
  if (move.promotion) text += ` et le pion devient ${["q","r"].includes(move.promotion) ? "une " : "un "}${pieceName[move.promotion]}`;
  return text + ".";
}
const canCapture = (game, square) => game.moves({ verbose: true }).some(m => m.captured && m.to === square);
const tryMove = (game, move) => { try { return move ? moveUci(game, move) : null; } catch { return null; } };

// Evidence comes from legal board states, not the heuristic motif or an engine
// score translated into an imaginary number of lost pieces. Also works on old reports.
export function explainMistake(m) {
  const start = new Chess(m.fen), side = start.turn(), enemy = side === "w" ? "b" : "w";
  const after = new Chess(m.fen), played = moveUci(after, m.played);
  const response = new Chess(after.fen()), reply = tryMove(response, m.reply);
  const better = new Chess(m.fen), best = moveUci(better, m.best);
  const targets = reply ? response.board().flat().filter(p => p && p.color === side && (p.type === "k" || value[p.type] >= 3) && response.attackers(p.square, enemy).includes(reply.to)) : [];
  const safeTake = best.captured && !canCapture(better, best.to);
  let consequence = "quiet", bestReason = "bestQuiet", remember = "rememberCompare";
  let title = "Deux idées à comparer", savedSquare = null;
  if (response.isCheckmate()) { consequence = "mate"; title = "Ton roi ne peut plus être sauvé"; }
  else if (reply?.captured) {
    consequence = !played.captured && !canCapture(response, reply.to) ? "taken" : "capture";
    title = consequence === "taken" ? `${own(reply.captured)[0].toUpperCase() + own(reply.captured).slice(1)} peut être pris${["q","r"].includes(reply.captured) ? "e" : ""}` : "Une prise à comparer avec la reprise";
  } else if (targets.length >= 2) { consequence = "fork"; title = "Deux de tes pièces sont attaquées"; }
  else if (response.isCheck()) { consequence = "check"; title = "Ton roi est attaqué"; }
  else if (safeTake || better.isCheckmate() || m.missedMate) { consequence = "missed"; title = better.isCheckmate() ? "Tu pouvais terminer la partie" : "Une occasion à repérer"; }

  if (better.isCheckmate()) bestReason = "bestMate";
  else if (best.captured) bestReason = safeTake ? "bestTake" : "bestExchange";
  else if (reply?.captured) {
    // For en passant, the captured pawn is behind the destination square.
    const victim = reply.flags.includes("e") ? reply.to[0] + reply.from[1] : reply.to;
    const originalSquare = played.to === victim ? played.from : victim;
    savedSquare = best.from === originalSquare ? best.to : originalSquare;
    const saved = better.get(savedSquare);
    if (saved?.color === side && saved.type === reply.captured && !better.isAttacked(savedSquare, enemy)) {
      bestReason = best.from === originalSquare ? "bestEscape" : "bestStay";
    } else if (saved?.color === side && !canCapture(better, savedSquare)) bestReason = "bestStop";
  }
  if (bestReason === "bestQuiet") {
    if (/[kq]/.test(best.flags)) bestReason = "bestCastle";
    else if (better.isCheck()) bestReason = "bestCheck";
    else if (["b","n"].includes(best.piece) && best.from[1] === (side === "w" ? "1" : "8") && Number(start.fen().split(" ")[5]) <= 10) bestReason = "bestDevelop";
    else if (["d4","e4","d5","e5"].includes(best.to)) bestReason = "bestCentre";
  }
  if (["taken","capture"].includes(consequence)) remember = "rememberSafety";
  else if (["mate","check","fork"].includes(consequence)) remember = "rememberThreat";
  else if (["bestMate","bestTake"].includes(bestReason)) remember = "rememberChance";
  const shortReason = reply ? simpleMove(reply, false) + (consequence === "taken" ? " Tu ne peux pas reprendre immédiatement." : "") : better.isCheckmate() ? "Tu pouvais attaquer le roi sans lui laisser aucune défense." : "Une autre idée était possible : regarde la comparaison sur l’échiquier.";
  return { title, consequence, bestReason, remember, shortReason, savedSquare, replyUci: reply ? m.reply : null, targets: targets.map(p => p.square),
    played: simpleMove(played), reply: simpleMove(reply, false), best: simpleMove(best),
    risk: coachWords[consequence], why: coachWords[bestReason], rule: coachWords[remember] };
}
