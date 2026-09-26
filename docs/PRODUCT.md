# Product Brief

## Experience

Create a blackjack table that is satisfying to play repeatedly. The visual identity centers on a Japanese-inspired illustrated deck. Dealing and chip motion should make outcomes feel tangible without slowing decisions.

## First Release

- Single-player play with virtual chips and repeatable rounds.
- Rules agreed by Alim: six decks, 3:2 natural blackjack, dealer stands on soft 17, hit, stand, double, split; no insurance or surrender initially.
- Clear current bet, bankroll, hand totals, active hand, legal actions, and result.
- Responsive desktop and mobile interaction, with keyboard access on desktop.
- Speed control, reduced-motion behavior, and a way to proceed immediately if an animation is interrupted.
- A concise in-game rules panel that matches the implementation.

## Quality Bar

- Cards and corner indices remain sharp and legible at the largest intended display size and on high-density screens.
- UI never invents a result; the game engine owns cards, totals, legal actions, and payouts.
- Rapid input, resizing, and replay do not duplicate actions or leave cards in the wrong state.
- Automated rule tests and real browser playthroughs both pass before release.

## First Implementation Decisions

- Build the first version as a browser game with TypeScript, React, and Vite.
- Use the original scalable deck Alim accepted on 2026-09-26.
- Apply the detailed MVP defaults in `RULES.md`; revisit them if Alim requests a different house rule.

Accounts, multiplayer, and real-money play are outside this release. Publishing follows a separate decision.
