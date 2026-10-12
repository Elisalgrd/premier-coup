import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Chess } from "../src/chess/chess.js";
import { parsePgn, parseNdjson, saveGames } from "../src/play/import.js";
import { centipawns, classify, labelMistake } from "../src/chess/analysis.js";
import { beginnerMove } from "../src/chess/beginner.js";
test("10 legal fixtures classify hanging pieces and missed mates", () => {
  const fixtures = JSON.parse(fs.readFileSync("tests/fixtures/mistakes.json"));
  assert.equal(fixtures.length, 10);
  for (const f of fixtures)
    assert.equal(
      labelMistake(f.fen, f.played, f.best, f.before, f.after).label,
      f.expected,
      JSON.stringify(f),
    );
});
test("classification handles side reversal, caps and mates", () => {
  assert.equal(
    classify({ type: "cp", score: 100 }, { type: "cp", score: 100 }).severity,
    "gaffe",
  );
  assert.equal(
    classify({ type: "cp", score: 2000 }, { type: "cp", score: -1100 }).loss,
    0,
  );
  assert.equal(
    classify({ type: "mate", score: 2 }, { type: "cp", score: -900 }).severity,
    "gaffe",
  );
  assert.equal(centipawns({ type: "mate", score: 0 }), -1000);
});
test("PGN and NDJSON parse and reject malformed input; imports deduplicate", () => {
  const pgn =
      '[White "Elisa"]\n[Black "Coach"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 *',
    g = parsePgn(pgn);
  assert.deepEqual(g.moves.slice(0, 2), ["e2e4", "e7e5"]);
  const rows = parseNdjson(
    JSON.stringify({
      id: "x",
      variant: "standard",
      pgn,
      players: { black: { user: { name: "Elisa" } } },
    }),
    "elisa",
  );
  assert.equal(rows[0].color, "b");
  const s = { games: [] };
  assert.equal(saveGames(s, rows), 1);
  assert.equal(saveGames(s, rows), 0);
  assert.throws(() => parsePgn("1. e8#"));
});
test("beginner levels play legal moves, with seeded imperfect choices", () => {
  const g = new Chess();
  for (let level = 1; level <= 3; level++) {
    const move = beginnerMove(g, level, () => 0.2);
    assert.ok(g.moves({ verbose: true }).some((m) => m.from + m.to === move));
  }
});
