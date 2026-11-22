// "You may be living on a tank bed. My map will tell you which one."
// Checks a position against every lost tank in data/lost_tanks.json.
// It all happens on the visitor's device: the position is never sent or kept.
import { TANKS } from "../data/record.js";

var places, ready;
function load() { return places ? Promise.resolve(places) : fetch("data/lost_tanks.json").then(function (r) { return r.json(); }).then(function (d) { places = d; return d; }); }

function inside(rings, x, y) {
  var hit = false;
  rings.forEach(function (r) { for (var i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > y) !== (r[j][1] > y) && x < (r[j][0] - r[i][0]) * (y - r[i][1]) / (r[j][1] - r[i][1]) + r[i][0]) hit = !hit; });
  return hit;
}
// metres from a point to the nearest edge, and the compass direction to it
function nearest(rings, lon, lat) {
  var kx = 111320 * Math.cos(lat * Math.PI / 180), ky = 110574, best = { d: 1e12 };
  rings.forEach(function (r) {
    for (var i = 0, j = r.length - 1; i < r.length; j = i++) {
      var ax = (r[j][0] - lon) * kx, ay = (r[j][1] - lat) * ky, bx = (r[i][0] - lon) * kx, by = (r[i][1] - lat) * ky;
      var L = (bx - ax) * (bx - ax) + (by - ay) * (by - ay), t = L ? Math.max(0, Math.min(1, -(ax * (bx - ax) + ay * (by - ay)) / L)) : 0;
      var x = ax + t * (bx - ax), y = ay + t * (by - ay), d = Math.hypot(x, y);
      if (d < best.d) best = { d: d, dir: ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][Math.round(Math.atan2(x, y) / (Math.PI / 4) + 8) % 8] };
    }
  });
  return best;
}
function name(t) { return t.name === "Unknown" ? "a tank with no name in the register, No.\u00a0" + t.fid : t.name + ", No.\u00a0" + t.fid; }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

export function standing(root, openSheet) {
  if (ready) return; ready = true;
  var out = root.querySelector("#stand-out"), list = root.querySelector("#stand-list"), find = root.querySelector("#stand-find");
  load().then(function (all) {
    root.querySelector("#stand-count").textContent = all.length;
    function rows(q) {
      list.innerHTML = all.filter(function (t) { return (t.name + " " + t.now + " " + t.fid).toLowerCase().indexOf(q) >= 0; }).sort(function (a, b) { return (a.name === "Unknown") - (b.name === "Unknown") || a.name.localeCompare(b.name); }).map(function (t) {
        var s = TANKS.find(function (x) { return x.fid === t.fid; });
        var nm = t.name === "Unknown" ? "no name in the register" : esc(t.name);
        return "<tr><td>" + t.fid + "</td><td>" + (s ? '<button type="button" data-fid="' + t.fid + '">' + nm + "</button>" : nm) + "</td><td>" + t.sheet + "</td><td>" + (esc(t.now) || "not recorded") + "</td></tr>";
      }).join("") || '<tr><td colspan="4">No tank by that name in the register.</td></tr>';
    }
    rows("");
    find.addEventListener("input", function () { rows(find.value.trim().toLowerCase()); });
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-fid]"); if (!b) return;
      var s = TANKS.find(function (x) { return x.fid === +b.dataset.fid; });
      if (s) openSheet(s.name + " (No. " + s.fid + ")");
    });
    function answer(lon, lat, acc) {
      var on = all.filter(function (t) { return inside(t.rings, lon, lat); });
      var html;
      if (on.length) {
        html = on.map(function (t) {
          var s = TANKS.find(function (x) { return x.fid === t.fid; });
          return "<p class=\"big\">You are standing on " + esc(name(t)) + ".</p><p>It was last drawn in " + t.sheet + "." + (t.now ? " The register now calls this place: " + esc(t.now) + "." : "") + "</p>" + (s ? '<p><button type="button" class="primary" data-fid="' + t.fid + '">Open its sheet</button></p>' : "");
        }).join("");
      } else {
        var near = all.map(function (t) { var n = nearest(t.rings, lon, lat); return { t: t, d: n.d, dir: n.dir }; }).sort(function (a, b) { return a.d - b.d; })[0];
        html = "<p class=\"big\">Not on a lost tank in this register.</p><p>" + (near.d > 40000 ? "You are more than 40 km from any of them. These sheets cover Bengaluru only." : "The nearest is " + esc(name(near.t)) + ", " + (near.d < 1000 ? Math.round(near.d / 10) * 10 + " m" : (near.d / 1000).toFixed(1) + " km") + " to the " + near.dir + ".") + "</p>";
      }
      if (acc > 30) html += "<p class=\"small\">Your device is sure of its position only to " + Math.round(acc) + " m.</p>";
      out.innerHTML = html;
    }
    root.querySelector("#stand-go").addEventListener("click", function () {
      if (!navigator.geolocation) { out.innerHTML = "<p>This browser can't tell where it is. Look for your neighbourhood in the list.</p>"; return; }
      out.innerHTML = "<p>Taking a reading…</p>";
      navigator.geolocation.getCurrentPosition(function (p) { answer(p.coords.longitude, p.coords.latitude, p.coords.accuracy); },
        function () { out.innerHTML = "<p>No reading: the browser didn't give a position. Look for your neighbourhood in the list, or type a latitude and longitude.</p>"; }, { enableHighAccuracy: true, timeout: 15000 });
    });
    root.querySelector("#stand-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var m = /(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/.exec(root.querySelector("#stand-ll").value);
      if (m) answer(+m[2], +m[1], 0); else out.innerHTML = "<p>Write it as latitude, longitude. For example 12.9775, 77.5725.</p>";
    });
  });
}
