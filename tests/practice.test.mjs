import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { updateRating, pickPuzzles } from "../src/learn/rating.js";
import { PuzzleRun } from "../src/learn/puzzles.js";
import { emptyState, entryStatus, validateState } from "../src/state/schema.js";
test("Elo converges near 1200 with 50 representative results", () => {
  let r = { value: 800, attempts: 0 },
    seed = 2;
  for (let n = 0; n < 50; n++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const opponent = r.value,
      expected = 1 / (1 + 10 ** ((opponent - 1200) / 400));
    r = updateRating(r, opponent, seed / 4294967296 < expected ? 1 : 0);
  }
  assert.ok(r.value >= 1100 && r.value <= 1300, JSON.stringify(r));
});
test("Lichess initial opponent move, line replies and reloading", () => {
  const rows = JSON.parse(fs.readFileSync("data/puzzles/tac-fork.json"));
  for (const row of rows.slice(0, 30)) {
    let run = new PuzzleRun(row);
    assert.equal(run.game.turn(), run.side);
    while (!run.finished) {
      assert.ok(run.tryMove(run.expected()).ok);
      run = new PuzzleRun(row, run.snapshot());
      if (!run.finished) run.reply();
    }
    assert.equal(run.clean, true);
  }
});
test("wrong answer or hint forfeits clean score; recent positions excluded", () => {
  const row = JSON.parse(fs.readFileSync("data/puzzles/tac-fork.json"))[0],
    run = new PuzzleRun(row);
  run.hint();
  assert.equal(run.clean, false);
  const state = emptyState();
  state.history = [{ puzzleId: row[0], day: "2026-10-12" }];
  assert.equal(
    pickPuzzles([row], state, "tac-fork", { day: "2026-10-12" }).length,
    0,
  );
});
test("mastery uses first encounter, retains achievement and can degrade", () => {
  const s = emptyState(),
    e = { id: "tac-fork", prerequisites: [] };
  s.history = Array.from({ length: 15 }, (_, i) => ({
    entryId: e.id,
    puzzleId: String(i),
    day: i < 7 ? "2026-10-11" : "2026-10-12",
    clean: true,
  }));
  assert.equal(entryStatus(s, e), "mastered");
  s.history.push(
    ...Array.from({ length: 20 }, (_, i) => ({
      entryId: e.id,
      puzzleId: "b" + i,
      day: "2026-10-13",
      clean: false,
    })),
  );
  assert.equal(entryStatus(s, e), "review");
});
test("resume exercise is preserved through backup validation", () => {
  const s = emptyState();
  s.exercise = { id: "test", run: { index: 2 } };
  assert.deepEqual(validateState(s).exercise, s.exercise);
});
