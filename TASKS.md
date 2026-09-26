# Tasks and Handoffs

States: `ready`, `blocked`, `in progress`, `review`, `done`. Dora updates ownership and state as the work starts. Planned owners are roles, not running agents.

| ID | Backlog | Planned owner | State | Dependency / next evidence |
| --- | --- | --- | --- | --- |
| T-00 | — | Dora | done | Repository guidance, product, rules, architecture, art, backlog, and task documents created and checked |
| T-01 | B-01 | Dora + Alim | done | Browser platform and detailed MVP rule defaults recorded; original scalable deck accepted |
| T-02 | B-02 | Dora | done | TypeScript, React, Vite, and Vitest scaffolded; build and lint passed; preview server returned HTTP 200; gameplay tests pending T-03 |
| T-03 | B-03 | Gameplay agent | in progress | Implement shared engine contract and deterministic rule tests |
| T-04 | B-04 | Deck and UI agent | done | 52 original SVG faces, one back, generator, and preview delivered; Dora verified rendering; Alim accepted the prototype |
| T-05 | B-05 | Deck and UI agent | in progress | Build responsive table from shared types and AnimatedCard contract; deliver keyboard/touch controls |
| T-06 | B-06 | Motion agent | in progress | Build AnimatedCard and motion CSS with reduced-motion and interruption behavior |
| T-07 | B-07 | Dora | blocked | T-03 through T-06; integrate and run end-to-end playthroughs |
| T-08 | B-07 | QA agent | blocked | T-07; report reproducible defects and independent verification |
| T-09 | B-08 | Motion agent | ready | Optional after first playable release |
| T-10 | B-09 | Dora + UI agent | ready | Optional after first playable release |

## Handoff Format

For each completed task, report: changed files; behavior delivered; checks run with results; remaining risks; any shared contract change. Dora reviews and moves the task to `done` only after the evidence is checked.
