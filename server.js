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

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan("dev"));

// Serve static assets
app.use(express.static(__dirname, { extensions: ["html"] }));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/pages", express.static(path.join(__dirname, "pages")));

// Pretty routes
const pretty = ["index","dashboard","programs","about","contact","enrolment","participant","admin"];
pretty.forEach(route => {
  const target = route === "index"
    ? path.join(__dirname, "index.html")
    : path.join(__dirname, "pages", `${route}.html`);
  app.get(`/${route}`, (req, res, next) => {
    res.sendFile(target, err => err ? next(err) : null);
  });
});

// SPA fallback
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.includes(".")) return next();
  res.sendFile(path.join(__dirname, "index.html"), err => err ? next(err) : null);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Server error");
});

app.listen(PORT, () => {
  console.log(`✅ NCG QAP dev server running: http://localhost:${PORT}`);
});
