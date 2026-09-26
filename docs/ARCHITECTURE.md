# Architecture Proposal

The browser application is proposed as TypeScript with Vite and React. Confirm the platform before scaffolding. Keep the rules engine framework-independent so it can be tested and reused.

## Boundaries

1. **Game engine (`src/game/`):** immutable or clearly controlled state transitions for betting, dealing, player actions, dealer play, and settlement. Inject the random source so tests can control the shoe.
2. **UI (`src/ui/`):** renders authoritative state, communicates legal actions, and handles mouse, touch, and keyboard input. No duplicated hand-total or payout logic.
3. **Motion (`src/motion/`):** consumes ordered game events and animates rendered cards/chips. Completion or cancellation returns the UI to the authoritative state. It never chooses outcomes.
4. **Assets (`assets/cards/`):** original or licensed scalable card faces and one consistent back. A card component maps rank and suit to art.

## Shared Contract to Define Before Parallel Coding

- Card, rank, suit, hand, wager, round phase, legal action, and result types.
- Command inputs and ordered domain events such as `cardDealt`, `holeCardRevealed`, `handSettled`.
- State snapshot semantics for interrupted animations and instant/reduced-motion mode.
- Error behavior for illegal or repeated actions.

## Verification

Test rule boundaries with seeded shoes: naturals, soft totals, dealer soft 17, busts, pushes, double, split, and payout rounding. Browser verification covers responsive layout, keyboard/touch play, reduced motion, fast repeated input, and interrupted animations. Keep UI tests focused on real behavior rather than mirroring implementation details.
