# Art Direction and Asset Plan

## Chosen Reference

Alim selected the Japanese-inspired deck shown in `/Users/alimyuksek/Downloads/Set Of Playing Cards - 10 Free PDF Printables _ Printablee.jpeg`. Its strengths are the warm ivory field, restrained navy/red suits, thin card border, and characterful Japanese-style court illustrations. Keep that character rather than switching to a generic casino deck.

The local file is a 735 × 1165 JPEG, with roughly 87 pixels of width per card. Cropping and enlarging it for full-size cards will soften borders, suit symbols, indices, and portraits. The 300-DPI metadata does not change the available pixels. This sheet is a design reference, not a final sprite sheet.

Source page: https://www.printablee.com/post_set-of-playing-cards-printable_42715/ . The page did not establish a license for redistributing the exact artwork inside a public game. Confirm permission if using it directly.

## Production Direction

The Deck and UI agent owns the quality fix. The selected production path is an original scalable SVG deck inspired by the broad visual style: warm ivory faces, navy/red suits, larger corner indices, consistent border, original J/Q/K portraits, and one coherent card back. Alim can still provide a higher-quality original for comparison, but work need not wait for it.

1. Deliver all 52 faces and one back as sharp production assets. Do not trace or enlarge the supplied JPEG into final cards.
2. Keep the same back on every hidden card. Decorative bonus cards in the reference sheet are not substitutes for a uniform back.
3. Check face readability at small mobile size and sharpness at the largest intended desktop size on a high-density display. Hand off a preview to Dora for review.

Do not use AI upscaling as the sole production plan; it cannot recover authentic line and lettering detail that is absent from an 87-pixel crop.

## Prototype for Review

The Deck and UI agent delivered `assets/cards/`: 52 original SVG faces, one uniform SVG back, a reproducible generator, an HTML gallery, and a PNG contact sheet. Dora rendered a number card, a court card, and the back at enlarged size, plus the full contact sheet at game-like size. The assets remain sharp; their court art is simpler and more stylized than the selected reference. Alim's visual review determines whether these portraits are acceptable or need further art direction before the deck is final.
