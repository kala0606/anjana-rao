#!/bin/bash
# Makes every production file from the system. Same seed, same files.
# Needs: node, rsvg-convert (librsvg), python3 with Pillow, and vpype for the plot.
#   bash outputs/production/make.sh [path to vpype]
set -e
cd "$(dirname "$0")/../.."
VPYPE=${1:-vpype}; OUT=outputs/production; N=deficit-survey_74
node -e "import('./press/core.js').then(m => { const fs = require('fs'), c = JSON.parse(fs.readFileSync('config/params.json')); fs.writeFileSync('$OUT/${N}_source.svg', m.render(c, m.defaults(c), c.seed).plotSVG); })"
# digital print: vector PDF at true size, and a 300 PPI TIFF rendered at full size (never enlarged)
rsvg-convert -f pdf -b white $OUT/${N}_source.svg -o $OUT/${N}_print.pdf
rsvg-convert -w 4961 -h 7016 -b white $OUT/${N}_source.svg -o /tmp/${N}.png
python3 - "$OUT/${N}" <<'P'
import sys
from PIL import Image, ImageCms
Image.MAX_IMAGE_PIXELS = None
out, im = sys.argv[1], Image.open("/tmp/deficit-survey_74.png").convert("RGB")
icc = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
im.save(out + "_print_A2_300ppi.tif", compression="tiff_lzw", dpi=(300, 300), icc_profile=icc)
mm = lambda v: round(v / 25.4 * 300)
strip = im.crop((mm(18), mm(255), mm(18) + mm(190), mm(255) + mm(120)))  # finest, lightest and darkest, at true size
strip.save(out + "_teststrip_190x120_300ppi.tif", compression="tiff_lzw", dpi=(300, 300), icc_profile=icc)
im.resize((1240, 1754), Image.LANCZOS).convert("L").save(out + "_preview.png", optimize=True)
P
# pen plot: three pens (0.1 for writing and presence, 0.3 for absence, 0.6 for broken), one layer each
sed -E 's/stroke-width="0\.(15|18|2)"/stroke-width="0.1"/g' $OUT/${N}_source.svg > /tmp/${N}_pens.svg
$VPYPE read --attr stroke-width /tmp/${N}_pens.svg linemerge --tolerance 0.05mm linesort reloop linesimplify --tolerance 0.03mm \
  write --page-size a2 $OUT/${N}_plot.svg
