import { Chess } from "./chess.js";
import { moveUci, pieceName } from "./notation.js";
import { centipawns } from "./mistake-core.js";
import { personalExplanation } from "./review-evidence.js";
export const PERSONAL_ANALYSIS_VERSION = 3;
export const hasPersonalAnalysis = r => r.analysis?.version >= PERSONAL_ANALYSIS_VERSION && Array.isArray(r.analysis?.decisions);
const moveNo = ply => Math.ceil(ply / 2);
const lessonFor = row => row.e.consequence === "mate" ? "proc-opponent-threat" : row.e.bestReason === "bestMate" ? "proc-forcing-moves" : row.e.consequence === "taken" ? "proc-blunder-check" : row.e.bestReason === "bestTake" ? "proc-free-material" : row.e.consequence === "fork" ? "tac-fork" : row.m.entryId;

export function gameProfile(record, recentGames = []) {
  const moments = record.analysis?.allMoments || record.analysis?.moments || [];
  const facts = [], g = new Chess(record.initialFen), initial = g.fen(), home = record.color === "w" ? "1" : "8";
  const developed = new Set(), queenPlies = [], own = [];
  const standardStart = initial.split(" ")[0] === new Chess().fen().split(" ")[0];
  const identities = new Map(g.board().flat().filter(p => p && p.color === record.color && ["b", "n"].includes(p.type) && p.square[1] === home).map(p => [p.square, p.square]));
  let castle = null, opening = null;
  for (let i = 0; i < record.moves.length; i++) {
    const m = moveUci(g, record.moves[i]);
    const identity = identities.get(m.from);
    identities.delete(m.from); identities.delete(m.to);
    if (identity) identities.set(m.to, identity);
    if (m.color !== record.color) continue;
    own.push({ ply: i + 1, move: m, fen: g.fen() });
    if (own.length <= 8) {
      if (identity) developed.add(identity);
      if (m.piece === "q") queenPlies.push(i + 1);
      if (/[kq]/.test(m.flags)) castle = i + 1;
      opening = { ply: i + 1, developed: developed.size, castle, queen: queenPlies.length, count: own.length };
    }
  }
  if (standardStart && opening?.count >= 4) {
    const text = `Après ${opening.count} de tes coups, tu avais sorti ${opening.developed} de tes quatre cavaliers et fous. ${opening.castle ? `Ton roi était déjà mis à l’abri avec une tour, au coup ${moveNo(opening.castle)}.` : "Tu n’avais pas encore mis ton roi à l’abri avec une tour."}${opening.queen >= 3 ? ` Tu avais joué ta dame ${opening.queen} fois ; compare ce que ces déplacements t’ont apporté avec la participation de tes autres pièces.` : ""}`;
    facts.push({ kind: "opening", title: "Comment tu as construit ta position", text, ply: opening.ply, entryId: "ouv-principles" });
  }
  const detailed = moments.map(m => ({ m, e: personalExplanation(record, m) }));
  const groups = new Map();
  for (const row of detailed) {
    const key = row.e.consequence === "taken" ? "Pièces laissées sans reprise" : row.e.bestReason === "bestTake" ? "Prises accessibles manquées" : row.e.consequence === "fork" ? "Deux pièces attaquées ensemble" : row.e.consequence === "mate" ? "Sécurité du roi" : null;
    if (key) { const xs = groups.get(key) || []; xs.push(row); groups.set(key, xs); }
  }
  const pattern = [...groups].sort((a,b) => b[1].length - a[1].length)[0];
  const biggest = detailed.slice().sort((a,b) => (b.m.loss || 0) - (a.m.loss || 0))[0];
  if (biggest) {
    const d = record.analysis?.decisions?.find(d => d.ply === biggest.m.ply);
    const reversal = d && centipawns(d.before) >= 150 && -centipawns(d.after) <= -100;
    facts.push({ kind: "turning", title: reversal ? `Ton avantage bascule au coup ${moveNo(biggest.m.ply)}` : `Ta décision la plus coûteuse : coup ${moveNo(biggest.m.ply)}`, text: biggest.e.cause, ply: biggest.m.ply, moment: biggest.m.ply, entryId: lessonFor(biggest) });
  }
  if (pattern?.[1].length >= 2) {
    const rows = pattern[1];
    facts.push({ kind: "pattern", title: `${rows.length} fois le même mécanisme`, text: `${pattern[0]}, aux coups ${rows.map(r => moveNo(r.m.ply)).join(", ")}. Ce point revient dans cette partie : travaille-le avant d’ajouter une nouvelle ouverture.`, ply: rows[0].m.ply, moment: rows[0].m.ply, entryId: lessonFor(rows[0]) });
  }
  const positive = (record.analysis?.decisions || []).filter(d => d.before?.best === d.played && d.before?.depth !== 0 && !(d.before.type === "mate" && d.before.score < 0) && centipawns(d.before) + centipawns(d.after) < 50).map(d => {
    const p = new Chess(d.fen), m = moveUci(p, d.played);
    const safeCapture = m.captured && !p.moves({verbose:true}).some(x => x.captured && x.to === m.to);
    return { d, m, p, safeCapture };
  }).find(x => x.p.isCheckmate() || x.safeCapture);
  if (positive) {
    const {d,m,p} = positive;
    facts.push({ kind: "strength", title: `Un bon réflexe au coup ${moveNo(d.ply)}`, text: p.isCheckmate() ? "Tu as trouvé le coup qui attaque le roi sans lui laisser de défense : tu as terminé la partie." : `Tu as repéré une prise avec ${["r","q"].includes(m.piece) ? "ta" : "ton"} ${pieceName[m.piece]} : tu prends ${["r","q"].includes(m.captured) ? "sa" : "son"} ${pieceName[m.captured]}, sans reprise immédiate légale. Ce coup est aussi le premier choix de l’analyse.`, ply:d.ply });
  } else if (standardStart && opening?.castle && opening.developed >= 3) {
    facts.push({kind:"strength", title:"Un début organisé à conserver",text:`Tu as fait participer au moins trois cavaliers ou fous et mis ton roi à l’abri dans tes ${opening.count} premiers coups. Ces deux objectifs sont bien présents dans ta partie.`,ply:opening.ply});
  }
  const focusRow = pattern?.[1].length >= 2 ? pattern[1][0] : biggest;
  const focus = focusRow ? { text: focusRow.e.question, entryId: lessonFor(focusRow), ply: focusRow.m.ply } : { text: "Aucune erreur importante repérée dans cette analyse. Compare aussi tes idées dans les positions calmes ; cela ne signifie pas que chaque coup était parfait.", entryId: "str-worst-piece" };
  const prior = recentGames.filter(r => r.id !== record.id && r.analysis).slice(-5);
  const recurringGames = focusRow ? prior.filter(r => (r.analysis.allMoments || []).some(m => {
    const e = personalExplanation(r,m); return e.consequence === focusRow.e.consequence && ["taken","fork","mate"].includes(e.consequence) || e.bestReason === "bestTake" && focusRow.e.bestReason === "bestTake";
  })).length : 0;
  return { facts, focus, ownMoves: own.length, errors: moments.length, recurringGames, comparedGames: prior.length, summary: biggest ? `${own.length} de tes coups examinés. Commence par le coup ${moveNo(biggest.m.ply)} : c’est la décision qui coûte le plus selon cette analyse.` : `${own.length} de tes coups examinés. Aucune erreur importante détectée à cette profondeur.`, complete: hasPersonalAnalysis(record) };
}
