import { Chess } from "../chess/chess.js";
import { moveUci, sanFr, uci, material, pieceName } from "../chess/notation.js";
let manifestPromise;
const shardCache = new Map();
export const puzzleManifest = () =>
  (manifestPromise ??= fetch("./data/puzzles/manifest.json").then((r) => {
    if (!r.ok) throw Error("Catalogue des problèmes indisponible.");
    return r.json();
  }));
export async function loadPuzzles(theme = "mixed") {
  const manifest = await puzzleManifest();
  const key = manifest.shards[theme] ? theme : "mixed";
  if (!shardCache.has(key)) {
    const r = await fetch("./data/puzzles/" + manifest.shards[key].file);
    if (!r.ok)
      throw Error(
        "Ces problèmes ne sont pas téléchargés. Reconnecte-toi une fois pour les garder hors ligne.",
      );
    shardCache.set(key, await r.json());
  }
  return { rows: shardCache.get(key), manifest, theme: key };
}
export function tagsFor(row, manifest) {
  const mask = BigInt(row[4]);
  return manifest.themes.filter((t, i) => (mask & (1n << BigInt(i))) !== 0n);
}
export class PuzzleRun {
  constructor(
    row,
    { index = 1, clean = true, hints = 0, finished = false, fen = null } = {},
  ) {
    this.row = row;
    this.line = row[2].split(" ");
    this.game = new Chess(row[1]);
    this.index = Math.max(1, Math.min(this.line.length, index));
    for (const move of this.line.slice(0, this.index)) moveUci(this.game, move);
    if (fen) this.game.load(fen);
    this.side = new Chess(row[1]).turn() === "w" ? "b" : "w";
    this.clean = clean;
    this.hints = hints;
    this.finished = finished || this.index === this.line.length;
  }
  expected() {
    return this.line[this.index];
  }
  hint() {
    this.clean = false;
    this.hints = Math.min(3, this.hints + 1);
    return this.expected();
  }
  tryMove(move, { acceptMate = false } = {}) {
    if (this.finished || this.game.turn() !== this.side)
      return { ignored: true };
    const after = new Chess(this.game.fen());
    let made;
    try {
      made = moveUci(after, move);
    } catch {
      return { illegal: true };
    }
    if (move !== this.expected() && !(acceptMate && after.isCheckmate())) {
      this.clean = false;
      const correct = new Chess(this.game.fen()),
        best = moveUci(correct, this.expected());
      let reply = null,
        gain = 0;
      for (const candidate of after.moves({ verbose: true })) {
        const g = new Chess(after.fen());
        g.move(candidate);
        const loss = material(after, this.side) - material(g, this.side);
        if (g.isCheckmate() || loss > gain) {
          gain = loss;
          reply = {
            move: uci(candidate),
            san: sanFr(candidate.san),
            fen: g.fen(),
            mate: g.isCheckmate(),
          };
          if (reply.mate) break;
        }
      }
      return {
        ok: false,
        played: sanFr(made.san),
        fen: after.fen(),
        expected: sanFr(best.san),
        arrow: [best.from, best.to],
        reply,
        loss: gain,
      };
    }
    this.game = after;
    this.index++;
    this.finished = this.index >= this.line.length || after.isCheckmate();
    return {
      ok: true,
      move,
      fen: after.fen(),
      san: sanFr(made.san),
      finished: this.finished,
    };
  }
  reply() {
    if (this.finished || this.game.turn() === this.side) return null;
    const move = this.line[this.index++],
      made = moveUci(this.game, move);
    this.finished = this.index >= this.line.length;
    return { move, fen: this.game.fen(), san: sanFr(made.san) };
  }
  snapshot() {
    return {
      fen: this.game.fen(),
      index: this.index,
      clean: this.clean,
      hints: this.hints,
      finished: this.finished,
    };
  }
}
