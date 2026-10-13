import test from "node:test";
import assert from "node:assert/strict";
import { boardHtml, Board } from "../src/chess/board.js";
import { Chess } from "../src/chess/chess.js";
import { currentBadge } from "../src/play/coach-alerts.js";
test("badge follows its square in both orientations and expires only at the next own move", () => {
  const alert = { ply: 3, played: "f1c4", severity: "gaffe" };
  const badges = currentBadge(alert, 4, "all");
  const white = boardHtml(new Chess(), { badges });
  const black = boardHtml(new Chess(), { badges, flipped: true });
  assert.match(white, /data-badge="c4" style="left:33%;top:50%"/);
  assert.match(black, /data-badge="c4" style="left:70.5%;top:37.5%"/);
  assert.deepEqual(currentBadge(alert, 5, "all"), []);
  assert.deepEqual(currentBadge(alert, 3, "off"), []);
});
test("badge tap opens advice without playing; normal board taps still play", () => {
  let opened = 0, played;
  const root = { innerHTML: "" };
  const board = new Board(root, { onBadge: () => opened++, onMove: m => played = m });
  root.onclick({ target: { closest: s => s === "[data-badge]" ? { dataset: { badge: "e4" } } : null } });
  assert.equal(opened, 1); assert.equal(played, undefined);
  board.tap("e2"); board.tap("e4");
  assert.equal(played, "e2e4");
});
