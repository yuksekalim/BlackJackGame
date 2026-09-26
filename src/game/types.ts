export const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'] as const
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const

export type Suit = (typeof SUITS)[number]
export type Rank = (typeof RANKS)[number]
export type Phase = 'betting' | 'player' | 'dealer' | 'settled'
export type Outcome = 'blackjack' | 'win' | 'loss' | 'push'

export interface Card {
  suit: Suit
  rank: Rank
}

export interface PlayerHand {
  id: string
  cards: Card[]
  bet: number
  fromSplit: boolean
  doubled: boolean
  status: 'playing' | 'stood' | 'busted' | 'settled'
  outcome?: Outcome
  payout?: number
}

export interface GameState {
  phase: Phase
  bankroll: number
  selectedBet: number
  shoe: Card[]
  dealerCards: Card[]
  dealerHoleHidden: boolean
  hands: PlayerHand[]
  activeHandIndex: number | null
  roundNumber: number
  message: string
}

export type GameAction =
  | { type: 'SET_BET'; amount: number }
  | { type: 'DEAL' }
  | { type: 'HIT' }
  | { type: 'STAND' }
  | { type: 'DOUBLE' }
  | { type: 'SPLIT' }
  | { type: 'NEXT_ROUND' }
  | { type: 'NEW_GAME' }

export type GameEvent =
  | { type: 'round-started'; roundNumber: number }
  | { type: 'bet-placed'; amount: number; handId: string }
  | { type: 'card-dealt'; recipient: 'dealer' | 'player'; card: Card; handId?: string; faceDown: boolean }
  | { type: 'hole-revealed'; card: Card }
  | { type: 'turn-changed'; handId: string }
  | { type: 'hand-settled'; handId: string; outcome: Outcome; payout: number }
  | { type: 'round-ended' }

export interface GameTransition {
  state: GameState
  events: GameEvent[]
}

export interface GameOptions {
  initialBankroll?: number
  /** Cards are drawn from index 0. Use this to set a deterministic shoe in tests. */
  shoe?: Card[]
  /** Return a floating point number in [0, 1); production defaults to browser crypto. */
  random?: () => number
}
