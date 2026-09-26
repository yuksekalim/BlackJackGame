import { describe, expect, it } from 'vitest'
import {
  canAdvanceCardSequence,
  completeCardPresentation,
  initialCardPresentation,
  presentationEvents,
  projectCardPresentationEvent,
  shouldFastForwardCardSequence,
} from '../../src/motion/card-presentation'
import type { Card, GameState, GameTransition, PlayerHand } from '../../src/game/types'

const playerCards: Card[] = [
  { suit: 'hearts', rank: '10' },
  { suit: 'spades', rank: '7' },
]
const dealerCards: Card[] = [
  { suit: 'clubs', rank: '6' },
  { suit: 'diamonds', rank: '10' },
  { suit: 'hearts', rank: '8' },
]

function hand(overrides: Partial<PlayerHand> = {}): PlayerHand {
  return {
    id: 'round-1-hand-1',
    cards: playerCards,
    bet: 100,
    fromSplit: false,
    doubled: false,
    status: 'playing',
    ...overrides,
  }
}

function state(overrides: Partial<GameState> = {}): GameState {
  return {
    phase: 'player',
    bankroll: 900,
    selectedBet: 100,
    shoe: [],
    dealerCards: dealerCards.slice(0, 2),
    dealerHoleHidden: true,
    hands: [hand()],
    activeHandIndex: 0,
    roundNumber: 1,
    message: 'Your turn.',
    ...overrides,
  }
}

describe('card presentation projection', () => {
  it('reveals the opening cards in engine event order', () => {
    const before = state({
      phase: 'betting',
      bankroll: 1_000,
      dealerCards: [],
      dealerHoleHidden: true,
      hands: [],
      activeHandIndex: null,
      roundNumber: 0,
    })
    const dealtHand = hand()
    const target = state({ hands: [dealtHand], roundNumber: 1 })
    const transition: GameTransition = {
      state: target,
      events: [
        { type: 'round-started', roundNumber: 1 },
        { type: 'bet-placed', amount: 100, handId: dealtHand.id },
        { type: 'card-dealt', recipient: 'player', card: playerCards[0], handId: dealtHand.id, faceDown: false },
        { type: 'card-dealt', recipient: 'dealer', card: dealerCards[0], faceDown: false },
        { type: 'card-dealt', recipient: 'player', card: playerCards[1], handId: dealtHand.id, faceDown: false },
        { type: 'card-dealt', recipient: 'dealer', card: dealerCards[1], faceDown: true },
        { type: 'turn-changed', handId: dealtHand.id },
      ],
    }

    const events = presentationEvents(transition)
    expect(events.map((event) => event.type)).toEqual([
      'bet-placed', 'card-dealt', 'card-dealt', 'card-dealt', 'card-dealt',
    ])

    let frame = initialCardPresentation(before, target, 4)
    expect(frame.dealerVisibleCardCount).toBe(0)
    expect(frame.playerVisibleCardCounts[dealtHand.id]).toBe(0)
    expect(frame.displayedBankroll).toBe(1_000)

    frame = projectCardPresentationEvent(frame, events[0])
    expect(frame.displayedBankroll).toBe(900)
    frame = projectCardPresentationEvent(frame, events[1])
    expect(frame.activeCard).toMatchObject({ recipient: 'player', cardIndex: 0, step: 1 })
    frame = projectCardPresentationEvent(frame, events[2])
    expect(frame.activeCard).toMatchObject({ recipient: 'dealer', cardIndex: 0, step: 2 })
    frame = projectCardPresentationEvent(frame, events[3])
    expect(frame.activeCard).toMatchObject({ recipient: 'player', cardIndex: 1, step: 3 })
    frame = projectCardPresentationEvent(frame, events[4])
    expect(frame.activeCard).toMatchObject({ recipient: 'dealer', cardIndex: 1, faceDown: true, step: 4 })
    expect(frame.dealerHoleRevealed).toBe(false)

    const complete = completeCardPresentation(target, 4)
    expect(complete.busy).toBe(false)
    expect(complete.dealerVisibleCardCount).toBe(2)
    expect(complete.playerVisibleCardCounts[dealtHand.id]).toBe(2)
  })

  it('keeps settlement hidden until the hole reveal and dealer draw finish', () => {
    const before = state()
    const settledHand = hand({ status: 'settled', outcome: 'win', payout: 200 })
    const target = state({
      phase: 'settled',
      bankroll: 1_100,
      dealerCards,
      dealerHoleHidden: false,
      hands: [settledHand],
      activeHandIndex: null,
      message: 'Round settled.',
    })
    const transition: GameTransition = {
      state: target,
      events: [
        { type: 'hole-revealed', card: dealerCards[1] },
        { type: 'card-dealt', recipient: 'dealer', card: dealerCards[2], faceDown: false },
        { type: 'hand-settled', handId: settledHand.id, outcome: 'win', payout: 200 },
        { type: 'round-ended' },
      ],
    }
    const [revealEvent, drawEvent] = presentationEvents(transition)
    let frame = initialCardPresentation(before, target, 7)

    expect(frame.dealerVisibleCardCount).toBe(2)
    expect(frame.dealerHoleRevealed).toBe(false)
    expect(frame.resultsVisible).toBe(false)
    expect(frame.displayedBankroll).toBe(900)

    frame = projectCardPresentationEvent(frame, revealEvent)
    expect(frame.dealerHoleRevealed).toBe(true)
    expect(frame.resultsVisible).toBe(false)
    expect(frame.displayedBankroll).toBe(900)

    expect(shouldFastForwardCardSequence('instant', false)).toBe(true)
    const afterInstantSwitch = completeCardPresentation(target, 7)
    expect(afterInstantSwitch.busy).toBe(false)
    expect(afterInstantSwitch.resultsVisible).toBe(true)
    expect(afterInstantSwitch.dealerVisibleCardCount).toBe(3)

    frame = projectCardPresentationEvent(frame, drawEvent)
    expect(frame.dealerVisibleCardCount).toBe(3)
    expect(frame.activeCard).toMatchObject({ recipient: 'dealer', cardIndex: 2 })
    expect(frame.resultsVisible).toBe(false)

    const complete = completeCardPresentation(target, 7)
    expect(complete.resultsVisible).toBe(true)
    expect(complete.displayedBankroll).toBe(1_100)
  })

  it('starts split hands with one existing card before sequencing their draws', () => {
    const pair: Card[] = [
      { suit: 'clubs', rank: '8' },
      { suit: 'spades', rank: '8' },
    ]
    const before = state({ hands: [hand({ cards: pair })] })
    const splitHandId = `${before.hands[0].id}-split`
    const first = hand({ cards: [pair[0], playerCards[0]], fromSplit: true })
    const second = hand({ id: splitHandId, cards: [pair[1], playerCards[1]], fromSplit: true })
    const target = state({ hands: [first, second], activeHandIndex: 0 })
    const frame = initialCardPresentation(before, target, 9)

    expect(frame.playerVisibleCardCounts[first.id]).toBe(1)
    expect(frame.playerVisibleCardCounts[second.id]).toBe(1)
    expect(frame.activeCard).toBeUndefined()
  })

  it('fast-forwards for instant/reduced motion and invalidates interrupted sequence callbacks', () => {
    expect(shouldFastForwardCardSequence('normal', false)).toBe(false)
    expect(shouldFastForwardCardSequence('instant', false)).toBe(true)
    expect(shouldFastForwardCardSequence('normal', true)).toBe(true)
    expect(canAdvanceCardSequence(3, 3)).toBe(true)
    expect(canAdvanceCardSequence(3, 4)).toBe(false)

    const resetState = state({
      phase: 'betting',
      dealerCards: [],
      dealerHoleHidden: true,
      hands: [],
      activeHandIndex: null,
      roundNumber: 0,
      bankroll: 1_000,
      message: 'Choose your bet to start.',
    })
    const newGameTransition: GameTransition = { state: resetState, events: [] }
    expect(presentationEvents(newGameTransition)).toEqual([])

    const reset = completeCardPresentation(newGameTransition.state, 4)
    expect(reset.busy).toBe(false)
    expect(reset.dealerVisibleCardCount).toBe(0)
    expect(reset.playerVisibleCardCounts).toEqual({})
    expect(reset.resultsVisible).toBe(false)
    expect(canAdvanceCardSequence(3, reset.sequenceId)).toBe(false)
  })
})
