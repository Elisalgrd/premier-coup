import { loadEntry } from "./catalogue.js";
import { loadDrillChallenges } from "./drills.js";
import { startDrill } from "./drill-player.js";
import { loadPuzzles } from "./puzzles.js";
import { PuzzlePlayer } from "./puzzle-player.js";
import { pickPuzzles } from "./rating.js";
import { esc } from "../ui/helpers.js";
export async function startPuzzles(ctx, root, theme = "mixed", options = {}) {
  root.innerHTML =
    '<p class="loading" role="status">Préparation des positions…</p>';
  let player,
    disposed = false;
  const run = async () => {
    try {
      const data = await loadPuzzles(theme);
      if (disposed) return;
      if (theme !== "mixed" && data.theme !== theme) {
        const e = await loadEntry(theme);
        const rows = await loadDrillChallenges(e);
        if (!disposed)
          player = { destroy: startDrill(ctx, root, e, { ...options, rows }) };
        return;
      }
      const saved = ctx.state.exercise;
      let rows =
        options.rows || pickPuzzles(data.rows, ctx.state, theme, options);
      if (saved?.scope === "free:" + theme && !options.rows)
        rows = [saved.row, ...rows.filter((r) => r[0] !== saved.id)].slice(
          0,
          options.count || 10,
        );
      if (!rows.length) {
        root.innerHTML =
          '<h1>Tu as déjà vu ces positions récemment.</h1><p>Tu as déjà vu ces positions récemment. Change de thème ou retrouve tes révisions.</p><a class="button primary" href="#train/reviews">Mes révisions →</a>';
        return;
      }
      player = new PuzzlePlayer(ctx, rows, data.manifest, {
        theme,
        title:
          ctx.entries.find((x) => x.id === theme)?.title ||
          "Problèmes mélangés",
        ...options,
      });
      player.start(root);
    } catch (e) {
      if (!disposed)
        root.innerHTML = `<h1>Ces positions ne sont pas disponibles.</h1><p>${esc(e.message)}</p><a href="#train" class="button primary">Revenir →</a>`;
    }
  };
  run();
  return () => {
    disposed = true;
    player?.destroy();
  };
}
