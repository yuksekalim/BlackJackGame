# Blackjack Game

A single-player browser blackjack game built around a distinctive Japanese-inspired card deck and polished, responsive card handling. The game uses virtual chips only.

**Status:** playable MVP on `codex/blackjack-mvp`. The original scalable deck has received a detail and readability pass.

## Agreed Baseline

- Six-deck blackjack; natural blackjack pays 3:2.
- Dealer stands on soft 17.
- Custom five-card house rule: a side reaching five cards at 21 or below wins the round; a fifth-card bust loses.
- Player actions: hit, stand, double, and split.
- Insurance and surrender are outside the first release.
- Desktop and mobile layouts, readable cards, quick controls, animation speed control, and reduced-motion support are product goals.

The detailed edge rules for splitting and doubling are tracked in [Rules](docs/RULES.md). The browser game uses TypeScript, React, and Vite. It includes virtual-chip betting, full rounds, keyboard controls, speed settings, and reduced-motion support. Cards fly from a live point on the new [Higgsfield-generated dealer’s](assets/dealer/README.md) moving card hand in engine event order; the dealer reveals the hidden card before drawing, and outcomes appear after the sequence. Her arms move separately from the illustrated body for dealing and reveal gestures. The 10, 50, 100, and 500 chip controls select the amount used by both the + and − bet buttons. Chip counts and net round results also animate. Richer chip travel remains in the backlog.

## Deck Direction

Alim selected a Japanese-inspired card sheet with warm ivory faces, navy and red suits, and illustrated court cards. The supplied sheet is a 735 × 1165 JPEG with individual cards about 87 pixels wide; it cannot provide crisp enlarged cards. The Deck and UI agent created an [original SVG deck](assets/cards/README.md) with [52 faces and a matching back](assets/cards/contact-sheet.png). Alim accepted this deck for the first release. See [Art Direction](docs/ART_DIRECTION.md) for the asset plan.

## Project Documents

- [Agent instructions](AGENTS.md): responsibilities and collaboration rules
- [Product brief](docs/PRODUCT.md): experience and acceptance criteria
- [Rules](docs/RULES.md): agreed rules and open edge cases
- [Architecture](docs/ARCHITECTURE.md): proposed application boundaries
- [Art direction](docs/ART_DIRECTION.md): deck reference and production approach
- [Backlog](BACKLOG.md): prioritized outcomes
- [Tasks](TASKS.md): current work and handoffs

## Local Development

Use Node.js 22.12+ or a newer compatible release.

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
```

The local preview runs at `http://localhost:5173/` by default. The app is playable on the `codex/blackjack-mvp` branch. Betting, actions, and round results sit on the felt between the dealer and player hands. The desktop table is sized to keep the bankroll, cards, controls, and result together on screen; narrow phones use a vertical layout. All 36 automated rule, presentation, and result tests, the production build, and lint pass. Browser checks covered 1710×952, 1366×768, 1280×720, 1024×768, 900×700, and 800×900 desktop sizes plus 320×700 mobile, including live deal and settlement. Previous gameplay and motion updates also received independent QA. The current dealer art is ready for Alim’s visual review. Full end-to-end outcome coverage is tracked in [Tasks](TASKS.md).
