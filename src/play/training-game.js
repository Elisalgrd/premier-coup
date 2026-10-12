export const timeControls = [
  { id: "15+10", seconds: 900, increment: 10, label: "15 min + 10 s par coup (conseillé)" },
  { id: "10+5", seconds: 600, increment: 5, label: "10 min + 5 s par coup" },
  { id: "10", seconds: 600, increment: 0, label: "10 minutes" },
  { id: "15", seconds: 900, increment: 0, label: "15 minutes" },
  { id: "30", seconds: 1800, increment: 0, label: "30 minutes" },
];
export function applyIncrement(time, color, increment) { time[color] += increment; }

export function takebackCount(game, alert, mode, used) {
  if (mode !== "all" || used >= 3 || alert.retracted) return 0;
  const moves = game.history({ verbose: true }), move = moves[alert.ply - 1];
  if (!move || move.before !== alert.fen || move.from + move.to + (move.promotion || "") !== alert.played) return 0;
  const count = moves.length - alert.ply + 1;
  return count === 1 || count === 2 ? count : 0;
}
export function takeback(game, alert, { mode, used, time }) {
  const count = takebackCount(game, alert, mode, used);
  if (!count) return false;
  for (let i = 0; i < count; i++) game.undo();
  // Comments at the restored position survive PGN export and resume.
  const previous = game.getComment();
  game.setComment([previous, "coup repris"].filter(Boolean).join("; "));
  if (alert.timeBefore) Object.assign(time, alert.timeBefore);
  alert.retracted = true;
  return true;
}
