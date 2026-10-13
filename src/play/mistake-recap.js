import { Chess } from "../chess/chess.js";
import { moveUci, describeMove } from "../chess/notation.js";
import { mistakeQuestion } from "../chess/mistake-questions.js";
import { esc, friendlyMistake } from "../ui/helpers.js";

export function dominantMistake(moments) {
  const counts = new Map();
  for (const m of moments) {
    const item = counts.get(m.label) || { ...m, count: 0, loss: 0 };
    item.count++; item.loss = Math.max(item.loss, m.loss || 0); counts.set(m.label, item);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || b.loss - a.loss)[0] || null;
}
export function mistakeList(record) {
  return [...(record.analysis?.allMoments || record.analysis?.moments || [])].sort((a,b) => a.ply - b.ply).map(m => {
    const played = describeMove(moveUci(new Chess(m.fen), m.played)), best = describeMove(moveUci(new Chess(m.fen), m.best));
    const question = m.question || mistakeQuestion(m.label), title = `Coup ${Math.ceil(m.ply / 2)} · ${m.severity === "gaffe" ? "Gaffe" : "Erreur"} · ${m.title || friendlyMistake(m.label)}`;
    return { ...m, question, title, playedText: played, bestText: best, text: `${title}. Ton coup : ${played} Mieux : ${best} Question à te poser : ${question}` };
  });
}
export function nextGameRule(record) {
  const m = dominantMistake(record?.analysis?.allMoments || record?.analysis?.moments || []);
  return m ? m.question || mistakeQuestion(m.label) : "";
}
export function mistakeRecapHtml(record) {
  const list = mistakeList(record), rule = nextGameRule(record);
  return `<section class="mistake-recap"><h2>Tes erreurs dans cette partie</h2>${rule ? `<aside class="next-game-rule"><strong>Ta règle pour la prochaine partie</strong><p>${esc(rule)}</p></aside>` : "<p>Aucune erreur importante détectée. Continue à vérifier ce que ton adversaire menace.</p>"}<ul>${list.map(m => `<li><a href="#train/review-video/${esc(record.id)}/${m.ply}"><strong>${esc(m.title)}</strong><span>Ton coup : ${esc(m.playedText)}</span><span>Mieux : ${esc(m.bestText)}</span><em>${esc(m.question)}</em><small>▶ Revoir cette erreur</small></a></li>`).join("")}</ul>${list.length ? '<button class="button secondary" data-copy-mistakes>Copier la liste</button>' : ""}<div data-copy-fallback></div></section>`;
}
export function bindMistakeRecap(root, record) {
  const button = root.querySelector("[data-copy-mistakes]"); if (!button) return;
  button.onclick = async () => {
    const text = `Ta règle pour la prochaine partie : ${nextGameRule(record)}\n\n${mistakeList(record).map(m => "• " + m.text).join("\n\n")}`;
    try { await navigator.clipboard.writeText(text); button.textContent = "Liste copiée ✓"; }
    catch {
      const target = root.querySelector("[data-copy-fallback]");
      target.innerHTML = '<label>Copie ce texte dans tes notes<textarea readonly rows="8"></textarea></label>';
      const area = target.querySelector("textarea"); area.value = text; area.focus(); area.select();
      button.textContent = "Texte sélectionné : copie-le";
    }
  };
}
