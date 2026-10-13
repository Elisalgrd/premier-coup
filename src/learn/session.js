import { dueCards } from "./srs.js";
import { dateKey } from "../ui/helpers.js";
import { nextDailyEntry } from "./daily-courses.js";
export function sessionPlan(state, entries, today = dateKey()) {
  const minutes = state.preferences.minutes,
    notion = nextDailyEntry(state, entries),
    due = dueCards(state, today).slice(0, minutes === 45 ? 5 : 3),
    reviews = due.length * 0.75;
  const tasks = [{ kind: "lesson", label: notion.title, entryId: notion.id,
    minutes: minutes - reviews - 0.5, count: minutes === 15 ? 4 : minutes === 25 ? 6 : 8 }];
  if (due.length)
    tasks.push({
      kind: "reviews",
      label: "Tes révisions",
      minutes: reviews,
      cards: due.map((c) => c.id),
    });
  tasks.push({ kind: "finish", label: "Ton bilan", minutes: 0.5 });
  return {
    version: 3,
    day: today,
    minutes,
    tasks,
    index: 0,
    seconds: 0,
    startedAt: Date.now(),
    done: false,
    results: [],
  };
}
export function weakThemes(state, entries) {
  const mistakes = state.games
    .slice(-20)
    .flatMap((g) => g.analysis?.moments || []);
  return entries
    .filter((e) => state.entries[e.id]?.viewedAt)
    .map((e) => ({
      id: e.id,
      weight:
        1 +
        Math.max(0, 1000 - (state.ratings.themes[e.id]?.value || 800)) / 200 +
        mistakes.filter((m) => m.entryId === e.id).length,
    }))
    .sort((a, b) => b.weight - a.weight);
}
