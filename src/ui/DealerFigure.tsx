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

/**
 * A decorative, original vector dealer stage. Place it before the dealer heading
 * and cards inside `.bj-dealer-area`; its invisible source anchor is used by
 * AnimatedCard to begin each card flight at the dealer's right hand.
 */
export function DealerFigure({
  gesture = 'idle',
  speed = 'normal',
  motionKey,
  className,
}: DealerFigureProps) {
  const replayKey = motionKey ?? gesture

  return (
    <div
      className={`dealer-figure-stage${className ? ` ${className}` : ''}`}
      data-gesture={gesture}
      data-motion-speed={speed}
      data-motion-key={motionKey}
      aria-hidden="true"
    >
      <div className="dealer-figure__artboard">
        <svg
          className="dealer-figure__art"
          viewBox="80 0 240 200"
          preserveAspectRatio="xMidYMax meet"
          focusable="false"
        >
          <g className="dealer-figure__back-hair">
            <path d="M166 45c-19 3-30 18-29 39 1 18 8 27 4 44 11-2 20-9 23-20l16-49z" fill="#282220" />
            <path d="M149 94c-7 12-5 25-1 33 5-3 10-10 11-19z" fill="#45302a" />
          </g>

          <path className="dealer-figure__shirt-back" d="M145 105c8-9 22-14 36-14l19 16 19-16c15 0 28 6 36 15 15 17 23 43 27 94H118c4-51 12-78 27-95z" fill="#e8e5dc" />

          <g
            className="dealer-figure__arm dealer-figure__arm--left"
            key={`left-${replayKey}`}
          >
            <path d="M151 101c-15 1-27 7-35 18l-21 34c-3 5-2 10 3 13l8 4c5 2 9 0 12-5l20-27c6-7 14-11 24-14l8-13z" fill="#f1eee6" stroke="#c7c5bc" strokeWidth="2" strokeLinejoin="round" />
            <path d="m99 151 17 9-5 9-17-9z" fill="#cbd0c8" stroke="#aeb5ae" strokeWidth="1.5" />
            <path d="M94 158c-3-4-2-8 2-10 3-2 6 0 7 3l4-4c2-2 5-1 5 2l-2 9c-1 4-5 6-9 5z" fill="#e8ad91" stroke="#9f6854" strokeWidth="1.5" strokeLinejoin="round" />
          </g>

          <g
            className="dealer-figure__arm dealer-figure__arm--right"
            key={`right-${replayKey}`}
          >
            <path d="M249 101c15 1 27 7 35 18l21 34c3 5 2 10-3 13l-8 4c-5 2-9 0-12-5l-20-27c-6-7-14-11-24-14l-8-13z" fill="#f1eee6" stroke="#c7c5bc" strokeWidth="2" strokeLinejoin="round" />
            <path d="m301 151-17 9 5 9 17-9z" fill="#cbd0c8" stroke="#aeb5ae" strokeWidth="1.5" />
            <path d="M306 158c3-4 2-8-2-10-3-2-6 0-7 3l-4-4c-2-2-5-1-5 2l2 9c1 4 5 6 9 5z" fill="#e8ad91" stroke="#9f6854" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M303 150c2-3 5-4 7-2 2 2 1 5-1 7" fill="none" stroke="#f4c3a4" strokeWidth="2" strokeLinecap="round" />
          </g>

          <g className="dealer-figure__vest">
            <path d="M151 103c9-8 20-12 31-12l18 23 18-23c12 0 23 4 32 12l11 97H139z" fill="#20272a" />
            <path d="m178 99 22 25 22-25-7 24-15 21-15-21z" fill="#faf7ed" />
            <path d="m181 100 19 21-10 3-11-13-8-8zM219 100l-19 21 10 3 11-13 8-8z" fill="#d9d9d0" />
            <path d="m192 119 8-5 8 5-2 8 2 10-8 9-8-9 2-10z" fill="#9d2d36" />
            <path d="m192 119 8 4 8-4-2 8 2 10-8-3-8 3 2-10z" fill="#c63a40" />
            <path d="M198 121h4v5h-4z" fill="#e7b8a0" />
            <path d="M178 145 170 196M222 145l8 51" fill="none" stroke="#586064" strokeWidth="2" />
            <circle cx="184" cy="156" r="2.4" fill="#c4a760" />
            <circle cx="181" cy="173" r="2.4" fill="#c4a760" />
            <circle cx="216" cy="156" r="2.4" fill="#c4a760" />
            <circle cx="219" cy="173" r="2.4" fill="#c4a760" />
            <path d="M229 143h19v3h-19z" fill="#c4a760" />
            <path d="M231 140h16v3h-16z" fill="#e3cb8d" />
          </g>

          <g className="dealer-figure__head" key={`head-${replayKey}`}>
            <path d="M159 46c-8 9-11 23-8 36 2 8 8 15 15 18l5-31zM240 43c9 10 12 24 8 38-2 8-8 15-15 19l-5-33z" fill="#352723" />
            <path d="M173 82h54v29c0 13-11 23-27 23s-27-10-27-23z" fill="#d99678" />
            <path d="M160 48c0-22 16-37 39-37 25 0 42 16 42 41v25c-7-6-14-14-19-24-10 7-23 11-41 10-7 0-14-2-20-5v-10z" fill="#302522" />
            <path d="M162 54c0-22 15-37 37-37 20 0 34 11 39 29-8-6-15-13-18-20-8 13-24 22-46 24-4 0-8 2-12 4z" fill="#40302a" />
            <path d="M164 59c0-17 13-28 31-30-7 9-14 15-27 19l-2 19z" fill="#211f20" />
            <path d="M167 56c-2 8-3 17 0 26 5 17 17 27 33 27s28-10 33-27c3-10 2-22-1-31-10-2-18-7-24-13-7 8-20 15-41 18z" fill="#f0b99a" />
            <path d="M154 66c-6-3-9 1-8 7 1 6 5 9 11 9M245 66c6-3 9 1 8 7-1 6-5 9-11 9" fill="#e8a98b" stroke="#a96e59" strokeWidth="2" />
            <path d="M171 65c5-4 12-5 18-2M212 63c6-3 13-2 18 2" fill="none" stroke="#4b302b" strokeWidth="3" strokeLinecap="round" />
            <path d="M170 73c5-5 13-5 18 0 1 5-3 10-9 10-6 0-10-4-9-10zM212 73c5-5 13-5 18 0 1 5-3 10-9 10-6 0-10-4-9-10z" fill="#fff8ee" />
            <ellipse cx="180" cy="77" rx="4.5" ry="6" fill="#342925" />
            <ellipse cx="221" cy="77" rx="4.5" ry="6" fill="#342925" />
            <circle cx="181.5" cy="75" r="1.5" fill="#fff" />
            <circle cx="222.5" cy="75" r="1.5" fill="#fff" />
            <path d="M200 77c-2 6-4 10-2 12 2 2 5 2 7 1" fill="none" stroke="#c27e67" strokeWidth="2" strokeLinecap="round" />
            <path d="M192 98c5 3 12 3 17-1" fill="none" stroke="#9c4b48" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M194 98c3 1 7 1 11 0" fill="none" stroke="#fff0df" strokeWidth="1" strokeLinecap="round" />
            <path d="M164 52c9-4 17-8 23-15M166 59c11-3 20-8 27-16M231 54c-5-4-8-8-10-13" fill="none" stroke="#584038" strokeWidth="2" strokeLinecap="round" opacity=".76" />
          </g>
        </svg>

        <span className="dealer-figure__shoe-anchor" data-motion-shoe />
      </div>
    </div>
  )
}
