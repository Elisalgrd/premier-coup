import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
export async function nodeEngine() {
  const file = path.resolve("src/chess/vendor/stockfish-18-lite-single.js"),
    mod = new Module(file);
  mod.filename = file;
  mod.paths = Module._nodeModulePaths(path.dirname(file));
  mod._compile(fs.readFileSync(file, "utf8"), file);
  const listeners = new Set();
  const api = {
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
  send("setoption name Hash value 16");
  return {
    search: (fen, { depth = 12 } = {}) =>
      new Promise((resolve) => {
        let info = {};
        const receive = (line) => {
          const score = / score (cp|mate) (-?\d+)/.exec(line);
          if (score && line.includes(" pv "))
            info = {
              type: score[1],
              score: Number(score[2]),
              line: line.split(" pv ")[1].trim().split(" "),
              depth: Number(/ depth (\d+)/.exec(line)?.[1] || 0),
            };
          if (line.startsWith("bestmove ")) {
            listeners.delete(receive);
            resolve({ ...info, best: line.split(" ")[1] });
          }
        };
        listeners.add(receive);
        send("position fen " + fen);
        send("go depth " + depth);
      }),
  };
}
