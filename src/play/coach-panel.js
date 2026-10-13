import { signalSummary } from "./pre-move-signals.js";
import { Board } from "../chess/board.js";
import { Chess } from "../chess/chess.js";
import { moveUci } from "../chess/notation.js";
import { coachSummary } from "./live-coach.js";
import { esc, friendlyMistake } from "../ui/helpers.js";

const severityLabel = (m) => m.severity === "gaffe" ? "Gaffe" : "Erreur";
export function coachSummaryHtml(record) {
  if (!record.liveCoach || record.liveCoach === "off") return record.signals?.length ? `<p>${esc(signalSummary(record.signals))}</p>` : "";
  const { total, repeated } = coachSummary(record.alerts);
  return `<section class="coach-summary"><h2>Ton bilan avec le coach</h2><p>${esc(signalSummary(record.signals))}</p><p>Le coach t’a signalé ${total} erreur${total > 1 ? "s" : ""} pendant la partie.${repeated?.count >= 2 ? ` Dont ${repeated.count} du même type : ${esc(friendlyMistake(repeated.label))}.` : ""}</p>${repeated ? `<a class="text-link" href="#lesson/${esc(repeated.entryId)}">Revoir le principe →</a>` : ""}<p>${record.takebacks || 0} coup${record.takebacks === 1 ? "" : "s"} repris sur 3 possibles.</p></section>`;
}

export class CoachPanel {
  constructor(root, { side, alerts, canTakeback, onTakeback, onDismiss }) {
    Object.assign(this, { root, side, alerts, canTakeback, onTakeback, onDismiss });
    this.selected = [...alerts].reverse().find((a) => !a.dismissed && !a.retracted) || null;
    this.render();
  }
  add(alert) { this.selected = alert; this.render(); }
  update() {
    const button = this.root.querySelector("[data-takeback]");
    if (button) button.disabled = !this.canTakeback(this.selected);
  }
  render() {
    this.board?.destroy();
    this.board = null;
    const m = this.selected;
    this.root.innerHTML = `${m ? `<article class="live-coach-card" aria-label="Conseil du coach"><span class="eyebrow">${severityLabel(m)} AU COUP ${Math.ceil(m.ply / 2)}</span><h2>${esc(m.title)}</h2>${m.opportunity ? `<p class="coach-opportunity">${esc(m.opportunity)}</p>` : ""}<p><strong>Risque :</strong> ${esc(m.risk)}</p><p><strong>Tu avais mieux :</strong> ${esc(m.better)}</p><div class="coach-buttons"><button class="button secondary" data-show>Voir sur l’échiquier</button><button class="text-link" data-dismiss>Compris</button></div><button class="text-link" data-takeback ${this.canTakeback(m) ? "" : "disabled"}>${m.retracted ? "Coup repris ✓" : "Reprendre mon coup"}</button><div class="coach-position" hidden><p class="small">Cette position est un arrêt sur image. Ta partie continue sur le grand échiquier.</p><div class="coach-mini-board"></div><p class="coach-legend"><span>Vert : ton meilleur coup.</span><span>Rouge : sa réponse après ton coup.</span></p><div class="coach-buttons"><button class="text-link" data-before>Avant mon coup</button><button class="text-link" data-reply ${m.reply ? "" : "disabled"}>Voir sa réponse</button><button class="text-link" data-best>Voir le meilleur coup</button></div></div></article>` : ""}<details class="coach-history" ${!m && this.alerts.length ? "open" : ""}><summary>Conseils de cette partie (${this.alerts.length})</summary>${this.alerts.length ? this.alerts.map((a, i) => `<button class="text-link" data-alert="${i}">Coup ${Math.ceil(a.ply / 2)} · ${severityLabel(a)} · ${esc(a.title)}${a.retracted ? " (repris)" : ""}</button>`).join("") : "<p>Le coach te préviendra après un coup qui mérite d’être revu.</p>"}</details>`;
    for (const b of this.root.querySelectorAll("[data-alert]")) b.onclick = () => { this.selected = this.alerts[Number(b.dataset.alert)]; this.render(); this.show(); };
    if (!m) return;
    this.root.querySelector("[data-dismiss]").onclick = () => { m.dismissed = true; this.onDismiss(); this.selected = null; this.render(); };
    this.root.querySelector("[data-show]").onclick = () => this.show();
    this.root.querySelector("[data-takeback]").onclick = () => { if (this.onTakeback(m)) this.render(); };
    this.root.querySelector("[data-before]").onclick = () => this.before();
    this.root.querySelector("[data-best]").onclick = () => {
      const game = new Chess(m.fen);
      moveUci(game, m.best);
      this.board.animate(game.fen(), m.best);
      this.board.options.arrows = [[m.best.slice(0, 2), m.best.slice(2, 4), "good"]];
      this.board.render();
    };
    this.root.querySelector("[data-reply]").onclick = () => {
      const game = new Chess(m.afterFen);
      moveUci(game, m.reply);
      this.board.set(m.afterFen, { arrows: [] });
      this.board.animate(game.fen(), m.reply);
      this.board.options.arrows = [[m.reply.slice(0, 2), m.reply.slice(2, 4), "danger"]];
      this.board.render();
    };
  }
  show() {
    this.root.querySelector(".coach-position").hidden = false;
    this.board ??= new Board(this.root.querySelector(".coach-mini-board"), { fen: this.selected.fen, flipped: this.side === "b", interactive: false });
    this.before();
  }
  before() {
    const m = this.selected;
    this.board.set(m.fen, { arrows: [[m.best.slice(0, 2), m.best.slice(2, 4), "good"], ...(m.reply ? [[m.reply.slice(0, 2), m.reply.slice(2, 4), "danger"]] : [])] });
  }
  destroy() { this.board?.destroy(); }
}
