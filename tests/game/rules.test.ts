import { describe, expect, it } from 'vitest'
import { applyAction, createGame, scoreHand } from '../../src/game/index'
import type { Card, Rank } from '../../src/game/types'

function card(rank: Rank, suit: Card['suit'] = 'clubs'): Card {
  return { rank, suit }
}

function fixedShoe(...prefix: Card[]): Card[] {
  const filler: Card[] = []
  const suits: Card['suit'][] = ['clubs', 'diamonds', 'hearts', 'spades']
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  for (const suit of suits) {
    for (const rank of ranks) filler.push(card(rank, suit))
  }
  return [...prefix, ...filler].slice(0, 52)
}

describe('scoreHand', () => {
  it('counts aces as eleven when possible and soft totals correctly', () => {
    expect(scoreHand([card('A'), card('6')])).toEqual({ total: 17, soft: true, busted: false })
    expect(scoreHand([card('A'), card('A'), card('9')])).toEqual({ total: 21, soft: true, busted: false })
    expect(scoreHand([card('A'), card('K'), card('9')])).toEqual({ total: 20, soft: false, busted: false })
  })

  it('reports busts after reducing every usable ace', () => {
    expect(scoreHand([card('A'), card('K'), card('K'), card('2')])).toEqual({ total: 23, soft: false, busted: true })
  })
})

describe('round opening and naturals', () => {
  it('creates six decks and supports deterministic shuffling', () => {
    const first = createGame({ random: () => 0.25 })
    const second = createGame({ random: () => 0.25 })
    expect(first.shoe).toHaveLength(312)
    expect(first.shoe).toEqual(second.shoe)
    expect(first.bankroll).toBe(1_000)
  })

  it('pays an initial player blackjack at 3:2 after the dealer peek', () => {
    const state = createGame({ shoe: fixedShoe(card('A'), card('9'), card('K'), card('7')) })
    const transition = applyAction(state, { type: 'DEAL' })

    expect(transition.state.phase).toBe('settled')
    expect(transition.state.bankroll).toBe(1_150)
    expect(transition.state.hands[0]).toMatchObject({
      outcome: 'blackjack',
      payout: 250,
      status: 'settled',
    })
    expect(transition.state.dealerHoleHidden).toBe(false)
    expect(transition.events).toContainEqual({ type: 'hole-revealed', card: card('7') })
  })

  it('reveals a dealer natural and pushes when both sides have blackjack', () => {
    const state = createGame({ shoe: fixedShoe(card('A'), card('A'), card('K'), card('K')) })
    const transition = applyAction(state, { type: 'DEAL' })

    expect(transition.state.phase).toBe('settled')
    expect(transition.state.bankroll).toBe(1_000)
    expect(transition.state.dealerHoleHidden).toBe(false)
    expect(transition.state.hands[0]).toMatchObject({ outcome: 'push', payout: 100 })
    expect(transition.events).toContainEqual({ type: 'hole-revealed', card: card('K') })
  })

  it('settles a non-blackjack player loss when the dealer has blackjack', () => {
    const state = createGame({ shoe: fixedShoe(card('9'), card('A'), card('8'), card('K')) })
    const transition = applyAction(state, { type: 'DEAL' })

    expect(transition.state.phase).toBe('settled')
    expect(transition.state.bankroll).toBe(900)
    expect(transition.state.hands[0]).toMatchObject({ outcome: 'loss', payout: 0 })
    expect(transition.events.some((event) => event.type === 'hole-revealed')).toBe(true)
  })

  it('makes the dealer stand on soft 17 and pushes an equal total', () => {
    const state = createGame({ shoe: fixedShoe(card('10'), card('6'), card('7'), card('A')) })
    const dealt = applyAction(state, { type: 'DEAL' })
    const transition = applyAction(dealt.state, { type: 'STAND' })

    expect(transition.state.phase).toBe('settled')
    expect(scoreHand(transition.state.dealerCards)).toEqual({ total: 17, soft: true, busted: false })
    expect(transition.state.dealerCards).toHaveLength(2)
    expect(transition.state.bankroll).toBe(1_000)
    expect(transition.state.hands[0]).toMatchObject({ outcome: 'push', payout: 100 })
  })

  it('makes the dealer stand on hard 17', () => {
    const state = createGame({ shoe: fixedShoe(card('10'), card('10'), card('7'), card('7')) })
    const dealt = applyAction(state, { type: 'DEAL' })
    const transition = applyAction(dealt.state, { type: 'STAND' })

    expect(transition.state.dealerCards).toHaveLength(2)
    expect(transition.state.dealerCards.reduce((total, current) => total + Number(current.rank), 0)).toBe(17)
    expect(transition.state.hands[0].outcome).toBe('push')
  })

  it('settles an ordinary player win and loss with the correct returned stake', () => {
    const winningState = createGame({ shoe: fixedShoe(card('10'), card('7'), card('10'), card('10')) })
    const winningDeal = applyAction(winningState, { type: 'DEAL' })
    const win = applyAction(winningDeal.state, { type: 'STAND' })
    expect(win.state.hands[0]).toMatchObject({ outcome: 'win', payout: 200 })
    expect(win.state.bankroll).toBe(1_100)

    const losingState = createGame({ shoe: fixedShoe(card('10'), card('10'), card('8'), card('9')) })
    const losingDeal = applyAction(losingState, { type: 'DEAL' })
    const loss = applyAction(losingDeal.state, { type: 'STAND' })
    expect(loss.state.hands[0]).toMatchObject({ outcome: 'loss', payout: 0 })
    expect(loss.state.bankroll).toBe(900)
  })

  it('pays an ordinary win when the dealer busts', () => {
    const state = createGame({ shoe: fixedShoe(card('10'), card('10'), card('8'), card('6'), card('10')) })
    const dealt = applyAction(state, { type: 'DEAL' })
    const transition = applyAction(dealt.state, { type: 'STAND' })

    expect(transition.state.dealerCards).toHaveLength(3)
    expect(transition.state.hands[0]).toMatchObject({ outcome: 'win', payout: 200 })
    expect(transition.state.bankroll).toBe(1_100)
  })
})

describe('five-card side rule', () => {
  it('settles for the player side at five cards before revealing or drawing for the dealer', () => {
    const state = createGame({
      shoe: fixedShoe(
        card('10'), card('10'), card('2'), card('10'),
        card('2'), card('2'), card('2'), card('A'),
      ),
    })
    const dealt = applyAction(state, { type: 'DEAL' })
    const firstHit = applyAction(dealt.state, { type: 'HIT' })
    const secondHit = applyAction(firstHit.state, { type: 'HIT' })
    const fifthCard = applyAction(secondHit.state, { type: 'HIT' })

    expect(fifthCard.state.phase).toBe('settled')
    expect(fifthCard.state.hands[0].cards).toHaveLength(5)
    expect(fifthCard.state.hands[0]).toMatchObject({ outcome: 'win', payout: 200, status: 'settled' })
    expect(fifthCard.state.dealerCards).toHaveLength(2)
    expect(fifthCard.state.dealerHoleHidden).toBe(true)
    expect(fifthCard.state.message).toBe('You reached five cards without busting and win the round.')
    expect(fifthCard.state.bankroll).toBe(1_100)
    expect(fifthCard.events.some((event) => event.type === 'hole-revealed')).toBe(false)
    expect(fifthCard.events.at(-2)).toMatchObject({ type: 'hand-settled', outcome: 'win' })
    expect(fifthCard.events.at(-1)).toEqual({ type: 'round-ended' })
  })

  it('settles a player fifth-card bust as a loss for the player side', () => {
    const state = createGame({
      shoe: fixedShoe(
        card('6'), card('6'), card('6'), card('10'),
        card('2'), card('2'), card('6'),
      ),
    })
    const dealt = applyAction(state, { type: 'DEAL' })
    const firstHit = applyAction(dealt.state, { type: 'HIT' })
    const secondHit = applyAction(firstHit.state, { type: 'HIT' })
    const fifthCard = applyAction(secondHit.state, { type: 'HIT' })

    expect(scoreHand(fifthCard.state.hands[0].cards).busted).toBe(true)
    expect(fifthCard.state.hands[0]).toMatchObject({ outcome: 'loss', payout: 0, status: 'settled' })
    expect(fifthCard.state.message).toBe('You busted on your fifth card. The dealer wins the round.')
    expect(fifthCard.state.bankroll).toBe(900)
    expect(fifthCard.state.dealerHoleHidden).toBe(true)
  })

  it.each([
    {
      fifthCard: card('2'),
      dealerBusted: false,
      dealerTotal: 18,
      outcome: 'loss',
      bankroll: 900,
      message: 'The dealer reached five cards without busting and wins the round.',
    },
    {
      fifthCard: card('K'),
      dealerBusted: true,
      dealerTotal: 26,
      outcome: 'win',
      bankroll: 1_100,
      message: 'The dealer busted on its fifth card. You win the round.',
    },
  ] as const)('resolves the dealer fifth card by its total (busted: $dealerBusted)', ({ fifthCard, dealerBusted, dealerTotal, outcome, bankroll, message }) => {
    const state = createGame({
      shoe: fixedShoe(
        card('10'), card('10'), card('4'), card('2'),
        card('6'), card('2'), card('2'), fifthCard,
      ),
    })
    const dealt = applyAction(state, { type: 'DEAL' })
    const hit = applyAction(dealt.state, { type: 'HIT' })
    const transition = applyAction(hit.state, { type: 'STAND' })

    expect(transition.state.phase).toBe('settled')
    expect(transition.state.hands[0]).toMatchObject({ outcome, payout: outcome === 'win' ? 200 : 0 })
    expect(transition.state.dealerCards).toHaveLength(5)
    expect(scoreHand(transition.state.dealerCards)).toMatchObject({ busted: dealerBusted, total: dealerTotal })
    expect(transition.state.message).toBe(message)
    expect(transition.state.bankroll).toBe(bankroll)
    expect(transition.events.at(-2)).toMatchObject({ type: 'hand-settled', outcome })
    expect(transition.events.at(-1)).toEqual({ type: 'round-ended' })
  })

  it('uses ordinary comparison when the player hand and dealer stop at four cards', () => {
    const state = createGame({
      shoe: fixedShoe(
        card('10'), card('10'), card('2'), card('2'),
        card('2'), card('4'), card('3'), card('2'),
      ),
    })
    const dealt = applyAction(state, { type: 'DEAL' })
    const firstHit = applyAction(dealt.state, { type: 'HIT' })
    const fourthPlayerCard = applyAction(firstHit.state, { type: 'HIT' })
    const transition = applyAction(fourthPlayerCard.state, { type: 'STAND' })

    expect(transition.state.hands[0].cards).toHaveLength(4)
    expect(transition.state.dealerCards).toHaveLength(4)
    expect(transition.state.hands[0]).toMatchObject({ outcome: 'win', payout: 200 })
    expect(scoreHand(transition.state.dealerCards).total).toBe(17)
  })

  it('settles every split hand as a win when one player hand reaches five without busting', () => {
    const state = createGame({
      shoe: fixedShoe(
        card('8'), card('6'), card('8'), card('10'),
        card('10'), card('3'), card('9'), card('2'), card('2'), card('2'),
      ),
    })
    const dealt = applyAction(state, { type: 'DEAL' })
    const split = applyAction(dealt.state, { type: 'SPLIT' })
    const firstHandBust = applyAction(split.state, { type: 'HIT' })
    const secondHandFirstHit = applyAction(firstHandBust.state, { type: 'HIT' })
    const secondHandSecondHit = applyAction(secondHandFirstHit.state, { type: 'HIT' })
    const playerFiveCards = applyAction(secondHandSecondHit.state, { type: 'HIT' })

    expect(playerFiveCards.state.phase).toBe('settled')
    expect(playerFiveCards.state.hands.map((hand) => hand.cards.length)).toEqual([3, 5])
    expect(playerFiveCards.state.hands.map((hand) => hand.outcome)).toEqual(['win', 'win'])
    expect(playerFiveCards.state.hands.map((hand) => hand.payout)).toEqual([200, 200])
    expect(playerFiveCards.state.bankroll).toBe(1_200)
    expect(playerFiveCards.state.dealerHoleHidden).toBe(true)
  })

  it('settles every split hand as a loss when one player fifth card busts', () => {
    const state = createGame({
      shoe: fixedShoe(
        card('8'), card('6'), card('8'), card('10'),
        card('10'), card('3'), card('9'), card('2'), card('2'), card('9'),
      ),
    })
    const dealt = applyAction(state, { type: 'DEAL' })
    const split = applyAction(dealt.state, { type: 'SPLIT' })
    const firstHandBust = applyAction(split.state, { type: 'HIT' })
    const secondHandFirstHit = applyAction(firstHandBust.state, { type: 'HIT' })
    const secondHandSecondHit = applyAction(secondHandFirstHit.state, { type: 'HIT' })
    const playerFiveCards = applyAction(secondHandSecondHit.state, { type: 'HIT' })

    expect(playerFiveCards.state.phase).toBe('settled')
    expect(playerFiveCards.state.hands.map((hand) => hand.cards.length)).toEqual([3, 5])
    expect(scoreHand(playerFiveCards.state.hands[1].cards).busted).toBe(true)
    expect(playerFiveCards.state.hands.map((hand) => hand.outcome)).toEqual(['loss', 'loss'])
    expect(playerFiveCards.state.hands.map((hand) => hand.payout)).toEqual([0, 0])
    expect(playerFiveCards.state.bankroll).toBe(800)
    expect(playerFiveCards.state.dealerHoleHidden).toBe(true)
  })
})
