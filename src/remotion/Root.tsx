import { Composition } from 'remotion'
import { DealerMotion } from './DealerMotion'

const motionCanvas = { width: 1391, height: 1230, fps: 60, durationInFrames: 36 }

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="DealToPlayer"
        component={DealerMotion}
        {...motionCanvas}
        defaultProps={{ gesture: 'deal-player' as const }}
      />
      <Composition
        id="DealToDealer"
        component={DealerMotion}
        {...motionCanvas}
        defaultProps={{ gesture: 'deal-dealer' as const }}
      />
      <Composition
        id="Reveal"
        component={DealerMotion}
        {...motionCanvas}
        defaultProps={{ gesture: 'reveal' as const }}
      />
    </>
  )
}
