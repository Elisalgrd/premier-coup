import { esc, $, dateKey, notice } from "../ui/helpers.js";
import { migrateLegacy } from "../state/migrate.js";
export function applyPreferences(state) {
  document.documentElement.dataset.theme = state.preferences.theme;
  document.documentElement.dataset.sound = String(state.preferences.sound);
  document.documentElement.dataset.board = state.preferences.boardSize;
  for (const v of document.querySelectorAll("video"))
    v.muted = state.preferences.voice === "silent";
}
export function openSettings(ctx) {
  const d = $("#settings"),
    p = ctx.state.preferences;
  d.innerHTML = `<form method="dialog"><header><h2>Réglages</h2><button aria-label="Fermer les réglages">✕</button></header></form><label>Ma séance<select id="setting-minutes">${[15, 25, 45].map((n) => `<option value="${n}" ${p.minutes === n ? "selected" : ""}>${n} minutes</option>`).join("")}</select></label><label>Apparence<select id="setting-theme"><option value="light" ${p.theme === "light" ? "selected" : ""}>Claire</option><option value="dark" ${p.theme === "dark" ? "selected" : ""}>Sombre</option></select></label><label>Taille d’échiquier<select id="setting-board"><option value="normal" ${p.boardSize === "normal" ? "selected" : ""}>Confort</option><option value="compact" ${p.boardSize === "compact" ? "selected" : ""}>Compacte</option></select></label><label>Voix des vidéos<select id="setting-voice"><option value="male" ${p.voice !== "silent" ? "selected" : ""}>Narration masculine</option><option value="silent" ${p.voice === "silent" ? "selected" : ""}>Muette, avec sous-titres</option></select></label><label><input type="checkbox" id="setting-sound" ${p.sound ? "checked" : ""}> Son des coups</label><label class="form-label">Pseudo Lichess<input id="setting-lichess" value="${esc(p.lichess || "")}" autocomplete="off"></label><label class="form-label">Pseudo Chess.com<input id="setting-chesscom" value="${esc(p.chesscom || "")}" autocomplete="off"></label><small>Les pseudos restent ici jusqu’à ce que tu lances un import.</small><h3>Ma progression</h3><p>Enregistrée sur cet appareil. Exporte une copie pour la transférer.</p><button class="button secondary" id="export">Exporter ma sauvegarde ↓</button><label class="button secondary">Importer une sauvegarde<input id="import" type="file" accept="application/json,.json"></label><button id="undo-import" class="button secondary" hidden>Annuler cet import</button><a href="#train/placement" id="settings-placement" class="text-link">Faire le test de placement ↗</a><p id="settings-status" role="status"></p><small>Premier coup ${esc(document.documentElement.dataset.version)} · <a href="https://github.com/Elisalgrd/premier-coup/blob/main/THIRD_PARTY_LICENSES.md" target="_blank" rel="noopener">Sources et licences ↗</a></small>`;
  d.showModal();
  for (const [id, key] of [
    ["minutes", "minutes"],
    ["theme", "theme"],
    ["board", "boardSize"],
    ["voice", "voice"],
    ["lichess", "lichess"],
    ["chesscom", "chesscom"],
  ])
    $("#setting-" + id).onchange = (e) => {
      ctx.state.preferences[key] =
        id === "minutes" ? Number(e.target.value) : e.target.value;
      ctx.save();
      applyPreferences(ctx.state);
    };
  $("#setting-sound").onchange = (e) => {
    ctx.state.preferences.sound = e.target.checked;
    applyPreferences(ctx.state);
    ctx.save();
  };
  $("#settings-placement").onclick = () => d.close();
  $("#export").onclick = () => {
    const url = URL.createObjectURL(
        new Blob([JSON.stringify(ctx.state, null, 2)], {
          type: "application/json",
        }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = "premier-coup-" + dateKey() + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  let previous;
  $("#import").onchange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 30e6) throw Error("Fichier trop volumineux.");
      let raw = JSON.parse(await file.text());
      if (raw.version === 1) {
        const map = await (await fetch("./curriculum/legacy-map.json")).json();
        raw = migrateLegacy(raw, map);
      }
      previous = structuredClone(ctx.state);
      await ctx.store.replace(raw);
      $("#settings-status").textContent =
        "Progression importée. Tu peux annuler tant que ces réglages restent ouverts.";
      $("#undo-import").hidden = false;
      applyPreferences(ctx.state);
      ctx.render();
    } catch (err) {
      $("#settings-status").textContent = err.message;
    }
  };
  $("#undo-import").onclick = async () => {
    if (previous) {
      await ctx.store.replace(previous);
      $("#undo-import").hidden = true;
      $("#settings-status").textContent = "Progression précédente restaurée.";
      ctx.render();
    }
  };
}
