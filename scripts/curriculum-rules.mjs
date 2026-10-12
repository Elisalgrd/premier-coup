import { Chess, validateFen } from "../src/chess/chess.js";
import { moveUci } from "../src/chess/notation.js";
export const forbidden =
  /trait aux|\b(?:FEN|UCI|SAN|palier|Woodpecker)\b|Types à couvrir|Nuances à donner|Règles à enseigner|Exercices spécifiques|Méthode d’entraînement|changent certaines positions|erreurs décisives|avantage significatif|gérer la position|améliorer sa structure|Repère les pièces concernées, leurs cases|Observe la suite sur l’échiquier\. Compare les pièces actives|Ce repère ne remplace pas le calcul/iu;
export function announcedOutcome(text = "") {
  if (
    /voici un mat|c’est (?:« )?(?:échec et )?mat(?:[,. »]|$)|: échec et mat|tour en e1 fait mat/iu.test(
      text,
    )
  )
    return "mate";
  if (/c’est (?:le )?(?:« )?pat|ce blocage s’appelle le pat/iu.test(text))
    return "stalemate";
  return null;
}
export function assertOutcome(game, outcome) {
  if (outcome === "mate" && !game.isCheckmate())
    throw Error("mat annoncé incorrect");
  if (outcome === "stalemate" && !game.isStalemate())
    throw Error("pat annoncé incorrect");
}
export function assertPosition(fen) {
  const v = validateFen(fen);
  if (!v.ok) throw Error(v.error);
  const g = new Chess(fen),
    other = g.turn() === "w" ? "b" : "w",
    king = g
      .board()
      .flat()
      .find((p) => p?.type === "k" && p.color === other);
  if (g.isAttacked(king.square, g.turn()))
    throw Error("Le roi du camp qui ne joue pas est déjà attaqué");
  return g;
}
export const wordCount = (s) =>
  String(s).trim().split(/\s+/u).filter(Boolean).length;
export function textErrors(text) {
  const out = [];
  if (wordCount(text) > 70)
    out.push("plus de 70 mots (" + wordCount(text) + ")");
  if (/[—–]/u.test(text)) out.push("tiret interdit");
  if (forbidden.test(text))
    out.push("mot ou phrase interdit : " + text.match(forbidden)[0]);
  return out;
}
export function glossaryMatcher(glossary) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const aliases = glossary
    .flatMap((g) => g.aliases.map((a) => ({ a, g })))
    .filter((x) => x.a.length > 1)
    .sort((a, b) => b.a.length - a.a.length);
  const re = new RegExp(
    "(?<![\\p{L}])(" +
      aliases.map((x) => esc(x.a)).join("|") +
      ")(s?)(?![\\p{L}])",
    "giu",
  );
  return (text) =>
    [...String(text).matchAll(re)]
      .filter(
        (m) =>
          !(
            m[1].toLowerCase() === "nulle" &&
            String(text).slice(m.index).startsWith("nulle part")
          ),
      )
      .map(
        (m) => aliases.find((x) => x.a.toLowerCase() === m[1].toLowerCase()).g,
      );
}
export function introducedTerms(e, all, visited = new Set()) {
  if (visited.has(e.id)) return new Set();
  visited.add(e.id);
  const out = new Set(e.introduces || []);
  for (const p of [
    ...e.prerequisites,
    ...(e.id === "vis-start" ? [] : ["vis-start"]),
  ]) {
    const dep = all.find((x) => x.id === p);
    if (!dep) throw Error("Prérequis inconnu " + p);
    for (const t of introducedTerms(dep, all, visited)) out.add(t);
  }
  return out;
}
export function validateEntry(e, all, glossary) {
  const errors = [],
    add = (where, msg) => errors.push(e.id + " / " + where + " : " + msg),
    known = introducedTerms(e, all),
    terms = glossaryMatcher(glossary);
  let positions = 0,
    moves = 0;
  const inspect = (where, c, isExercise = false) => {
    if (!c) return;
    for (const key of ["title", "text", "prompt", "hint", "success"])
      if (c[key]) {
        for (const m of textErrors(c[key])) add(where + "/" + key, m);
        for (const term of terms(c[key]))
          if (!known.has(term.term))
            add(where + "/" + key, "terme non introduit : " + term.term);
      }
    if (!c.fen) {
      if (!c.boardless) add(where, "position manquante");
      return;
    }
    try {
      const g = assertPosition(c.fen);
      positions++;
      if (
        c.outcome === "mate" &&
        !g.isCheckmate() &&
        !c.line?.length &&
        !c.solution?.length
      )
        throw Error("mat annoncé incorrect");
      if (c.outcome === "stalemate" && !g.isStalemate())
        throw Error("pat annoncé incorrect");
      for (const m of c.line || []) {
        if (!m.text?.trim()) throw Error("coup sans commentaire");
        for (const err of textErrors(m.text)) add(where + "/commentaire", err);
        for (const t of terms(m.text))
          if (!known.has(t.term))
            add(where + "/commentaire", "terme non introduit : " + t.term);
        moveUci(g, m.uci);
        moves++;
        assertOutcome(g, announcedOutcome(m.text));
      }
      if (!isExercise) assertOutcome(g, c.outcome || announcedOutcome(c.text));
      if (isExercise) {
        if (!["move", "square"].includes(c.kind)) throw Error("type inconnu");
        if (!c.accept?.length) throw Error("réponses acceptées manquantes");
        if (c.kind === "square") {
          for (const s of c.accept)
            if (!/^[a-h][1-8]$/.test(s)) throw Error("case inconnue " + s);
        } else {
          for (const m of [...c.accept, ...(c.alsoGood || [])])
            moveUci(new Chess(c.fen), m);
          const g2 = new Chess(c.fen);
          for (const m of c.solution) {
            moveUci(g2, m);
            moves++;
          }
          if (!c.accept.includes(c.solution[0]))
            throw Error("la solution doit être acceptée");
          if (c.outcome === "mate" && !g2.isCheckmate())
            throw Error("solution sans mat");
        }
      }
    } catch (err) {
      add(where, err.message);
    }
  };
  inspect("challenge", e.challenge, true);
  e.screens.forEach((s, i) => inspect("écran " + i, s));
  (e.exercises || []).forEach((c, i) => inspect("exercice " + i, c, true));
  for (const term of terms(e.retenir))
    if (!known.has(term.term))
      add("retenir", "terme non introduit : " + term.term);
  for (const m of textErrors(e.retenir)) add("retenir", m);
  return { errors: [...new Set(errors)], positions, moves };
}
