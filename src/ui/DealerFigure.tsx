import dealerCore from '../../assets/dealer/dealer-core.webp'
import dealerLeftArm from '../../assets/dealer/dealer-left-arm.webp'
import dealerRightArm from '../../assets/dealer/dealer-right-arm.webp'
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

/** Higgsfield artwork is split at the shoulders so the card hand can lead each deal. */
export function DealerFigure({
  gesture = 'idle',
  speed = 'normal',
  motionKey,
  className,
}: DealerFigureProps) {
  return (
    <div
      className={`dealer-figure-stage${className ? ` ${className}` : ''}`}
      data-gesture={gesture}
      data-motion-speed={speed}
      aria-hidden="true"
    >
      <div className="dealer-figure__artboard">
        <div className="dealer-figure__rig" key={motionKey ?? gesture}>
          <div className="dealer-figure__left-arm">
            <img src={dealerLeftArm} alt="" draggable="false" />
            <span className="dealer-figure__release-point" data-motion-shoe />
          </div>
          <div className="dealer-figure__right-arm">
            <img src={dealerRightArm} alt="" draggable="false" />
          </div>
          <img className="dealer-figure__core" src={dealerCore} alt="" draggable="false" />
        </div>
      </div>
    </div>
  )
}
