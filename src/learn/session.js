import { dueCards } from "./srs.js";
import { entryStatus } from "../state/schema.js";
import { dateKey } from "../ui/helpers.js";
export function sessionPlan(state, entries, today = dateKey()) {
  const minutes = state.preferences.minutes,
    working = entries.filter(
      (e) =>
        ["viewed", "practice", "review"].includes(entryStatus(state, e)) &&
        !(e.drill && state.entries[e.id]?.drillAt),
    ),
    notion =
      working.find((e) => !e.drill) ||
      working[0] ||
      entries.find((e) => entryStatus(state, e) === "new") ||
      entries[0],
    due = dueCards(state, today).slice(
      0,
      Math.floor((minutes * 0.32 * 60) / 45),
    ),
    vision = entries
      .filter((e) => e.tier === 0)
      .some((e) => entryStatus(state, e) !== "mastered"),
    reviews = Math.min(minutes * 0.32, due.length * 0.75),
    v = vision ? 1 : 0;
  const tasks = [];
  if (due.length)
    tasks.push({
      kind: "reviews",
      label: "Tes révisions",
      minutes: reviews,
      cards: due.map((c) => c.id),
    });
  if (vision)
    tasks.push({ kind: "vision", label: "Une minute de vision", minutes: v });
  tasks.push({
    kind: "lesson",
    label: notion.title,
    entryId: notion.id,
    minutes: minutes * 0.2,
  });
  tasks.push({
    kind: "targeted",
    label: "Pratique ciblée",
    entryId: notion.id,
    count: minutes === 15 ? 8 : minutes === 25 ? 10 : 12,
    minutes: minutes * 0.28,
  });
  tasks.push({
    kind: "mixed",
    label: "Retrouver les motifs",
    count: minutes === 15 ? 5 : 8,
    minutes: minutes - reviews - v - minutes * 0.48 - 0.5,
  });
  tasks.push({ kind: "finish", label: "Ton bilan", minutes: 0.5 });
  return {
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
