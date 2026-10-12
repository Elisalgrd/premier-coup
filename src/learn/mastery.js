import { entryStatus, statusLabel } from "../state/schema.js";
import { dateKey, esc, notice } from "../ui/helpers.js";

export function masteryHint(state, entry, today = dateKey()) {
  const status = entryStatus(state, entry);
  if (status === "mastered") return "Leçon validée. Retrouve-la dans tes révisions pour garder ce réflexe.";
  if (status === "review") return "Cette idée mérite une révision : vise au moins 13 réussites sur tes 20 derniers problèmes.";
  const first = new Map();
  for (const h of state.history)
    if (h.entryId === entry.id && !h.review && !first.has(h.puzzleId)) first.set(h.puzzleId, h);
  const sample = [...first.values()].slice(-15);
  const clean = sample.filter((h) => h.clean).length;
  const days = new Set(sample.map((h) => h.day));
  if (sample.length === 15 && clean >= 12 && days.size === 1)
    return `Encore 1 jour de révision pour la valider. Refais une série ${days.has(today) ? "demain" : "aujourd’hui"} : garde 12 réussites sur 15 positions différentes, sur 2 jours.`;
  if (sample.length < 15)
    return `Encore ${15 - sample.length} position${sample.length === 14 ? "" : "s"} différente${sample.length === 14 ? "" : "s"} pour mesurer tes acquis. Objectif : 12 réussites sur 15, sur 2 jours différents.`;
  return `Tu as ${clean} réussites sur les 15 dernières positions différentes. Vise 12 sur 15, sur 2 jours différents.`;
}

export function lessonReceipt(state, entry) {
  const series = state.entries[entry.id]?.lastSeries;
  return `<section class="lesson-receipt" role="status"><h2>Leçon enregistrée ✓</h2>${series ? `<p><strong>${series.clean} / ${series.total}</strong> réussis du premier coup</p>${series.ratingBefore != null ? `<p>Classement en problèmes : <strong>${series.ratingBefore} → ${series.ratingAfter}</strong></p>` : "<p>Ces exercices de repérage ne changent pas ton classement.</p>"}` : "<p>Tes résultats et ta lecture sont conservés.</p>"}<p>Statut : <strong>${statusLabel[entryStatus(state, entry)]}</strong></p><p>${esc(masteryHint(state, entry))}</p></section>`;
}

export async function saveSeries(ctx, entryId, series) {
  const entry = (ctx.state.entries[entryId] ??= {});
  if (entry.lastSeries?.id === series.id) return;
  entry.lastSeries = { ...series, at: Date.now() };
  await ctx.save();
  if (!ctx.store?.error && typeof document !== "undefined") notice("Progression enregistrée");
}
