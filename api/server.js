const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const captcha = require("./captcha");

const PORT = process.env.PORT || 4000;
const TTL_MS = 5 * 60 * 1000; // codes expire 5 minutes after issue

const app = express();
app.use(cors());
app.use(express.json());

// id -> { code, expiresAt }
const codes = new Map();

function purgeExpired() {
  const now = Date.now();
  for (const [id, entry] of codes) {
    if (entry.expiresAt <= now) codes.delete(id);
  }
}

app.get("/api/captcha", (req, res) => {
  purgeExpired();
  const { code, svg } = captcha.generate();
  const id = crypto.randomUUID();
  codes.set(id, { code, expiresAt: Date.now() + TTL_MS });
  res.json({ id, svg, expiresIn: TTL_MS / 1000 });
});

app.post("/api/captcha/verify", (req, res) => {
  const { id, code } = req.body || {};
  if (typeof id !== "string" || typeof code !== "string") {
    return res.status(400).json({ valid: false, reason: "missing id or code" });
  }

  const entry = codes.get(id);
  // Single-use: the id is consumed on the first verification attempt,
  // whether it matches or not.
  codes.delete(id);

  if (!entry) {
    return res.json({ valid: false, reason: "expired or unknown code" });
  }
  if (entry.expiresAt <= Date.now()) {
    return res.json({ valid: false, reason: "expired" });
  }

  const valid = entry.code === code;
  res.json({ valid, reason: valid ? undefined : "mismatch" });
});

app.listen(PORT, () => {
  console.log(`CAPTCHA API listening on http://localhost:${PORT}`);
});
