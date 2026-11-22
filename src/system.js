// THE DEFICIT SURVEY · the rules Anjana Rao's work obeys.
// Nine rules, in the order they run. The data is in data/record.js; the
// dials are in config/params.json; the reasons are in manifesto.md.

import { RAIN, MEAN, TANKS, OSM_DATE } from "../data/record.js";
import { write } from "./letters.js";

const LAST_SHEET = 1969; // the Survey of India sheet after which none of these tanks is drawn
const SCALES = [1000, 1200, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3500, 4000];

export function draw(pen, p, chance, page) {
  // RULE 1 · Chance decides where I go and which way I face. It never touches a measurement.
  pen.stroke("#000000");
  const lot = chance.random(), facing = chance.random();
  const named = TANKS.find(function (t) { return label(t) === p.tank; });
  const tank = named || TANKS[Math.floor(lot * TANKS.length)];
  const turn = chooseTurn(tank, facing) + p.bearing;
  const rings = tank.rings.map(function (r) { return rotate(r, turn); });
  const box = bounds(rings);

  // RULE 2 · The largest round scale that fits the sheet. No stretching.
  const area = { x: page.margin + 34, y: page.margin, w: page.width - 2 * page.margin - 36, h: page.height - 2 * page.margin - 58 };
  const scale = SCALES.find(function (s) { return box.w * 1000 / s <= area.w && box.h * 1000 / s <= area.h; }) || 6000;
  const k = 1000 / scale; // millimetres on paper for one metre on the ground
  const ox = area.x + (area.w - box.w * k) / 2 - box.x * k, oy = area.y + (area.h - box.h * k) / 2 - box.y * k;
  const px = function (x) { return ox + x * k; }, py = function (y) { return oy + y * k; };

  // RULE 3 · One year, one row of chain lines, oldest first.
  const years = RAIN.filter(function (r) { return r[0] >= p.first; });
  const rowH = box.h / years.length;
  const most = years.reduce(function (m, r) { return Math.max(m, absence(r, p, proof(r, tank))); }, 1);
  const slots = Math.max(1, Math.ceil(most / 100 * p.passes));
  const buildings = tank.buildings.map(function (b) { return rotate(b, turn); });
  const owed = { mm: 0, stopped: 0, stations: 0 };

  years.forEach(function (r, i) {
    // RULE 4 · Ask whether a sheet proves the tank that year. Held, unproved, or lost.
    const year = r[0], state = proof(r, tank), gone = absence(r, p, state), top = box.y + i * rowH;

    // RULE 5 · Absence is drawn heavier than presence: whole passes of the pen.
    const count = Math.round(gone / 100 * p.passes);
    if (year > LAST_SHEET) owed.mm += r[1];
    if (count > 0) pen.layer("2-absence").weight(p.pen); else pen.layer("1-presence").weight(0.1);
    if (state === "unproved") {
      // No sheet says whether the tank was there, so no line: only the two pegs.
      spans(rings, top + rowH / 2).forEach(function (s) { peg(s[0], 1); peg(s[1], -1); });
    } else for (let n = 0; n < Math.max(1, count); n++) {
      const y = top + rowH * (n + 0.5) / slots;

      // RULE 6 · Nothing is drawn between two stations unless both were clear.
      // After the last sheet, a wall stops the chain.
      const wall = p.stopped && state === "lost";
      const walls = wall ? buildings.map(function (b) { return spans([b], y); }).flat() : [];
      spans(rings, y).forEach(function (s) { chain(s[0], s[1], y, walls, count > 0); });
    }

    // RULE 7 · Every row carries its date, its measure and its source.
    pen.layer("3-writing").weight(0.15);
    const size = Math.min(1.5, rowH * k * 0.62), base = py(top) + rowH * k * 0.5 + size / 2;
    write(pen, year, page.margin, base, size);
    write(pen, r[1].toFixed(0), page.margin + 17, base, size, "right");
    write(pen, r[2], page.margin + 20, base, size);

    function peg(x, way) { const y = py(top + rowH / 2); pen.layer("1-presence").weight(0.1).line(px(x), y, px(x) + way * 1.2, y); }
  });

  function chain(x0, x1, y, walls, solid) {
    const stops = [x0];
    for (let x = Math.ceil(x0 / p.cell) * p.cell; x < x1; x += p.cell) if (x > x0) stops.push(x);
    stops.push(x1);
    let run = [];
    stops.forEach(function (x) {
      const blocked = walls.some(function (w) { return x >= w[0] && x <= w[1]; });
      owed.stations++; if (blocked) owed.stopped++;
      if (blocked) { flush(); return; }
      run.push([px(x), py(y) + tremor(px(x), py(y))]);
    });
    flush();
    function flush() {
      if (run.length > 1) {
        if (solid) pen.polyline(run);
        else for (let i = 0; i + 1 < run.length; i += 3) pen.polyline([run[i], run[i + 1]]); // presence: barely there
      }
      run = [];
    }
  }

  // The hand: a slow drift, the same for neighbouring lines, so the chain sags but never changes length.
  function tremor(x, y) { return p.hand ? (chance.noise(x / 9, y / 2.2) - 0.5) * 4 * p.hand : 0; }

  // RULE 8 · A boundary is not a line. Stones stand where it still can be walked;
  // a heavy cross where it was broken.
  let standing = 0, broken = 0;
  const gaps = tank.breaks.map(function (b) { return spin(b[0], b[1], turn); });
  rings.forEach(function (r) {
    walk(r, p.stone).forEach(function (q) {
      if (buildings.some(function (b) { return within(b, q[0], q[1]); })) { gaps.push(q); return; }
      standing++;
      pen.layer("4-stones").weight(0.3).rect(px(q[0]) - 0.5, py(q[1]) - 0.5, 1, 1);
    });
  });
  gaps.forEach(function (q) {
    broken++; const x = px(q[0]), y = py(q[1]), a = 2;
    pen.layer("5-broken").weight(0.6).line(x - a, y - a, x + a, y + a).line(x - a, y + a, x + a, y - a);
  });

  titleBlock(pen, page, { tank: tank, scale: scale, k: k, turn: turn, standing: standing, broken: broken, owed: owed, years: years, seed: chance.seed });

  // what the press needs to read a row back to a visitor
  return { tank: tank, top: py(box.y), rowH: rowH * k, rows: years.map(function (r) { const st = proof(r, tank); return { year: r[0], mm: r[1], gone: absence(r, p, st), state: st }; }) };
}

// What the sheets can prove about the tank in a year.
function proof(r, tank) {
  if (r[0] <= tank.sheet) return "held";        // a sheet of this year or later shows it
  return r[0] <= LAST_SHEET ? "unproved" : "lost"; // "lost": the sheet of 1969 is the last word
}

// What is absent in a year, in millimetres of water.
function absence(r, p, state) {
  const withheld = Math.max(0, MEAN - r[1]), unkept = state === "lost" ? r[1] : 0;
  if (p.ledger === "what the sky withheld") return withheld;
  if (p.ledger === "what the city did not keep") return unkept;
  return state === "lost" ? unkept : withheld;
}

// The chain is laid across a tank, never along it: of the turns that make the
// tank stand taller than it is wide, the lot chooses one.
function chooseTurn(tank, facing) {
  const all = [];
  for (let d = 0; d < 360; d += 2) { const b = bounds(tank.rings.map(function (r) { return rotate(r, d); })); all.push([d, b.h / b.w]); }
  const best = Math.max.apply(null, all.map(function (a) { return a[1]; }));
  const ok = all.filter(function (a) { return a[1] >= Math.min(1.25, best * 0.93); });
  return ok[Math.floor(facing * ok.length)][0];
}

// ---------- geometry, in metres ----------
function spin(x, y, d) { const a = d * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; }
function rotate(flat, d) { const a = d * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), out = []; for (let i = 0; i < flat.length; i += 2) { const x = flat[i] / 10, y = flat[i + 1] / 10; out.push([x * c - y * s, x * s + y * c]); } return out; }
function bounds(rings) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; rings.forEach(function (r) { r.forEach(function (q) { a = Math.min(a, q[0]); b = Math.min(b, q[1]); c = Math.max(c, q[0]); d = Math.max(d, q[1]); }); }); return { x: a, y: b, w: c - a, h: d - b }; }
function within(r, x, y) { let hit = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > y) !== (r[j][1] > y) && x < (r[j][0] - r[i][0]) * (y - r[i][1]) / (r[j][1] - r[i][1]) + r[i][0]) hit = !hit; return hit; }
function spans(rings, y) { const xs = []; rings.forEach(function (r) { for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > y) !== (r[j][1] > y)) xs.push((r[j][0] - r[i][0]) * (y - r[i][1]) / (r[j][1] - r[i][1]) + r[i][0]); }); xs.sort(function (a, b) { return a - b; }); const out = []; for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]); return out; }
function walk(r, step) { const out = []; let left = 0; for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); let t = left; while (t < L) { out.push([a[0] + (b[0] - a[0]) * t / L, a[1] + (b[1] - a[1]) * t / L]); t += step; } left = t - L; } return out; }
function label(t) { return t.name + " (No. " + t.fid + ")"; }

// RULE 9 · Add it up in the margin: what was measured, from what, and what it adds up to.
function titleBlock(pen, page, s) {
  const l = page.margin, r = page.width - page.margin, b = page.height - page.margin, t = s.tank;
  const top = b - 46, c2 = l + 132, c3 = l + 236;
  const north = ((-s.turn % 360) + 360) % 360;
  pen.layer("3-writing").weight(0.3).line(l, top, r, top);
  write(pen, "DEFICIT SURVEY", l, top + 8, 2.6);
  write(pen, "Tank No. " + t.fid, l, top + 18.5, 6.4);
  write(pen, t.name, l, top + 28.5, 6.4);
  pen.weight(0.18);
  if (t.now) write(pen, "Now: " + t.now, l, top + 36, 1.9);
  write(pen, "A. Rao, surveyor of tank beds. Sheet drawn 2041. Lot " + s.seed + ".", l, top + 46, 1.9);

  const m3 = s.owed.mm / 1000 * t.ha * 10000;
  lines(pen, c2, top + 8, [
    "Last sheet to show the tank: " + t.sheet,
    "Bed: " + t.ha.toFixed(1) + " hectares   Scale 1:" + s.scale,
    "Rows: " + s.years[0][0] + " to " + s.years[s.years.length - 1][0] + (t.sheet < LAST_SHEET ? ". Pegs: no sheet proves it" : ", one for each year of the gauge"),
    "Stations taken: " + commas(s.owed.stations) + "   stopped by a wall: " + commas(s.owed.stopped),
    "Stones standing: " + s.standing + "   boundary broken: " + s.broken,
    "Rain on this bed since " + (LAST_SHEET + 1) + ", not kept:",
    (s.owed.mm / 1000).toFixed(2) + " m deep, " + commas(Math.round(m3 / 1000) * 1000) + " cubic metres"
  ], 1.9, 5.2);
  lines(pen, c3, top + 8, [
    "Left margin: year, rain in mm, source",
    "D daily register  R long record  M climate bulletin",
    "Rain: Bangalore gauge 43295, NOAA GHCN-Monthly v4",
    "Mean of " + RAIN.length + " years, " + RAIN[0][0] + " to " + RAIN[RAIN.length - 1][0] + ": " + MEAN.toFixed(1) + " mm",
    "Bed: Mod Foundation, traced from the sheet of " + t.sheet,
    "Walls, roads: OpenStreetMap contributors, " + OSM_DATE,
    "Well: Groundwater Directorate, Bengaluru East taluk"
  ], 1.55, 5.2);

  // which way north is, and fifty metres of chain
  const nx = r - 39, ny = top + 15, v = spin(0, -7, s.turn), a = spin(-1.8, -4.4, s.turn), c = spin(1.8, -4.4, s.turn);
  pen.weight(0.3).line(nx - v[0], ny - v[1], nx + v[0], ny + v[1]).polyline([[nx + a[0], ny + a[1]], [nx + v[0], ny + v[1]], [nx + c[0], ny + c[1]]]);
  write(pen, "north", nx, top + 30, 1.55, "centre");
  const len = 50 * s.k;
  pen.line(nx - len / 2, top + 40, nx + len / 2, top + 40).line(nx - len / 2, top + 39, nx - len / 2, top + 41).line(nx + len / 2, top + 39, nx + len / 2, top + 41);
  write(pen, "50 m", nx, top + 45, 1.55, "centre");

  // the well: the rule above is the ground. Thin to where water stood, heavy to where it had gone.
  const wx = r - 1.2, d1 = top + 17.86 * s.k, d2 = top + 37.76 * s.k;
  pen.weight(0.2).line(wx, top, wx, d1);
  write(pen, "17.86 m, Mar 2015", wx - 2.2, d1 + 0.7, 1.4, "right");
  write(pen, "37.76 m, Mar 2024", wx - 2.2, d2 + 0.7, 1.4, "right");
  pen.layer("2-absence").weight(0.3);
  for (let i = -3; i <= 3; i++) pen.line(wx + i * 0.28, d1, wx + i * 0.28, d2);
}
function lines(pen, x, y, list, size, gap) { list.forEach(function (t, i) { write(pen, t, x, y + i * gap, size); }); }
function commas(n) { return String(n).replace(/\B(?=(\d{3})+$)/g, ","); }
