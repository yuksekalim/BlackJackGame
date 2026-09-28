# HyperFrames dealer motion prototype

This isolated HyperFrames composition showcases three dealer gestures: a deal from the intact Higgsfield character, a disappointed dealer when the player wins, and a celebrating dealer when the player loses. It does not replace the Remotion Player used by the live game. All pose sprites are complete transparent figures copied from `public/dealer/`; the original illustration remains `assets/dealer/higgsfield-dealer.png`.

The root composition is 1920 × 1080, 8.4 seconds. Opaque felt-dark color dips separate scenes so no two character poses blend during a transition. Deal uses the same 42-frame / 60-fps pose order as `src/remotion/DealerMotion.tsx`. Outcome beats use the same full-pose progression. The card back comes from the production SVG deck.

From this directory:

```sh
npm run check
npm run dev
npm run render
```

The rendered review file is [`renders/dealer-gestures.mp4`](renders/dealer-gestures.mp4) (8.4 seconds, 1920 × 1080, 60 fps, high quality). The Studio project URL is `http://localhost:3002/#project/hyperframes` while the local preview server is running. Rendering requires FFmpeg and FFprobe; the supplied MP4 was encoded with the copies bundled in the parent project’s Remotion dependency.

`npm run check` passes with no runtime, layout, motion, or contrast errors. It reports four non-gating lint warnings: the three self-contained timed scene sections are suggested as sub-compositions for finer Studio rows, and the shared idle PNG appears in three scenes. The encoded 60-fps output was checked at both scene transitions and at gesture boundaries. The opaque color dips prevent blending two full-figure poses.
