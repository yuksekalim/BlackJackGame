# Dealer artwork

The current dealer is original game artwork generated in Alim's Higgsfield workspace with the `z_image` model on 2026-09-27 (generation `ff906940-5c0c-4a54-845a-cf1dbbe8b817`). The prompt asked for a Japanese-inspired illustrated adult card dealer with clear hands and a navy/ivory uniform. The generated pink background and table were removed to keep the existing game table. The transparent high-resolution source is `higgsfield-dealer.png` (1391 × 1230 pixels).

The three lossless WebP layers split the source around the shoulders. `dealer-left-arm.webp` holds the cards and the live card-launch anchor, `dealer-right-arm.webp` gestures toward the player, and `dealer-core.webp` covers the seams at the shoulders. Each layer uses the same 1391 × 1230 canvas, so they stay aligned when the image scales. `src/ui/DealerFigure.tsx` and `src/ui/dealer-figure.css` control their poses. The source file is kept for future refinements; it is not loaded by the game.

The generated hand cards are decorative. The actual dealt cards and all game outcomes come from the game engine and the original SVG deck.
