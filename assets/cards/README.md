# Blackjack deck artwork prototype

This is an original, scalable SVG deck based on the broad art direction Alim chose: warm ivory faces, navy and red suits, Japanese-inspired court characters, and a consistent card back. The low-resolution reference image was used only for general visual direction; none of its card artwork was copied, enlarged, or cropped.

## Files

- `faces/<suit>-<rank>.svg` — 52 self-contained card faces, for example `faces/hearts-Q.svg` and `faces/spades-10.svg`.
- `back.svg` — one uniform navy patterned back for every hidden card.
- `preview.html` — browser gallery of all 53 SVGs; open this file locally to inspect the deck.
- `contact-sheet.svg` — one self-contained vector overview of the faces and back.
- `generate_deck.py` — standard-library Python generator; regenerate with `python3 generate_deck.py`.

## Design and sizing

Each SVG uses a 250 × 350 viewBox (5:7 poker-card ratio) and declares a 63.5 × 88.9 mm intrinsic size. The artwork stays vector at any display or print size. Corner indices show both rank and suit in opposite corners; number-card pips follow conventional arrangements. J, Q, and K have mirrored original vector figures: an armored samurai page, a court lady with a fan, and a shogun. The back uses one rotationally balanced crest over a geometric lattice.

## Checks and current limits

The generator creates exactly 52 face SVGs plus `back.svg`; all 54 SVG documents (including the contact sheet) parse as XML. The art is a prototype for product review: court portraits are intentionally stylized and reused by rank across suits with suit-specific colors and emblems. The card border has no print bleed or crop marks, so production print files would need those added if physical printing becomes a requirement.
