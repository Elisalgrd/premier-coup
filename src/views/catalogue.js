import { masteryHint } from "../learn/mastery.js";
import { entryStatus, statusLabel } from "../state/schema.js";
import { esc } from "../ui/helpers.js";
export const tiers = [
  "Lire l’échiquier",
  "Ne plus rien donner",
  "Prendre des pièces et gagner",
  "Prévoir la suite et terminer la partie",
  "Préparer tes prochains coups",
];
export function entryCard(e, state) {
  const status = entryStatus(state, e),
    attempts = state.history.filter(
      (x) => x.entryId === e.id && !x.review,
    ).length;
  return `<a class="entry-card" href="#lesson/${e.id}"><span class="priority ${e.priority}">${e.priority}</span><div><small>${esc(e.domain)} · NIVEAU ${e.tier}</small><h3>${esc(e.title)}</h3><p>${esc(e.principle)}</p><span class="status ${status}">${statusLabel[status]}</span>${attempts ? `<span class="attempt-count">${attempts} positions travaillées</span>` : ""}${status === "practice" ? `<p class="mastery-hint">${esc(masteryHint(state, e))}</p>` : ""}<progress max="15" value="${status === "mastered" ? 15 : Math.min(15, attempts)}" aria-label="Pratique de ${esc(e.title)}"></progress></div><span aria-hidden="true">↗</span></a>`;
}
export function catalogueView(entries, state, filters = {}) {
  let filtered = entries.filter(
    (e) =>
      (!filters.domain || e.domain === filters.domain) &&
      (!filters.priority || e.priority === filters.priority) &&
      (!filters.status || entryStatus(state, e) === filters.status) &&
      (!filters.query ||
        (
          e.title +
          " " +
          e.principle +
          " " +
          e.domain +
          " " +
          (e.searchText || "")
        )
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .includes(
            filters.query
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase(),
          )),
  );
  return `<header class="page-intro"><span class="eyebrow">TES LEÇONS, À TON RYTHME</span><h1>Un principe.<br>Un nouveau réflexe.</h1><p>${entries.length} fiches, dans un seul parcours. Commence par voir les menaces, puis apprends à les créer.</p></header><div class="catalogue-filters"><label class="search">Rechercher<input id="catalogue-search" placeholder="Fourchette, roi, ouverture…" value="${esc(filters.query || "")}"></label><label>Domaine<select id="filter-domain"><option value="">Tous</option>${[...new Set(entries.map((e) => e.domain))].map((d) => `<option ${filters.domain === d ? "selected" : ""}>${d}</option>`).join("")}</select></label><label>Priorité<select id="filter-priority"><option value="">Toutes</option>${["S", "A", "B", "C"].map((d) => `<option ${filters.priority === d ? "selected" : ""}>${d}</option>`).join("")}</select></label><label>État<select id="filter-status"><option value="">Tous</option>${Object.entries(
    statusLabel,
  )
    .map(
      ([id, label]) =>
        `<option value="${id}" ${filters.status === id ? "selected" : ""}>${label}</option>`,
    )
    .join(
      "",
    )}</select></label></div><p class="result-count" role="status">${filtered.length} fiches · S : indispensable · A : très rentable</p>${
    tiers
      .map((title, tier) => {
        const list = filtered.filter((e) => e.tier === tier);
        return list.length
          ? `<section class="tier"><header><span class="tier-number">0${tier}</span><div><small>NIVEAU ${tier}</small><h2>${title}</h2></div><span>${list.length} fiches</span></header><div class="entry-grid">${list.map((e) => entryCard(e, state)).join("")}</div></section>`
          : "";
      })
      .join("") ||
    '<div class="empty"><h2>Aucune fiche trouvée</h2><p>Essaie un autre mot ou enlève un filtre.</p></div>'
  }`;
}
