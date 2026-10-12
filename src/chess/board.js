import { moveSound } from "./sound.js";
import { Chess } from "./chess.js";
import { pieceHtml } from "./pieces.js";
import { pieceName } from "./notation.js";
import { esc } from "../ui/helpers.js";
let sequence = 0;
export function boardHtml(
  game,
  {
    flipped = false,
    selected = null,
    targets = [],
    marks = [],
    arrows = [],
    interactive = false,
    last = [],
    arrowColor = null,
  } = {},
) {
  const files = flipped ? "hgfedcba" : "abcdefgh",
    ranks = flipped ? "12345678" : "87654321",
    id = "arrow-" + ++sequence;
  const xy = (s) => [
    files.indexOf(s[0]) * 100 + 50,
    ranks.indexOf(s[1]) * 100 + 50,
  ];
  return `<div class="board-shell"><div class="board-grid" role="group" aria-label="Échiquier, ${flipped ? "noirs" : "blancs"} en bas">${[
    ...ranks,
  ]
    .flatMap((rank, row) =>
      [...files].map((file, col) => {
        const sq = file + rank,
          p = game.get(sq),
          light = ("abcdefgh".indexOf(file) + Number(rank)) % 2 === 0;
        return `<button type="button" class="square ${light ? "light" : "dark"} ${selected === sq ? "selected" : ""} ${marks.includes(sq) ? "marked" : ""} ${last.includes(sq) ? "last" : ""}" data-square="${sq}" aria-label="${sq}${p ? ", " + pieceName[p.type] + " " + (p.color === "w" ? (["q", "r"].includes(p.type) ? "blanche" : "blanc") : ["q", "r"].includes(p.type) ? "noire" : "noir") : ", vide"}" ${!interactive ? "disabled" : ""}>${p ? pieceHtml(p) : ""}${targets.includes(sq) ? '<i class="move-dot"></i>' : ""}${col === 0 ? `<span class="rank">${rank}</span>` : ""}${row === 7 ? `<span class="file">${file}</span>` : ""}</button>`;
      }),
    )
    .join(
      "",
    )}</div><svg class="board-arrows ${arrowColor === "danger" ? "danger-arrows" : ""}" viewBox="0 0 800 800" aria-hidden="true"><defs><marker id="${id}" markerWidth="3" markerHeight="3" refX="1.5" refY="1.5" orient="auto"><path d="M0 0L3 1.5L0 3Z" fill="currentColor"/></marker>${["danger", "good"].map((color) => `<marker id="${id}-${color}" class="${color}-arrow" markerWidth="3" markerHeight="3" refX="1.5" refY="1.5" orient="auto"><path d="M0 0L3 1.5L0 3Z" fill="currentColor"/></marker>`).join("")}</defs>${arrows
    .map(([a, b, color]) => {
      const [x1, y1] = xy(a),
        [x2, y2] = xy(b);
      return `<line ${color ? `class="${color === "danger" ? "danger-arrow" : "good-arrow"}" style="marker-end:url(#${id}-${color === "danger" ? "danger" : "good"})"` : ""} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${id})"/>`;
    })
    .join("")}</svg></div>`;
}
export class Board {
  constructor(
    root,
    {
      fen = new Chess().fen(),
      onMove = () => {},
      onSquare = null,
      flipped = false,
      interactive = true,
      ...options
    } = {},
  ) {
    this.root = root;
    this.game = new Chess(fen);
    this.onMove = onMove;
    this.onSquare = onSquare;
    this.options = { flipped, interactive, ...options };
    this.selected = null;
    this.suppressClick = false;
    this.render();
  }
  set(fen, options = {}) {
    this.game.load(fen);
    Object.assign(this.options, options);
    this.selected = null;
    this.render();
  }
  render() {
    const targets = this.selected
      ? this.game
          .moves({ square: this.selected, verbose: true })
          .map((m) => m.to)
      : [];
    this.root.innerHTML = boardHtml(this.game, {
      ...this.options,
      selected: this.selected,
      targets,
    });
    this.root.onclick = (e) => {
      if (this.suppressClick) {
        this.suppressClick = false;
        return;
      }
      const sq = e.target.closest("[data-square]")?.dataset.square;
      if (sq) this.tap(sq);
    };
    this.root.onpointerdown = (e) => {
      const sq = e.target.closest("[data-square]")?.dataset.square;
      if (!this.options.interactive || !sq || this.onSquare) return;
      this.drag = {
        square: sq,
        x: e.clientX,
        y: e.clientY,
        pointer: e.pointerId,
      };
    };
    this.root.onpointerup = (e) => {
      const d = this.drag;
      this.drag = null;
      if (!d) return;
      const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12;
      if (!moved) return;
      const target = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest("[data-square]");
      this.suppressClick = true;
      if (target && this.root.contains(target))
        this.attempt(d.square, target.dataset.square);
    };
    this.root.onpointercancel = () => {
      this.drag = null;
    };
  }
  tap(square) {
    if (!this.options.interactive) return;
    if (this.onSquare) {
      this.onSquare(square);
      return;
    }
    if (this.selected && this.selected !== square) {
      const legal = this.game
        .moves({ square: this.selected, verbose: true })
        .some((m) => m.to === square);
      if (legal) {
        this.attempt(this.selected, square);
        return;
      }
    }
    const p = this.game.get(square);
    this.selected = p?.color === this.game.turn() ? square : null;
    this.render();
  }
  attempt(from, to) {
    const candidates = this.game
      .moves({ square: from, verbose: true })
      .filter((m) => m.to === to);
    if (!candidates.length) {
      this.selected = null;
      this.render();
      return;
    }
    if (candidates.some((m) => m.promotion)) {
      const el = document.createElement("div");
      el.className = "promotion-panel";
      el.setAttribute("role", "group");
      el.setAttribute("aria-label", "Choisir la nouvelle pièce du pion");
      el.innerHTML =
        "<strong>Ton pion devient :</strong>" +
        ["q", "r", "b", "n"]
          .map(
            (t) =>
              `<button data-promote="${t}" aria-label="${pieceName[t]}">${pieceHtml({ type: t, color: this.game.turn() })}<span>${pieceName[t]}</span></button>`,
          )
          .join("");
      el.onclick = (e) => {
        const t = e.target.closest("[data-promote]")?.dataset.promote;
        if (t) {
          el.remove();
          this.onMove(from + to + t);
        }
      };
      this.root.append(el);
      return;
    }
    this.onMove(from + to);
  }
  animate(fen, move, duration = 400) {
    moveSound();
    this.set(fen, {
      last: [move.slice(0, 2), move.slice(2, 4)],
      marks: [],
      arrows: [[move.slice(0, 2), move.slice(2, 4)]],
    });
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      return;
    const from = this.root.querySelector(`[data-square="${move.slice(0, 2)}"]`),
      to = this.root.querySelector(`[data-square="${move.slice(2, 4)}"]`),
      piece = to?.querySelector(".piece");
    if (piece && from) {
      const a = from.getBoundingClientRect(),
        b = to.getBoundingClientRect();
      piece.animate?.(
        [
          { transform: `translate(${a.x - b.x}px,${a.y - b.y}px)` },
          { transform: "translate(0,0)" },
        ],
        { duration, easing: "ease-out" },
      );
    }
  }
  destroy() {
    this.root.onclick = null;
    this.root.onpointerdown = null;
    this.root.onpointerup = null;
    this.root.onpointercancel = null;
  }
}
