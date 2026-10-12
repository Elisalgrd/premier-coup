export function updateRating(current, puzzleRating, score) {
  const old = current || { value: 800, attempts: 0 },
    k = old.attempts < 30 ? 40 : 20,
    expected = 1 / (1 + 10 ** ((puzzleRating - old.value) / 400));
  return {
    value: Math.round(
      Math.max(100, Math.min(3000, old.value + k * (score - expected))),
    ),
    attempts: old.attempts + 1,
  };
}
export function recordRating(state, theme, rating, clean) {
  state.ratings.global = updateRating(
    state.ratings.global,
    rating,
    clean ? 1 : 0,
  );
  if (theme)
    state.ratings.themes[theme] = updateRating(
      state.ratings.themes[theme],
      rating,
      clean ? 1 : 0,
    );
}
export function pickPuzzles(
  rows,
  state,
  theme,
  {
    count = 10,
    day = new Date().toISOString().slice(0, 10),
    allowRecent = false,
    exclude = [],
    seed = Date.now(),
  } = {},
) {
  const rating =
      state.ratings.themes[theme]?.value || state.ratings.global.value,
    cutoff = new Date(day + "T12:00:00");
  cutoff.setDate(cutoff.getDate() - 30);
  const recent = new Set(
      state.history
        .filter((h) => new Date(h.day + "T12:00:00") >= cutoff)
        .map((h) => h.puzzleId),
    ),
    excluded = new Set(exclude);
  let available = rows.filter(
    (r) => !excluded.has(r[0]) && (allowRecent || !recent.has(r[0])),
  );
  let n = seed >>> 0;
  const random = () => {
    n = (n * 1664525 + 1013904223) >>> 0;
    return n / 4294967296;
  };
  const shuffled = available
    .map((row) => ({ row, tie: random() }))
    .sort((a, b) => {
      const penalty = (r) =>
        r[3] < rating - 150
          ? rating - 150 - r[3]
          : r[3] > rating + 100
            ? r[3] - rating - 100
            : 0;
      return penalty(a.row) - penalty(b.row) || a.tie - b.tie;
    });
  return shuffled.slice(0, count).map((x) => x.row);
}
