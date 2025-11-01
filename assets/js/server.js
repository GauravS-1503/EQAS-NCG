import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security & perf
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan("dev"));

const publicDir = path.join(__dirname, "..", "public");

// 1) Static files
app.use(express.static(publicDir, { extensions: ["html"] }));

// 2) Optional pretty routes (NO asterisks)
const pretty = ["index","dashboard","programs","about","contact","enrolment","participant","admin"];
pretty.forEach(route => {
  app.get(`/${route}`, (req, res, next) => {
    res.sendFile(path.join(publicDir, `${route}.html`), err => err ? next(err) : null);
  });
});

// 3) SPA fallback WITHOUT a route pattern (no path-to-regexp involved)
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.includes(".")) return next(); // real file: let static 404 it
  res.sendFile(path.join(publicDir, "index.html"), err => err ? next(err) : null);
});

// 4) Error handler (optional)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Server error");
});

app.listen(PORT, () => {
  console.log(`NCG QAP dev server running: http://localhost:${PORT}`);
});
