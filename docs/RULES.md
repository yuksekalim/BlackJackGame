# Blackjack Rules

## Agreed by Alim

| Rule | First-release decision |
| --- | --- |
| Shoe | Six standard 52-card decks |
| Natural blackjack | Pays 3:2 |
| Dealer soft 17 | Dealer stands |
| Player actions | Hit, stand, double, split |
| Insurance and surrender | Not included initially |
| Wagers | Virtual chips only |

Display these rules in the game. The rules engine must be deterministic under an injected shuffle/random source for testing.

## Proposed Defaults to Finalize Before Engine Work

- A natural is an initial two-card ace plus ten-value card; a 21 after splitting is an ordinary 21.
- Dealer checks for a natural before player actions. If both have naturals, the hand pushes.
- Double is allowed on the first two cards of a hand, including a split hand; it draws exactly one card and then stands.
- Split once into two hands when the initial ranks match. Split aces receive one card each and then stand. No resplitting in the first release.
- Dealer draws to 17 and stands on all 17s. Compare each surviving player hand independently; a tie pushes.
- Shoe reshuffle threshold, minimum/maximum bet, starting bankroll, and bankroll reset behavior remain open product settings.

These detailed defaults are proposals, not yet approved rules. Record any change here before implementation and mirror it in the in-game rules panel and tests.
