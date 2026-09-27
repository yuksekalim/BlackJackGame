# Dealer artwork

The current dealer is original game artwork generated in Alim’s Higgsfield workspace with the `z_image` model on 2026-09-27 (generation `ff906940-5c0c-4a54-845a-cf1dbbe8b817`). The generated pink background and table were removed to keep the existing game table. The transparent high-resolution source is `higgsfield-dealer.png` (1391 × 1230 pixels).

The live art is a seven-layer transparent cutout under `public/dealer/`: two upper sleeves, the core body, two cuff overlays, and two forearm/hand pieces. Each layer uses the source canvas so the rest pose aligns without resampling. The card hand retains the decorative cards. The actual dealt cards and game outcomes come from the game engine and original SVG deck. The previous three WebP shoulder layers were retired when this rig replaced them; Git history retains them.

`src/remotion/DealerMotion.tsx` choreographs shoulder and elbow motion by frame. `src/ui/DealerFigure.tsx` embeds it with Remotion Player in the game; `npm run studio` opens the editable composition. The live card release marker follows the card-hand layer at source point (158, 589). Normal and fast modes play the same motion at different rates; instant and reduced-motion modes show the neutral pose. The art has no reconstructed anatomy behind its limbs, so the joint travel stays restrained and the cuff overlays cover the seams.
