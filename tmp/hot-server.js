const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 5501);
const clients = new Set();

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const reloadScript = `
<script>
(() => {
  const source = new EventSource("/__hot_reload");
  source.onmessage = () => location.reload();
})();
</script>`;

function sendReload() {
  for (const res of clients) {
    res.write("data: reload\\n\\n");
  }
}

function serve(req, res) {
  if (req.url === "/__hot_reload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("\\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  const url = new URL(req.url, "http://127.0.0.1");
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const file = path.resolve(root, `.${requested}`);

  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(file).toLowerCase();
    res.setHeader("Content-Type", types[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-store");

    if (ext === ".html") {
      res.end(data.toString("utf8").replace("</body>", `${reloadScript}</body>`));
      return;
    }

    res.end(data);
  });
}

function watch(dir) {
  fs.watch(dir, { recursive: true }, (_event, filename) => {
    if (!filename || filename.startsWith("tmp")) return;
    if (/\.(html|css|js|png|jpe?g|webp|svg)$/i.test(filename)) {
      clearTimeout(watch.timer);
      watch.timer = setTimeout(sendReload, 120);
    }
  });
}

http.createServer(serve).listen(port, "127.0.0.1", () => {
  console.log(`Hot reload server: http://127.0.0.1:${port}/`);
  watch(root);
});
