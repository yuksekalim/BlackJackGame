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
