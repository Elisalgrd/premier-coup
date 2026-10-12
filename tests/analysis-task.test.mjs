import test from "node:test";
import assert from "node:assert/strict";
import { parsePgn } from "../src/play/import.js";
import { analyzePendingGame, pendingAnalyses, pendingAnalysisCard } from "../src/play/analysis-task.js";
import { emptyState } from "../src/state/schema.js";

const score = { type: "cp", score: 0, best: "e2e4", line: ["e2e4"] };
const record = () => ({ ...parsePgn("1. e4 *"), autoAnalyze: true });
test("cancel during the final engine search never consumes the pending game or creates cards", async () => {
  const g = record(), state = emptyState(), controller = new AbortController();
  state.games.push(g);
  let n = 0;
  const snapshots = [];
  await assert.rejects(analyzePendingGame(g, { search: async () => {
    if (++n === 2) controller.abort();
    return score;
  } }, { state, signal: controller.signal, save: () => snapshots.push(structuredClone(g)) }));
  assert.equal(g.analysis, null);
  assert.equal(g.autoAnalyze, true);
  assert.equal(g.analysisStatus, "interrupted");
  assert.deepEqual(state.cards, {});
  assert.equal(pendingAnalyses(state).length, 1);
  assert.match(pendingAnalysisCard(state), /Analyse interrompue, reprendre/);
  assert.ok(snapshots.every((s) => !s.analysis && s.autoAnalyze));
});
test("engine failure stays pending; a successful retry saves analysis and consumes the flag together", async () => {
  const g = record();
  await assert.rejects(analyzePendingGame(g, { search: async () => { throw Error("worker failed"); } }, { save() {} }));
  assert.equal(g.autoAnalyze, true);
  assert.equal(g.analysisStatus, "interrupted");
  const snapshots = [];
  await analyzePendingGame(g, { search: async () => score }, { save: () => snapshots.push(structuredClone(g)) });
  assert.equal(g.autoAnalyze, false);
  assert.equal(g.analysis.analyzedMoves, 1);
  assert.equal(snapshots.at(-1).analysisStatus, "complete");
  assert.equal(snapshots.at(-1).autoAnalyze, false);
  assert.ok(snapshots.at(-1).analysis);
});
test("old consumed flags and stale running analyses remain visible on both entry points", () => {
  const state = emptyState();
  state.games = [{ ...record(), autoAnalyze: false }, { ...record(), analysisStatus: "running" }];
  assert.equal(pendingAnalyses(state).length, 2);
  assert.match(pendingAnalysisCard(state), /2 parties à analyser/);
  state.games.forEach((g) => g.analysis = {});
  assert.equal(pendingAnalysisCard(state), "");
});
