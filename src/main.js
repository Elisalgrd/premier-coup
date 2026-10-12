import { Store } from "./state/store.js";
import { loadIndex, loadEntry, loadSearch } from "./learn/catalogue.js";
import { catalogueView } from "./views/catalogue.js";
import { trainView } from "./views/train.js";
import { progressView } from "./views/progress.js";
import { dailyView } from "./views/today.js";
import { openSettings, applyPreferences } from "./views/settings.js";
import { esc, $, icon, notice } from "./ui/helpers.js";
const store = new Store();
let entries = [],
  cleanup = null,
  renderId = 0,
  filters = {},
  detail = null;
const routes = [
  ["today", "Aujourd’hui"],
  ["catalogue", "Catalogue"],
  ["train", "S’entraîner"],
  ["progress", "Progrès"],
];
export const context = {
  store,
  get state() {
    return store.state;
  },
  get entries() {
    return entries;
  },
  save: () =>
    store.save().then(() => {
      if (store.error) notice(store.error);
    }),
  render,
  navigate: (path) => (location.hash = path),
  mountActivity,
};
function route() {
  return (location.hash.slice(1) || "today").split("/");
}
function shell(content, active) {
  return `<div class="app-shell"><aside class="sidebar"><a class="brand" href="#today"><img src="./assets/icon.svg" alt=""><span>premier coup<small>Un coup mieux compris.</small></span></a><nav aria-label="Navigation principale">${routes.map(([id, label]) => `<a href="#${id}" class="${active === id ? "active" : ""}" ${active === id ? 'aria-current="page"' : ""}><span aria-hidden="true">${icon(id)}</span>${label}</a>`).join("")}</nav><div class="sidebar-note">Comprendre une idée.<br>La retrouver en partie.</div></aside><main class="main"><header class="topbar"><a class="mobile-brand" href="#today">♞ premier coup</a><span class="desktop-tag">TON ATELIER D’ÉCHECS</span><button id="settings-open" class="icon-button" aria-label="Réglages">⚙</button></header><div id="view">${content}</div></main></div>`;
}
export function mountActivity(html, binder) {
  cleanup?.();
  cleanup = null;
  $("#view").innerHTML = html;
  cleanup = binder?.($("#view")) || null;
  window.scrollTo(0, 0);
}
function bindCatalogue() {
  const update = () => {
    filters = {
      query: $("#catalogue-search").value,
      domain: $("#filter-domain").value,
      priority: $("#filter-priority").value,
      status: $("#filter-status").value,
    };
    const pos = $("#catalogue-search").selectionStart,
      focused = document.activeElement?.id;
    $("#view").innerHTML = catalogueView(entries, store.state, filters);
    bindCatalogue();
    if (focused === "catalogue-search") {
      $("#catalogue-search").focus();
      $("#catalogue-search").setSelectionRange(pos, pos);
    }
  };
  $("#catalogue-search").oninput = update;
  for (const id of ["domain", "priority", "status"])
    $("#filter-" + id).onchange = update;
}
export async function render() {
  const ticket = ++renderId;
  cleanup?.();
  cleanup = null;
  let nextCleanup = null;
  const [page, id, theme] = route(),
    active = routes.some(([x]) => x === page)
      ? page
      : page === "lesson"
        ? "catalogue"
        : "today";
  try {
    let html, entry;
    if (page === "lesson") {
      entry = await loadEntry(id);
      html = '<div id="activity"></div>';
    } else if (page === "catalogue") {
      await loadSearch(entries);
      html = catalogueView(entries, store.state, filters);
    } else
      html =
        page === "train"
          ? trainView(entries)
          : page === "progress"
            ? progressView(entries, store.state)
            : dailyView(entries, store.state);
    if (ticket !== renderId) return;
    $("#app").innerHTML = shell(html, active);
    const view = $("#view");
    $("#settings-open").onclick = () => openSettings(context);
    if (page === "catalogue") bindCatalogue();
    if (page === "lesson") {
      const mod = await import("./learn/lesson-player.js");
      if (ticket !== renderId) return;
      nextCleanup = new mod.LessonPlayer(entry, context).start(
        $("#activity", view),
      );
    } else if (page === "train" && id === "vision") {
      const mod = await import("./vision/player.js");
      if (ticket !== renderId) return;
      if (theme) nextCleanup = await mod.startVision(context, view, theme);
      else view.innerHTML = mod.visionMenu(store.state);
    } else {
      const activities = {
        session: ["./learn/session-player.js", "startSession"],
        placement: ["./learn/placement.js", "startPlacement"],
        game: ["./play/game.js", "startGame", theme],
        import: ["./play/import-view.js", "startImport"],
        mistakes: [
          "./learn/reviews.js",
          "startReviews",
          {
            ids: Object.values(store.state.cards)
              .filter((c) => c.type === "mistake")
              .map((c) => c.id),
          },
        ],
        reviews: ["./learn/reviews.js", "startReviews"],
        woodpecker: ["./learn/woodpecker.js", "startWoodpecker"],
        puzzles: ["./learn/start-puzzles.js", "startPuzzles", theme || "mixed"],
      };
      const task =
        activities[
          page === "session" ? "session" : page === "train" ? id : null
        ];
      if (task) {
        view.innerHTML =
          '<p class="loading">Préparation de ton entraînement…</p>';
        const mod = await import(task[0]);
        if (ticket !== renderId) return;
        nextCleanup = await mod[task[1]](context, view, task[2]);
      }
    }
    if (ticket !== renderId) {
      nextCleanup?.();
      return;
    }
    cleanup = nextCleanup;
    applyPreferences(store.state);
  } catch (error) {
    nextCleanup?.();
    if (ticket !== renderId) return;
    $("#app").innerHTML = shell(
      `<section class="empty"><h1>Ce contenu n’est pas disponible.</h1><p>${esc(error.message)}</p><a href="#today" class="button primary">Revenir à l’accueil</a></section>`,
      active,
    );
  }
}
async function start() {
  const loaded = await Promise.all([
    loadIndex(),
    fetch("./curriculum/legacy-map.json").then((r) => r.json()),
  ]);
  entries = loaded[0];
  const mapping = loaded[1];
  await store.load(mapping);
  applyPreferences(store.state);
  await render();
  window.addEventListener("hashchange", () => {
    render();
    window.scrollTo(0, 0);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") store.save();
  });
  window.addEventListener("pagehide", () => store.save());
  if ("serviceWorker" in navigator)
    navigator.serviceWorker
      .register("./sw.js?v=" + document.documentElement.dataset.version)
      .catch(() => {});
}
start().catch((e) => {
  $("#app").innerHTML =
    `<main class="fatal"><h1>La progression reste conservée.</h1><p>${esc(e.message)}</p><button onclick="location.reload()">Réessayer</button></main>`;
});
