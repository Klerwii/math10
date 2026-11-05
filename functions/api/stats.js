// Live "You vs AI" results for the Is Math Biased? site.
// Runs on Cloudflare Pages Functions with a D1 database bound as DB.
// Stores only anonymous answer marks: no names, no IP addresses, no device info.

const CATEGORY = {1:0,2:0,3:0,4:0,5:0,6:1,7:1,8:1,9:1,10:1,11:2,12:2,13:2,14:2,15:2,16:3,17:3,18:3,19:3,20:3};
const CHOICE = new Set([6, 14, 18, 20]);

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: { "content-type": "application/json", "cache-control": "no-store" }
});

async function ensureTables(db) {
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS plays (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, mode TEXT NOT NULL, n INTEGER NOT NULL, exact INTEGER NOT NULL, close INTEGER NOT NULL, avg_miss REAL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS answers (play_id INTEGER NOT NULL, qid INTEGER NOT NULL, cat INTEGER NOT NULL, exact INTEGER NOT NULL, close INTEGER NOT NULL, miss REAL)")
  ]);
}

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: "Live results are not set up yet." }, 503);
  try {
    await ensureTables(env.DB);
    const total = await env.DB.prepare(
      "SELECT COUNT(*) AS players, AVG(exact * 1.0 / n) AS exactRate, AVG(close * 1.0 / n) AS closeRate, AVG(avg_miss) AS avgMiss FROM plays"
    ).first();
    const cats = await env.DB.prepare(
      "SELECT cat, COUNT(*) AS answered, SUM(exact) AS correct FROM answers GROUP BY cat"
    ).all();
    const questions = await env.DB.prepare(
      "SELECT qid, COUNT(*) AS answered, SUM(exact) AS correct, SUM(close) AS close FROM answers GROUP BY qid"
    ).all();
    const dist = await env.DB.prepare(
      "SELECT CAST(ROUND(exact * 100.0 / n) AS INTEGER) AS pct, COUNT(*) AS count FROM plays GROUP BY pct"
    ).all();
    return json({
      players: total.players || 0,
      exactRate: total.exactRate,
      closeRate: total.closeRate,
      avgMiss: total.avgMiss,
      categories: cats.results,
      questions: questions.results,
      distribution: dist.results,
      updated: Date.now()
    });
  } catch (e) {
    return json({ error: "Could not read live results." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Live results are not set up yet." }, 503);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 5000) return json({ error: "Too large." }, 413);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Bad data." }, 400); }

  const mode = body && body.mode;
  const answers = body && body.answers;
  const expected = mode === "quick" ? 8 : mode === "full" ? 20 : 0;
  if (!expected || !Array.isArray(answers) || answers.length !== expected) return json({ error: "Bad data." }, 400);

  const seen = new Set();
  const perCat = [0, 0, 0, 0];
  const clean = [];
  for (const a of answers) {
    const qid = Number(a && a.id);
    if (!Number.isInteger(qid) || !(qid in CATEGORY) || seen.has(qid)) return json({ error: "Bad data." }, 400);
    seen.add(qid);
    const exact = a.exact === 1 || a.exact === true ? 1 : a.exact === 0 || a.exact === false ? 0 : null;
    const close = a.close === 1 || a.close === true ? 1 : a.close === 0 || a.close === false ? 0 : null;
    if (exact === null || close === null || (exact && !close)) return json({ error: "Bad data." }, 400);
    let miss = null;
    if (CHOICE.has(qid)) {
      if (a.miss !== null && a.miss !== undefined) return json({ error: "Bad data." }, 400);
    } else {
      miss = Number(a.miss);
      if (!Number.isFinite(miss) || miss < 0 || miss > 100) return json({ error: "Bad data." }, 400);
      if (exact && miss > 1e-6) return json({ error: "Bad data." }, 400);
      if (Math.abs(miss - 10) > 1e-3 && close !== (miss < 10 ? 1 : 0)) return json({ error: "Bad data." }, 400);
    }
    perCat[CATEGORY[qid]]++;
    clean.push({ qid, cat: CATEGORY[qid], exact, close, miss });
  }
  if (mode === "quick" && perCat.some(c => c !== 2)) return json({ error: "Bad data." }, 400);

  const exactTotal = clean.reduce((s, a) => s + a.exact, 0);
  const closeTotal = clean.reduce((s, a) => s + a.close, 0);
  const misses = clean.filter(a => a.miss !== null).map(a => a.miss);
  const avgMiss = misses.length ? misses.reduce((s, m) => s + m, 0) / misses.length : null;

  try {
    await ensureTables(env.DB);
    const res = await env.DB.prepare(
      "INSERT INTO plays (ts, mode, n, exact, close, avg_miss) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(Date.now(), mode, expected, exactTotal, closeTotal, avgMiss).run();
    const playId = res.meta.last_row_id;
    await env.DB.batch(clean.map(a => env.DB.prepare(
      "INSERT INTO answers (play_id, qid, cat, exact, close, miss) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(playId, a.qid, a.cat, a.exact, a.close, a.miss)));
    return json({ ok: true });
  } catch (e) {
    return json({ error: "Could not save." }, 500);
  }
}
