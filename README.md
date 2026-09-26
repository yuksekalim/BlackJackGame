# Blackjack Game

A single-player browser blackjack game built around a distinctive Japanese-inspired card deck and polished, responsive card handling. The game uses virtual chips only.

**Status:** planning with an original scalable deck prototype under visual review. No application code has been added yet.

## Agreed Baseline

- Six-deck blackjack; natural blackjack pays 3:2.
- Dealer stands on soft 17.
- Player actions: hit, stand, double, and split.
- Insurance and surrender are outside the first release.
- Desktop and mobile layouts, readable cards, quick controls, animation speed control, and reduced-motion support are product goals.

The detailed edge rules for splitting and doubling are tracked in [Rules](docs/RULES.md). The browser platform and TypeScript/React/Vite stack are current proposals, pending final confirmation.

## Deck Direction

Alim selected a Japanese-inspired card sheet with warm ivory faces, navy and red suits, and illustrated court cards. The supplied sheet is a 735 × 1165 JPEG with individual cards about 87 pixels wide; it cannot provide crisp enlarged cards. The Deck and UI agent created an [original SVG deck prototype](assets/cards/README.md) with [52 faces and a matching back](assets/cards/contact-sheet.png). Its court figures are more stylized than the reference and await Alim's visual review. See [Art Direction](docs/ART_DIRECTION.md) for the asset plan.

## Project Documents

- [Agent instructions](AGENTS.md): responsibilities and collaboration rules
- [Product brief](docs/PRODUCT.md): experience and acceptance criteria
- [Rules](docs/RULES.md): agreed rules and open edge cases
- [Architecture](docs/ARCHITECTURE.md): proposed application boundaries
- [Art direction](docs/ART_DIRECTION.md): deck reference and production approach
- [Backlog](BACKLOG.md): prioritized outcomes
- [Tasks](TASKS.md): current work and handoffs

Setup and run commands will be added after the app scaffold exists.
