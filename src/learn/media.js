import { esc } from "../ui/helpers.js";
let titles = {};
fetch("./curriculum/videos.json")
  .then((r) => r.json())
  .then((x) => (titles = x))
  .catch(() => {});
export function videoResources(e, preferences) {
  const videos = e.videos || [e.videoId].filter(Boolean);
  return videos.length
    ? `<details class="video-resource"><summary>Voir en vidéo (${videos.length})</summary><p>Complément avec narration masculine. Le cours interactif reste indépendant de la vidéo.</p>${videos.map((id) => `<h3>${esc(titles[id] || id)}</h3><video controls playsinline preload="none" ${preferences.voice === "silent" ? "muted" : ""} poster="./videos/${id}-cover.jpg" aria-label="${esc(titles[id] || e.title)}"><source src="./videos/${id}.mp4" type="video/mp4"><track kind="subtitles" src="./videos/${id}.vtt" srclang="fr" label="Français" ${preferences.voice === "silent" ? "default" : ""}></video>`).join("")}</details>`
    : "";
}
export function sourceResources(e) {
  return e.sources?.length
    ? `<details class="source-links"><summary>Sources et repères complémentaires</summary>${e.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join("")}<small>Premier coup est une application indépendante. Les textes du parcours viennent du programme fourni.</small></details>`
    : "";
}
