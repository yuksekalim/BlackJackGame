# Dealer artwork and motion

`higgsfield-dealer.png` is the original 1391 × 1230 RGBA illustration generated in Alim's Higgsfield workspace with `z_image` on 2026-09-27 (generation `ff906940-5c0c-4a54-845a-cf1dbbe8b817`). Its pink background pixels have zero alpha. `public/dealer/dealer-idle.png` is an exact copy of that original file.

The active animation uses **complete, transparent figure poses** derived from this source. The dealer never separates into shoulder, cuff, forearm, or body layers. The deal poses are `dealer-deal-near.png`, `dealer-deal-early.png`, `dealer-deal-between.png`, `dealer-deal-mid.png`, `dealer-deal-late.png`, and `dealer-deal.png`. All seven positions, including the original rest pose, have connected arms and hands. Outcome poses are `dealer-player-win-near.png`, `dealer-player-win-middle.png`, `dealer-player-win-between.png`, `dealer-player-win-late.png`, and `dealer-player-win.png` (dealer disappointed), plus `dealer-player-loss-near.png`, `dealer-player-loss-middle.png`, and `dealer-player-loss.png` (dealer celebrating). These derivative sprites were edited from the Higgsfield illustration with ImageGen, preserving the dealer's face, hair, uniform, and illustration style.

`src/remotion/DealerMotion.tsx` plays the poses as a 42-frame, 60-fps hand-drawn sequence. The real card comes from the game engine and flies from the `data-motion-shoe` marker attached to the extended hand. The marker reaches source-canvas point `(557, 1046)` on frame 17; normal-speed card flight starts around frame 19 and ends within its presentation event. Fast mode uses the same sequence at 2× speed; instant and reduced-motion modes show a stable pose. `src/ui/DealerFigure.tsx` embeds this composition with Remotion Player in the unchanged table, and `npm run studio` opens its editable timeline.

Every frame uses one complete figure sprite. This avoids split joints, detached hands, and ghosted duplicate arms. Smooth body drift and a short edge blur accompany the pose changes. The result expression holds after playback. The original source remains under `assets/dealer/` so the derivatives can be compared with the accepted character.

## Review clips

The 60-fps, 42-frame preview clips are [`deal.mp4`](previews/deal.mp4), [`player-win.mp4`](previews/player-win.mp4), and [`player-loss.mp4`](previews/player-loss.mp4). They show the dealer without the table; the live game uses the same Remotion compositions over the existing felt.
