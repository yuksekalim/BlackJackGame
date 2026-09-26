# Tasks and Handoffs

States: `ready`, `blocked`, `in progress`, `review`, `done`. Dora updates ownership and state as the work starts. Planned owners are roles, not running agents.

| ID | Backlog | Planned owner | State | Dependency / next evidence |
| --- | --- | --- | --- | --- |
| T-00 | — | Dora | done | Repository guidance, product, rules, architecture, art, backlog, and task documents created and checked |
| T-01 | B-01 | Dora + Alim | done | Browser platform and detailed MVP rule defaults recorded; original scalable deck accepted |
| T-02 | B-02 | Dora | done | TypeScript, React, Vite, and Vitest scaffolded; build, lint, and preview verified |
| T-03 | B-03 | Gameplay agent | done | Engine integrated; 22 deterministic tests cover naturals, totals, payouts, dealer soft/hard 17, busts, double, split, and 21 progression |
| T-04 | B-04 | Deck and UI agent | done | 52 original SVG faces, one back, generator, and preview delivered; Dora verified rendering; Alim accepted the prototype |
| T-05 | B-05 | Deck and UI agent | done | Responsive table, bets, legal controls, rules panel, and keyboard shortcuts integrated; desktop and 320px browser checks passed |
| T-06 | B-06 | Motion agent | done | Ordered deal and Stand sequences, dealer reveal, chip-count and result motion integrated; 4 presentation tests and browser sequence checks passed; richer chip travel is later polish |
| T-07 | B-07 | Dora | in progress | Browser playthroughs covered loss, bust, push, stand, double, replay, keyboard, and mobile; finish full outcome and animation review |
| T-08 | B-07 | QA agent | done | Independent audit found 21 progression and duplicate card announcements; both fixed and re-reviewed; 22 tests and lint pass |
| T-09 | B-08 | Motion agent | ready | Optional after first playable release |
| T-10 | B-09 | Dora + UI agent | ready | Optional after first playable release |
| T-11 | B-04 / B-05 | Deck and UI agent + Dora | done | 12 court faces and card back refined; 52 face SVGs verified; enlarged card and total sizes checked at desktop and 320px mobile without page overflow |
| T-12 | B-05 / B-06 | Dealer figure agent + Dora | done | Original animated dealer figure and hand-sourced card flight integrated; desktop and 320px checks, reduced-motion CSS, build, lint, and independent QA passed |
| T-13 | B-05 | Dora | done | Centered player cards and net chip result banner verified in live win/loss rounds and at 320px; 2 result tests and independent QA passed |
| T-14 | B-03 | Gameplay agent + Dora | done | Custom first-side-to-five rule, fifth-card bust precedence, split settlement, UI copy, and docs verified by 6 rule tests and independent QA |

## Handoff Format

For each completed task, report: changed files; behavior delivered; checks run with results; remaining risks; any shared contract change. Dora reviews and moves the task to `done` only after the evidence is checked.
