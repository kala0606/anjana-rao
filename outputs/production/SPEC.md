# Production spec · archival print

- **Final size:** 420 × 594 mm (A2 portrait) · 4961 × 7016 px at 300 PPI
- **Paper:** matte cotton rag, about 300 gsm, natural white. Which one: confirm with the facilitator. **Why:** the old sheets that survived are on cotton, and a record shouldn't shine.
- **Ink:** black only. If the printer has a matte black, use it. Print as black and white, not as a colour mix, if the driver offers it.
- **Colour profile:** sRGB embedded; pure black on white, no greys in the drawing. Convert to the printer and paper profile when it is given. Soft-proofed: not yet
- **Seed and parameters:** seed 1, every dial at its default in `config/params.json`
- **Files:** `deficit-survey_74_print.pdf` (vector, first choice) · `deficit-survey_74_print_A2_300ppi.tif` (if the printer wants pixels)
- **Scale:** 100%. The sheet is at 1:2000, so "fit to page" makes it untrue. The 50 m bar must measure 25 mm on paper.
- **Margins:** paper white, 19 mm or more on every side
- **Test strip:** `deficit-survey_74_teststrip_190x120_300ppi.tif`, Day 13 · notes: not printed yet
- **Full proof:** not printed yet
- **Mounting or framing:** to be confirmed with the facilitator

## Checks on the file

- [x] PDF page is A2, one page, all vector, no fonts and no images inside
- [x] TIFF is 4961 × 7016, 300 PPI, LZW, sRGB profile embedded, rendered at full size and not enlarged
- [x] All ink inside 19 mm margins (measured: 19.9 left, 54.4 top, 19.95 right, 19.4 bottom)
- [x] Finest line, 0.1 mm, reaches full black at 300 PPI
- [x] Seed 1 renders to the same file twice, and to the same file as `outputs/digital/001`
- [ ] 50 m bar measured on paper: 25 mm
- [ ] Letters at 1.5 mm readable on the real paper

# Production spec · pen plot (alternate)

- **Final size:** 420 × 594 mm (A2) · **Margins:** 19 mm
- **Paper:** smooth cotton, 250 to 300 gsm, white
- **Pens and layers:** layer 1: 0.1 mm, writing and hairlines · layer 2: 0.3 mm, absence, stones, title · layer 3: 0.6 mm, broken crosses. All black, plotted in that order.
- **Seed and parameters:** the same
- **File:** `deficit-survey_74_plot.svg`, through vpype: linemerge, linesort, reloop, linesimplify
- **Path count and drawing length:** 4,888 paths, 32.9 m pen down (8.2 m, 23.9 m, 0.8 m)
- **Estimated plot time:** to be timed on Day 13 from a 100 × 100 mm section. At 30 mm a second with a second for each lift it is about 100 minutes, which fits one slot; the lifts are most of it.
- **Test plot:** not plotted yet. Watch rows 2017 to 2022: ten passes side by side may soak the paper.
- **Fallback:** the archival print above, same seed, same size
