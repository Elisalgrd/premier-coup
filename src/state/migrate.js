import { emptyState } from "./schema.js";
export function migrateLegacy(legacy, mapping) {
  const state = emptyState();
  if (!legacy || legacy.version !== 1) return state;
  state.legacy = structuredClone(legacy);
  state.preferences.voice = legacy.narrator || "male";
  state.preferences.minutes = [15, 25, 45].includes(legacy.goal)
    ? legacy.goal
    : legacy.goal <= 20
      ? 15
      : 25;
  state.days = structuredClone(legacy.days || {});
  const done = new Set(legacy.lessons || []);
  for (const [id, run] of Object.entries(legacy.deep?.lessons || {})) {
    if (run.completed || run.phase === "done") done.add(id);
    if (run.note) state.notes[id] = run.note;
  }
  for (const [id, run] of Object.entries(legacy.academy?.courses || {}))
    if (run.stage === "done") done.add(id);
  for (const [id, run] of Object.entries(legacy.coach?.lessons || {}))
    if (run.done) done.add(id);
  for (const id of done)
    for (const target of mapping[id] || [])
      state.entries[target] = {
        viewedAt: "migration",
        migratedFrom: [...(state.entries[target]?.migratedFrom || []), id],
      };
  state.migratedAt = new Date().toISOString();
  return state;
}
