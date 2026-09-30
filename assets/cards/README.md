# Blackjack deck artwork

An original, scalable SVG deck in the Japanese-inspired direction Alim chose: warm ivory card faces, restrained navy and red suits, mirrored court characters, and one uniform back. The supplied low-resolution reference image was used only for broad visual direction; none of its card art was copied or enlarged.

## Files

- `faces/<suit>-<rank>.svg` — 52 self-contained face cards.
- `back.svg` — one uniform patterned back for every hidden card.
- `contact-sheet.svg` and `contact-sheet.png` — overview of all 52 faces and the back.
- `preview.html` — browser gallery with individual files.
- `generate_deck.py` — standard-library Python generator for all face SVGs, the back, vector contact sheet, and HTML gallery; regenerate with `python3 generate_deck.py`.

## Design and sizing

Each card has a 250 × 350 viewBox (5:7 ratio) and a 63.5 × 88.9 mm intrinsic size, so its lines and lettering stay crisp when enlarged. J, Q, and K retain their original mirrored samurai page, court lady, and shogun silhouettes, with clearer faces, costume panels, and suit-specific embroidery. The back keeps its navy, gold, and red identity with a more legible geometric lattice.

`contact-sheet.png` is a rendered convenience preview of the current vector contact sheet; the SVG assets are the source of truth. The deck is still stylized vector art; it has no print bleed or crop marks, which would be needed for physical printing.
