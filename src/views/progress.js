import { mostFrequentMistake } from "../learn/targeted.js";
import { entryStatus } from "../state/schema.js";
import { dueCards } from "../learn/srs.js";
import {
  dateKey,
  addDays,
  esc,
  duration,
  friendlyMistake,
} from "../ui/helpers.js";
import { tiers } from "./catalogue.js";
export function progressView(entries, state) {
  const priority = mostFrequentMistake(state);
  const activity = new Set([
    ...Object.keys(state.days),
    ...state.history.map((h) => h.day),
    ...Object.values(state.vision).flatMap((v) =>
      (v.runs || []).map((r) => r.day),
    ),
  ]);
  let day = dateKey(),
    streak = 0;
  if (!activity.has(day)) day = addDays(day, -1);
  while (activity.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  const seconds =
      state.history.reduce((n, h) => n + (h.seconds || 0), 0) +
      Object.values(state.vision)
        .flatMap((v) => v.runs || [])
        .reduce((n, r) => n + (r.seconds || 0), 0),
    series = state.history
      .filter((h) => Number.isFinite(h.ratingAfter))
      .slice(-100),
    ratings = series.length
      ? series.map((h) => h.ratingAfter)
      : [state.ratings.global.value],
    min = Math.min(...ratings) - 60,
    max = Math.max(...ratings) + 60,
    points = ratings
      .map(
        (v, i) =>
          `${20 + (i * 660) / Math.max(1, ratings.length - 1)},${170 - ((v - min) / (max - min)) * 140}`,
      )
      .join(" "),
    themes = Object.entries(state.ratings.themes)
      .filter(([id]) => id !== "mixed" && id !== "placement")
      .sort((a, b) => b[1].attempts - a[1].attempts),
    errors = {};
  for (const m of state.games
    .slice(-10)
    .flatMap((g) => g.analysis?.allMoments || g.analysis?.moments || []))
    errors[m.label] = (errors[m.label] || 0) + 1;
  const maxErrors = Math.max(1, ...Object.values(errors));
  return `<header class="page-intro"><span class="eyebrow">TES ACQUIS, PAS UNE COURSE</span><h1>Ce qui devient un réflexe.</h1><p>Une fiche vue a été lue. Une idée maîtrisée a été retrouvée sans aide dans plusieurs positions.</p></header>${priority ? `<section class="next-game-rule"><strong>Ton erreur n°1 sur tes 10 dernières parties</strong><p>${esc(friendlyMistake(priority.label))} (${priority.count} fois)</p><a class="button primary" href="#train/targeted/${encodeURIComponent(priority.label)}">Série ciblée (10 positions) →</a></section>` : ""}<div class="overview"><span><strong>${state.ratings.global.value}</strong>ton niveau en problèmes</span><span><strong>${streak} jour${streak > 1 ? "s" : ""}</strong>ta série</span><span><strong>${Math.round(seconds / 60)} min</strong>pratique enregistrée</span></div><section class="chart-card"><div class="section-title"><h2>Ton niveau en problèmes</h2><span class="pill">${state.ratings.global.attempts} essais</span></div><svg viewBox="0 0 700 200" role="img" aria-label="Évolution du classement de ${ratings[0]} à ${ratings.at(-1)}"><line x1="20" y1="170" x2="680" y2="170" stroke="#e7e0e4"/><polyline points="${points}" fill="none" stroke="#84526d" stroke-width="3" stroke-linecap="round"/><text x="20" y="196" fill="#998592" font-size="12">${ratings[0]}</text><text x="645" y="196" fill="#84526d" font-size="12">${ratings.at(-1)}</text></svg><p>${series.length ? "Les 100 dernières positions évaluées. Les révisions ne changent pas ton classement." : "La courbe se dessinera au fil de tes problèmes."}</p></section><div class="progress-columns"><section class="chart-card"><h2>Par thème</h2>${themes.map(([id, r]) => `<div class="rating-row"><span>${esc(entries.find((e) => e.id === id)?.title || id)}</span><strong>${r.value}</strong><progress max="2200" value="${r.value}"></progress></div>`).join("") || "<p>Pratique un thème pour voir son estimation.</p>"}</section><section class="chart-card"><h2>Mes erreurs récurrentes</h2><p>Sur tes 10 dernières parties.</p>${
    Object.entries(errors)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([label, n]) =>
          `<div class="rating-row"><span>${esc(friendlyMistake(label))}</span><strong>${n}</strong><progress max="${maxErrors}" value="${n}"></progress></div>`,
      )
      .join("") || "<p>Importe une partie pour découvrir tes priorités.</p>"
  }<a href="#train/mistakes" class="text-link">Retravailler mes erreurs ↗</a></section></div><div class="section-title"><h2>Ton parcours</h2><a href="#train/reviews">${dueCards(state).length} à revoir aujourd’hui ↗</a></div>${state.legacy ? '<p class="notice-good">Tes anciennes séances sont conservées. Les fiches correspondantes sont marquées « Vue ».</p>' : ""}${tiers
    .map((t, i) => {
      const list = entries.filter((e) => e.tier === i),
        seen = list.filter((e) => state.entries[e.id]?.viewedAt).length,
        mastered = list.filter(
          (e) => entryStatus(state, e) === "mastered",
        ).length;
      return `<section class="progress-tier"><span>NIVEAU ${i}</span><h2>${t}</h2><progress max="${list.length}" value="${mastered}" aria-label="${mastered} notions maîtrisées sur ${list.length}"></progress><p>${seen} / ${list.length} fiches vues · ${mastered} maîtrisées</p></section>`;
    })
    .join("")}`;
}
