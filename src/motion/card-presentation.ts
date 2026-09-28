import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { GameEvent, GameState, GameTransition } from '../game/types'

export type MotionSpeed = 'normal' | 'fast' | 'instant'

export interface ActiveCardMotion {
  recipient: 'dealer' | 'player'
  handId?: string
  cardIndex: number
  faceDown: boolean
  sequenceId: number
  step: number
}

/**
 * A render-only view of a game transition. The game engine's state remains
 * authoritative; these counts only control when already-decided cards appear.
 */
export interface CardPresentation {
  sequenceId: number
  step: number
  busy: boolean
  dealerVisibleCardCount: number
  playerVisibleCardCounts: Readonly<Record<string, number>>
  dealerHoleRevealed: boolean
  resultsVisible: boolean
  /** Holds chips at their pre-payout value until the dealer sequence is done. */
  displayedBankroll: number
  displayMessage: string
  displayPhaseLabel: string
  activeCard?: ActiveCardMotion
}

interface SequenceRun {
  sequenceId: number
  target: GameState
  events: PresentationEvent[]
  eventIndex: number
  activeEvent: Extract<GameEvent, { type: 'card-dealt' | 'hole-revealed' }> | null
  presentation: CardPresentation
}

export type PresentationEvent = Extract<GameEvent, { type: 'card-dealt' | 'hole-revealed' | 'bet-placed' }>

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const DEAL_GAP_MS = 72
const FLIP_GAP_MS = 72

function readReducedMotionPreference(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function isVisualEvent(event: GameEvent): event is Extract<GameEvent, { type: 'card-dealt' | 'hole-revealed' }> {
  return event.type === 'card-dealt' || event.type === 'hole-revealed'
}

export function initialCardPresentation(before: GameState, target: GameState, sequenceId: number): CardPresentation {
  const newRound = target.roundNumber !== before.roundNumber
  const isSplit = !newRound
    && before.hands.length === 1
    && target.hands.length === 2
    && target.hands.every((hand) => hand.fromSplit)
  const playerVisibleCardCounts: Record<string, number> = {}

  for (const hand of target.hands) {
    const oldHand = before.hands.find((candidate) => candidate.id === hand.id)
    playerVisibleCardCounts[hand.id] = newRound
      ? 0
      : isSplit
        ? 1
        : Math.min(oldHand?.cards.length ?? 0, hand.cards.length)
  }

  const dealerVisibleCardCount = newRound
    ? 0
    : Math.min(before.dealerCards.length, target.dealerCards.length)

  return {
    sequenceId,
    step: 0,
    busy: true,
    dealerVisibleCardCount,
    playerVisibleCardCounts,
    dealerHoleRevealed: !newRound
      && before.dealerCards.length > 1
      && !before.dealerHoleHidden,
    resultsVisible: before.phase === 'settled' && !newRound,
    displayedBankroll: before.bankroll,
    displayMessage: before.message,
    displayPhaseLabel: before.phase === 'dealer' ? 'Dealer turn' : 'Cards in motion',
  }
}

export function completeCardPresentation(state: GameState, sequenceId: number): CardPresentation {
  const playerVisibleCardCounts = Object.fromEntries(
    state.hands.map((hand) => [hand.id, hand.cards.length]),
  )

  return {
    sequenceId,
    step: Number.MAX_SAFE_INTEGER,
    busy: false,
    dealerVisibleCardCount: state.dealerCards.length,
    playerVisibleCardCounts,
    dealerHoleRevealed: !state.dealerHoleHidden,
    resultsVisible: state.phase === 'settled',
    displayedBankroll: state.bankroll,
    displayMessage: state.message,
    displayPhaseLabel: state.phase === 'betting'
      ? 'Place your bet'
      : state.phase === 'player'
        ? 'Player turn'
        : state.phase === 'dealer'
          ? 'Dealer turn'
          : 'Round complete',
  }
}

export function projectCardPresentationEvent(
  current: CardPresentation,
  event: PresentationEvent,
): CardPresentation {
  if (event.type === 'bet-placed') {
    return {
      ...current,
      displayedBankroll: Math.max(0, current.displayedBankroll - event.amount),
    }
  }

  const nextStep = current.step + 1
  const copy = getEventCopy(event)
  if (event.type === 'hole-revealed') {
    return {
      ...current,
      step: nextStep,
      dealerHoleRevealed: true,
      displayMessage: copy.message,
      displayPhaseLabel: copy.phaseLabel,
      activeCard: undefined,
    }
  }

  if (event.recipient === 'dealer') {
    const cardIndex = current.dealerVisibleCardCount
    return {
      ...current,
      step: nextStep,
      dealerVisibleCardCount: cardIndex + 1,
      displayMessage: copy.message,
      displayPhaseLabel: copy.phaseLabel,
      activeCard: {
        recipient: 'dealer',
        cardIndex,
        faceDown: event.faceDown,
        sequenceId: current.sequenceId,
        step: nextStep,
      },
    }
  }

  const handId = event.handId
  if (!handId) return current
  const cardIndex = current.playerVisibleCardCounts[handId] ?? 0
  return {
    ...current,
    step: nextStep,
    playerVisibleCardCounts: { ...current.playerVisibleCardCounts, [handId]: cardIndex + 1 },
    displayMessage: copy.message,
    displayPhaseLabel: copy.phaseLabel,
    activeCard: {
      recipient: 'player',
      handId,
      cardIndex,
      faceDown: event.faceDown,
      sequenceId: current.sequenceId,
      step: nextStep,
    },
  }
}

export function presentationEvents(transition: GameTransition): PresentationEvent[] {
  return transition.events.filter((event): event is PresentationEvent => {
    return event.type === 'card-dealt' || event.type === 'hole-revealed' || event.type === 'bet-placed'
  })
}

export function shouldFastForwardCardSequence(speed: MotionSpeed, reducedMotion: boolean): boolean {
  return speed === 'instant' || reducedMotion
}

export function canAdvanceCardSequence(expectedSequenceId: number, activeSequenceId: number | null): boolean {
  return expectedSequenceId === activeSequenceId
}

function getEventDuration(event: SequenceRun['activeEvent'], speed: MotionSpeed): number {
  if (speed === 'fast') return event?.type === 'hole-revealed' ? 180 : 340
  return event?.type === 'hole-revealed' ? 390 : 680
}

function getEventCopy(event: SequenceRun['activeEvent']): { message: string; phaseLabel: string } {
  if (!event) return { message: 'Cards are being dealt.', phaseLabel: 'Cards in motion' }
  if (event.type === 'hole-revealed') {
    return { message: 'The dealer reveals the hidden card.', phaseLabel: 'Dealer turn' }
  }
  if (event.recipient === 'dealer') {
    return { message: 'The dealer draws a card.', phaseLabel: 'Dealer turn' }
  }
  return { message: 'A card is dealt to your hand.', phaseLabel: 'Player turn' }
}

/**
 * Sequence decided engine events for presentation. Call `beginTransition` with
 * the before-state and complete engine transition; do not use its projection
 * to calculate legal actions or game outcomes.
 */
export function useCardPresentation(speed: MotionSpeed): {
  presentation: CardPresentation | null
  beginTransition: (before: GameState, transition: GameTransition) => void
  finishSequence: () => void
} {
  const [presentation, setPresentation] = useState<CardPresentation | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(readReducedMotionPreference)
  const speedRef = useRef(speed)
  const reducedRef = useRef(prefersReducedMotion)
  const sequenceIdRef = useRef(0)
  const runRef = useRef<SequenceRun | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const advanceRef = useRef<(() => void) | null>(null)

  useLayoutEffect(() => {
    speedRef.current = speed
    reducedRef.current = prefersReducedMotion
  }, [speed, prefersReducedMotion])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const finishSequence = useCallback(() => {
    clearTimer()
    const run = runRef.current
    if (!run) return
    runRef.current = null
    setPresentation(completeCardPresentation(run.target, run.sequenceId))
  }, [clearTimer])

  const scheduleAdvance = useCallback((run: SequenceRun, event: SequenceRun['activeEvent']) => {
    clearTimer()
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      if (!canAdvanceCardSequence(run.sequenceId, runRef.current?.sequenceId ?? null)) return
      run.activeEvent = null
      advanceRef.current?.()
    }, getEventDuration(event, speedRef.current) + (event?.type === 'hole-revealed' ? FLIP_GAP_MS : DEAL_GAP_MS))
  }, [clearTimer])

  const advance = useCallback(() => {
    const run = runRef.current
    if (!run) return

    while (run.eventIndex < run.events.length) {
      const event = run.events[run.eventIndex++]
      if (!isVisualEvent(event)) {
        run.presentation = projectCardPresentationEvent(run.presentation, event)
        continue
      }

      run.presentation = projectCardPresentationEvent(run.presentation, event)

      run.activeEvent = event
      setPresentation(run.presentation)
      scheduleAdvance(run, event)
      return
    }

    finishSequence()
  }, [finishSequence, scheduleAdvance])

  useLayoutEffect(() => {
    advanceRef.current = advance
  }, [advance])

  const beginTransition = useCallback((before: GameState, transition: GameTransition) => {
    clearTimer()
    runRef.current = null
    const sequenceId = ++sequenceIdRef.current
    const target = transition.state
    const events = presentationEvents(transition)

    if (events.length === 0 || shouldFastForwardCardSequence(speedRef.current, reducedRef.current)) {
      setPresentation(completeCardPresentation(target, sequenceId))
      return
    }

    const run: SequenceRun = {
      sequenceId,
      target,
      events,
      eventIndex: 0,
      activeEvent: null,
      presentation: initialCardPresentation(before, target, sequenceId),
    }
    runRef.current = run
    setPresentation(run.presentation)
    advance()
  }, [advance, clearTimer])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)
    updatePreference()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference)
      return () => mediaQuery.removeEventListener('change', updatePreference)
    }
    mediaQuery.addListener(updatePreference)
    return () => mediaQuery.removeListener(updatePreference)
  }, [])

  useEffect(() => {
    if (shouldFastForwardCardSequence(speed, prefersReducedMotion)) {
      finishSequence()
      return
    }

    const run = runRef.current
    if (run?.activeEvent) scheduleAdvance(run, run.activeEvent)
  }, [speed, prefersReducedMotion, finishSequence, scheduleAdvance])

  useEffect(() => () => {
    clearTimer()
    runRef.current = null
  }, [clearTimer])

  return { presentation, beginTransition, finishSequence }
}
