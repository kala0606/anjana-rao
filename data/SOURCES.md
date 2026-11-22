# Data sources

All downloaded 22 November 2026. `data/build/prepare.py` turns the downloads into the files here. It selects, converts degrees to metres, rounds and counts. It adds nothing.

## Rain · rain_monthly.csv, rain_annual.csv, RAIN in record.js

- **What:** monthly precipitation at Bangalore, station IN009010100 (WMO 43295), 1837 to 2023. 187 years, every month present.
- **From:** NOAA National Centers for Environmental Information, GHCN-Monthly version 4. https://www.ncei.noaa.gov/data/ghcnm/v4/precipitation/access/IN009010100.csv
- **Terms:** US government data, free to use with credit.
- **Flags:** D daily register, R an international collection, M Monthly Climatic Data for the World.
- **What to know:** the record is stitched from several sources. It is R before 1901 and from 1971 to 2008, D from 1901 to 1970, M after that. The station's listed position shifts by a few kilometres between them. Trace amounts count as zero.
- **Left out:** 2024 to 2026. Those years have missing months, or months NOAA flags as outliers (May 2024 reads 1,815 mm). Not measured well enough to draw.

## Tank boundaries · TANKS in record.js, lost_tanks.json

- **What:** 111 lost tanks, traced from georeferenced sheets of 1854, 1870, 1897 and 1969. Four have no area and are dropped, leaving 107; 26 named ones have full sheets here.
- **From:** Mod Foundation, Bengaluru Watershed download centre, "Lost Tanks". https://mod-foundation.github.io/download_center/
- **Terms:** offered for public download; the dashboard calls itself open source, but no licence is stated. Ask the Mod Foundation before reusing the boundaries for anything else.
- **What to know:** their own disclaimer says it is not an on-the-ground survey and gives approximate positions. Names are kept as the register spells them. "Last sheet" is the sheet the boundary was traced from.

## Walls and roads · buildings and breaks in record.js

- **What:** building outlines and road centrelines inside and across each of the 26 beds.
- **From:** OpenStreetMap, by the Overpass API and the OSM API. © OpenStreetMap contributors.
- **Terms:** Open Database Licence (ODbL). https://www.openstreetmap.org/copyright
- **What to know:** mostly traced by volunteers from imagery, and not equally complete everywhere. A bed with few walls here may only be a bed few people have mapped.

## The well

- **What:** depth to water, Bengaluru East taluk: 17.86 m in March 2015, 37.76 m in March 2024.
- **From:** Groundwater Directorate figures reported by ThePrint, 6 June 2025 (reference 6).
- **What to know:** two readings for a whole taluk. The same two are drawn on every sheet, and labelled as the east, whichever tank the sheet shows.
