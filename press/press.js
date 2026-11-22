// The press: controls built from config/params.json, a live preview,
// seeds, a contact sheet, and downloads. You shouldn't need to edit this
// file; your rules live in src/system.js and your dials in config/params.json.
import { render, defaults, fileName } from "./core.js";
import { standing } from "./standing.js";

var $ = function (id) { return document.getElementById(id); };
var config, values, seed, sheetStart = 1, timer, startHash = location.hash;

function readHash() {
  var h = new URLSearchParams(location.hash.slice(1)), v = {};
  h.forEach(function (val, key) { v[key] = val; });
  return v;
}
function coerce(p, raw) {
  if (p.type === "toggle") return raw === true || raw === "true" || raw === "1";
  if (p.type === "range" || p.type === "number") { var n = parseFloat(raw); return isNaN(n) ? p.value : n; }
  return raw;
}
function writeHash() {
  var h = new URLSearchParams();
  h.set("seed", seed);
  config.params.forEach(function (p) { if (String(values[p.key]) !== String(p.value)) h.set(p.key, values[p.key]); });
  history.replaceState(null, "", "#" + h.toString());
}

// ---------- controls ----------
function control(p) {
  var wrap = document.createElement("div"); wrap.className = "param";
  var id = "p-" + p.key, v = values[p.key], html = "";
  var lab = '<label for="' + id + '"><span>' + (p.label || p.key) + "</span>";
  if (p.type === "range") {
    html = lab + "</label><div class=\"row\"><input type=\"range\" id=\"" + id + "\" min=\"" + p.min + "\" max=\"" + p.max + "\" step=\"" + (p.step || 1) + "\" value=\"" + v + "\"><input type=\"number\" aria-label=\"" + (p.label || p.key) + " value\" min=\"" + p.min + "\" max=\"" + p.max + "\" step=\"" + (p.step || 1) + "\" value=\"" + v + "\"></div>";
  } else if (p.type === "number") {
    html = lab + "</label><div class=\"row\"><input type=\"number\" id=\"" + id + "\" value=\"" + v + "\"" + (p.min != null ? ' min="' + p.min + '"' : "") + (p.max != null ? ' max="' + p.max + '"' : "") + ' step="' + (p.step || 1) + '"></div>';
  } else if (p.type === "toggle") {
    html = lab + '<input type="checkbox" id="' + id + '"' + (v ? " checked" : "") + "></label>";
  } else if (p.type === "select") {
    html = lab + '</label><div class="row"><select id="' + id + '">' + (p.options || []).map(function (o) { return "<option" + (o === v ? " selected" : "") + ">" + o + "</option>"; }).join("") + "</select></div>";
  } else if (p.type === "color") {
    html = lab + '<input type="color" id="' + id + '" value="' + v + '"></label>';
  } else {
    html = lab + '</label><div class="row"><input type="text" id="' + id + '" value="' + String(v).replace(/"/g, "&quot;") + '"></div>';
  }
  if (p.reason) html += '<p class="reason">' + p.reason + "</p>";
  wrap.innerHTML = html;
  var inputs = wrap.querySelectorAll("input, select");
  inputs.forEach(function (inp) {
    inp.addEventListener("input", function () {
      var raw = inp.type === "checkbox" ? inp.checked : inp.value;
      values[p.key] = coerce(p, raw);
      inputs.forEach(function (o) { if (o !== inp && o.type !== "checkbox") o.value = values[p.key]; });
      schedule();
    });
  });
  return wrap;
}
function buildControls() {
  var box = $("params"); box.innerHTML = "";
  config.params.forEach(function (p) { box.appendChild(control(p)); });
}

// ---------- render ----------
function schedule() { clearTimeout(timer); timer = setTimeout(draw, 30); }
function draw() {
  var t0 = performance.now(), r;
  try { r = render(config, values, seed); }
  catch (e) { $("stage").innerHTML = '<p class="status">The system stopped with an error: ' + e.message + "</p>"; console.error(e); return; }
  $("stage").innerHTML = r.svg;
  reading(r);
  var ms = Math.round(performance.now() - t0);
  $("status").textContent = "lot " + seed + " · " + r.count + " marks · " + r.page.width + " × " + r.page.height + " mm · " + ms + " ms";
  $("seed").value = seed;
  writeHash();
}
// ---------- the reading line: point at a row and it says what it is ----------
function reading(r) {
  var svg = $("stage").querySelector("svg"), out = $("reading"), info = r.info;
  if (!svg || !info) return;
  var rest = info.tank.name + ", Tank No. " + info.tank.fid + (info.tank.now ? ". Now: " + info.tank.now : "") + ". Point at a row to read its year.";
  out.textContent = rest;
  var mark = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  mark.setAttribute("x", r.page.margin - 4); mark.setAttribute("width", 2); mark.setAttribute("height", info.rowH); mark.setAttribute("fill", "#000"); mark.setAttribute("visibility", "hidden");
  svg.appendChild(mark);
  function at(e) {
    var b = svg.getBoundingClientRect(), y = (e.clientY - b.top) / b.height * r.page.height, i = Math.floor((y - info.top) / info.rowH), row = info.rows[i];
    if (!row) { out.textContent = rest; mark.setAttribute("visibility", "hidden"); return; }
    mark.setAttribute("y", info.top + i * info.rowH); mark.setAttribute("visibility", "visible");
    var mm = row.mm.toFixed(0) + " mm fell. ";
    out.textContent = row.year + ": " + mm + (row.state === "unproved" ? "No sheet proves whether the tank was there." : row.state === "lost" ? (row.gone > 0 ? "None of it was kept here." : "") : (row.gone > 0 ? row.gone.toFixed(0) + " mm short of the mean. The tank was on the sheet." : "Not short. The tank was on the sheet."));
  }
  svg.addEventListener("pointermove", at); svg.addEventListener("pointerdown", at);
  svg.addEventListener("pointerleave", function () { out.textContent = rest; mark.setAttribute("visibility", "hidden"); });
}
function setSeed(s) { seed = String(s); draw(); if (!$("tab-sheet").hidden) sheet(); }

// ---------- downloads ----------
function save(blob, name) {
  var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
}
function downloadSVG() {
  var r = render(config, values, seed);
  save(new Blob([r.plotSVG], { type: "image/svg+xml" }), fileName(config, values, seed, 1) + ".svg");
}
function downloadPNG() {
  var r = render(config, values, seed), ppi = +$("ppi").value;
  var w = Math.round(r.page.width / 25.4 * ppi), h = Math.round(r.page.height / 25.4 * ppi);
  if (w * h > 60e6 && !confirm("That's " + Math.round(w * h / 1e6) + " megapixels and may take a while. Continue?")) return;
  var btn = $("dl-png"), old = btn.textContent; btn.textContent = "Rendering…";
  var img = new Image(), url = URL.createObjectURL(new Blob([r.svg], { type: "image/svg+xml" }));
  img.onload = function () {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    var cx = c.getContext("2d"); cx.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
    c.toBlob(function (b) { btn.textContent = old; if (b) save(b, fileName(config, values, seed, 1) + "_" + ppi + "ppi.png"); else alert("This browser couldn't make an image that large. Try a lower resolution."); }, "image/png");
  };
  img.onerror = function () { btn.textContent = old; alert("Couldn't render the PNG."); };
  img.src = url;
}

// ---------- sheet ----------
var sheetRun = 0;
function sheet() {
  var grid = $("grid"), run = ++sheetRun; grid.innerHTML = "";
  for (var i = 0; i < 20; i++) {
    (function (s) {
      var b = document.createElement("button"); b.type = "button"; b.innerHTML = "<small>lot " + s + "</small>";
      b.addEventListener("click", function () { tab("press"); setSeed(s); });
      grid.appendChild(b);
      setTimeout(function () {                       // one at a time, so a phone keeps up
        if (run !== sheetRun) return;
        try {
          var r = render(config, values, s), img = new Image();
          img.alt = "Deficit survey of " + r.info.tank.name + ", lot " + s; img.width = 420; img.height = 594;
          img.onload = function () { URL.revokeObjectURL(img.src); };
          img.src = URL.createObjectURL(new Blob([r.svg], { type: "image/svg+xml" }));
          b.innerHTML = ""; b.appendChild(img);
          var c = document.createElement("small"); c.textContent = "lot " + s + " · " + r.info.tank.name; b.appendChild(c);
        } catch (e) { b.textContent = "lot " + s + ": error"; }
      }, 20 + i * 40);
    })(sheetStart + i);
  }
}

// ---------- about ----------
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function inline(s) { return s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>'); }
function md(text) {
  var out = [], list = "", first = true;
  function close() { if (list) { out.push("</" + list + ">"); list = ""; } }
  function open(k) { if (list !== k) { close(); out.push("<" + k + ">"); list = k; } }
  esc(text).split(/\n/).forEach(function (line) {
    var l = line.trim(), m;
    if ((m = /^- (.*)/.exec(l))) { open("ul"); out.push("<li>" + inline(m[1]) + "</li>"); return; }
    if ((m = /^\d+\. (.*)/.exec(l))) { open("ol"); out.push("<li>" + inline(m[1]) + "</li>"); return; }
    if (!l || /^&lt;!--/.test(l)) return;
    close();
    if ((m = /^(#{1,6}) (.*)/.exec(l))) { if (!first) out.push("<h3>" + inline(m[2]) + "</h3>"); first = false; return; } // the file's own title is replaced by the page's
    if ((m = /^&gt; ?(.*)/.exec(l))) { if (m[1]) out.push("<blockquote>" + inline(m[1]) + "</blockquote>"); return; }
    out.push("<p>" + inline(l) + "</p>");
  });
  close();
  return out.join("\n");
}
function repoURL() {
  if (config.repository) return config.repository;
  var host = location.hostname, path = location.pathname.split("/").filter(Boolean);
  if (/\.github\.io$/.test(host)) return "https://github.com/" + host.split(".")[0] + "/" + (path[0] || host);
  return null;
}
function about() {
  var rows = config.params.map(function (p) { return "<tr><td>" + esc(p.label || p.key) + "</td><td>" + (p.type === "range" ? esc(p.min + " to " + p.max) : p.type === "select" ? esc(p.options.length + " choices") : "on or off") + "</td><td>" + esc(p.reason || "") + "</td></tr>"; }).join("");
  $("dials").innerHTML = "<thead><tr><th>Dial</th><th>Range</th><th>Her reason</th></tr></thead><tbody>" + rows + "</tbody>";
  [["manifesto.md", "manifesto"], ["final-statement.md", "statement"], ["process.md", "process"]].forEach(function (f) {
    fetch(f[0], { cache: "no-store" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (t) { $(f[1]).innerHTML = md(t) || "<p>Not written yet.</p>"; });
  });
}

// ---------- tabs ----------
function tab(name) {
  document.querySelectorAll(".tabs button").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.tab === name ? "true" : "false"); });
  ["press", "sheet", "stand", "about"].forEach(function (t) { $("tab-" + t).hidden = t !== name; });
  if (name === "sheet") sheet();
  if (name === "about") about();
  if (name === "stand") standing($("stand"), function (label) { values.tank = label; buildControls(); tab("press"); draw(); });
  window.scrollTo(0, 0);
}

// ---------- start ----------
fetch("config/params.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (c) {
  config = c; config.params = config.params || [];
  values = defaults(config);
  var h = readHash();
  config.params.forEach(function (p) { if (h[p.key] != null) values[p.key] = coerce(p, h[p.key]); });
  seed = String(h.seed || config.seed || 1);
  $("identity").textContent = config.identity || "Untitled identity";
  $("title").textContent = (config.title || "") + (config.paper && config.paper.name ? " · " + config.paper.name : "");
  document.title = (config.identity || "Press") + " · " + (config.title || "Computationally Yours");
  var repo = repoURL(); if (repo) $("repo-link").href = repo; else $("repo-link").remove();
  buildControls(); draw();
  var go = { "#sheet": "sheet", "#stand": "stand", "#about": "about" }[startHash]; if (go) tab(go);

  $("seed").addEventListener("change", function () { setSeed($("seed").value.trim() || "1"); });
  $("seed-prev").addEventListener("click", function () { var n = parseInt(seed, 10); setSeed(isNaN(n) ? 1 : Math.max(1, n - 1)); });
  $("seed-next").addEventListener("click", function () { var n = parseInt(seed, 10); setSeed(isNaN(n) ? 1 : n + 1); });
  $("seed-rand").addEventListener("click", function () { setSeed(1 + Math.floor(Math.random() * 99999)); });
  $("reset").addEventListener("click", function () { values = defaults(config); buildControls(); draw(); });
  $("dl-svg").addEventListener("click", downloadSVG);
  $("dl-png").addEventListener("click", downloadPNG);
  $("copy-link").addEventListener("click", function () {
    var b = this; navigator.clipboard && navigator.clipboard.writeText(location.href).then(function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy link"; }, 1500); });
  });
  $("sheet-prev").addEventListener("click", function () { sheetStart = Math.max(1, sheetStart - 20); sheet(); });
  $("sheet-next").addEventListener("click", function () { sheetStart += 20; sheet(); });
  document.querySelectorAll(".tabs button").forEach(function (b) { b.addEventListener("click", function () { tab(b.dataset.tab); }); });
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, select, textarea")) return;
    if (e.key === "ArrowRight") $("seed-next").click();
    if (e.key === "ArrowLeft") $("seed-prev").click();
  });
}).catch(function (e) {
  $("stage").innerHTML = '<p class="status">Couldn\'t load config/params.json: ' + e.message + ". If you opened index.html as a file, ask Codex to \"preview the press\" instead.</p>";
});
