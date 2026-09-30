import { Composition } from 'remotion'
import { DealerMotion, DEALER_HEIGHT, DEALER_WIDTH, GESTURE_FRAMES } from './DealerMotion'

const motionCanvas = { width: DEALER_WIDTH, height: DEALER_HEIGHT, fps: 60, durationInFrames: GESTURE_FRAMES }

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
        id="PlayerWins"
        component={DealerMotion}
        {...motionCanvas}
        defaultProps={{ gesture: 'win' as const }}
      />
      <Composition
        id="PlayerLoses"
        component={DealerMotion}
        {...motionCanvas}
        defaultProps={{ gesture: 'loss' as const }}
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
