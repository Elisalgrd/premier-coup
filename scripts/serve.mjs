import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
const root = path.resolve("dist"),
  port = Number(process.env.PORT || 4180),
  types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".webmanifest": "application/manifest+json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg",
    ".wasm": "application/wasm",
    ".vtt": "text/vtt",
  };
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost"),
        file = path.resolve(
          root,
          "." +
            decodeURIComponent(
              url.pathname === "/" ? "/index.html" : url.pathname,
            ),
        );
      if (!file.startsWith(root + path.sep)) {
        res.writeHead(403).end();
        return;
      }
      const data = await fs.readFile(file),
        headers = {
          "Content-Type":
            types[path.extname(file)] || "application/octet-stream",
          "Cache-Control": "no-cache",
          "Accept-Ranges": "bytes",
        };
      if (req.headers.range) {
        const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range);
        if (m) {
          const start = Number(m[1]),
            end = Math.min(
              m[2] ? Number(m[2]) : data.length - 1,
              data.length - 1,
            );
          if (start > end) {
            res.writeHead(416).end();
            return;
          }
          res.writeHead(206, {
            ...headers,
            "Content-Range": `bytes ${start}-${end}/${data.length}`,
            "Content-Length": end - start + 1,
          });
          res.end(data.subarray(start, end + 1));
          return;
        }
      }
      res.writeHead(200, { ...headers, "Content-Length": data.length });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404).end("Introuvable");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log("Premier coup : http://localhost:" + port),
  );
