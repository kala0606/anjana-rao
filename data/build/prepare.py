"""Turns the downloaded records into data/record.js and data/*.csv.

Run once, from this folder's raw/ (not kept in the repository):
  ghcnm.csv               NOAA GHCN-Monthly v4 precipitation, station IN009010100
  mod_lakes_lost.geojson  Mod Foundation download centre, "Lost Tanks"
  osm/<fid>.json          OpenStreetMap (Overpass): buildings and roads round each tank

Nothing is invented here. It selects, converts degrees to metres, rounds, and counts.
  python3 data/build/prepare.py <raw folder>
"""
import csv, json, math, os, sys
from collections import defaultdict

RAW, OUT = sys.argv[1], os.path.join(os.path.dirname(__file__), "..")
LAST_YEAR = 2023   # 2024-2026 carry months that fail NOAA's own quality check (flag O) or are missing

# ---------- rain ----------
months, src = defaultdict(dict), defaultdict(set)
for line in open(f"{RAW}/ghcnm.csv"):
    c = [x.strip() for x in line.split(",")]
    y, m = int(c[5][:4]), int(c[5][4:])
    months[y][m] = max(0, int(c[6]) / 10)     # tenths of a millimetre; -1 means a trace
    src[y].add(c[9])
rain = []
for y in sorted(months):
    if y > LAST_YEAR or len(months[y]) != 12: continue
    rain.append([y, round(sum(months[y].values()), 1), "+".join(sorted(src[y]))])
with open(f"{OUT}/rain_annual.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["year", "rain_mm", "noaa_source_flag"]); w.writerows(rain)
with open(f"{OUT}/rain_monthly.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["year", "month", "rain_mm"])
    for y, _, _ in rain:
        for m in range(1, 13): w.writerow([y, m, months[y][m]])
mean = round(sum(r[1] for r in rain) / len(rain), 1)

# ---------- tanks ----------
def inside(x, y, rings):
    hit = False
    for r in rings:
        j = len(r) - 1
        for i in range(len(r)):
            if (r[i][1] > y) != (r[j][1] > y) and x < (r[j][0]-r[i][0])*(y-r[i][1])/(r[j][1]-r[i][1]) + r[i][0]: hit = not hit
            j = i
    return hit

def area(r):
    return abs(sum(r[i-1][0]*r[i][1] - r[i][0]*r[i-1][1] for i in range(len(r)))) / 2

def simplify(p, tol):                          # Douglas-Peucker
    if len(p) < 3: return p
    (ax, ay), (bx, by) = p[0], p[-1]; L = math.hypot(bx-ax, by-ay) or 1e-9; best, k = 0, 0
    for i in range(1, len(p)-1):
        d = abs((bx-ax)*(ay-p[i][1]) - (ax-p[i][0])*(by-ay)) / L if L > 1e-6 else math.hypot(p[i][0]-ax, p[i][1]-ay)
        if d > best: best, k = d, i
    return [p[0], p[-1]] if best <= tol else simplify(p[:k+1], tol)[:-1] + simplify(p[k:], tol)

def ring_simplify(r, tol):
    if r[0] == r[-1]: r = r[:-1]
    if len(r) < 8: return r
    k = max(range(len(r)), key=lambda i: (r[i][0]-r[0][0])**2 + (r[i][1]-r[0][1])**2)
    return simplify(r[:k+1], tol)[:-1] + simplify(r[k:] + [r[0]], tol)[:-1]

def cross(a, b, c, d):
    den = (b[0]-a[0])*(d[1]-c[1]) - (b[1]-a[1])*(d[0]-c[0])
    if abs(den) < 1e-12: return None
    t = ((c[0]-a[0])*(d[1]-c[1]) - (c[1]-a[1])*(d[0]-c[0])) / den
    u = ((c[0]-a[0])*(b[1]-a[1]) - (c[1]-a[1])*(b[0]-a[0])) / den
    return (a[0]+t*(b[0]-a[0]), a[1]+t*(b[1]-a[1])) if 0 <= t <= 1 and 0 <= u <= 1 else None

ROADS = {"motorway","trunk","primary","secondary","tertiary","unclassified","residential","living_street","service","road"}
ROADS |= {r + "_link" for r in ROADS}
tanks, places, osm_date = [], [], ""
for f in json.load(open(f"{RAW}/mod_lakes_lost.geojson"))["features"]:
    p, polys = f["properties"], f["geometry"]["coordinates"]
    fid, name = p["fid"], " ".join((p["name"] or "Unknown").split())
    pts = [q for poly in polys for q in poly[0]]
    lon0, lat0 = sum(q[0] for q in pts)/len(pts), sum(q[1] for q in pts)/len(pts)
    kx, ky = 111320*math.cos(math.radians(lat0)), 110574
    to = lambda q: (round((q[0]-lon0)*kx, 2), round(-(q[1]-lat0)*ky, 2))        # metres, y down the page
    rings = [[to(q) for q in r] for poly in polys for r in poly]
    rings = [r for r in rings if area(r) > 400]
    if not rings: continue
    # every lost tank, for "where you stand": degrees, coarse
    places.append({"fid": fid, "name": name, "sheet": int(p["year"]), "now": " ".join((p["Status"] or "").split()),
                   "rings": [[[round(q[0]/kx+lon0, 5), round(lat0-q[1]/ky, 5)] for q in ring_simplify(r, 3)] for r in rings]})
    path = f"{RAW}/osm/{fid}.json"
    if not os.path.exists(path) or name == "Unknown": continue
    rings = [ring_simplify(r, 0.4) for r in rings]
    osm = json.load(open(path)); osm_date = max(osm_date, osm["osm3s"]["timestamp_osm_base"][:10])
    blds, roads = [], []
    for e in osm["elements"]:
        tags = e.get("tags", {})
        if "building" in tags:
            geoms = [e["geometry"]] if e["type"] == "way" else [m["geometry"] for m in e.get("members", []) if m.get("role") == "outer" and "geometry" in m]
            for g in geoms:
                r = [to((q["lon"], q["lat"])) for q in g if q]
                if len(r) > 3 and any(inside(x, y, rings) for x, y in r): blds.append(ring_simplify(r, 0.3))
        elif tags.get("highway") in ROADS or tags.get("railway") == "rail":
            roads.append([to((q["lon"], q["lat"])) for q in e["geometry"]])
    breaks = []
    for r in rings:
        for i in range(len(r)):
            a, b = r[i-1], r[i]
            for rd in roads:
                for k in range(len(rd)-1):
                    x = cross(a, b, rd[k], rd[k+1])
                    if x and all(math.hypot(x[0]-q[0], x[1]-q[1]) > 12 for q in breaks): breaks.append([round(x[0],1), round(x[1],1)])
    flat = lambda r: [int(round(v*10)) for q in r for v in q]                    # decimetres
    tanks.append({"fid": fid, "name": name, "sheet": int(p["year"]), "now": " ".join((p["Status"] or "").split()),
                  "ward": p["ward_name"], "lat": round(lat0, 5), "lon": round(lon0, 5),
                  "ha": round(sum(area(r) for r in rings)/1e4, 1), "rings": [flat(r) for r in rings],
                  "breaks": breaks, "buildings": [flat(b) for b in blds]})
tanks.sort(key=lambda t: t["fid"])
with open(f"{OUT}/record.js", "w") as f:
    f.write("// GENERATED by data/build/prepare.py from the sources listed in data/SOURCES.md. Don't edit.\n"
            f"export const OSM_DATE = {json.dumps(osm_date)};\n"
            f"export const MEAN = {mean}; // mm a year, 1837-{LAST_YEAR}, all {len(rain)} years\n"
            "// [year, rain in mm, NOAA source flag]\nexport const RAIN = " + json.dumps(rain, separators=(",", ":")) + ";\n"
            "// boundaries and buildings in decimetres from the tank's centre, y down\nexport const TANKS = [\n"
            + ",\n".join(json.dumps(t, separators=(",", ":"), ensure_ascii=False) for t in tanks) + "\n];\n")
with open(f"{OUT}/lost_tanks.json", "w") as f: json.dump(places, f, separators=(",", ":"), ensure_ascii=False)
print(len(rain), "years, mean", mean, "|", len(tanks), "tank sheets |", len(places), "lost tanks")
for t in tanks: print(t["fid"], t["name"], t["sheet"], t["ha"], "ha", len(t["breaks"]), "breaks", len(t["buildings"]), "buildings")
