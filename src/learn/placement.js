import { loadPuzzles } from "./puzzles.js";
import { PuzzlePlayer } from "./puzzle-player.js";
import { $ } from "../ui/helpers.js";
export async function startPlacement(ctx, root) {
  let disposed = false,
    player;
  const data = await loadPuzzles("mixed");
  let p = ctx.state.placement;
  if (!p || p.done)
    p = ctx.state.placement = {
      low: 400,
      high: 2200,
      index: 0,
      ids: [],
      answers: [],
      done: false,
    };
  const next = () => {
    if (disposed) return;
    if (p.index >= 15) {
      p.done = true;
      ctx.state.ratings.global.value = Math.round((p.low + p.high) / 2);
      ctx.save();
      root.innerHTML = `<section class="completion"><span class="complete-icon">✓</span><h1>Ton point de départ : ${ctx.state.ratings.global.value}.</h1><p>C’est une estimation pour choisir tes problèmes. Elle évoluera avec tes résultats.</p><a href="#today" class="button primary">Commencer mon parcours →</a></section>`;
      return;
    }
    const target = (p.low + p.high) / 2,
      rows = data.rows
        .filter((r) => !p.ids.includes(r[0]))
        .sort((a, b) => Math.abs(a[3] - target) - Math.abs(b[3] - target)),
      row = rows[0];
    player?.destroy();
    player = new PuzzlePlayer(ctx, [row], data.manifest, {
      theme: "placement",
      resume: false,
      title: "Placement " + (p.index + 1) + " / 15",
      review: true,
      onResult: (r) => {
        p.ids.push(row[0]);
        p.answers.push(r.clean);
        const mid = (p.low + p.high) / 2;
        if (r.clean) p.low = mid;
        else p.high = mid;
        p.index++;
        ctx.save();
      },
      onDone: next,
    });
    player.start(root);
  };
  next();
  return () => {
    disposed = true;
    player?.destroy();
  };
}
