import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion'
import type { DealerGesture } from '../ui/DealerFigure'

export interface DealerMotionProps {
  gesture: DealerGesture
  [key: string]: unknown
}

const WIDTH = 1391
const HEIGHT = 1230
const ease = Easing.bezier(0.35, 0, 0.2, 1)

function pose(frame: number, frames: number[], values: number[]): number {
  return interpolate(frame, frames, values, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  })
}

const fullCanvas: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: WIDTH,
  height: HEIGHT,
}

function layer(file: string, style?: React.CSSProperties) {
  return <Img src={staticFile(`dealer/${file}`)} style={{ ...fullCanvas, ...style }} />
}

/** A deterministic, frame-driven cutout rig. The player and Remotion Studio share this composition. */
export function DealerMotion({ gesture }: DealerMotionProps) {
  const frame = useCurrentFrame()
  const isDeal = gesture === 'deal-player' || gesture === 'deal-dealer'
  const playerDeal = gesture === 'deal-player'
  const strength = playerDeal ? 1 : 0.72
  const shoulder = isDeal
    ? pose(frame, [0, 5, 14, 18, 27, 35], [0, 2, -10 * strength, -9 * strength, -2, 0])
    : gesture === 'reveal'
      ? pose(frame, [0, 6, 17, 28, 35], [0, -2, 7, 2, 0])
      : 0
  const elbow = isDeal
    ? pose(frame, [0, 5, 13, 18, 27, 35], [0, -3, 12 * strength, 15 * strength, 4, 0])
    : gesture === 'reveal'
      ? pose(frame, [0, 6, 17, 28, 35], [0, 5, -10, -3, 0])
      : 0
  const supportShoulder = isDeal
    ? pose(frame, [0, 7, 17, 28, 35], [0, 1, -3, -1, 0])
    : gesture === 'reveal'
      ? pose(frame, [0, 6, 18, 28, 35], [0, -4, 12, 3, 0])
      : gesture === 'win'
        ? pose(frame, [0, 12, 22, 35], [0, -5, 4, 0])
        : 0
  const supportElbow = isDeal
    ? pose(frame, [0, 7, 17, 28, 35], [0, -1, 5, 1, 0])
    : gesture === 'reveal'
      ? pose(frame, [0, 7, 18, 28, 35], [0, 4, -18, -4, 0])
      : gesture === 'win'
        ? pose(frame, [0, 12, 22, 35], [0, 4, -7, 0])
        : 0
  const torsoY = gesture === 'idle'
    ? Math.sin(frame * Math.PI / 105) * -2.5
    : isDeal
      ? pose(frame, [0, 5, 15, 24, 35], [0, -3, 2, 1, 0])
      : gesture === 'win'
        ? pose(frame, [0, 12, 22, 35], [0, -5, 2, 0])
        : gesture === 'loss'
          ? pose(frame, [0, 12, 22, 35], [0, 3, 1, 0])
          : 0
  const torsoRotate = isDeal
    ? pose(frame, [0, 6, 17, 29, 35], [0, -0.6, 1.4, 0.4, 0])
    : 0

  return (
    <AbsoluteFill style={{ overflow: 'visible' }} data-dealer-frame={frame}>
      <div
        style={{
          ...fullCanvas,
          transform: `translateY(${torsoY}px) rotate(${torsoRotate}deg)`,
          transformOrigin: '680px 650px',
          filter: 'drop-shadow(0 29px 23px rgba(5, 18, 18, .22))',
        }}
      >
        <div style={{ ...fullCanvas, transform: `rotate(${shoulder}deg)`, transformOrigin: '376px 604px' }}>
          {layer('viewer-left-upper-sleeve.png')}
        </div>
        <div style={{ ...fullCanvas, transform: `rotate(${supportShoulder}deg)`, transformOrigin: '868px 604px' }}>
          {layer('viewer-right-upper-sleeve.png')}
        </div>
        {layer('core-body.png')}
        <div style={{ ...fullCanvas, transform: `rotate(${shoulder}deg)`, transformOrigin: '376px 604px' }}>
          {layer('viewer-left-cuff-overlay.png')}
        </div>
        <div style={{ ...fullCanvas, transform: `rotate(${supportShoulder}deg)`, transformOrigin: '868px 604px' }}>
          {layer('viewer-right-cuff-overlay.png')}
        </div>
        <div style={{ ...fullCanvas, transform: `rotate(${shoulder}deg)`, transformOrigin: '376px 604px' }}>
          <div style={{ ...fullCanvas, transform: `rotate(${elbow}deg)`, transformOrigin: '276px 968px' }}>
            {layer('viewer-left-forearm-hand-cards.png')}
            <div
              data-motion-shoe
              style={{ position: 'absolute', left: 158, top: 589, width: 2, height: 2, opacity: 0 }}
            />
          </div>
        </div>
        <div style={{ ...fullCanvas, transform: `rotate(${supportShoulder}deg)`, transformOrigin: '868px 604px' }}>
          <div style={{ ...fullCanvas, transform: `rotate(${supportElbow}deg)`, transformOrigin: '1003px 987px' }}>
            {layer('viewer-right-forearm-hand.png')}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
