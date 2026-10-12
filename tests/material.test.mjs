import test from "node:test";
import assert from "node:assert/strict";
import { Chess } from "../src/chess/chess.js";
import { capturedPieces } from "../src/chess/material.js";
import { playerStrip, gameAt } from "../src/ui/player-strip.js";
import { parsePgn } from "../src/play/import.js";

test("captures belong to the taker, are sorted, and undo restores them", () => {
  const game = new Chess();
  for (const m of ["e4", "d5", "exd5", "Qxd5"]) game.move(m);
  assert.deepEqual(capturedPieces(game), { w: ["p"], b: ["p"], diff: 0 });
  game.undo();
  assert.deepEqual(capturedPieces(game), { w: ["p"], b: [], diff: 1 });
});
test("en passant counts the captured pawn even though the destination was empty", () => {
  const game = new Chess();
  for (const m of ["e4", "a6", "e5", "d5", "exd6"]) game.move(m);
  assert.deepEqual(capturedPieces(game), { w: ["p"], b: [], diff: 1 });
});
test("promotion changes material; capturing the promoted piece records its actual type", () => {
  const game = new Chess("1r6/P7/7k/8/8/8/8/7K w - - 0 1");
  assert.equal(capturedPieces(game).diff, -4);
  game.move("a8=Q");
  assert.deepEqual(capturedPieces(game), { w: [], b: [], diff: 4 });
  game.move("Rxa8");
  assert.deepEqual(capturedPieces(game), { w: [], b: ["q"], diff: -5 });
});
test("custom positions never invent missing starting pieces as captures", () => {
  const game = new Chess("1r5k/8/8/8/8/8/8/1Q5K w - - 0 1");
  assert.deepEqual(capturedPieces(game), { w: [], b: [], diff: 4 });
  game.move("Qxb8+");
  assert.deepEqual(capturedPieces(game), { w: ["r"], b: [], diff: 9 });
  assert.match(playerStrip(game, "w", { name: "<Toi>" }), /&lt;Toi&gt;/);
  assert.match(playerStrip(game, "w"), /data-piece="br"/);
  assert.match(playerStrip(game, "w"), /\+9/);
  assert.doesNotMatch(playerStrip(game, "b"), /\+9/);
});
test("replay and alternative analysis lines preserve all earlier captures", () => {
  const record = parsePgn("1. e4 d5 2. exd5 Qxd5 3. Nc3 *");
  const at = gameAt(record, 4);
  assert.deepEqual(capturedPieces(at), { w: ["p"], b: ["p"], diff: 0 });
  at.move("Nf3");
  assert.equal(at.history().length, 5);
  assert.deepEqual(capturedPieces(at).w, ["p"]);
});
