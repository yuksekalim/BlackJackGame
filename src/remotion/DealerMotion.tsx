import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion'
import type { DealerGesture } from '../ui/DealerFigure'

export interface DealerMotionProps {
  gesture: DealerGesture
  frozen?: boolean
  [key: string]: unknown
}

/** Source-art pixels. All pose sprites share this canvas after normalization. */
export const DEALER_WIDTH = 1391
export const DEALER_HEIGHT = 1230
export const GESTURE_FRAMES = 42

const art: Record<string, string> = {
  idle: 'dealer-idle.png',
  near: 'dealer-deal-near.png',
  early: 'dealer-deal-early.png',
  between: 'dealer-deal-between.png',
  mid: 'dealer-deal-mid.png',
  late: 'dealer-deal-late.png',
  extended: 'dealer-deal.png',
  playerWinNear: 'dealer-player-win-near.png',
  playerWinMiddle: 'dealer-player-win-middle.png',
  playerWinBetween: 'dealer-player-win-between.png',
  playerWinLate: 'dealer-player-win-late.png',
  playerWin: 'dealer-player-win.png',
  playerLossNear: 'dealer-player-loss-near.png',
  playerLossMiddle: 'dealer-player-loss-middle.png',
  playerLoss: 'dealer-player-loss.png',
}

const gestureCels: Record<DealerGesture, (keyof typeof art)[]> = {
  idle: ['idle'],
  'deal-player': ['idle', 'near', 'early', 'between', 'mid', 'late', 'extended'],
  'deal-dealer': ['idle', 'near', 'early', 'between', 'mid', 'late', 'extended'],
  reveal: ['idle', 'near', 'early'],
  win: ['idle', 'playerWinNear', 'playerWinMiddle', 'playerWinBetween', 'playerWinLate', 'playerWin'],
  loss: ['idle', 'playerLossNear', 'playerLossMiddle', 'playerLoss'],
}

const releasePoints: Record<string, [number, number]> = {
  idle: [158, 589],
  near: [203, 634],
  early: [263, 691],
  between: [354, 788],
  mid: [445, 851],
  late: [490, 935],
  extended: [557, 1046],
  playerWinNear: [158, 589],
  playerWinMiddle: [158, 589],
  playerWinBetween: [158, 589],
  playerWinLate: [158, 589],
  playerWin: [158, 589],
  playerLossNear: [158, 589],
  playerLossMiddle: [158, 589],
  playerLoss: [158, 589],
}

/** Intact, hand-drawn cels avoid gaps at the elbow or duplicated ghost arms. */
function celAt(frame: number, gesture: DealerGesture): keyof typeof art {
  if (gesture === 'win') return frame < 3 ? 'idle' : frame < 7 ? 'playerWinNear' : frame < 11 ? 'playerWinMiddle' : frame < 15 ? 'playerWinBetween' : frame < 19 ? 'playerWinLate' : 'playerWin'
  if (gesture === 'loss') return frame < 4 ? 'idle' : frame < 8 ? 'playerLossNear' : frame < 13 ? 'playerLossMiddle' : 'playerLoss'
  if (gesture === 'reveal') return frame < 8 || frame >= 24 ? 'idle' : frame < 12 || frame >= 20 ? 'near' : 'early'
  if (gesture !== 'deal-player' && gesture !== 'deal-dealer') return 'idle'
  if (frame < 2 || frame >= 40) return 'idle'
  if (frame < 5 || frame >= 38) return 'near'
  if (frame < 8 || frame >= 36) return 'early'
  if (frame < 11 || frame >= 33) return 'between'
  if (frame < 14 || frame >= 30) return 'mid'
  if (frame < 17 || frame >= 27) return 'late'
  return 'extended'
}

const ease = Easing.bezier(0.22, 0.72, 0.24, 1)
const smooth = (frame: number, times: number[], values: number[]) => interpolate(frame, times, values, {
  easing: ease,
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
})

/** The same frame function runs in Remotion Studio and the live Player. */
export function DealerMotion({ gesture, frozen = false }: DealerMotionProps) {
  const currentFrame = useCurrentFrame()
  const frame = frozen ? GESTURE_FRAMES - 1 : currentFrame
  const isDeal = gesture === 'deal-player' || gesture === 'deal-dealer'
  const cel = celAt(frame, gesture)
  const [handX, handY] = releasePoints[cel]
  const drift = gesture === 'idle' ? Math.sin(frame * Math.PI / 105) * -2.5 : 0
  const reachY = isDeal ? smooth(frame, [0, 7, 17, 23, 34, 41], [0, -3, 5, 5, -2, 0]) : 0
  const reactionY = gesture === 'win'
    ? smooth(frame, [0, 8, 18, 28, 41], [0, 0, 8, 6, 6])
    : gesture === 'loss'
      ? smooth(frame, [0, 7, 17, 27, 41], [0, 0, -11, -4, -5])
      : 0
  const tilt = isDeal
    ? smooth(frame, [0, 8, 18, 26, 41], [0, -0.3, 1.1, 0.7, 0])
    : gesture === 'win' ? smooth(frame, [0, 8, 24, 41], [0, 0, -1.1, -0.6])
      : gesture === 'loss' ? smooth(frame, [0, 7, 22, 41], [0, 0, 1.1, 0.5]) : 0
  const switchFrames = isDeal ? [2, 5, 8, 11, 14, 17, 27, 30, 33, 36, 38, 40] : gesture === 'win' ? [3, 7, 11, 15, 19] : gesture === 'loss' ? [4, 8, 13] : [8, 12, 20, 24]
  const smear = switchFrames.some((cut) => Math.abs(frame - cut) <= 1) ? 1.0 : 0
  const horizontal = isDeal ? smooth(frame, [0, 12, 20, 31, 41], [0, 0, 4, 0, 0]) : 0

  return (
    <AbsoluteFill
      style={{
        overflow: 'visible'
      }}
      data-dealer-frame={frame}
      data-dealer-cel={cel}
    >
      <div style={{
        position: 'absolute', inset: 0,
        width: DEALER_WIDTH, height: DEALER_HEIGHT,
        transform: `translate3d(${horizontal}px, ${drift + reachY + reactionY}px, 0) rotate(${tilt}deg)`,
        transformOrigin: '680px 640px',
        filter: `drop-shadow(0 29px 23px rgba(5, 18, 18, .22)) blur(${smear}px)`,
      }}>
        {/* Keep each pose's src fixed so Remotion cannot interrupt an in-flight image decode. */}
        {(frozen ? [cel] : gestureCels[gesture]).map((pose) => (
          <Img
            key={pose}
            src={staticFile(`dealer/${art[pose]}`)}
            style={{
              position: 'absolute', inset: 0, width: DEALER_WIDTH, height: DEALER_HEIGHT,
              objectFit: 'fill', display: pose === cel ? 'block' : 'none',
            }}
            draggable={false}
            from={-16}
          />
        ))}
        <div
          data-motion-shoe
          style={{ position: 'absolute', left: handX, top: handY, width: 2, height: 2, opacity: 0 }}
        />
      </div>
    </AbsoluteFill>
  )
}
