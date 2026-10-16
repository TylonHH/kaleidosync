import express from "express";
import compression from "compression";
import helmet from "helmet";
import { fileURLToPath } from "node:url";
import { audiusData } from "./audius.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use((_request, response, next) => {
  response.setHeader("Referrer-Policy", "no-referrer");
  next();
});
app.get("/healthz", (_request, response) => response.json({ status: "ok" }));
app.get(["/api/audius/:action", "/api/audius/:action/:id"], async (request, response) => {
  try {
    const { action, id } = request.params;
    if (id?.length > 200) return response.sendStatus(400);
    const data = await audiusData(action, id);
    if (data === null) return response.sendStatus(404);
    response.setHeader("Cache-Control", "public, max-age=60");
    response.json(data);
  } catch { response.status(502).json({ error: "Audius is temporarily unavailable" }); }
});
const dist = fileURLToPath(new URL("./dist", import.meta.url));
app.use("/assets", express.static(`${dist}/assets`, { immutable: true, maxAge: "1y" }));
app.use(express.static(dist, { setHeaders: response => response.setHeader("Cache-Control", "no-cache") }));
app.use("/api", (_request, response) => response.status(404).json({ error: "Unknown API endpoint" }));
app.get(/.*/, (request, response) => {
  if (request.path.includes(".")) return response.sendStatus(404);
  response.setHeader("Cache-Control", "no-store");
  response.sendFile(`${dist}/index.html`);
});
app.listen(Number(process.env.PORT || 80), "0.0.0.0", () => console.log("Kaleidosync is ready"));
