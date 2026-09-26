import { useCallback, useState } from 'react'
import { applyAction, createGame, getLegalActions } from './game'
import type { GameAction, GameState } from './game/types'
import { BlackjackTable } from './ui/BlackjackTable'

type Speed = 'normal' | 'fast' | 'instant'

function App() {
  const [state, setState] = useState<GameState>(() => createGame())
  const [speed, setSpeed] = useState<Speed>('normal')

  const handleAction = useCallback((action: GameAction) => {
    setState((current) => applyAction(current, action).state)
  }, [])

  return (
    <BlackjackTable
      state={state}
      legalActions={getLegalActions(state)}
      onAction={handleAction}
      speed={speed}
      onSpeedChange={setSpeed}
    />
  )
}

export default App
