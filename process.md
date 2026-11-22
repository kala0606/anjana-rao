# How Anjana Rao's work is made

## The position

Anjana Rao is a land surveyor in 2041, sent to measure irrigation tanks that Bengaluru has built over. She holds that the city maps what it owns and never what it has lost, so she draws the second map.

## The system in one paragraph

It takes the outline of one lost tank, the year of the last sheet that showed it, and the record of one rain gauge. It rules a line across the tank for every year of rain. The more water was missing that year, the more ink the line gets. Where a building stands on the bed today, the line stops.

## Inputs

- The rain gauge at Bangalore, read every month from 1837 to 2023 and kept by NOAA
- The outlines of lost tanks, traced from old sheets by the Mod Foundation
- The walls and roads on those beds now, drawn by OpenStreetMap volunteers
- Two depths to water in Bengaluru East, measured by the Groundwater Directorate

## Rules

1. Draw a lot. It picks the tank, and which way she faces. She doesn't choose where she is sent.
2. Fit the bed to the sheet at the largest round scale. Nothing is stretched.
3. Give each year one row across the bed, oldest at the top. A row is a date and a place at once.
4. Ask whether a sheet proves the tank that year. If it does, the tank is held. If no sheet says, it is unproved. After the 1969 sheet, it is lost. ("Nothing is drawn that has not been measured.")
5. Draw what is absent, in whole passes of the pen. While the tank is held, absence is the rain that fell short of the mean. Once it is lost, absence is all the rain, because none of it was kept. ("Absence is drawn heavier than presence.")
6. Walk the row a station at a time. Draw between two stations only if both are clear. In the lost years, a wall stops the chain.
7. Write the year, the rain and the source beside every row. ("Every line carries its date and its source.")
8. Don't draw the boundary. Set a stone where it can still be walked, and a heavy cross where a road or a wall breaks it. ("A boundary is not a line.")
9. Add it up in the margin.

## Parameters

Station spacing matters most. At 4 metres the walls of single houses show; at 20 the city disappears, which lets it off. Pen passes per 100 mm decides how much heavier one year is than another: at 0.5 the wettest unkept year, 2022, fills its row. The ledger switches between blaming the sky and blaming the city, so a visitor can see what the first version of this work got wrong.

## Chance

Chance picks the tank and the direction, and makes the line sag by under a tenth of a millimetre. It is forbidden everywhere else. The exhibited sheet is seed 1.

## From screen to material

Two distances had to work on one sheet: the dark bed from across a room, and 123 dates from forty centimetres. Matte cotton and black pigment can hold both. The letters were redrawn as single pen strokes, the greys were taken out, and the passes were spaced so that a full row goes solid. For the plotter the same drawing is split into three pens.

## What changed over the month

- Day 8. The rain was supposed to be falling short. It wasn't. The rule changed from the sky's deficit to the city's.
- Day 9. Half of some sheets went blank, because no survey proves what stood there between 1870 and 1969.
- Day 9. A line came out of the manifesto because nobody had measured it.

## What it can't say

The boundaries are traced, not surveyed. The walls are mostly traced from imagery, and unevenly. The gauge stands in one place, and its record was stitched together from three sources. A tank on the 1969 sheet is taken to have been there in the years before it and gone in every year after; the true year of each loss is not in the register. Each of these is written on the sheet or in data/SOURCES.md. She would want them found.
