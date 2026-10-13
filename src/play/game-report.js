import { gameProfile } from "../chess/game-profile.js";
import { locatedMove } from "../chess/review-evidence.js";
import { PlayerBoard, gameAt } from "../ui/player-strip.js";
import { esc, $ } from "../ui/helpers.js";
export function mountGameReport(ctx, root, record, onOpen) {
  const p = gameProfile(record, ctx.state.games), title = id => ctx.entries.find(e => e.id === id)?.title;
  let board;
  root.innerHTML = `<section class="personal-report"><a class="back-link" href="#train/import">← Mes parties</a><header class="page-intro"><span class="eyebrow">TON JEU, DANS CETTE PARTIE</span><h1>Ce que tes coups racontent.</h1><p>${esc(p.summary)}</p></header><aside class="report-priority"><span class="eyebrow">UN OBJECTIF POUR TA PROCHAINE PARTIE</span><h2>${esc(p.focus.text)}</h2>${p.recurringGames ? `<p>Ce même mécanisme apparaît aussi dans ${p.recurringGames} des ${p.comparedGames} autres parties analysées les plus récentes.</p>` : ""}${p.focus.ply ? '<button class="button primary" id="report-main">Comprendre ce moment →</button>' : ""}${title(p.focus.entryId) ? `<a class="text-link" href="#lesson/${esc(p.focus.entryId)}">Le cours pour travailler ça : ${esc(title(p.focus.entryId))} →</a>` : ""}</aside><div class="report-findings">${p.facts.map((f,i) => `<article class="report-fact ${f.kind}"><span class="eyebrow">${{opening:"LE DÉBUT",turning:"LE MOMENT CLÉ",pattern:"CE QUI REVIENT",strength:"À CONSERVER"}[f.kind]}</span><h2>${esc(f.title)}</h2><p>${esc(f.text)}</p><button class="button secondary" data-proof="${i}">Voir dans ma partie →</button>${f.moment ? `<button class="text-link" data-explain="${f.moment}">Comprendre les deux choix</button>` : ""}</article>`).join("")}</div><section id="report-position" hidden><h2 id="report-proof-title"></h2><div id="report-proof-board"></div><p id="report-proof-text"></p><p class="muted">Position réellement atteinte dans ta partie. Les comparaisons avec un autre coup sont dans « Comprendre les deux choix ».</p></section><section class="report-moments"><h2>Les décisions à reprendre (${p.errors})</h2>${(record.analysis.allMoments || []).map(m => `<button class="report-moment" data-explain="${m.ply}"><span>Coup ${Math.ceil(m.ply/2)}</span><strong>${esc(m.title || "Une décision à comparer")}</strong><span>→</span></button>`).join("") || '<p>Aucune grosse erreur repérée. Les constats ci-dessus restent utiles pour préparer ta prochaine partie.</p>'}${p.errors ? `<a class="button secondary" href="#train/correct/${esc(record.id)}">Retrouver les meilleurs coups moi-même →</a>` : ""}</section><details><summary>Comment ce bilan est construit</summary><p>Les faits de début de partie viennent de tes coups. Les occasions et erreurs viennent de l’analyse locale de chaque décision, à profondeur ${record.analysis.depth || "variable"}. Une suite calculée montre ce qui était possible ; elle est distinguée des coups réellement joués. Le bilan ne devine pas tes intentions.</p></details></section>`;
  if ($("#report-main", root)) $("#report-main", root).onclick = () => onOpen(p.focus.ply);
  for (const b of root.querySelectorAll("[data-explain]")) b.onclick = () => onOpen(Number(b.dataset.explain));
  for (const b of root.querySelectorAll("[data-proof]")) b.onclick = () => {
    const f = p.facts[Number(b.dataset.proof)], g = gameAt(record, f.ply), m = g.history({verbose:true}).at(-1);
    $("#report-position", root).hidden = false;
    $("#report-proof-title", root).textContent = f.title;
    $("#report-proof-text", root).textContent = `Après le coup ${Math.ceil(f.ply/2)} : ${locatedMove(m, record.color)}`;
    board?.destroy();
    board = new PlayerBoard($("#report-proof-board", root), g, {side:record.color,names:{[record.color]:"Toi",[record.color === "w" ? "b" : "w"]:"Adversaire"}});
    board.set(g,{last:m ? [m.from,m.to] : [], arrows:m ? [[m.from,m.to,"good"]] : []});
    $("#report-position", root).scrollIntoView({block:"start",behavior:"smooth"});
  };
  return () => board?.destroy();
}
