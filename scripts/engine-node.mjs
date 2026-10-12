import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
export async function nodeEngine() {
  const file = path.resolve("src/chess/vendor/stockfish-18-lite-single.js"),
    mod = new Module(file);
  mod.filename = file;
  mod.paths = Module._nodeModulePaths(path.dirname(file));
  mod._compile(fs.readFileSync(file, "utf8"), file);
  const listeners = new Set(),
    api = {
      wasmBinary: fs.readFileSync(file.replace(/\.js$/, ".wasm")),
      listener: (line) => {
        for (const f of listeners) f(line);
      },
    };
  await mod.exports()(api);
  while (api._isReady && !api._isReady())
    await new Promise((r) => setTimeout(r, 10));
  const send = (cmd) =>
    api.ccall("command", null, ["string"], [cmd], { async: /^go\b/.test(cmd) });
  const request = (command, match) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        listeners.delete(receive);
        reject(Error("Engine timeout: " + command));
      }, 180000);
      const receive = (line) => {
        if (match(line)) {
          clearTimeout(timer);
          listeners.delete(receive);
          resolve(line);
        }
      };
      listeners.add(receive);
      send(command);
    });
  await request("uci", (s) => s === "uciok");
  send("setoption name Hash value 32");
  await request("isready", (s) => s === "readyok");
  let queue = Promise.resolve();
  return {
    search(fen, { depth = 12, multiPV = 1, searchmoves = [] } = {}) {
      const job = async () => {
        const vars = new Map();
        const receive = (line) => {
          const score = / score (cp|mate) (-?\d+)/.exec(line),
            d = Number(/ depth (\d+)/.exec(line)?.[1] || 0),
            p = Number(/ multipv (\d+)/.exec(line)?.[1] || 1);
          if (
            score &&
            line.includes(" pv ") &&
            (!vars.has(p) || d >= vars.get(p).depth)
          )
            vars.set(p, {
              type: score[1],
              score: Number(score[2]),
              line: line.split(" pv ")[1].trim().split(" "),
              depth: d,
            });
        };
        listeners.add(receive);
        try {
          send("setoption name MultiPV value " + multiPV);
          send("position fen " + fen);
          const best = await request(
            "go depth " +
              depth +
              (searchmoves.length
                ? " searchmoves " + searchmoves.join(" ")
                : ""),
            (s) => s.startsWith("bestmove "),
          );
          return {
            ...vars.get(1),
            best: best.split(" ")[1],
            variations: [...vars.values()],
          };
        } finally {
          listeners.delete(receive);
        }
      };
      const result = queue.then(job);
      queue = result.catch(() => {});
      return result;
    },
  };
}
