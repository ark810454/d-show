const http = require("node:http");
const path = require("node:path");

process.env.TURBOPACK = "0";

const next = require("next");

const port = Number(process.env.PORT || process.env.FRONTEND_PORT || 3001);
const hostname = process.env.HOST || "127.0.0.1";
const dir = path.resolve(__dirname, "..");

async function main() {
  const app = next({
    dev: true,
    dir,
    hostname,
    port,
  });

  const handle = app.getRequestHandler();
  await app.prepare();

  http
    .createServer((req, res) => handle(req, res))
    .listen(port, hostname, () => {
      console.log(`D_Show frontend ready on http://${hostname}:${port}`);
    });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
