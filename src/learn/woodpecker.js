import { loadPuzzles } from "./puzzles.js";
import { PuzzlePlayer } from "./puzzle-player.js";
import { pickPuzzles } from "./rating.js";
import { dateKey, duration, $ } from "../ui/helpers.js";
export async function startWoodpecker(ctx, root) {
  let disposed = false,
    player;
  const w = ctx.state.woodpecker;
  root.innerHTML = `<a href="#train" class="back-link">← S’entraîner</a><header class="page-intro"><span class="eyebrow">LA MÉTHODE PIC-VERT</span><h1>Les motifs deviennent familiers.</h1><p>100 positions fixes. Refais-les à chaque cycle et compare ton temps avec ta précision.</p></header>${w ? `<div class="overview"><span><strong>${w.index} / 100</strong>ce cycle</span><span><strong>${w.cycles.length}</strong>cycles terminés</span></div>${w.cycles.map((c, i) => `<p>Cycle ${i + 1} : ${duration(c.seconds)}, ${c.clean} réussites sans aide.</p>`).join("")}` : '<label class="form-label">Difficulté du premier set<select id="wood-band"><option value="800">Palier 1 : 400 à 1000</option><option value="1200">Palier 2 : 1000 à 1400</option><option value="1600">Palier 3 : 1400 à 1800</option></select></label>'}<button class="button primary" id="wood-start">${w ? "Reprendre le cycle" : "Créer mon set de 100"} →</button>`;
  $("#wood-start", root).onclick = async () => {
    const data = await loadPuzzles("mixed");
    if (disposed) return;
    let set = ctx.state.woodpecker;
    if (!set) {
      const rating = Number($("#wood-band", root).value);
      const rows = pickPuzzles(
        data.rows.filter((r) => r[3] >= rating - 400 && r[3] <= rating + 200),
        ctx.state,
        "mixed",
        { count: 100, allowRecent: true },
      );
      set = ctx.state.woodpecker = {
        ids: rows.map((r) => r[0]),
        index: 0,
        cycles: [],
        seconds: 0,
        clean: 0,
      };
    }
    const rows = set.ids
      .map((id) => data.rows.find((r) => r[0] === id))
      .filter(Boolean)
      .slice(set.index);
    player = new PuzzlePlayer(ctx, rows, data.manifest, {
      theme: "mixed",
      scope: "woodpecker",
      review: true,
      title: "Pic-vert",
      onResult: (r) => {
        set.index++;
        set.seconds += r.seconds;
        set.clean += r.clean ? 1 : 0;
        ctx.save();
      },
      onDone: () => {
        set.cycles.push({
          day: dateKey(),
          seconds: set.seconds,
          clean: set.clean,
        });
        set.index = 0;
        set.seconds = 0;
        set.clean = 0;
        ctx.save();
        ctx.render();
      },
    });
    player.start(root);
  };
  return () => {
    disposed = true;
    player?.destroy();
  };
}
