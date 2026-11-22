# System · the deficit survey

## A · Metaphor to rules

**The metaphor.** The survey line as a sieve: it crosses the bed and keeps only what could be measured, and the drawing records what the bed did not keep.

**The process, plainly.** Take the outline of a tank from the last sheet that shows it. Turn it so the chain lies across it. Rule one row across it for each year of the rain gauge, oldest at the top. Ask whether a sheet proves the tank was there that year. If it was, draw the rain that fell short of the mean. If no sheet says, set two pegs and draw nothing. If it was gone, draw all the rain that fell, because none of it was kept, and stop at every wall. More missing water is more passes of the pen. Put stones along the edge, and a heavy cross wherever the edge has been broken.

**Manifesto lines that must become rules.**

- "Nothing is drawn that has not been measured" → no line between two stations unless both are clear; pegs only, where no sheet proves the tank; 2024 to 2026 left out
- "Absence is drawn heavier than presence" → passes = absence ÷ 100 mm × dial, rounded to whole passes; a year with nothing absent gets one broken hairline
- "Every line carries its date and its source" → year, rain and source flag beside every row
- "A boundary is not a line" → stones and crosses, no outline anywhere in the code
- "It fell, and it was not kept" → after the last sheet, absence is the whole year's rain

**What it must never do.** Colour. Gradient. North at the top by default. Water that isn't in the gauge. Randomness in a measurement.

## B · The diagram

[diagram/system.svg](diagram/system.svg). To be redrawn by hand on A3 and photographed as `diagram/system.jpg`.

- **Inputs:** one gauge, 187 years; one boundary and the year of its sheet; the walls and roads on the bed now; two depths to water
- **Rules:** nine, numbered the same way in `src/system.js`
- **Parameters:** ten dials, in `config/params.json`
- **Chance:** which tank, which way to face, how the chain sags. Forbidden everywhere else
- **Outputs:** one A2 sheet per lot, black lines, in millimetres

## C · Technique

- [x] Data as material
- [x] Geometry and tiling (a scanline across a polygon)

**Why, for this identity.** A scanline is what a chain is: a straight line laid across ground, with a record of where it entered, where it left and what stopped it. It never sees the whole tank at once, and neither does she.

**Avoiding the default.** The default of data as material is a chart, and of city data a figure-ground map. Here the years are tied to the ground, so a row is both a date and a place; and the city is never drawn. It shows only as the gap where measuring had to stop.

## D · Architecture

`draw()` runs the nine rules top to bottom. `src/letters.js` holds single-stroke letters so a pen can write. `data/record.js` is generated and never edited.

**What the agent proposed.** Buildings drawn as outlines; roads as white bands; a noise field for the line.

**What changed, and why.** Buildings are not drawn at all. Road width isn't in the data, so a road is only a break in the boundary. Noise moves the hand by less than a tenth of a millimetre and does nothing else.

**First run.** Day 7, seed 1. [log/day-07.png](log/day-07.png)

## E · Parameter table

In the [README](README.md#parameters), with her reason for each.

## F · Twenty variations

Seeds 1 to 20, in order, none thrown away: [outputs/digital/contact-sheet.png](outputs/digital/contact-sheet.png). Seventeen different tanks came up.

**Where it stays itself.** Any tank, any turn, `cell` from 2 to 8 m, `passes` from 0.3 to 0.6, `first` up to about 1930.

**Where it breaks.** [log/day-08-edges.png](log/day-08-edges.png). `cell` at 20 m: walls vanish and the city is let off. `passes` under 0.2: one pass for everything, so no year weighs more than another. `hand` at 0.3 mm: the shake becomes a style. `first` at 1837: it holds, but on this bed the loss shrinks to a strip and the sheet turns back into weather.

**The three strongest.**

- `001_seed-1` · Chinnagara Kere, now Ejipura. Last drawn in 1969, so every row above the break is proved. The walls below are the densest of the twenty.
- `004_seed-4` · Sampangi, now Kanteerava Stadium. The stadium appears as a ring nobody drew. Last drawn in 1870, so the top half is pegs.
- `020_seed-20` · Sunnakal, now a bus depot. The depot's own geometry, kept out, reads as clearly as if it were the subject.

## G · The agent as critic

**Suggested.** The fifth rule does the most work. The surplus hairlines could go. Sampangi is the strongest image.

**Kept.** The reading of rule 5: everything else was made quieter so it could be heard.

**Rejected.** Removing the hairlines: a year the tank was full is a measurement, and taking it out would be the city's habit. Choosing Sampangi: see [authorship.md](authorship.md), Day 9.

## H · Toward a material

- [x] Archival print (hero)
- [x] A2 pen plot (alternate, same seed)

**Why this material carries the rules.** Her sheet has to be read at two distances: from across a room, a dark bed with the city bitten out of it; from forty centimetres, 123 dates. A pigment print holds a 1.5 mm letter and a solid black row on the same matte sheet. The pen plot says the same thing with time, since a heavier year takes longer to draw.

**What the system must output for it.** A vector PDF at A2, a 300 PPI TIFF, and an SVG split into three pens. See [production-plan.md](production-plan.md).
