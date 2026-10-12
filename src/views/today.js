import { pendingAnalysisCard } from "../play/analysis-task.js";
import { sessionPlan } from "../learn/session.js";
import { dueCards } from "../learn/srs.js";
import { dateKey, esc } from "../ui/helpers.js";
export function dailyView(entries, state) {
  const s =
      state.session?.day === dateKey() && !state.session.done
        ? state.session
        : sessionPlan(state, entries),
    due = dueCards(state).length;
  return `<header class="page-intro"><span class="eyebrow">${new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date()).toUpperCase()}</span><h1>Un meilleur coup,<br>chaque jour.</h1><p>Tes révisions d’abord, puis une idée à retrouver sur l’échiquier.</p></header><div class="overview"><span><strong>${state.preferences.minutes} min</strong>ton rythme</span><span><strong>${due}</strong>à revoir aujourd’hui</span><span><strong>${state.ratings.global.value}</strong>ton niveau en problèmes</span></div><p class="level-explanation">Ce score sert à choisir tes problèmes. Il évolue avec tes réponses et reste propre à cette app.</p>${pendingAnalysisCard(state)}<section class="session-card"><div class="session-kicker"><span class="eyebrow">TA SÉANCE PERSONNALISÉE</span><span class="pill">${s.index ? "EN COURS" : state.entries[s.tasks.find((t) => t.kind === "lesson")?.entryId]?.viewedAt ? "À REVOIR" : "PRÊTE"}</span></div><h2>${esc(s.tasks.find((t) => t.kind === "lesson")?.label || "Consolider tes réflexes")}</h2><ol class="daily-list">${s.tasks
    .filter((t) => t.kind !== "finish")
    .map(
      (t, i) =>
        `<li class="${i < s.index ? "done" : ""}"><span>${i < s.index ? "✓" : String(i + 1).padStart(2, "0")}</span><strong>${esc(t.label)}</strong><small>${Math.max(1, Math.round(t.minutes))} min</small></li>`,
    )
    .join(
      "",
    )}</ol><a class="button primary" href="#session">${s.index ? "Reprendre" : "Commencer"} <span>→</span></a><small>Tu peux quitter et reprendre. Chaque étape est enregistrée.</small></section>${state.ratings.global.attempts === 0 && !state.placement?.done ? '<section class="placement-invite"><h2>Tu connais déjà les règles ?</h2><p>15 problèmes pour ajuster ton niveau de départ. Tu peux aussi commencer directement.</p><a href="#train/placement" class="button secondary">Faire le test de placement →</a></section>' : ""}<div class="section-title"><h2>Envie de pratiquer librement ?</h2><a href="#train">Tous les exercices ↗</a></div><a class="button secondary" href="#train/puzzles">Résoudre des problèmes directement →</a>`;
}
