import { mostFrequentMistake, mistakeThemes, targetedPlan } from "./targeted.js";
import { loadPuzzles, puzzleManifest } from "./puzzles.js";
import { startCorrection } from "../play/correction-player.js";
import { Chess } from "../chess/chess.js";
import { PuzzlePlayer } from "./puzzle-player.js";
import { esc, friendlyMistake } from "../ui/helpers.js";

export function startTargeted(ctx, root, encodedLabel) {
  const label = encodedLabel ? decodeURIComponent(encodedLabel) : mostFrequentMistake(ctx.state)?.label;
  let disposed = false, cleanup, player, index = 0;
  root.innerHTML = '<p class="loading">Je prépare tes positions et celles de la banque…</p>';
  const run = async () => {
    const manifest = await puzzleManifest(), themes = mistakeThemes[label] || mistakeThemes["Autre décision à revoir"];
    const keys = Object.entries(manifest.shards).filter(([,s]) => s.tags?.some(t => themes.includes(t))).sort((a,b) => b[1].tags.filter(t => themes.includes(t)).length - a[1].tags.filter(t => themes.includes(t)).length).slice(0,3).map(([key])=>key);
    const loaded = await Promise.allSettled(keys.map(key => loadPuzzles(key)));
    if (disposed) return;
    const rows = loaded.filter(r => r.status === "fulfilled").flatMap(r => r.value.rows);
    const signature = label || "Autre décision à revoir";
    let batch = ctx.state.targeted;
    if (!batch || batch.label !== signature || batch.index >= batch.plan.length) {
      batch = ctx.state.targeted = { label: signature, index: 0, plan: targetedPlan(ctx.state, signature, rows, manifest), completed: {}, created: Date.now() };
      await ctx.save();
    }
    index = batch.index;
    const next = async () => { if (disposed) return; batch.index = ++index; await ctx.save(); if (!disposed) show(); };
    const show = async () => {
      cleanup?.(); cleanup = null; player?.destroy(); player = null;
      if (disposed) return;
      const item = batch.plan[index];
      if (!item) {
        root.innerHTML = `<section class="completion"><h1>${batch.plan.length ? "Série ciblée terminée ✓" : "Ces positions ne sont pas encore disponibles."}</h1><p>${batch.plan.length ? `${batch.plan.length} positions pour renforcer ton réflexe. Retrouve-le maintenant dans une partie.` : "Reconnecte-toi une fois pour télécharger les problèmes de ce thème."}</p><a class="button primary" href="#train/game">Jouer une partie →</a><a href="#progress" class="button secondary">Voir mes progrès</a></section>`; return;
      }
      root.innerHTML = `<header class="targeted-banner"><strong>SÉRIE CIBLÉE · ${index+1} / ${batch.plan.length}</strong><p>${esc(friendlyMistake(signature))}</p><small>${item.kind === "mistake" ? "Une position de tes parties" : "Un nouveau contexte, le même réflexe"}</small></header><div id="targeted-content"></div>`;
      const content = root.querySelector("#targeted-content");
      if (item.kind === "puzzle" && batch.completed?.[item.row[0]]) return next();
      if (item.kind === "mistake") {
        const c = ctx.state.cards[item.id];
        if (!c) return next();
        const m = { fen: c.challenge.fen, best: c.challenge.solution[0], line: c.challenge.solution, ply: c.ply || Number(c.id.split(":").at(-1)), question: c.question, label: c.principle, entryId: c.entryId };
        const record = { id: c.gameId, color: new Chess(m.fen).turn(), analysis: { allMoments: [m] }, correction: batch.corrections?.[c.id] };
        const local = { ...ctx, save: () => { (batch.corrections ??= {})[c.id] = record.correction; return ctx.save(); } };
        cleanup = startCorrection(local, content, c.gameId, { record, onDone: next });
      }
      else {
        player = new PuzzlePlayer(ctx, [item.row], manifest, { theme: Object.values(ctx.state.cards).find(c => c.principle === signature)?.entryId || keys[0] || "mixed", title: "Série ciblée", scope: `targeted:${batch.created}:${index}`, autoContinue: true, onResult: () => { (batch.completed ??= {})[item.row[0]] = true; }, onDone: next });
        player.start(content);
      }
      if (disposed) { cleanup?.(); player?.destroy(); }
    };
    show();
  };
  run().catch(e => { if (!disposed) root.innerHTML = `<h1>La série attend sa banque de problèmes.</h1><p>${esc(e.message)}</p><a href="#train/mistakes" class="button primary">Revoir mes positions enregistrées</a>`; });
  return () => { disposed = true; cleanup?.(); player?.destroy(); };
}
