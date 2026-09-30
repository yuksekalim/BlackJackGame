import { useEffect, useState } from 'react'
import { scoreHand } from '../game'
import type { Card, GameAction, GameState, PlayerHand } from '../game/types'
import { AnimatedCard } from '../motion/AnimatedCard'
import type { CardPresentation } from '../motion/card-presentation'
import { DealerFigure } from './DealerFigure'
import type { DealerGesture } from './DealerFigure'
import { summarizeRound } from './round-result'
import './table.css'

export interface BlackjackTableProps {
  state: GameState
  legalActions: GameAction['type'][]
  onAction: (action: GameAction) => void
  speed: 'normal' | 'fast' | 'instant'
  onSpeedChange: (speed: 'normal' | 'fast' | 'instant') => void
  presentation?: CardPresentation | null
}

const MIN_BET = 10
const BET_STEP = 10
const CHIP_VALUES = [10, 50, 100, 500]
const numberFormat = new Intl.NumberFormat('en-US')

const formatChips = (amount: number) => `${numberFormat.format(amount)} chips`

function HandScore({ cards }: { cards: Card[] }) {
  if (cards.length === 0) return <span className="bj-score bj-score--pending">—</span>
  const score = scoreHand(cards)
  if (score.busted) return <span className="bj-score bj-score--bust">Bust · <span className="bj-score-value">{score.total}</span></span>
  return (
    <span className="bj-score">
      <span className="bj-score-value">{score.total}</span>{score.soft ? <span className="bj-score-note"> soft</span> : null}
    </span>
  )
}

function HandStatus({ hand, active, resultsVisible }: { hand: PlayerHand; active: boolean; resultsVisible: boolean }) {
  if (!resultsVisible && hand.outcome) return <span className="bj-hand-result">Resolving</span>
  if (hand.outcome) {
    const label = hand.outcome === 'blackjack' ? 'Blackjack' : hand.outcome[0].toUpperCase() + hand.outcome.slice(1)
    return <span className={`bj-hand-result bj-hand-result--${hand.outcome} motion-result-entry`} data-motion-pulse="a">{label}</span>
  }
  if (active) return <span className="bj-hand-result bj-hand-result--active">Your turn</span>
  if (hand.status === 'busted') return <span className="bj-hand-result bj-hand-result--loss">Busted</span>
  if (hand.status === 'stood') return <span className="bj-hand-result">Standing</span>
  if (hand.status === 'settled') return <span className="bj-hand-result">Complete</span>
  return <span className="bj-hand-result">Waiting</span>
}

function PlayerHandView({
  hand,
  handIndex,
  roundNumber,
  active,
  speed,
  presentation,
}: {
  hand: PlayerHand
  handIndex: number
  roundNumber: number
  active: boolean
  speed: BlackjackTableProps['speed']
  presentation?: CardPresentation | null
}) {
  const visibleCards = hand.cards.slice(0, presentation?.playerVisibleCardCounts[hand.id] ?? hand.cards.length)
  const resultsVisible = !presentation?.busy || presentation.resultsVisible
  return (
    <section
      className={`bj-hand${active ? ' bj-hand--active' : ''}`}
      aria-label={`Player hand ${handIndex + 1}${active ? ', active hand' : ''}`}
      aria-current={active ? 'step' : undefined}
    >
      <header className="bj-hand-heading">
        <div>
          <span className="bj-hand-title">Hand {handIndex + 1}</span>
          {hand.fromSplit ? <span className="bj-split-tag">Split</span> : null}
        </div>
        <HandStatus hand={hand} active={active && !presentation?.busy} resultsVisible={resultsVisible} />
      </header>
      <div className="bj-hand-detail">
        <HandScore cards={visibleCards} />
        <span className="bj-hand-bet">Bet {formatChips(hand.bet)}</span>
      </div>
      <div className="bj-cards-lane" aria-label={`${visibleCards.length} cards`}>
        {visibleCards.map((card, cardIndex) => (
          <div className="bj-card-slot" key={`${roundNumber}-${hand.id}-${cardIndex}`}>
            <AnimatedCard
              card={card}
              cardId={`round-${roundNumber}-${hand.id}-${cardIndex}`}
              speed={speed}
              className="bj-card"
              animateOnMount={presentation?.busy
                ? presentation.activeCard?.recipient === 'player'
                  && presentation.activeCard.handId === hand.id
                  && presentation.activeCard.cardIndex === cardIndex
                : undefined}
              entranceKey={presentation?.busy
                && presentation.activeCard?.recipient === 'player'
                && presentation.activeCard.handId === hand.id
                && presentation.activeCard.cardIndex === cardIndex
                ? `${presentation.sequenceId}-${presentation.step}`
                : undefined}
            />
          </div>
        ))}
        {visibleCards.length === 0 ? <span className="bj-empty-hand">Cards will appear here.</span> : null}
      </div>
      {resultsVisible && hand.payout !== undefined ? (
        <p className="bj-hand-payout motion-result-entry" data-motion-pulse="a">Return: <strong>{formatChips(hand.payout)}</strong></p>
      ) : null}
    </section>
  )
}

export function BlackjackTable({
  state,
  legalActions,
  onAction,
  speed,
  onSpeedChange,
  presentation,
}: BlackjackTableProps) {
  const [betStep, setBetStep] = useState(CHIP_VALUES[0])
  const can = (type: GameAction['type']) => legalActions.includes(type)
    && (type === 'NEW_GAME' || !presentation?.busy)
  const send = (action: GameAction) => {
    if (can(action.type)) onAction(action)
  }
  const setBet = (amount: number) => {
    // The engine remains authoritative; this only clamps the visible control.
    const maximum = Math.floor(state.bankroll / BET_STEP) * BET_STEP
    if (!can('SET_BET') || maximum < MIN_BET) return
    const snapped = Math.round(amount / BET_STEP) * BET_STEP
    const validAmount = Math.max(MIN_BET, Math.min(maximum, snapped))
    if (validAmount !== state.selectedBet) send({ type: 'SET_BET', amount: validAmount })
  }

  useEffect(() => {
    const shortcuts: Record<string, Exclude<GameAction['type'], 'SET_BET' | 'DEAL' | 'NEXT_ROUND' | 'NEW_GAME'>> = {
      h: 'HIT',
      s: 'STAND',
      d: 'DOUBLE',
      p: 'SPLIT',
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target
      if (target instanceof HTMLElement && (
        target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'SUMMARY'].includes(target.tagName)
      )) return
      const action = shortcuts[event.key.toLowerCase()]
      if (!action || !legalActions.includes(action)) return
      event.preventDefault()
      onAction({ type: action })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [legalActions, onAction])

  const dealerCards = state.dealerCards.slice(0, presentation?.dealerVisibleCardCount ?? state.dealerCards.length)
  const dealerHoleHidden = state.dealerHoleHidden || Boolean(presentation?.busy && !presentation.dealerHoleRevealed)
  const dealerVisibleCards = dealerHoleHidden ? dealerCards.slice(0, 1) : dealerCards
  const dealerScore = dealerVisibleCards.length > 0 ? scoreHand(dealerVisibleCards) : null
  const dealerFiveCardWin = state.phase === 'settled' && !presentation?.busy
    && dealerVisibleCards.length >= 5 && !dealerScore?.busted && state.hands.every((hand) => hand.outcome === 'loss')
  const activeIndex = state.activeHandIndex
  const statePhaseLabel = state.phase === 'betting'
    ? 'Place your bet'
    : state.phase === 'player'
      ? 'Player turn'
      : state.phase === 'dealer'
        ? 'Dealer turn'
        : 'Round complete'
  const phaseLabel = presentation?.busy ? presentation.displayPhaseLabel : statePhaseLabel
  const displayMessage = presentation?.busy ? presentation.displayMessage : state.message
  const displayedBankroll = presentation?.busy ? presentation.displayedBankroll : state.bankroll
  const roundResult = state.phase === 'settled' && !presentation?.busy
    ? summarizeRound(state.hands)
    : null
  const dealerGesture: DealerGesture = presentation?.busy
    ? presentation.activeCard?.recipient === 'player'
      ? 'deal-player'
      : presentation.activeCard?.recipient === 'dealer'
        ? 'deal-dealer'
        : presentation.dealerHoleRevealed
          ? 'reveal'
          : 'idle'
    : roundResult?.tone === 'win'
      ? 'win'
      : roundResult?.tone === 'loss'
        ? 'loss'
        : 'idle'
  const dealerMotionKey = presentation?.busy
    ? `${presentation.sequenceId}-${presentation.step}`
    : `${state.roundNumber}-${dealerGesture}`
  const roundAction = can('DEAL')
    ? { label: 'Deal cards', type: 'DEAL' as const }
    : can('NEXT_ROUND')
      ? { label: 'Next hand', type: 'NEXT_ROUND' as const }
      : null
  const maxBet = Math.floor(state.bankroll / BET_STEP) * BET_STEP
  const canBet = can('SET_BET') && maxBet >= MIN_BET
  const committedBet = state.hands.reduce((total, hand) => total + hand.bet, 0)

  return (
    <main className="bj-app" data-motion-speed={speed}>
      <div className="bj-frame">
        <header className="bj-header">
          <div className="bj-brand">
            <span className="bj-brand-mark" aria-hidden="true">花</span>
            <div>
              <p className="bj-eyebrow">Virtual table · illustrated deck</p>
              <h1>Blackjack</h1>
            </div>
          </div>
          <div className="bj-round-pill" aria-label={`Round ${state.roundNumber}`}>
            <span className="bj-round-label">Round</span>
            <strong>{numberFormat.format(state.roundNumber)}</strong>
          </div>
        </header>

        <section className="bj-status-row" aria-label="Game status and settings">
          <div className="bj-bankroll">
            <span className="bj-status-label">Bankroll</span>
            <strong key={displayedBankroll} className="motion-chip-count" data-motion-pulse="a">{formatChips(displayedBankroll)}</strong>
          </div>
          <div className="bj-speed-control">
            <label htmlFor="bj-speed">Card speed</label>
            <select
              id="bj-speed"
              aria-label="Card speed"
              value={speed}
              onChange={(event) => onSpeedChange(event.target.value as BlackjackTableProps['speed'])}
            >
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
              <option value="instant">Instant</option>
            </select>
          </div>
        </section>

        <section className="bj-table" aria-label="Blackjack table">
          <div className="bj-table-content">
            <section className="bj-dealer-area" aria-label="Dealer hand">
              <DealerFigure gesture={dealerGesture} speed={speed} motionKey={dealerMotionKey} />
              <div className="bj-zone-heading">
                <div>
                  <span className="bj-zone-kicker">House</span>
                  <h2>Dealer</h2>
                </div>
                {dealerScore ? (
                  <span className="bj-total-badge bj-total-badge--score">
                    <span>{dealerFiveCardWin ? 'Five-card win' : dealerHoleHidden ? 'Showing' : 'Total'}</span>
                    {' '}
                    <strong>{dealerHoleHidden ? dealerVisibleCards[0]?.rank ?? '—' : dealerScore.total}</strong>
                    {!dealerHoleHidden && dealerScore.soft ? <small>soft</small> : null}
                  </span>
                ) : <span className="bj-total-badge">Waiting for deal</span>}
              </div>
              <div className="bj-table-cards bj-table-cards--dealer">
                {dealerCards.length > 0 ? dealerCards.map((card, index) => {
                  const hidden = dealerHoleHidden && index === 1
                  return (
                    <div className="bj-card-slot" key={`dealer-${state.roundNumber}-${index}`}>
                      <AnimatedCard
                        card={card}
                        cardId={`round-${state.roundNumber}-dealer-${index}`}
                        hidden={hidden || undefined}
                        speed={speed}
                        className={`bj-card${hidden ? ' bj-card--hidden' : ''}`}
                        animateOnMount={presentation?.busy
                          ? presentation.activeCard?.recipient === 'dealer'
                            && presentation.activeCard.cardIndex === index
                          : undefined}
                        entranceKey={presentation?.busy
                          && presentation.activeCard?.recipient === 'dealer'
                          && presentation.activeCard.cardIndex === index
                          ? `${presentation.sequenceId}-${presentation.step}`
                          : undefined}
                      />
                    </div>
                  )
                }) : <p className="bj-table-placeholder">Your next hand is waiting.</p>}
              </div>
            </section>

            <div className="bj-table-middle">
              <section className={`bj-round-message${roundResult ? ` bj-round-message--${roundResult.tone}` : ''}`} aria-live="polite" aria-atomic="true">
                <span className="bj-message-dot" aria-hidden="true" />
                <div>
                  <strong>{roundResult?.label ?? phaseLabel}</strong>
                  <p>{displayMessage}</p>
                </div>
              </section>

              <section className="bj-controls" aria-label="Game controls">
                {state.phase === 'betting' ? (
                  <div className="bj-bet-panel">
                    <div className="bj-control-heading">
                      <div>
                        <span className="bj-zone-kicker">Wager</span>
                        <h2>Choose your bet</h2>
                      </div>
                      <span className="bj-bet-limit">Max {formatChips(maxBet)} · min 10</span>
                    </div>
                    <div className="bj-bet-steps">
                      <span className="bj-bet-step-label">Change by</span>
                      <div className="bj-chip-row" role="group" aria-label="Select bet adjustment amount">
                        {CHIP_VALUES.map((value) => {
                          const selected = betStep === value
                          return (
                            <button
                              key={value}
                              type="button"
                              className={`bj-chip bj-chip--${value}${selected ? ' bj-chip--selected' : ''}`}
                              onClick={() => setBetStep(value)}
                              disabled={!canBet}
                              aria-label={selected ? `${value}-chip step selected` : `Select ${value}-chip step`}
                              aria-pressed={selected}
                            >
                              <span>{value}</span>
                              <small>{selected ? 'selected' : 'step'}</small>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="bj-bet-selector">
                      <button
                        type="button"
                        className="bj-adjust-button"
                        aria-label={`Decrease bet by ${betStep} chips`}
                        onClick={() => setBet(state.selectedBet - betStep)}
                        disabled={!canBet || state.selectedBet <= MIN_BET}
                      >−</button>
                      <output className="bj-bet-amount" aria-live="polite">
                        <span key={state.selectedBet} className="motion-chip-count" data-motion-pulse="a">{formatChips(state.selectedBet)}</span>
                        <small>selected bet</small>
                      </output>
                      <button
                        type="button"
                        className="bj-adjust-button"
                        aria-label={`Increase bet by ${betStep} chips`}
                        onClick={() => setBet(state.selectedBet + betStep)}
                        disabled={!canBet || state.selectedBet >= maxBet}
                      >+</button>
                    </div>
                  </div>
                ) : (
                  <div className="bj-locked-bet">
                    <span className="bj-zone-kicker">Current wager</span>
                    <strong key={committedBet} className="motion-chip-count" data-motion-pulse="a">{formatChips(committedBet)}</strong>
                    {state.hands.length > 1 ? <span>across {state.hands.length} hands</span> : <span>committed to this round</span>}
                  </div>
                )}

                <div className="bj-action-panel">
                  <div className="bj-control-heading bj-control-heading--actions">
                    <div>
                      <span className="bj-zone-kicker">Your move</span>
                      <h2>Actions</h2>
                    </div>
                    <span className="bj-key-hint">Keyboard: H · S · D · P</span>
                  </div>
                  <div className="bj-actions-grid">
                    <button type="button" className="bj-action-button bj-action-button--primary" onClick={() => send({ type: 'HIT' })} disabled={!can('HIT')}>
                      <span>Hit</span><kbd>H</kbd>
                    </button>
                    <button type="button" className="bj-action-button" onClick={() => send({ type: 'STAND' })} disabled={!can('STAND')}>
                      <span>Stand</span><kbd>S</kbd>
                    </button>
                    <button type="button" className="bj-action-button" onClick={() => send({ type: 'DOUBLE' })} disabled={!can('DOUBLE')}>
                      <span>Double</span><kbd>D</kbd>
                    </button>
                    <button type="button" className="bj-action-button" onClick={() => send({ type: 'SPLIT' })} disabled={!can('SPLIT')}>
                      <span>Split</span><kbd>P</kbd>
                    </button>
                  </div>
                  <div className="bj-round-actions">
                    {roundAction ? (
                      <button
                        type="button"
                        className="bj-round-button"
                        onClick={() => send({ type: roundAction.type })}
                        disabled={roundAction.type === 'DEAL' && (!canBet || state.selectedBet > maxBet)}
                      >
                        {roundAction.label}<span aria-hidden="true">→</span>
                      </button>
                    ) : null}
                    {can('NEW_GAME') ? (
                      <button type="button" className="bj-reset-button" onClick={() => send({ type: 'NEW_GAME' })}>
                        New game
                      </button>
                    ) : null}
                  </div>
                </div>
              </section>
            </div>

            <section className="bj-player-area" aria-label="Your hands">
              <div className="bj-zone-heading bj-zone-heading--player">
                <div>
                  <span className="bj-zone-kicker">Player</span>
                  <h2>Your hand{state.hands.length > 1 ? 's' : ''}</h2>
                </div>
                <span className="bj-total-badge bj-total-badge--phase">{phaseLabel}</span>
              </div>
              {state.hands.length > 0 ? (
                <div className="bj-hands-grid">
                  {state.hands.map((hand, index) => (
                    <PlayerHandView
                      key={hand.id}
                      hand={hand}
                      handIndex={index}
                      roundNumber={state.roundNumber}
                      active={activeIndex === index && state.phase === 'player' && !presentation?.busy}
                      speed={speed}
                      presentation={presentation}
                    />
                  ))}
                </div>
              ) : <p className="bj-table-placeholder">Place a bet to begin.</p>}
            </section>
          </div>
        </section>

        <details className="bj-rules">
          <summary>House rules &amp; shortcuts</summary>
          <div className="bj-rules-content">
            <ul>
              <li>Six decks; dealer stands on every 17, including soft 17.</li>
              <li>A natural blackjack pays 3:2; a tie pushes.</li>
              <li>House rule: a hand that reaches five cards at 21 or below wins the round. A fifth-card bust loses. A split hand counts for the player side.</li>
              <li>Bet from 10 virtual chips up to your bankroll in increments of 10.</li>
              <li>Double on the first two cards: take one card, then stand.</li>
              <li>Split one matching-rank pair once; split aces receive one card each and stand.</li>
              <li>Insurance and surrender are not available.</li>
            </ul>
            <p>Keyboard shortcuts while the table is active: <kbd>H</kbd> hit, <kbd>S</kbd> stand, <kbd>D</kbd> double, <kbd>P</kbd> split. All actions are also available with Tab and Enter.</p>
          </div>
        </details>
      </div>
    </main>
  )
}
