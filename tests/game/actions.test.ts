import { describe, expect, it } from 'vitest'
import { applyAction, createGame, getLegalActions } from '../../src/game/index'
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

describe('betting actions', () => {
  it('accepts only affordable bets from 10 to 500 in increments of 10', () => {
    const state = createGame({ initialBankroll: 100, shoe: fixedShoe() })
    for (const amount of [0, 9, 11, 105, 110, 510]) {
      const transition = applyAction(state, { type: 'SET_BET', amount })
      expect(transition.state).toBe(state)
      expect(transition.events).toEqual([])
    }

    const valid = applyAction(state, { type: 'SET_BET', amount: 90 })
    expect(valid.state.selectedBet).toBe(90)
    expect(valid.events).toEqual([])
  })

  it('returns the identical state for actions that are not legal in the current phase', () => {
    const state = createGame({ shoe: fixedShoe() })
    const transition = applyAction(state, { type: 'HIT' })
    expect(transition.state).toBe(state)
    expect(transition.events).toEqual([])
  })

  it('reshuffles to six decks before a round when fewer than 52 cards remain', () => {
    const state = createGame({ shoe: fixedShoe(card('10'), card('10'), card('7'), card('7')) })
    const dealt = applyAction(state, { type: 'DEAL' })
    const settled = applyAction(dealt.state, { type: 'STAND' })
    expect(settled.state.phase).toBe('settled')
    expect(settled.state.shoe.length).toBeLessThan(52)

    const next = applyAction(settled.state, { type: 'NEXT_ROUND' }, () => 0)
    expect(next.state.phase).toBe('betting')
    expect(next.state.shoe).toHaveLength(312)
  })
})

describe('player actions and settlement', () => {
  it('skips dealer play when every player hand busts', () => {
    const state = createGame({ shoe: fixedShoe(card('10'), card('6'), card('9'), card('10'), card('5')) })
    const dealt = applyAction(state, { type: 'DEAL' })
    const transition = applyAction(dealt.state, { type: 'HIT' })

    expect(transition.state.phase).toBe('settled')
    expect(transition.state.hands[0]).toMatchObject({ outcome: 'loss', status: 'settled' })
    expect(transition.state.dealerHoleHidden).toBe(true)
    expect(transition.events.some((event) => event.type === 'hole-revealed')).toBe(false)
    expect(transition.state.bankroll).toBe(900)
  })

  it('automatically stands on 21 after a hit and starts dealer play', () => {
    const state = createGame({ shoe: fixedShoe(card('10'), card('6'), card('5'), card('10'), card('6'), card('4')) })
    const dealt = applyAction(state, { type: 'DEAL' })
    const transition = applyAction(dealt.state, { type: 'HIT' })

    expect(transition.state.hands[0].cards).toHaveLength(3)
    expect(transition.state.hands[0].status).toBe('settled')
    expect(transition.state.phase).toBe('settled')
    expect(getLegalActions(transition.state)).not.toContain('HIT')
    expect(transition.state.hands[0]).toMatchObject({ outcome: 'win', payout: 200 })
  })

  it('automatically advances from a split hand that reaches 21', () => {
    const state = createGame({ shoe: fixedShoe(card('8'), card('6'), card('8'), card('10'), card('2'), card('3'), card('A')) })
    const dealt = applyAction(state, { type: 'DEAL' })
    const split = applyAction(dealt.state, { type: 'SPLIT' })
    const hit = applyAction(split.state, { type: 'HIT' })

    expect(hit.state.phase).toBe('player')
    expect(hit.state.activeHandIndex).toBe(1)
    expect(hit.state.hands[0].status).toBe('stood')
    expect(hit.state.hands[0].cards).toEqual([card('8'), card('2'), card('A')])
    expect(hit.state.hands[1].status).toBe('playing')
    expect(hit.events).toContainEqual({ type: 'turn-changed', handId: 'round-1-hand-1-split' })
    expect(getLegalActions(hit.state)).toContain('HIT')
  })

  it('automatically advances when a split hand receives 21 on its replacement card', () => {
    const state = createGame({ shoe: fixedShoe(card('10'), card('6'), card('10'), card('10'), card('A'), card('2')) })
    const dealt = applyAction(state, { type: 'DEAL' })
    const split = applyAction(dealt.state, { type: 'SPLIT' })

    expect(split.state.phase).toBe('player')
    expect(split.state.activeHandIndex).toBe(1)
    expect(split.state.hands[0].status).toBe('stood')
    expect(split.state.hands[0].cards).toEqual([card('10'), card('A')])
    expect(split.events).toContainEqual({ type: 'turn-changed', handId: 'round-1-hand-1-split' })
  })

  it('commits the extra double stake, draws once, and pays the doubled win', () => {
    const state = createGame({ shoe: fixedShoe(card('5'), card('6'), card('6'), card('10'), card('10'), card('4')) })
    const dealt = applyAction(state, { type: 'DEAL' })
    expect(getLegalActions(dealt.state)).toContain('DOUBLE')
    const transition = applyAction(dealt.state, { type: 'DOUBLE' })

    expect(transition.state.phase).toBe('settled')
    expect(transition.state.hands[0]).toMatchObject({ bet: 200, doubled: true, outcome: 'win', payout: 400 })
    expect(transition.state.bankroll).toBe(1_200)
    expect(transition.events).toContainEqual({ type: 'bet-placed', amount: 100, handId: 'round-1-hand-1' })
  })

  it('splits aces once, deals one card to each, and treats split 21 as ordinary', () => {
    const state = createGame({ shoe: fixedShoe(card('A'), card('6'), card('A'), card('10'), card('K'), card('9'), card('5')) })
    const dealt = applyAction(state, { type: 'DEAL' })
    const transition = applyAction(dealt.state, { type: 'SPLIT' })

    expect(transition.state.phase).toBe('settled')
    expect(transition.state.hands).toHaveLength(2)
    expect(transition.state.hands.map((hand) => hand.cards)).toEqual([
      [card('A'), card('K')],
      [card('A'), card('9')],
    ])
    expect(transition.state.hands.map((hand) => hand.outcome)).toEqual(['push', 'loss'])
    expect(transition.state.hands[0].outcome).not.toBe('blackjack')
    expect(transition.state.bankroll).toBe(900)
    expect(transition.events.filter((event) => event.type === 'card-dealt' && event.recipient === 'player')).toHaveLength(2)
  })

  it('allows doubling a split hand but prevents a second split', () => {
    const state = createGame({ shoe: fixedShoe(card('8'), card('6'), card('8'), card('10'), card('8'), card('2'), card('2')) })
    const dealt = applyAction(state, { type: 'DEAL' })
    const split = applyAction(dealt.state, { type: 'SPLIT' })

    expect(split.state.hands[0].cards).toEqual([card('8'), card('8')])
    expect(getLegalActions(split.state)).toContain('DOUBLE')
    expect(getLegalActions(split.state)).not.toContain('SPLIT')
    const invalidResplit = applyAction(split.state, { type: 'SPLIT' })
    expect(invalidResplit.state).toBe(split.state)
    expect(invalidResplit.events).toEqual([])

    const doubled = applyAction(split.state, { type: 'DOUBLE' })
    expect(doubled.state.hands[0]).toMatchObject({ bet: 200, doubled: true, status: 'stood' })
    expect(doubled.state.bankroll).toBe(700)
    expect(doubled.state.activeHandIndex).toBe(1)
  })

  it('disables split and double when the bankroll cannot cover another stake', () => {
    const state = createGame({ initialBankroll: 100, shoe: fixedShoe(card('8'), card('6'), card('8'), card('10')) })
    const dealt = applyAction(state, { type: 'DEAL' })
    expect(dealt.state.bankroll).toBe(0)
    expect(getLegalActions(dealt.state)).not.toContain('DOUBLE')
    expect(getLegalActions(dealt.state)).not.toContain('SPLIT')
    const split = applyAction(dealt.state, { type: 'SPLIT' })
    expect(split.state).toBe(dealt.state)
    expect(split.events).toEqual([])
  })

  it('starts a fresh 1,000-chip game on NEW_GAME', () => {
    const state = createGame({ initialBankroll: 300, shoe: fixedShoe() })
    const transition = applyAction(state, { type: 'NEW_GAME' }, () => 0.1)
    expect(transition.state.bankroll).toBe(1_000)
    expect(transition.state.shoe).toHaveLength(312)
    expect(transition.state.phase).toBe('betting')
  })
})
