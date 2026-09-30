# Dealer motion visual identity

## Style prompt
A refined Japanese-inspired blackjack table, using the approved Higgsfield dealer as the only character. The composition presents the same complete-pose motion as the playable game's Remotion dealer. It feels like a close view of the existing felt table, with restrained gold rules and large ivory result type.

## Colors
- Felt: `#0d4a3b`, `#115c46`, `#17694f`
- Deep table edge: `#081e21`, `#112b2c`
- Ivory text: `#f5efde`, `#fff9e9`
- Gold accents: `#ead297`, `#f4d690`
- Loss/result accent: `#ffb5a7`

## Typography
- Georgia / Times New Roman serif for display statements, matching the game heading.
- System sans for small table labels, matching game controls.

## Motion
- One full-body pose per instant. No separated arm layers or transparency blends between poses.
- Deal follows the 42-frame, 60-fps pose order in `src/remotion/DealerMotion.tsx`; win and loss have visibly different final expressions.
- Card travel begins at the extended hand and arcs toward the player side.

## What not to do
- No generic casino neon, chips, or stock dealer image.
- No crossfade between adjacent character poses or outcome scenes: it creates duplicate arms. Use an opaque felt-dark color dip before switching scenes.
- No forced black ending; hold the final result for review.
