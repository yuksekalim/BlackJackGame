# Architecture

Build a browser application with TypeScript, Vite, and React. Keep the rules engine framework-independent so it can be tested and reused.

## Boundaries

1. **Game engine (`src/game/`):** immutable or clearly controlled state transitions for betting, dealing, player actions, dealer play, and settlement. Inject the random source so tests can control the shoe.
2. **UI (`src/ui/`):** renders authoritative state, communicates legal actions, and handles mouse, touch, and keyboard input. No duplicated hand-total or payout logic.
3. **Motion (`src/motion/`):** consumes ordered engine events to stage card entrances and the hole-card reveal with Web Animations, plus chip-count and result feedback with CSS. The presentation hook gates visible cards and settlement labels until the sequence completes. Completion or cancellation returns the UI to the authoritative state. Motion never chooses outcomes.
4. **Assets (`assets/cards/`):** original or licensed scalable card faces and one consistent back. A card component maps rank and suit to art.

## Shared Contract

`src/game/types.ts` defines the card, hand, state, action, and event types. Agents use those types without independently redefining them. The gameplay agent exports these functions from `src/game/index.ts`:

- `createGame(options?: GameOptions): GameState`
- `applyAction(state: GameState, action: GameAction, random?: () => number): GameTransition`
- `getLegalActions(state: GameState): GameAction['type'][]`
- `scoreHand(cards: Card[]): { total: number; soft: boolean; busted: boolean }`

The shoe draws from index 0. `applyAction` returns a new authoritative state and ordered events. Invalid actions leave the state unchanged and return no events; controls also disable them with `getLegalActions`. Production shuffling uses a browser cryptographic random source. A test can inject a fixed shoe or random function.

The UI component `src/ui/BlackjackTable.tsx` accepts `{ state, legalActions, onAction, speed, onSpeedChange, presentation }`. `onAction` accepts a `GameAction`. The root `App.tsx` applies an action once, passes the before-state and engine transition into `useCardPresentation`, and renders the authoritative target state through its staged presentation.

`src/motion/AnimatedCard.tsx` accepts a `Card`, a stable card ID, a `hidden` flag for the dealer hole card, and a speed value of `normal`, `fast`, or `instant`. It loads the committed SVG assets and renders the same authoritative card immediately when motion is reduced or skipped. The UI uses this component for every card. `src/motion/card-presentation.ts` consumes ordered `card-dealt` and `hole-revealed` events, with instant and reduced-motion fast-forward. `motion-feedback.css` supplies chip-count and result-entry effects through UI classes and the same speed setting. No motion component changes game state.

## Verification

Test rule boundaries with seeded shoes: naturals, soft totals, dealer soft 17, busts, pushes, double, split, and payout rounding. Browser verification covers responsive layout, keyboard/touch play, reduced motion, fast repeated input, and interrupted animations. Keep UI tests focused on real behavior rather than mirroring implementation details.
