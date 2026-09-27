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
| T-15 | B-05 | Dora | done | Betting, actions, and result moved onto felt; live 1710×952, 1366×768, 1024×768, 900×700, 800×900, and 320×700 layouts checked; build, lint, 34 tests, and diff check pass |
| T-16 | B-03 | Gameplay agent + Dora | done | Valid fifth cards win; fifth-card busts lose for player, dealer, and split side; result copy and rules updated; deterministic tests and independent QA passed |
| T-17 | B-06 | Dealer figure agent + Dora | done | Original dealer holds/deals cards with shoulder, forearm, and wrist motion; card flight tracks the moving release point; normal, fast, instant, interruption, and independent QA checked |
| T-18 | B-03 / B-05 | Gameplay agent + Dora | done | Engine and UI permit 10-chip steps through bankroll without a fixed 500 cap; 1,000-chip live wager and engine 2,000-bankroll case verified |
| T-19 | B-05 | Dora | done | Larger player cards fit 1366×768, 1280×720, 900×700, and 320×700 checks without horizontal overflow or added desktop page height |
| T-20 | B-05 / B-06 | Dora | done | Higgsfield dealer cutout and shoulder layers integrated; cards launch from moving hand; desktop/mobile, normal/fast/instant, reduced-motion CSS, and interrupted New game checked |
| T-21 | B-05 | Deck and UI agent + Dora | done | 10/50/100/500 choice changes both + and −; browser verified selection, increment/decrement, bankroll/minimum clamps, and 320px fit |
| T-22 | B-06 | Motion agent + Dora | done | Remotion Player uses cleaned seven-layer dealer rig with frame-driven shoulder/elbow deal and reveal gestures; Studio and live normal/fast/instant, interrupted New game, hand-sourced card flight, build, lint, and 36 tests checked |

## Handoff Format

For each completed task, report: changed files; behavior delivered; checks run with results; remaining risks; any shared contract change. Dora reviews and moves the task to `done` only after the evidence is checked.
