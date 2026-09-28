import { useEffect, useState } from 'react'
import { Player } from '@remotion/player'
import { staticFile } from 'remotion'
import { DealerMotion, DEALER_HEIGHT, DEALER_WIDTH, GESTURE_FRAMES } from '../remotion/DealerMotion'
import './dealer-figure.css'

export type DealerGesture = 'idle' | 'deal-player' | 'deal-dealer' | 'reveal' | 'win' | 'loss'
export type DealerFigureSpeed = 'normal' | 'fast' | 'instant'

export interface DealerFigureProps {
  /** The current presentational gesture. `win` and `loss` are from the player's perspective. */
  gesture?: DealerGesture
  speed?: DealerFigureSpeed
  /** Change this with presentation.sequenceId + step to replay a repeated deal gesture. */
  motionKey?: string | number
  className?: string
}

function readReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Remotion keeps the dealer's joint motion frame-accurate with the live table. */
export function DealerFigure({
  gesture = 'idle',
  speed = 'normal',
  motionKey,
  className,
}: DealerFigureProps) {
  const [reducedMotion, setReducedMotion] = useState(readReducedMotion)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', update)
      return () => query.removeEventListener('change', update)
    }

    query.addListener(update)
    return () => query.removeListener(update)
  }, [])

  useEffect(() => {
    for (const name of ['dealer-idle.png', 'dealer-deal-near.png', 'dealer-deal-early.png', 'dealer-deal-between.png', 'dealer-deal-mid.png', 'dealer-deal-late.png', 'dealer-deal.png', 'dealer-player-win-near.png', 'dealer-player-win-middle.png', 'dealer-player-win-between.png', 'dealer-player-win-late.png', 'dealer-player-win.png', 'dealer-player-loss-near.png', 'dealer-player-loss-middle.png', 'dealer-player-loss.png']) {
      const image = new Image()
      image.src = staticFile(`dealer/${name}`)
    }
  }, [])

  return (
    <div
      className={`dealer-figure-stage${className ? ` ${className}` : ''}`}
      data-gesture={gesture}
      data-motion-speed={speed}
      aria-hidden="true"
    >
      <div className="dealer-figure__artboard">
        <Player
          key={`${motionKey ?? gesture}-${gesture}-${speed === 'instant'}-${reducedMotion}`}
          component={DealerMotion}
          inputProps={{ gesture, frozen: speed === 'instant' || reducedMotion }}
          compositionWidth={DEALER_WIDTH}
          compositionHeight={DEALER_HEIGHT}
          fps={60}
          durationInFrames={gesture === 'idle' ? 210 : GESTURE_FRAMES}
          autoPlay={speed !== 'instant' && !reducedMotion}
          loop={gesture === 'idle'}
          moveToBeginningWhenEnded={false}
          playbackRate={speed === 'fast' ? 2 : 1}
          initiallyMuted
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        />
      </div>
    </div>
  )
}
