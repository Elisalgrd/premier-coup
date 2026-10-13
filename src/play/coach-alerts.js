import { esc } from "../ui/helpers.js";
import { moveSound } from "../chess/sound.js";

export function currentBadge(alert, currentPly, mode) {
  return mode === "off" || alert.retracted || currentPly > alert.ply + 1 ? [] : [{ square: alert.played.slice(2, 4), kind: alert.severity }];
}

// No backdrop, focus trap or board listeners: the game stays playable.
export class CoachAlerts {
  constructor(root, panel, alerts) {
    Object.assign(this, { root, panel, alerts });
    this.sheet = root.querySelector("#coach-sheet");
    this.host = document.createElement("div");
    this.host.className = "coach-floating";
    root.append(this.host);
    this.host.onclick = () => this.open();
    const handle = this.sheet.querySelector(".coach-sheet-handle");
    handle.querySelector("button").onclick = () => this.close();
    handle.onpointerdown = e => { this.startY = e.clientY; handle.setPointerCapture?.(e.pointerId); };
    handle.onpointerup = e => { if (e.clientY - this.startY > 35) this.close(); };
    if (alerts.length) this.compact();
  }
  notify(alert) {
    this.latest = alert;
    clearTimeout(this.timer);
    this.host.innerHTML = `<button class="coach-toast" aria-live="polite">⚠ ${alert.severity === "gaffe" ? "Gaffe" : "Erreur"} au coup ${Math.ceil(alert.ply / 2)} · ${esc(alert.title)} · <strong>Voir</strong></button>`;
    moveSound();
    this.timer = setTimeout(() => this.compact(), 4000);
  }
  compact() { this.host.innerHTML = `<button class="coach-toast compact" aria-label="Voir les ${this.alerts.length} conseils du coach">⚠ ${this.alerts.length}</button>`; }
  open() {
    const alert = this.latest || this.alerts.at(-1);
    if (!alert) return;
    this.panel.add(alert);
    this.sheet.classList.add("is-open");
    if (matchMedia("(min-width:701px)").matches) this.sheet.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  close() { this.sheet.classList.remove("is-open"); }
  destroy() { clearTimeout(this.timer); this.host.remove(); }
}
