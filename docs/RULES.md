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

## MVP Implementation Defaults

- A natural is an initial two-card ace plus ten-value card; a 21 after splitting is an ordinary 21.
- Dealer checks for a natural before player actions. If both have naturals, the hand pushes.
- Double is allowed on the first two cards of a hand, including a split hand; it draws exactly one card and then stands.
- Split once into two hands when the initial ranks match. Split aces receive one card each and then stand. No resplitting in the first release.
- Dealer draws to 17 and stands on all 17s. Compare each surviving player hand independently; a tie pushes.
- Start with 1,000 virtual chips. Allow bets from 10 to 500 in increments of 10, limited by available bankroll.
- Deduct each stake when committed. Return twice the stake for an ordinary win, 2.5 times for a natural blackjack, the stake for a push, and zero for a loss. A double or split commits the additional stake before it receives cards.
- Keep the shoe between rounds and reshuffle all six decks before a round when fewer than 52 cards remain. A new game resets the shoe and bankroll.
- Double or split is unavailable when the bankroll cannot cover the additional stake. Dealer play is skipped when every player hand has busted.

These are Dora's implementation choices within the accepted first-release rules, not additional rules explicitly chosen by Alim. Mirror them in the in-game rules panel and tests; revise them if Alim chooses a different house rule.
