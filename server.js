const http = require("http");
const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "build");
const indexHtmlPath = path.join(buildDir, "index.html");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end("Internal Server Error");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
    res.statusCode = 200;
    res.end(data);
  });
}

function safeResolve(requestUrlPath) {
  const decoded = decodeURIComponent(requestUrlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^([/\\])+/, "");
  const resolved = path.join(buildDir, normalized);

  if (!resolved.startsWith(buildDir)) {
    return null;
  }

  return resolved;
}

const server = http.createServer((req, res) => {
  const urlPath = req.url || "/";
  const resolved = safeResolve(urlPath);

  if (!resolved) {
    res.statusCode = 400;
    res.end("Bad Request");
    return;
  }

  fs.stat(resolved, (err, stat) => {
    if (!err && stat.isFile()) {
      sendFile(res, resolved);
      return;
    }

    if (!err && stat.isDirectory()) {
      const dirIndex = path.join(resolved, "index.html");
      fs.stat(dirIndex, (dirErr, dirStat) => {
        if (!dirErr && dirStat.isFile()) {
          sendFile(res, dirIndex);
          return;
        }

        sendFile(res, indexHtmlPath);
      });
      return;
    }

    sendFile(res, indexHtmlPath);
  });
});

const port = (() => {
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('--port');
  if (portIndex !== -1 && args[portIndex + 1]) {
    return Number(args[portIndex + 1]);
  }
  return Number(process.env.PORT) || 3000;
})();

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(`Serving build/ on http://localhost:${port}\n`);
});
