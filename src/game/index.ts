import { RANKS, SUITS } from './types'
import type {
  Card,
  GameAction,
  GameEvent,
  GameOptions,
  GameState,
  GameTransition,
  Outcome,
  PlayerHand,
  Rank,
} from './types'

const DECK_COUNT = 6
const MIN_CARDS_BEFORE_ROUND = 52
const DEFAULT_BANKROLL = 1_000
const DEFAULT_BET = 100

type ContestSide = 'player' | 'dealer'

/**
 * House-rule policy: the first side to reach five cards wins the whole round
 * when that five-card hand totals 21 or less. If its fifth card busts, the
 * other side wins. A split hand reaching five resolves the player side, so all
 * committed hands share the round outcome.
 */
const FIVE_CARD_RULE = {
  cardCount: 5,
  appliesTo: ['player', 'dealer'] as const,
} as const

/** Create a new betting state and a shuffled six-deck shoe. */
export function createGame(options: GameOptions = {}): GameState {
  const bankroll = isNonNegativeInteger(options.initialBankroll)
    ? options.initialBankroll
    : DEFAULT_BANKROLL
  const random = options.random ?? secureRandom
  const shoe = options.shoe
    ? copyCards(options.shoe)
    : createShuffledShoe(random)
  const affordableDefaultBet = Math.floor(bankroll / 10) * 10
  const selectedBet = Math.max(
    10,
    Math.min(DEFAULT_BET, affordableDefaultBet || 10),
  )

  return {
    phase: 'betting',
    bankroll,
    selectedBet,
    shoe,
    dealerCards: [],
    dealerHoleHidden: true,
    hands: [],
    activeHandIndex: null,
    roundNumber: 0,
    message: 'Choose your bet to start.',
  }
}

/** Apply one action. Invalid actions preserve the exact state object and emit nothing. */
export function applyAction(
  state: GameState,
  action: GameAction,
  random: () => number = secureRandom,
): GameTransition {
  switch (action.type) {
    case 'SET_BET':
      if (
        state.phase !== 'betting' ||
        !isAllowedBet(action.amount, state.bankroll)
      ) {
        return unchanged(state)
      }
      return {
        state: { ...state, selectedBet: action.amount, message: `Bet set to ${action.amount}.` },
        events: [],
      }

    case 'DEAL':
      if (
        state.phase !== 'betting' ||
        !isAllowedBet(state.selectedBet, state.bankroll)
      ) {
        return unchanged(state)
      }
      return dealRound(state, random)

    case 'HIT':
      return applyHit(state)

    case 'STAND':
      return applyStand(state)

    case 'DOUBLE':
      return applyDouble(state)

    case 'SPLIT':
      return applySplit(state)

    case 'NEXT_ROUND':
      if (state.phase !== 'settled') return unchanged(state)
      return {
        state: {
          ...state,
          phase: 'betting',
          shoe: state.shoe.length < MIN_CARDS_BEFORE_ROUND
            ? createShuffledShoe(random)
            : state.shoe,
          dealerCards: [],
          dealerHoleHidden: true,
          hands: [],
          activeHandIndex: null,
          message: 'Choose your bet for the next round.',
        },
        events: [],
      }

    case 'NEW_GAME':
      return { state: createGame({ random }), events: [] }
  }
}

/** Return the action types currently available to the player. */
export function getLegalActions(state: GameState): GameAction['type'][] {
  const actions: GameAction['type'][] = []

  if (state.phase === 'betting') {
    if (state.bankroll >= 10) actions.push('SET_BET')
    if (isAllowedBet(state.selectedBet, state.bankroll)) actions.push('DEAL')
  } else if (state.phase === 'player') {
    const hand = getActiveHand(state)
    if (hand?.status === 'playing') {
      actions.push('HIT', 'STAND')
      if (
        hand.cards.length === 2 &&
        !hand.doubled &&
        state.bankroll >= hand.bet
      ) {
        actions.push('DOUBLE')
      }
      if (
        canSplit(state, hand) &&
        state.bankroll >= hand.bet
      ) {
        actions.push('SPLIT')
      }
    }
  } else if (state.phase === 'settled') {
    actions.push('NEXT_ROUND')
  }

  actions.push('NEW_GAME')
  return actions
}

/** Score aces as 11 where possible, then reduce them to 1 to avoid a bust. */
export function scoreHand(cards: Card[]): {
  total: number
  soft: boolean
  busted: boolean
} {
  let total = 0
  let aces = 0

  for (const card of cards) {
    if (card.rank === 'A') {
      total += 11
      aces += 1
    } else {
      total += cardValue(card.rank)
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }

  return {
    total,
    soft: aces > 0,
    busted: total > 21,
  }
}

function dealRound(state: GameState, random: () => number): GameTransition {
  let shoe = state.shoe
  if (shoe.length < MIN_CARDS_BEFORE_ROUND) {
    shoe = createShuffledShoe(random)
  }
  if (shoe.length < 4) return unchanged(state)

  const roundNumber = state.roundNumber + 1
  const handId = `round-${roundNumber}-hand-1`
  const cards = shoe.slice(0, 4)
  const playerCards = [cards[0], cards[2]]
  const dealerCards = [cards[1], cards[3]]
  const hand: PlayerHand = {
    id: handId,
    cards: playerCards,
    bet: state.selectedBet,
    fromSplit: false,
    doubled: false,
    status: 'playing',
  }

  let nextState: GameState = {
    ...state,
    phase: 'player',
    bankroll: state.bankroll - state.selectedBet,
    shoe: shoe.slice(4),
    dealerCards,
    dealerHoleHidden: true,
    hands: [hand],
    activeHandIndex: 0,
    roundNumber,
    message: 'Your turn.',
  }
  const events: GameEvent[] = [
    { type: 'round-started', roundNumber },
    { type: 'bet-placed', amount: state.selectedBet, handId },
    { type: 'card-dealt', recipient: 'player', card: playerCards[0], handId, faceDown: false },
    { type: 'card-dealt', recipient: 'dealer', card: dealerCards[0], faceDown: false },
    { type: 'card-dealt', recipient: 'player', card: playerCards[1], handId, faceDown: false },
    { type: 'card-dealt', recipient: 'dealer', card: dealerCards[1], faceDown: true },
  ]

  const playerNatural = isNatural(hand)
  const dealerNatural = isDealerNatural(dealerCards)

  if (dealerNatural) {
    nextState = { ...nextState, dealerHoleHidden: false }
    events.push({ type: 'hole-revealed', card: dealerCards[1] })
    return settleHands(
      nextState,
      () => playerNatural ? 'push' : 'loss',
      events,
      playerNatural
        ? 'Both you and the dealer have blackjack. The hand is a push.'
        : 'The dealer has blackjack. You lose this hand.',
    )
  }

  if (playerNatural) {
    nextState = { ...nextState, dealerHoleHidden: false }
    events.push({ type: 'hole-revealed', card: dealerCards[1] })
    return settleHands(
      nextState,
      () => 'blackjack',
      events,
      'Blackjack! You are paid 3:2.',
    )
  }

  events.push({ type: 'turn-changed', handId })
  return { state: nextState, events }
}

function applyHit(state: GameState): GameTransition {
  const handIndex = state.activeHandIndex
  const hand = getActiveHand(state)
  if (
    state.phase !== 'player' ||
    handIndex === null ||
    !hand ||
    hand.status !== 'playing' ||
    state.shoe.length < 1
  ) {
    return unchanged(state)
  }

  const [card, ...shoe] = state.shoe
  const cards = [...hand.cards, card]
  const score = scoreHand(cards)
  const busted = score.busted
  const reachedTwentyOne = score.total === 21
  const hands = replaceHand(state.hands, handIndex, {
    ...hand,
    cards,
    status: busted ? 'busted' : reachedTwentyOne ? 'stood' : 'playing',
  })
  const nextState: GameState = {
    ...state,
    shoe,
    hands,
    message: busted
      ? 'You busted.'
      : reachedTwentyOne
        ? 'You have 21 and stand.'
        : 'Card dealt. Your turn.',
  }
  const events: GameEvent[] = [
    { type: 'card-dealt', recipient: 'player', card, handId: hand.id, faceDown: false },
  ]

  const fiveCardWinner = getFiveCardWinner('player', cards)
  if (fiveCardWinner) {
    return settleFiveCardRound(nextState, 'player', fiveCardWinner, events)
  }

  return busted || reachedTwentyOne
    ? continueAfterPlayerHand(nextState, events)
    : { state: nextState, events }
}

function applyStand(state: GameState): GameTransition {
  const handIndex = state.activeHandIndex
  const hand = getActiveHand(state)
  if (
    state.phase !== 'player' ||
    handIndex === null ||
    !hand ||
    hand.status !== 'playing'
  ) {
    return unchanged(state)
  }

  return continueAfterPlayerHand(
    {
      ...state,
      hands: replaceHand(state.hands, handIndex, { ...hand, status: 'stood' }),
      message: 'You stand.',
    },
    [],
  )
}

function applyDouble(state: GameState): GameTransition {
  const handIndex = state.activeHandIndex
  const hand = getActiveHand(state)
  if (
    state.phase !== 'player' ||
    handIndex === null ||
    !hand ||
    hand.status !== 'playing' ||
    hand.cards.length !== 2 ||
    hand.doubled ||
    state.bankroll < hand.bet ||
    state.shoe.length < 1
  ) {
    return unchanged(state)
  }

  const [card, ...shoe] = state.shoe
  const cards = [...hand.cards, card]
  const busted = scoreHand(cards).busted
  const hands = replaceHand(state.hands, handIndex, {
    ...hand,
    cards,
    bet: hand.bet * 2,
    doubled: true,
    status: busted ? 'busted' : 'stood',
  })
  const nextState: GameState = {
    ...state,
    bankroll: state.bankroll - hand.bet,
    shoe,
    hands,
    message: busted ? 'You doubled and busted.' : 'You doubled and stand.',
  }
  const events: GameEvent[] = [
    { type: 'bet-placed', amount: hand.bet, handId: hand.id },
    { type: 'card-dealt', recipient: 'player', card, handId: hand.id, faceDown: false },
  ]
  return continueAfterPlayerHand(nextState, events)
}

function applySplit(state: GameState): GameTransition {
  const handIndex = state.activeHandIndex
  const hand = getActiveHand(state)
  if (
    state.phase !== 'player' ||
    handIndex === null ||
    handIndex !== 0 ||
    !hand ||
    hand.status !== 'playing' ||
    !canSplit(state, hand) ||
    state.bankroll < hand.bet ||
    state.shoe.length < 2
  ) {
    return unchanged(state)
  }

  const [firstDraw, secondDraw, ...shoe] = state.shoe
  const firstCard = hand.cards[0]
  const secondCard = hand.cards[1]
  const splitHandId = `${hand.id}-split`
  const splittingAces = firstCard.rank === 'A'
  const firstCards = [firstCard, firstDraw]
  const secondCards = [secondCard, secondDraw]
  const firstHand: PlayerHand = {
    ...hand,
    cards: firstCards,
    fromSplit: true,
    doubled: false,
    status: splittingAces || scoreHand(firstCards).total === 21 ? 'stood' : 'playing',
  }
  const secondHand: PlayerHand = {
    id: splitHandId,
    cards: secondCards,
    bet: hand.bet,
    fromSplit: true,
    doubled: false,
    status: splittingAces || scoreHand(secondCards).total === 21 ? 'stood' : 'playing',
  }
  const nextState: GameState = {
    ...state,
    bankroll: state.bankroll - hand.bet,
    shoe,
    hands: [firstHand, secondHand],
    activeHandIndex: null,
    message: splittingAces ? 'Split aces receive one card each.' : 'Choose an action for your first hand.',
  }
  const events: GameEvent[] = [
    { type: 'bet-placed', amount: hand.bet, handId: splitHandId },
    { type: 'card-dealt', recipient: 'player', card: firstDraw, handId: hand.id, faceDown: false },
    { type: 'card-dealt', recipient: 'player', card: secondDraw, handId: splitHandId, faceDown: false },
  ]

  return continueAfterPlayerHand(nextState, events)
}

function continueAfterPlayerHand(
  state: GameState,
  events: GameEvent[],
): GameTransition {
  const nextIndex = state.hands.findIndex((hand) => hand.status === 'playing')
  if (nextIndex >= 0) {
    const hand = state.hands[nextIndex]
    return {
      state: {
        ...state,
        phase: 'player',
        activeHandIndex: nextIndex,
        message: `Play hand ${nextIndex + 1}.`,
      },
      events: [...events, { type: 'turn-changed', handId: hand.id }],
    }
  }

  if (state.hands.every((hand) => hand.status === 'busted')) {
    return settleHands(state, () => 'loss', events, 'All hands busted. Round over.')
  }

  return beginDealerTurn(state, events)
}

function beginDealerTurn(
  state: GameState,
  priorEvents: GameEvent[],
): GameTransition {
  if (state.hands.every((hand) => hand.status === 'busted')) {
    return settleHands(state, () => 'loss', priorEvents, 'All hands busted. Round over.')
  }

  const dealerHole = state.dealerCards[1]
  let nextState: GameState = {
    ...state,
    phase: 'dealer',
    activeHandIndex: null,
    dealerHoleHidden: false,
    message: 'Dealer plays.',
  }
  const events = [...priorEvents]
  if (state.dealerHoleHidden && dealerHole) {
    events.push({ type: 'hole-revealed', card: dealerHole })
  }

  let shoe = nextState.shoe
  let dealerCards = nextState.dealerCards
  let fiveCardWinner: ContestSide | null = null
  while (scoreHand(dealerCards).total < 17 && shoe.length > 0) {
    const [card, ...remaining] = shoe
    shoe = remaining
    dealerCards = [...dealerCards, card]
    events.push({ type: 'card-dealt', recipient: 'dealer', card, faceDown: false })
    fiveCardWinner = getFiveCardWinner('dealer', dealerCards)
    if (fiveCardWinner) {
      break
    }
  }
  nextState = { ...nextState, shoe, dealerCards }

  if (fiveCardWinner) {
    return settleFiveCardRound(nextState, 'dealer', fiveCardWinner, events)
  }

  const dealerScore = scoreHand(dealerCards)
  return settleHands(
    nextState,
    (hand) => compareHandToDealer(hand, dealerScore),
    events,
    dealerScore.busted ? 'Dealer busted. Round settled.' : 'Round settled.',
  )
}

function settleHands(
  state: GameState,
  outcomeFor: (hand: PlayerHand) => Outcome,
  priorEvents: GameEvent[],
  message: string,
): GameTransition {
  let bankroll = state.bankroll
  const events = [...priorEvents]
  const hands = state.hands.map((hand): PlayerHand => {
    const outcome = outcomeFor(hand)
    const payout = payoutFor(hand.bet, outcome)
    bankroll += payout
    events.push({ type: 'hand-settled', handId: hand.id, outcome, payout })
    return { ...hand, status: 'settled', outcome, payout }
  })
  events.push({ type: 'round-ended' })

  return {
    state: {
      ...state,
      phase: 'settled',
      bankroll,
      hands,
      activeHandIndex: null,
      message,
    },
    events,
  }
}

function settleFiveCardRound(
  state: GameState,
  fiveCardSide: ContestSide,
  winner: ContestSide,
  priorEvents: GameEvent[],
): GameTransition {
  const winningOutcome: Outcome = winner === 'player' ? 'win' : 'loss'
  const message = fiveCardSide === 'player'
    ? winner === 'dealer'
      ? 'You busted on your fifth card. The dealer wins the round.'
      : 'You reached five cards without busting and win the round.'
    : winner === 'player'
      ? 'The dealer busted on its fifth card. You win the round.'
      : 'The dealer reached five cards without busting and wins the round.'
  return settleHands(state, () => winningOutcome, priorEvents, message)
}

function getFiveCardWinner(side: ContestSide, cards: Card[]): ContestSide | null {
  if (
    cards.length < FIVE_CARD_RULE.cardCount ||
    !FIVE_CARD_RULE.appliesTo.includes(side)
  ) {
    return null
  }
  return scoreHand(cards).busted
    ? side === 'player' ? 'dealer' : 'player'
    : side
}

function compareHandToDealer(hand: PlayerHand, dealer: ReturnType<typeof scoreHand>): Outcome {
  const player = scoreHand(hand.cards)
  if (player.busted) return 'loss'
  if (dealer.busted || player.total > dealer.total) return 'win'
  if (player.total < dealer.total) return 'loss'
  return 'push'
}

function payoutFor(bet: number, outcome: Outcome): number {
  switch (outcome) {
    case 'blackjack':
      return Math.round(bet * 2.5)
    case 'win':
      return bet * 2
    case 'push':
      return bet
    case 'loss':
      return 0
  }
}

function isNatural(hand: PlayerHand): boolean {
  return !hand.fromSplit && isNaturalCards(hand.cards)
}

function isNaturalCards(cards: Card[]): boolean {
  return cards.length === 2 &&
    cards.some((card) => card.rank === 'A') &&
    cards.some((card) => cardValue(card.rank) === 10)
}

function isDealerNatural(cards: Card[]): boolean {
  return isNaturalCards(cards)
}

function canSplit(state: GameState, hand: PlayerHand): boolean {
  return state.hands.length === 1 &&
    !hand.fromSplit &&
    hand.cards.length === 2 &&
    hand.cards[0].rank === hand.cards[1].rank
}

function getActiveHand(state: GameState): PlayerHand | undefined {
  return state.activeHandIndex === null
    ? undefined
    : state.hands[state.activeHandIndex]
}

function replaceHand(
  hands: PlayerHand[],
  index: number,
  replacement: PlayerHand,
): PlayerHand[] {
  return hands.map((hand, handIndex) => handIndex === index ? replacement : hand)
}

function isAllowedBet(amount: number, bankroll: number): boolean {
  return Number.isInteger(amount) &&
    amount >= 10 &&
    amount % 10 === 0 &&
    amount <= bankroll
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function cardValue(rank: Rank): number {
  if (rank === 'A') return 11
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10
  return Number(rank)
}

function createShuffledShoe(random: () => number): Card[] {
  const cards: Card[] = []
  for (let deck = 0; deck < DECK_COUNT; deck += 1) {
    for (const suit of SUITS) {
      for (const rank of RANKS) cards.push({ suit, rank })
    }
  }
  return shuffle(cards, random)
}

function shuffle<T>(cards: T[], random: () => number): T[] {
  const shuffled = [...cards]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const value = random()
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError('The random source must return values in [0, 1).')
    }
    const otherIndex = Math.floor(value * (index + 1))
    ;[shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]]
  }
  return shuffled
}

function secureRandom(): number {
  const cryptoApi = globalThis.crypto
  if (!cryptoApi?.getRandomValues) {
    throw new Error('A cryptographic random source is required to shuffle the shoe.')
  }
  const values = new Uint32Array(1)
  cryptoApi.getRandomValues(values)
  return values[0] / 0x1_0000_0000
}

function copyCards(cards: Card[]): Card[] {
  return cards.map((card) => ({ suit: card.suit, rank: card.rank }))
}

function unchanged(state: GameState): GameTransition {
  return { state, events: [] }
}
