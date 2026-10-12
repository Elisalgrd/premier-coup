import { startVision } from "../vision/player.js";
import { sessionPlan, weakThemes } from "./session.js";
import { startReviews } from "./reviews.js";
import { startPuzzles } from "./start-puzzles.js";
import { loadEntry } from "./catalogue.js";
import { loadPuzzles } from "./puzzles.js";
import { pickPuzzles } from "./rating.js";
import { LessonPlayer } from "./lesson-player.js";
import { dateKey, esc, $ } from "../ui/helpers.js";
export async function startSession(ctx, root) {
  let disposed = false,
    cleanup = null;
  const state = ctx.state;
  if (!state.session || state.session.day !== dateKey() || state.session.done)
    state.session = sessionPlan(state, ctx.entries);
  const session = state.session;
  const advance = (steps = 1) => {
    cleanup?.();
    cleanup = null;
    session.index += steps;
    ctx.save();
    show();
  };
  const clock = setInterval(() => {
    if (!disposed && document.visibilityState === "visible") {
      session.seconds++;
      state.days[session.day] ??= {};
      const d = state.days[session.day];
      if (typeof d === "object") d.seconds = (d.seconds || 0) + 1;
      if (session.seconds % 15 === 0) ctx.save();
    }
  }, 1000);
  const show = async () => {
    if (disposed) return;
    const t = session.tasks[session.index];
    if (!t || t.kind === "finish") {
      session.done = true;
      ctx.save();
      const h = state.history.filter((x) => x.day === session.day),
        errors = h.filter((x) => !x.clean).slice(-3);
      root.innerHTML = `<section class="completion"><span class="complete-icon">✓</span><h1>Ta séance est enregistrée.</h1><p>${h.length} positions travaillées aujourd’hui. ${h.filter((x) => x.clean).length} réussies sans aide.</p>${errors.map((x) => `<p>À consolider : ${esc(ctx.entries.find((e) => e.id === x.entryId)?.title || "les coups forçants")}.</p>`).join("")}<a href="#progress" class="button primary">Voir mes progrès →</a></section>`;
      return;
    }
    root.innerHTML =
      '<p class="loading">Préparation de ' + esc(t.label) + "…</p>";
    if (t.kind === "reviews")
      cleanup = await startReviews(ctx, root, {
        ids: t.cards,
        onDone: advance,
      });
    else if (t.kind === "lesson") {
      const e = await loadEntry(t.entryId);
      if (disposed) return;
      cleanup = new LessonPlayer(e, ctx, { onDone: () => advance(2) }).start(
        root,
      );
    } else if (t.kind === "vision") {
      cleanup = await startVision(ctx, root, "find", { onDone: advance });
    } else {
      let theme = t.entryId || "mixed";
      const data = await loadPuzzles(theme);
      if (disposed) return;
      let rows = pickPuzzles(data.rows, state, theme, { count: t.count });
      if (t.kind === "mixed") {
        const selected = [],
          used = new Set(),
          themes = weakThemes(state, ctx.entries).slice(0, 5);
        for (const item of themes) {
          const bank = await loadPuzzles(item.id);
          const group = pickPuzzles(bank.rows, state, item.id, {
            count: Math.ceil(t.count / Math.max(1, themes.length)),
            exclude: [...used],
          });
          for (const r of group) {
            used.add(r[0]);
            selected.push(r);
          }
        }
        if (selected.length)
          rows = selected.sort(() => Math.random() - 0.5).slice(0, t.count);
      }
      cleanup = await startPuzzles(ctx, root, theme, {
        rows,
        scope: "session:" + session.day + ":" + session.index,
        onDone: advance,
      });
    }
  };
  await show();
  return () => {
    disposed = true;
    clearInterval(clock);
    cleanup?.();
    ctx.save();
  };
}
