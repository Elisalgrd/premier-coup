import { Board } from "../chess/board.js";
import { Chess } from "../chess/chess.js";
import { capturedPieces } from "../chess/material.js";
import { pieceName, moveUci } from "../chess/notation.js";
import { pieceHtml } from "../chess/pieces.js";
import { duration, esc } from "./helpers.js";

export function playerStrip(game, color, { name, seconds, clockId } = {}) {
  const taken = capturedPieces(game), enemy = color === "w" ? "b" : "w";
  const advantage = taken.diff * (color === "w" ? 1 : -1);
  const counts = new Map();
  for (const type of taken[color]) counts.set(type, (counts.get(type) || 0) + 1);
  return `<div class="player-strip ${game.turn() === color ? "to-play" : ""}" data-color="${color}"><div class="player-identity"><strong>${esc(name || (color === "w" ? "Blancs" : "Noirs"))}</strong><small>${color === "w" ? "Blancs" : "Noirs"}</small></div><div class="captured-pieces" aria-label="${esc(taken[color].length ? "Pièces prises : " + [...counts].map(([p, n]) => n + " " + pieceName[p] + (n > 1 ? "s" : "")).join(", ") : "Aucune pièce prise")}">${[...counts].map(([type, n]) => `<span class="captured-group">${pieceHtml({ type, color: enemy })}${n > 1 ? `<small>×${n}</small>` : ""}</span>`).join("")}</div>${advantage > 0 ? `<strong class="material-advantage" title="Avance en valeur des pièces encore sur l’échiquier" aria-label="${advantage} points d’avance en pièces">+${advantage}</strong>` : ""}${seconds != null ? `<strong class="player-clock" ${clockId ? `id="${esc(clockId)}"` : ""}>${duration(seconds)}</strong>` : ""}</div>`;
}

export function gameAt(record, ply) {
  const game = new Chess(record.initialFen);
  for (const move of record.moves.slice(0, ply)) moveUci(game, move);
  return game;
}

// The same two strips frame every replay and analysis board.
export class PlayerBoard {
  constructor(root, game, { side = "w", names = {} } = {}) {
    this.root = root;
    this.side = side;
    this.names = names;
    root.innerHTML = '<div class="player-above"></div><div class="player-board"></div><div class="player-below"></div>';
    this.board = new Board(root.querySelector(".player-board"), { fen: game.fen(), flipped: side === "b", interactive: false });
    this.set(game);
  }
  strips(game) {
    const other = this.side === "w" ? "b" : "w";
    this.root.querySelector(".player-above").innerHTML = playerStrip(game, other, { name: this.names[other] });
    this.root.querySelector(".player-below").innerHTML = playerStrip(game, this.side, { name: this.names[this.side] });
  }
  set(game, options = {}) { this.board.set(game.fen(), options); this.strips(game); }
  animate(game, move, duration, options) { this.board.animate(game.fen(), move, duration, options); this.strips(game); }
  get options() { return this.board.options; }
  render() { this.board.render(); }
  destroy() { this.board.destroy(); }
}
