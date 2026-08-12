const UPSTREAM = "https://jsonbin-zeta.vercel.app/api/bins/Kp30So05gV";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

async function readRawBody(req) {
  if (typeof req.body === "string" && req.body) return req.body;
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8") || "{}";
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "GET") {
      const r = await fetch(UPSTREAM, { cache: "no-store" });
      const text = await r.text();
      res.statusCode = r.status;
      res.setHeader("Content-Type", "application/json");
      res.end(text);
      return;
    }

    if (req.method === "PUT") {
      const body = await readRawBody(req);
      const r = await fetch(UPSTREAM, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body
      });
      const text = await r.text();
      res.statusCode = r.status;
      res.setHeader("Content-Type", "application/json");
      res.end(text);
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
  } catch (err) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(err && err.message ? err.message : err) }));
  }
};
