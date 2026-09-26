# Tasks and Handoffs

States: `ready`, `blocked`, `in progress`, `review`, `done`. Dora updates ownership and state as the work starts. Planned owners are roles, not running agents.

| ID | Backlog | Planned owner | State | Dependency / next evidence |
| --- | --- | --- | --- | --- |
| T-00 | — | Dora | done | Repository guidance, product, rules, architecture, art, backlog, and task documents created and checked |
| T-01 | B-01 | Dora + Alim | in progress | Confirm browser platform and detailed split/double defaults; original scalable deck path is selected |
| T-02 | B-02 | Dora | blocked | T-01 platform decision; then scaffold and verify commands |
| T-03 | B-03 | Gameplay agent | blocked | Shared engine contract and T-02; deliver tests and rule summary |
| T-04 | B-04 | Deck and UI agent | review | 52 original SVG faces, one back, generator, and preview delivered; Dora verified rendering at card and enlarged sizes; Alim to review stylized court art |
| T-05 | B-05 | Deck and UI agent | blocked | T-02 and engine contract; deliver playable responsive interface |
| T-06 | B-06 | Motion agent | blocked | Event contract and card component shape; deliver motion and reduced-motion checks |
| T-07 | B-07 | Dora | blocked | T-03 through T-06; integrate and run end-to-end playthroughs |
| T-08 | B-07 | QA agent | blocked | T-07; report reproducible defects and independent verification |
| T-09 | B-08 | Motion agent | ready | Optional after first playable release |
| T-10 | B-09 | Dora + UI agent | ready | Optional after first playable release |

## Handoff Format

For each completed task, report: changed files; behavior delivered; checks run with results; remaining risks; any shared contract change. Dora reviews and moves the task to `done` only after the evidence is checked.
