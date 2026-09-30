import { useCallback, useRef, useState } from 'react'
import { applyAction, createGame, getLegalActions } from './game'
import type { GameAction, GameState } from './game/types'
import { useCardPresentation } from './motion/card-presentation'
import { BlackjackTable } from './ui/BlackjackTable'

type Speed = 'normal' | 'fast' | 'instant'

function App() {
  const [state, setState] = useState<GameState>(() => createGame())
  const [speed, setSpeed] = useState<Speed>('normal')
  const stateRef = useRef(state)
  const { presentation, beginTransition } = useCardPresentation(speed)

  const handleAction = useCallback((action: GameAction) => {
    if (presentation?.busy && action.type !== 'NEW_GAME') return
    const before = stateRef.current
    const transition = applyAction(before, action)
    if (transition.state === before) return
    stateRef.current = transition.state
    beginTransition(before, transition)
    setState(transition.state)
  }, [beginTransition, presentation?.busy])

  return (
    <BlackjackTable
      state={state}
      legalActions={getLegalActions(state)}
      onAction={handleAction}
      speed={speed}
      onSpeedChange={setSpeed}
      presentation={presentation}
    />
  )
}

export default App
