// Draws diagram/system.svg and exhibition/zone.svg with the same pen and letters as the work.
import { writeFileSync } from "node:fs";
import { createPen } from "../press/pen.js";
import { write } from "../src/letters.js";
const at = (f, s) => writeFileSync(new URL("../" + f, import.meta.url), s);
function box(pen, x, y, w, h, head, rows, gap) {
  pen.weight(0.6).rect(x, y, w, h); pen.weight(0.35); write(pen, head, x + 6, y + 12, 4.6);
  pen.weight(0.25); rows.forEach((t, i) => write(pen, t, x + 6, y + 25 + i * (gap || 9), 3.1));
}
function arrow(pen, x1, y1, x2, y2) { const a = Math.atan2(y2 - y1, x2 - x1), s = 3; pen.weight(0.5).line(x1, y1, x2, y2).polyline([[x2 - s * Math.cos(a - .45), y2 - s * Math.sin(a - .45)], [x2, y2], [x2 - s * Math.cos(a + .45), y2 - s * Math.sin(a + .45)]]); }
let pen = createPen(420, 297); pen.stroke("#000");
box(pen, 15, 20, 112, 92, "1 Inputs", ["Rain: one gauge, 187 years", "Bed: boundary traced from a sheet", "Sheet: the last year it was drawn", "Walls and roads on the bed now", "Well: two measured depths", "", "Read, never changed."]);
box(pen, 15, 135, 112, 70, "4 Chance", ["The lot picks the tank", "The lot picks which way to face", "The hand: how the chain sags", "Never: a measurement"]);
box(pen, 15, 228, 112, 49, "3 Parameters", ["cell, passes, first year, ledger,", "walls, stones, hand, pen, turn"]);
box(pen, 160, 20, 130, 257, "2 Rules", ["1 Draw the lot: which tank, which way", "2 Largest round scale that fits", "3 One year, one row, oldest first", "4 Is the tank proved that year?", "    held: absence = mean less rain", "    unproved: two pegs, no line", "    lost: absence = all the rain", "5 Absence in whole pen passes", "    none absent: one broken hairline", "6 Walk the row station by station", "    outside the bed: stop", "    lost, and a wall: lift the pen", "7 Write the year, the rain, the source", "8 Stones where the edge still stands,", "    a heavy cross where it is broken", "9 Add it up in the margin"], 14);
box(pen, 323, 100, 82, 76, "5 Outputs", ["One A2 sheet a lot", "SVG in mm", "PDF, TIFF to print", "Three pens to plot", "Named by its seed"]);
arrow(pen, 127, 66, 160, 66); arrow(pen, 127, 170, 160, 170); arrow(pen, 127, 253, 160, 253); arrow(pen, 290, 138, 323, 138);
at("diagram/system.svg", pen.toSVG({ background: "#fff" }));

// the zone, 1:10, floor at the bottom
pen = createPen(260, 260); pen.stroke("#000"); const floor = 235, X = 20;
pen.weight(0.6).line(10, floor, 250, floor);
const thing = (x, cy, w, h, name, note) => { pen.weight(0.5).rect(x, floor - cy / 10 - h / 20, w / 10, h / 10); pen.weight(0.2); write(pen, name, x, floor - cy / 10 + h / 20 + 5, 2.2); if (note) write(pen, note, x, floor - cy / 10 + h / 20 + 9.5, 1.8); };
thing(60, 1470, 420, 594, "Tank No. 74", "A2, centre 147 cm");
thing(150, 1470, 297, 420, "Manifesto", "A3, centre 147 cm");
thing(118, 1510, 105, 148, "Card", "A6");
thing(118, 1320, 105, 50, "Label, QR", "132 cm");
pen.weight(0.2); write(pen, "1 the sheet   2 the card   3 the manifesto   4 the code", 20, 20, 2.6); write(pen, "Elevation 1:10. Wall 1.9 m wide. Stand 1.5 m back to read the bed, 40 cm to read a row.", 20, 27, 2.2);
pen.line(20, floor + 8, 120, floor + 8).line(20, floor + 6.5, 20, floor + 9.5).line(120, floor + 6.5, 120, floor + 9.5); write(pen, "1 m", 124, floor + 9, 2.2);
at("exhibition/zone.svg", pen.toSVG({ background: "#fff" }));
