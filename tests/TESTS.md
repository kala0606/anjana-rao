# Test log

Tests 01 to 04 were done on the files. Tests 05 and 06 need the machines and are open.

## Test 01 · Day 12 · print file, smallest marks

**What I tested:** whether a 0.1 mm hairline and 1.5 mm letters survive 300 PPI.
**Seed and parameters:** seed 1, defaults
**Photo:** [log/day-12.png](../log/day-12.png), a crop of the TIFF at true pixels
**What happened:** hairlines reach full black. Letters are 18 pixels tall and open. Passes in a heavy row are separated by a slit thinner than a pixel, so a full row reads as solid.
**What it means for the identity:** a date can be read from any row, so the third rule holds at print size.
**What I'll change:** nothing yet. The paper decides.

## Test 02 · Day 12 · plot file, before and after optimising

**What I tested:** whether vpype lost any lines. Both files rasterised at 300 PPI and compared pixel by pixel.
**What happened:** nothing was lost but the rounded tips of some strokes, at most 12 pixels each, because the optimised file doesn't record round ends. A real nib draws them.
**What I'll change:** six line widths became three, so it needs three pens.

## Test 03 · Day 12 · the same seed, twice

**What I tested:** seed 1 rendered twice and compared with the saved output.
**What happened:** all three files are identical. There is no `Math.random()` in `src/`.

## Test 04 · Day 14 · the press on a phone

**What I tested:** the press at 375 × 812.
**What happened:** two pages were wider than the phone, because a table pushed the whole page out. Fixed in press.css. After that all four tabs fit, the dials respond, a tapped row reads out its year, and About shows the manifesto.
**What I'll change:** the list of tanks had its Sheet button off the edge, so the tank's name became the link.

## Test 05 · Day 13 · test strip on paper

**What I tested:** open
**Photo:** tests/05.jpg
**What happened:**
**What it means for the identity:**
**What I'll change:**

## Test 06 · Day 13 · 100 × 100 mm plot section

**What I tested:** open
**Photo:** tests/06.jpg
**What happened:**
**What it means for the identity:**
**What I'll change:**
