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
| T-06 | B-06 | Motion agent | in progress | Deal/flip/stagger, chip-count, and result-entry motion integrated; speed and reduced-motion paths implemented; richer chip travel and timing review remain |
| T-07 | B-07 | Dora | in progress | Browser playthroughs covered loss, bust, push, stand, double, replay, keyboard, and mobile; finish full outcome and animation review |
| T-08 | B-07 | QA agent | done | Independent audit found 21 progression and duplicate card announcements; both fixed and re-reviewed; 22 tests and lint pass |
| T-09 | B-08 | Motion agent | ready | Optional after first playable release |
| T-10 | B-09 | Dora + UI agent | ready | Optional after first playable release |

## Handoff Format

For each completed task, report: changed files; behavior delivered; checks run with results; remaining risks; any shared contract change. Dora reviews and moves the task to `done` only after the evidence is checked.
