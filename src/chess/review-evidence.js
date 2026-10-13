import { Chess } from "./chess.js";
import { moveUci, pieceName } from "./notation.js";
import { explainMistake } from "./coach-explanation.js";

export function locationWords(square, side = "w") {
  let x = square.charCodeAt(0) - 97, y = Number(square[1]) - 1;
  if (side === "b") { x = 7 - x; y = 7 - y; }
  const vertical = y < 3 ? "en bas" : y > 4 ? "en haut" : "au milieu";
  const horizontal = x < 3 ? "à gauche" : x > 4 ? "à droite" : "au centre";
  return vertical === "au milieu" && horizontal === "au centre" ? "au centre" : `${vertical}, ${horizontal}`;
}
const noun = p => `${["q", "r"].includes(p) ? "la" : "le"} ${pieceName[p]}`;
const possess = (p, mine) => `${["q", "r"].includes(p) ? mine ? "ta" : "sa" : mine ? "ton" : "son"} ${pieceName[p]}`;
const upper = s => s.charAt(0).toUpperCase() + s.slice(1);
export function locatedMove(m, side) {
  if (!m) return "";
  const mine = m.color === side;
  if (/[kq]/.test(m.flags)) return `${mine ? "Tu mets" : "L’adversaire met"} ${mine ? "ton" : "son"} roi à l’abri en le déplaçant avec une tour.`;
  let text = `${upper(possess(m.piece, mine))}, ${locationWords(m.from, side)}, ${m.captured ? `prend ${possess(m.captured, !mine)} ${locationWords(m.to, side)}` : "rejoint la case indiquée par la flèche"}`;
  if (m.promotion) text += ` et devient ${noun(m.promotion)}`;
  return text + ".";
}

// These are legal continuations of a stored engine line, never a fabricated
// story inferred from a centipawn score or from the name of a tactical motif.
export function branchEvidence(fen, moves, side) {
  const g = new Chess(fen), steps = [], gains = [], losses = [];
  for (const uci of (moves || []).slice(0, 6)) {
    const beforeFen = g.fen(); let m;
    try { m = moveUci(g, uci); } catch { break; }
    if (m.captured) (m.color === side ? gains : losses).push(pieceName[m.captured]);
    const check = g.isCheckmate() ? " Le roi n’a aucune défense : la partie se termine ici." : g.isCheck() ? " Le roi est attaqué : il faut répondre à cette attaque." : "";
    steps.push({ move: uci, fen: beforeFen, afterFen: g.fen(), text: locatedMove(m, side) + check });
  }
  const taken = gains.length ? `Tu prends : ${gains.join(", ")}.` : "Tu ne prends aucune pièce dans cette suite.";
  const given = losses.length ? `L’adversaire prend : ${losses.join(", ")}.` : "L’adversaire ne prend aucune de tes pièces dans cette suite.";
  return { steps, gains, losses, outcome: `${taken} ${given}`, finalFen: g.fen() };
}

export function personalExplanation(record, m) {
  const side = record.color, e = explainMistake(m), start = new Chess(m.fen), after = new Chess(m.fen);
  const played = moveUci(after, m.played), better = new Chess(m.fen), best = moveUci(better, m.best);
  const punishment = branchEvidence(m.fen, [m.played, ...(m.replyLine?.length ? m.replyLine : [m.reply].filter(Boolean))], side);
  const alternative = branchEvidence(m.fen, m.line?.length ? m.line : [m.best], side);
  const replyStep = punishment.steps[1];
  const response = new Chess(after.fen()); let reply = null;
  try { if (replyStep) reply = moveUci(response, replyStep.move); } catch {}
  let cause = "";
  if (e.consequence === "mate") cause = `${upper(possess(reply.piece, false))} peut ${reply.captured ? `prendre ${possess(reply.captured, true)} et ` : ""}attaquer ton roi. Dans cette suite, aucun déplacement du roi, aucune prise de la pièce qui l’attaque et aucune pièce interposée ne le sauvent : c’est échec et mat.`;
  else if (reply?.captured) {
    const victim = reply.flags.includes("e") ? reply.to[0] + reply.from[1] : reply.to;
    if (victim === played.to) cause = `Tu places ${possess(played.piece, true)} sur une case que ${possess(reply.piece, false)} peut atteindre.`;
    else if (!start.attackers(victim, reply.color).includes(reply.from) && after.attackers(victim, reply.color).includes(reply.from)) cause = `Le départ de ${possess(played.piece, true)} ouvre le passage à ${possess(reply.piece, false)} vers ${possess(reply.captured, true)}.`;
    else cause = `${upper(possess(reply.captured, true))} était à surveiller. Quand tu déplaces ${noun(played.piece)}, cette prise reste possible.`;
    cause += e.consequence === "taken" ? " Après cette prise, tu n’as aucune reprise immédiate légale." : " Regarde aussi la reprise : la première prise ne suffit pas à juger l’échange.";
  } else if (e.consequence === "fork") {
    const targets = e.targets.map(s => start.get(s) || response.get(s)).filter(Boolean).map(p => noun(p.type));
    cause = `${upper(possess(reply.piece, false))} peut viser ${targets.join(" et ")} à la fois. Sauver une cible ne suffit pas forcément à sauver l’autre.`;
  } else if (e.consequence === "mate") cause = "Après cette réponse, ton roi est attaqué et aucun coup légal ne peut le sauver.";
  else if (e.consequence === "missed") cause = `Tu joues ${noun(played.piece)}, alors qu’une occasion immédiate existe avec ${possess(best.piece, true)}. Compare les deux positions ci-dessous.`;
  else if (e.consequence === "check") cause = `${upper(possess(reply.piece, false))} peut attaquer ton roi. Cette réponse t’oblige à interrompre ton idée pour mettre le roi hors de danger.`;
  else cause = `Ici, la différence apparaît dans la suite des coups. Suis la réponse de ${reply ? possess(reply.piece, false) : "l’adversaire"}, puis compare avec le déplacement proposé de ${possess(best.piece, true)}. Ce n’est pas une perte de pièce immédiate démontrée.`;
  let why;
  if (better.isCheckmate()) why = "Ce coup attaque le roi adverse et ne lui laisse aucune défense légale. Tu pouvais terminer la partie ici.";
  else if (best.captured) why = `${upper(possess(best.piece, true))} prend ${possess(best.captured, false)}. ${e.bestReason === "bestTake" ? "Dans la position obtenue, aucune réponse légale ne reprend immédiatement ta pièce." : "Il faut suivre les reprises pour comprendre ce que cet échange apporte."}`;
  else if (["bestEscape", "bestStay", "bestStop"].includes(e.bestReason)) why = `${upper(possess(best.piece, true))} joue un autre rôle ici : ${e.bestReason === "bestEscape" ? `mettre ${possess(reply.captured, true)} hors de l’attaque` : `empêcher la même prise de ${possess(reply.captured, true)}`}. Compare la case colorée avec la suite précédente.`;
  else if (e.bestReason === "bestDevelop") why = `${upper(possess(best.piece, true))} quitte sa case de départ et participe au jeu. Dans ton coup, tu avais choisi de jouer ${noun(played.piece)}. Regarde quelle activité supplémentaire cette autre pièce obtient.`;
  else if (e.bestReason === "bestCastle") why = "Le roi quitte le milieu et la tour se rapproche du jeu. Vérifie les lignes que l’adversaire peut ouvrir : c’est la sécurité de ton roi qui change ici.";
  else if (e.bestReason === "bestCentre") why = `${upper(possess(best.piece, true))} rejoint l’une des quatre cases du milieu. Regarde les cases qu’elle vise depuis cet emplacement, puis la meilleure réponse adverse conservée dans l’analyse.`;
  else if (e.bestReason === "bestCheck") why = `${upper(possess(best.piece, true))} attaque le roi adverse. L’adversaire doit d’abord répondre à cela. La suite montre ce que cette obligation te permet de faire.`;
  else why = `L’analyse préfère déplacer ${possess(best.piece, true)} vers ${locationWords(best.to, side)}. Pour comprendre ce choix, compare les réponses qui suivent. La courte suite affichée ne prouve pas à elle seule un gain de pièce.`;

  // Explain the exact mating threat, not whether any enemy piece can capture
  // the same pawn. Blocking the queen can stop mate while a bishop still aims there.
  if (e.consequence === "mate" && reply && !better.isCheckmate()) {
    const dx = Math.sign(reply.to.charCodeAt(0) - reply.from.charCodeAt(0));
    const dy = Math.sign(Number(reply.to[1]) - Number(reply.from[1]));
    const distance = Math.max(Math.abs(reply.to.charCodeAt(0)-reply.from.charCodeAt(0)),Math.abs(Number(reply.to[1])-Number(reply.from[1])));
    const linePiece = ["q","r","b"].includes(reply.piece);
    const between = linePiece ? Array.from({length:Math.max(0,distance-1)},(_,i)=>String.fromCharCode(reply.from.charCodeAt(0)+dx*(i+1))+(Number(reply.from[1])+dy*(i+1))) : [];
    if (between.includes(best.to) && !better.attackers(reply.to,reply.color).includes(reply.from)) {
      why = `Tu places ${possess(best.piece,true)} sur le passage de ${possess(reply.piece,false)} vers ${possess(reply.captured || "k",true)}. La ligne est coupée : ce déplacement empêche la prise qui faisait mat.`;
    } else {
      const test = new Chess(better.fen());
      try {
        moveUci(test,m.reply);
        const recapture = test.moves({verbose:true}).find(x=>x.captured && x.to===reply.to);
        if (!test.isCheckmate() && recapture) why = `Ce coup prépare une défense. Si ${possess(reply.piece,false)} vient attaquer ton roi comme dans l’autre suite, ${possess(recapture.piece,true)} peut maintenant la prendre. Le même coup adverse ne fait donc plus échec et mat.`;
      } catch { /* Another kind of defence keeps its already-grounded explanation. */ }
    }
  }

  const actual = record.moves[m.ply];
  let actualText = "La partie enregistrée s’arrête après ton coup ; cette réponse est une possibilité calculée.";
  if (actual) {
    const g = new Chess(after.fen());
    try { const made = moveUci(g, actual); actualText = actual === m.reply ? "L’adversaire a effectivement joué cette réponse dans ta partie." : `Dans ta partie : ${locatedMove(made, side)} La réponse montrée ici est celle calculée par l’analyse, pas le coup joué.`; } catch {}
  }
  const question = e.consequence === "mate" ? "Après mon coup, l’adversaire peut-il attaquer mon roi sans lui laisser aucune défense ?" : better.isCheckmate() ? "Puis-je attaquer son roi en lui fermant toutes les défenses, et terminer la partie maintenant ?" : reply?.captured ? `Avant de déplacer ${possess(played.piece, true)}, peux-tu reprendre si ${possess(reply.piece, false)} prend ${possess(reply.captured, true)} ?` : best.captured ? `Avant de jouer ${noun(played.piece)}, as-tu vérifié ce que ${possess(best.piece, true)} pouvait prendre ?` : e.rule;
  return { ...e, playedText: locatedMove(played, side), bestText: locatedMove(best, side), cause, why, actualText, question, punishment, alternative };
}
