import { Chess } from "../chess/chess.js";
import { uci } from "../chess/notation.js";
export function parsePgn(
  pgn,
  { color = "w", source = "Partie collée", id = null } = {},
) {
  if (typeof pgn !== "string" || pgn.length > 300000)
    throw Error("Le texte de la partie manque ou dépasse la taille autorisée.");
  const game = new Chess();
  game.loadPgn(pgn);
  const headers = game.getHeaders();
  if (
    headers.Variant &&
    !["Standard", "Chess", "From Position"].includes(headers.Variant)
  )
    throw Error(
      "Seules les parties d’échecs classiques sont prises en charge.",
    );
  const moves = game.history({ verbose: true });
  if (!moves.length) throw Error("Ce texte ne contient aucun coup reconnu.");
  return {
    id: id || crypto.randomUUID(),
    source,
    color,
    pgn: game.pgn(),
    headers,
    initialFen: moves[0].before,
    moves: moves.map(uci),
    createdAt: Date.now(),
    analysis: null,
  };
}
export function parseNdjson(text, pseudo) {
  return text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((g) => g.variant === "standard" && g.pgn)
    .map((g) =>
      parsePgn(g.pgn, {
        id: "lichess:" + g.id,
        source: "Lichess",
        color:
          g.players?.black?.user?.name?.toLowerCase() === pseudo.toLowerCase()
            ? "b"
            : "w",
      }),
    );
}
async function get(url, headers = {}) {
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!r.ok)
    throw Error(
      r.status === 429
        ? "Trop de demandes. Réessaie dans une minute."
        : "Le service répond " + r.status + ". Vérifie le pseudo.",
    );
  return r;
}
export async function importPublic(platform, pseudo) {
  pseudo = pseudo.trim();
  if (!/^[a-zA-Z0-9_-]{2,50}$/.test(pseudo))
    throw Error("Entre un pseudo valide.");
  const user = encodeURIComponent(pseudo);
  if (platform === "lichess") {
    const r = await get(
      `https://lichess.org/api/games/user/${user}?max=20&moves=true&opening=true&clocks=false&pgnInJson=true&ongoing=false&finished=true`,
      { Accept: "application/x-ndjson" },
    );
    return parseNdjson(await r.text(), pseudo);
  }
  const archives = await (
    await get(`https://api.chess.com/pub/player/${user}/games/archives`)
  ).json();
  if (!archives.archives?.length) return [];
  const url = archives.archives.at(-1);
  if (
    !/^https:\/\/api\.chess\.com\/pub\/player\/[^/]+\/games\/\d{4}\/\d{2}$/.test(
      url,
    )
  )
    throw Error("Adresse d’archive non reconnue.");
  const body = await (await get(url)).json();
  return (body.games || [])
    .filter((g) => g.rules === "chess")
    .sort((a, b) => b.end_time - a.end_time)
    .slice(0, 20)
    .map((g) =>
      parsePgn(g.pgn, {
        id: "chesscom:" + (g.uuid || g.url),
        source: "Chess.com",
        color:
          g.black?.username?.toLowerCase() === pseudo.toLowerCase() ? "b" : "w",
      }),
    );
}
export function saveGames(state, games) {
  const existing = new Set(state.games.map((g) => g.id));
  let count = 0;
  for (const g of games)
    if (!existing.has(g.id)) {
      state.games.push(g);
      existing.add(g.id);
      count++;
    }
  state.games = state.games.slice(-200);
  return count;
}
