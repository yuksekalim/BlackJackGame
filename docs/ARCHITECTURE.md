# Architecture

Build a browser application with TypeScript, Vite, and React. Keep the rules engine framework-independent so it can be tested and reused.

## Boundaries

1. **Game engine (`src/game/`):** immutable or clearly controlled state transitions for betting, dealing, player actions, dealer play, and settlement. Inject the random source so tests can control the shoe.
2. **UI (`src/ui/`):** renders authoritative state, communicates legal actions, and handles mouse, touch, and keyboard input. No duplicated hand-total or payout logic.
3. **Motion (`src/motion/`):** consumes ordered game events and animates rendered cards/chips. Completion or cancellation returns the UI to the authoritative state. It never chooses outcomes.
4. **Assets (`assets/cards/`):** original or licensed scalable card faces and one consistent back. A card component maps rank and suit to art.

## Shared Contract

`src/game/types.ts` defines the card, hand, state, action, and event types. Agents use those types without independently redefining them. The gameplay agent exports these functions from `src/game/index.ts`:

- `createGame(options?: GameOptions): GameState`
- `applyAction(state: GameState, action: GameAction, random?: () => number): GameTransition`
- `getLegalActions(state: GameState): GameAction['type'][]`
- `scoreHand(cards: Card[]): { total: number; soft: boolean; busted: boolean }`

The shoe draws from index 0. `applyAction` returns a new authoritative state and ordered events. Invalid actions leave the state unchanged and return no events; controls also disable them with `getLegalActions`. Production shuffling uses a browser cryptographic random source. A test can inject a fixed shoe or random function.

The Deck and UI agent builds `src/ui/BlackjackTable.tsx` with props `{ state, legalActions, onAction, speed, onSpeedChange }`. `onAction` accepts a `GameAction`. The main agent owns the small root `App.tsx` integration.

The Motion agent builds `src/motion/AnimatedCard.tsx` and accompanying CSS. It accepts a `Card`, a stable card ID, a `hidden` flag for the dealer hole card, and a speed value of `normal`, `fast`, or `instant`. It loads the committed SVG assets and renders the same authoritative card immediately when motion is reduced or skipped. The UI agent uses this component for every visible card. Additional chip/result effects may use the ordered events. No motion component changes game state.

## Verification

Test rule boundaries with seeded shoes: naturals, soft totals, dealer soft 17, busts, pushes, double, split, and payout rounding. Browser verification covers responsive layout, keyboard/touch play, reduced motion, fast repeated input, and interrupted animations. Keep UI tests focused on real behavior rather than mirroring implementation details.
