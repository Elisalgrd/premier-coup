import { explainMistake } from "./coach-explanation.js";
import { Chess } from "./chess.js";
import { classify, labelMistake } from "./mistake-core.js";
import { moveUci } from "./notation.js";
import { mistakeQuestion } from "./mistake-questions.js";
export function materialLoss(loss) {
  if (loss >= 800) return "environ la valeur d’une dame";
  if (loss >= 650) return "environ la valeur d’une tour et de deux pions";
  if (loss >= 450) return "environ la valeur d’une tour";
  if (loss >= 250) return "environ la valeur d’une pièce (un cavalier ou un fou)";
  if (loss > 150) return "environ la valeur de deux pions";
  return "environ la valeur d’un pion";
}

export function mistakeMessage(fen, played, before, after, { includeInaccuracies = false } = {}) {
  if (!before?.best || !after || before.best === played) return null;
  const afterGame = new Chess(fen);
  moveUci(afterGame, played);
  if (afterGame.isCheckmate()) return null;
  const cls = classify(before, after);
  if (!cls.severity || (!includeInaccuracies && cls.severity === "imprécision")) return null;
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
  const base = { ...cls, ...tag, fen, played, best: before.best, line, reply: replyMove ? reply : null, afterFen };
  const explanation = explainMistake(base);
  return { ...base, question: mistakeQuestion(tag.label), title: explanation.title,
    risk: [explanation.reply, explanation.risk].filter(Boolean).join(" "),
    better: explanation.best + " " + explanation.why,
    opportunity: explanation.bestReason === "bestTake" ? "Une pièce adverse pouvait être prise sans reprise immédiate." : "" };

}

