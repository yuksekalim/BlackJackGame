# Agent Instructions

This repository is the source of truth for the Blackjack Game. Read `README.md`, `TASKS.md`, and the relevant file under `docs/` before changing code. Read the current contents of every existing file before editing it.

## Goal

Build a responsive, single-player blackjack game with correct rules, a distinctive Japanese-inspired deck, and smooth, controllable card motion. Use virtual chips only. The reference JPEG is a style reference, not a production asset; see `docs/ART_DIRECTION.md`.

## Team and Ownership

| Role | Primary responsibility | Planned files |
| --- | --- | --- |
| Dora, main agent | Product decisions, contracts, repository setup, integration, review, and release verification | Shared configuration and documentation |
| Gameplay agent | Pure rules, state transitions, shuffle, and rule tests | `src/game/`, `tests/game/` |
| Deck and UI agent | Owns the deck-quality fix: original scalable card artwork, uniform back, size checks; later table, controls, responsive layout, accessibility | `src/ui/`, `assets/cards/` |
| Motion agent | Deal, flip, chip, and result animations; reduced motion and interruption behavior | `src/motion/`, motion-specific tests |
| QA agent | Independent rules, interaction, visual, and accessibility review after integration | Test reports; fixes only after coordination |

The paths are planned boundaries; the main agent may adjust them when the application is scaffolded. An agent must not edit another agent's area or a shared contract without coordinating with Dora. All subagents requested for this project use GPT-6 Luna at max effort. Run no more than three specialists alongside Dora; QA follows the build phase.

## Working Contract

1. Take one bounded task from `TASKS.md`; state the intended files and acceptance checks before editing.
2. Keep gameplay outcomes in the pure game engine. UI and motion consume its state or events and never determine cards, payouts, or legal actions.
3. Use original or properly licensed assets. Never commit the low-resolution reference JPEG as a card sprite sheet.
   The Deck and UI agent resolves the image-quality problem by delivering sharp production assets, not by enlarging the reference JPEG.
4. Keep animation optional, interruptible, and consistent with reduced-motion preferences.
5. Add meaningful tests for rule changes and verify behavior in a running browser for interface changes.
6. Report changed files, checks run, known limits, and any contract change to Dora. Update `TASKS.md` as work moves between states.

Do not claim a test, visual check, license, or deployment succeeded unless it was actually verified. Do not publish or deploy without Alim's direction.
