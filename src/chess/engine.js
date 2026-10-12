export class Engine {
  constructor() {
    this.queue = Promise.resolve();
    this.worker = null;
    this.closed = false;
    this.handlers = new Set();
    this.pending = new Set();
  }
  async ready() {
    if (this.closed) throw Error("Analyse annulée.");
    if (this.readyPromise) return this.readyPromise;
    this.worker = new Worker(
      new URL("./vendor/stockfish-18-lite-single.js", import.meta.url),
    );
    this.worker.onmessage = (e) => {
      for (const line of String(e.data).split("\n"))
        for (const h of this.handlers) h(line);
    };
    this.worker.onerror = () => {
      for (const p of this.pending)
        p.reject(
          Error(
            "Le moteur ne peut pas démarrer. Reconnecte-toi pour le télécharger.",
          ),
        );
    };
    this.readyPromise = (async () => {
      const uci = this.wait((line) => line === "uciok", 30000);
      this.worker.postMessage("uci");
      await uci;
      this.worker.postMessage("setoption name Hash value 16");
      const ready = this.wait((line) => line === "readyok");
      this.worker.postMessage("isready");
      await ready;
    })();
    return this.readyPromise;
  }
  wait(match, timeout = 45000) {
    return new Promise((resolve, reject) => {
      const p = {
          reject: (e) => {
            clearTimeout(timer);
            this.handlers.delete(handler);
            this.pending.delete(p);
            reject(e);
          },
        },
        handler = (line) => {
          if (match(line)) {
            clearTimeout(timer);
            this.handlers.delete(handler);
            this.pending.delete(p);
            resolve(line);
          }
        },
        timer = setTimeout(
          () =>
            p.reject(
              Error("Le moteur met trop de temps. Relance cette position."),
            ),
          timeout,
        );
      this.handlers.add(handler);
      this.pending.add(p);
    });
  }
  search(
    fen,
    {
      depth = 12,
      movetime = null,
      skill = 20,
      multiPV = 1,
      searchmoves = [],
    } = {},
  ) {
    const job = async () => {
      await this.ready();
      if (this.closed) throw Error("Analyse annulée.");
      const variations = new Map(),
        listener = (line) => {
          if (!line.startsWith("info ") || !line.includes(" pv ")) return;
          const d = Number(/ depth (\d+)/.exec(line)?.[1] || 0),
            pv = Number(/ multipv (\d+)/.exec(line)?.[1] || 1),
            score = / score (cp|mate) (-?\d+)/.exec(line);
          if (score && (!variations.has(pv) || d >= variations.get(pv).depth))
            variations.set(pv, {
              depth: d,
              type: score[1],
              score: Number(score[2]),
              line: line.split(" pv ")[1].trim().split(" "),
            });
        };
      this.handlers.add(listener);
      try {
        for (const cmd of [
          "setoption name Skill Level value " + skill,
          "setoption name MultiPV value " + multiPV,
          "position fen " + fen,
        ])
          this.worker.postMessage(cmd);
        const finished = this.wait(
          (line) => line.startsWith("bestmove "),
          60000,
        );
        this.worker.postMessage(
          "go " +
            (movetime ? "movetime " + movetime : "depth " + depth) +
            (searchmoves.length ? " searchmoves " + searchmoves.join(" ") : ""),
        );
        const best = await finished;
        return {
          best: best.split(" ")[1],
          ...(variations.get(1) || {
            type: "cp",
            score: 0,
            line: [],
            depth: 0,
          }),
          variations: [...variations.values()],
        };
      } finally {
        this.handlers.delete(listener);
      }
    };
    const result = this.queue.then(job);
    this.queue = result.catch(() => {});
    return result;
  }
  close() {
    this.closed = true;
    this.worker?.terminate();
    for (const p of [...this.pending]) p.reject(Error("Analyse annulée."));
    this.handlers.clear();
  }
}
