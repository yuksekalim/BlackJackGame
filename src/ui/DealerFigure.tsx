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
 * An original, Japanese-inspired vector dealer. The releasing hand carries a
 * live SVG source point so AnimatedCard can sample its current articulated pose.
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
      data-motion-key={replayKey}
      aria-hidden="true"
    >
      <div className="dealer-figure__artboard">
        <svg
          className="dealer-figure__art"
          viewBox="0 0 320 200"
          preserveAspectRatio="xMidYMax meet"
          focusable="false"
        >
          <defs>
            <linearGradient id="dealer-hair" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#332523" />
              <stop offset=".5" stopColor="#211e21" />
              <stop offset="1" stopColor="#171c23" />
            </linearGradient>
            <linearGradient id="dealer-skin" x1=".15" y1="0" x2=".82" y2="1">
              <stop offset="0" stopColor="#ffddbd" />
              <stop offset=".72" stopColor="#edb797" />
              <stop offset="1" stopColor="#d9957a" />
            </linearGradient>
            <linearGradient id="dealer-coat" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#171e2b" />
              <stop offset=".48" stopColor="#273244" />
              <stop offset="1" stopColor="#151c29" />
            </linearGradient>
            <linearGradient id="dealer-sleeve" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fffdf6" />
              <stop offset="1" stopColor="#d8d6cd" />
            </linearGradient>
            <linearGradient id="dealer-card-back" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#34475d" />
              <stop offset="1" stopColor="#172337" />
            </linearGradient>
          </defs>

          <ellipse cx="160" cy="197" rx="57" ry="3" fill="#111b19" opacity=".12" />

          {/* Hair falls behind the shoulders and frames the face. */}
          <g className="dealer-figure__hair-back">
            <path d="M137 49c-8 15-13 34-12 56 1 20 9 34 24 41l18-16 33 13c13-11 17-29 15-50-2-28-13-47-37-54z" fill="url(#dealer-hair)" />
            <path d="M189 17c13 1 22 10 20 22-1 10-9 17-19 18-8-5-12-14-10-23 1-8 4-13 9-17z" fill="#252126" />
            <path d="M138 67c-4 17-4 39 1 53m55-52c5 19 6 39 2 54" fill="none" stroke="#59403a" strokeWidth="2" strokeLinecap="round" opacity=".7" />
          </g>

          {/* Neck and the clean silhouette of the uniform. */}
          <path d="M150 78h20v24c0 7-4 11-10 11s-10-4-10-11z" fill="url(#dealer-skin)" />
          <path d="M125 101c8-8 18-11 28-12l7 14 7-14c11 1 21 4 29 12 9 13 13 45 17 99H107c4-54 8-86 18-99z" fill="url(#dealer-sleeve)" />

          {/* Rear arms make the figure feel planted behind the table. */}
          <g transform="translate(122 105) scale(-1 1)">
            <g className="dealer-figure__joint-motion dealer-figure__upper dealer-figure__upper--stock" key={`stock-arm-${replayKey}`}>
              <path d="M0 1c11 0 23 4 30 13l9 13-8 9c-8-1-17 2-23 8C3 36 1 26 0 16z" fill="url(#dealer-sleeve)" stroke="#b9b6ad" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M5 8c9 1 18 5 24 12M9 33c6-3 11-4 17-4" fill="none" stroke="#c4c1b8" strokeWidth="1.2" strokeLinecap="round" opacity=".8" />
              <g transform="translate(29 28)">
                <g className="dealer-figure__joint-motion dealer-figure__forearm dealer-figure__forearm--stock" key={`stock-forearm-${replayKey}`}>
                <path d="M1 0c10 2 20 8 27 16l5 9-8 9C16 28 8 23 0 19v-8z" fill="url(#dealer-sleeve)" stroke="#b9b6ad" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M23 21l10 4-5 10-10-5z" fill="#d3c8b7" stroke="#a98e70" strokeWidth="1.2" />
                <path d="M25 24l6 2" stroke="#bd4b43" strokeWidth="1.3" strokeLinecap="round" />
                <g transform="translate(26 24)">
                  <g className="dealer-figure__joint-motion dealer-figure__wrist dealer-figure__wrist--stock" key={`stock-wrist-${replayKey}`}>
                  <path d="M1 3c4-4 10-3 14 0l5 4c2 2 1 5-1 6l-8 1-8-3C0 9-1 6 1 3z" fill="url(#dealer-skin)" stroke="#a86e5d" strokeWidth="1.2" strokeLinejoin="round" />
                  <g className="dealer-figure__stock-cards">
                    <rect x="-2" y="-19" width="19" height="25" rx="2" transform="rotate(-11 7 0)" fill="#fbf7e9" stroke="#d3c4a5" strokeWidth="1" />
                    <rect x="2" y="-21" width="19" height="25" rx="2" transform="rotate(-4 11 -8)" fill="#fbf7e9" stroke="#d3c4a5" strokeWidth="1" />
                    <rect x="5" y="-22" width="19" height="25" rx="2" transform="rotate(4 14 -9)" fill="url(#dealer-card-back)" stroke="#e1c17a" strokeWidth="1.2" />
                    <rect x="7" y="-20" width="15" height="21" rx="1.2" transform="rotate(4 14 -9)" fill="none" stroke="#e7d8aa" strokeWidth=".65" />
                    <path d="M13-14l2 2 2-2-2 6z" fill="#c84b43" transform="rotate(4 14 -9)" />
                    <circle cx="15" cy="-9" r="1.2" fill="#e7d8aa" />
                  </g>
                  <path d="M8 4c2-4 5-7 9-8 2 0 3 2 2 4l-4 6" fill="none" stroke="#f7cfac" strokeWidth="2" strokeLinecap="round" />
                  </g>
                </g>
                </g>
              </g>
            </g>
          </g>

          <g transform="translate(198 105)">
            <g className="dealer-figure__joint-motion dealer-figure__upper dealer-figure__upper--dealing" key={`deal-arm-${replayKey}`}>
              <path d="M0 1c11 0 23 4 30 13l9 13-8 9c-8-1-17 2-23 8C3 36 1 26 0 16z" fill="url(#dealer-sleeve)" stroke="#b9b6ad" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M5 8c9 1 18 5 24 12M9 33c6-3 11-4 17-4" fill="none" stroke="#c4c1b8" strokeWidth="1.2" strokeLinecap="round" opacity=".8" />
              <g transform="translate(29 28)">
                <g className="dealer-figure__joint-motion dealer-figure__forearm dealer-figure__forearm--dealing" key={`deal-forearm-${replayKey}`}>
                <path d="M1 0c10 2 20 8 27 16l5 9-8 9C16 28 8 23 0 19v-8z" fill="url(#dealer-sleeve)" stroke="#b9b6ad" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M23 21l10 4-5 10-10-5z" fill="#d3c8b7" stroke="#a98e70" strokeWidth="1.2" />
                <path d="M25 24l6 2" stroke="#bd4b43" strokeWidth="1.3" strokeLinecap="round" />
                <g transform="translate(26 24)">
                  <g className="dealer-figure__joint-motion dealer-figure__wrist dealer-figure__wrist--dealing" key={`deal-wrist-${replayKey}`}>
                  <path d="M1 3c4-4 10-3 14 0l5 4c2 2 1 5-1 6l-8 1-8-3C0 9-1 6 1 3z" fill="url(#dealer-skin)" stroke="#a86e5d" strokeWidth="1.2" strokeLinejoin="round" />
                  <g className="dealer-figure__held-card">
                    <rect x="1" y="-18" width="15" height="21" rx="1.6" transform="rotate(-11 8.5 -7.5)" fill="#fff9ed" stroke="#c9bca2" strokeWidth="1" />
                    <path d="M5-13l2 2 2-2-2 5z" fill="#bd3540" transform="rotate(-11 8.5 -7.5)" />
                    <path d="M4-15h3" stroke="#24364a" strokeWidth=".8" strokeLinecap="round" transform="rotate(-11 8.5 -7.5)" />
                  </g>
                  <path d="M7 4c3-4 5-7 9-9 2-1 4 1 3 3l-4 7" fill="none" stroke="#f8cfac" strokeWidth="2.1" strokeLinecap="round" />
                  <circle className="dealer-figure__release-point" cx="11" cy="6" r=".7" fill="transparent" data-motion-shoe />
                  </g>
                </g>
                </g>
              </g>
            </g>
          </g>

          {/* Tailored haori-inspired waistcoat, gold piping, and a restrained red accent. */}
          <g className="dealer-figure__torso">
            <path d="M132 100c7-6 14-9 21-10l7 15 7-15c8 1 15 4 22 10l9 99h-82z" fill="url(#dealer-coat)" stroke="#101722" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M151 93l9 12-8 15-12-17z" fill="#f5f0e4" stroke="#cfb878" strokeWidth="1" />
            <path d="M169 93l-9 12 8 15 12-17z" fill="#f5f0e4" stroke="#cfb878" strokeWidth="1" />
            <path d="M151 101l9 11-6 6-7-9zM169 101l-9 11 6 6 7-9z" fill="#25354a" />
            <path d="M157 113l3 2 3-2 2 7-5 5-5-5z" fill="#a8303c" />
            <path d="M156 119h8" stroke="#e2c77f" strokeWidth="1.2" />
            <path d="M143 126l-7 68M177 126l7 68" fill="none" stroke="#b99b60" strokeWidth="1.2" opacity=".84" />
            <path d="M160 132v57" stroke="#728093" strokeWidth=".75" opacity=".58" />
            <circle cx="160" cy="137" r="1.8" fill="#d5b36a" />
            <circle cx="160" cy="151" r="1.8" fill="#d5b36a" />
            <circle cx="160" cy="165" r="1.8" fill="#d5b36a" />
            <path d="M173 124h11v5h-11z" fill="#d1ad67" />
            <path d="M175 125h7v2h-7z" fill="#f0d89d" />
            <path d="M140 111c3 3 5 6 7 10M180 111c-3 3-5 6-7 10" fill="none" stroke="#cfb878" strokeWidth=".8" opacity=".72" />
            <path d="M118 194h84" stroke="#101722" strokeWidth="3" opacity=".55" />
          </g>

          {/* Head, with a calm expression and a sweeping dark bob. */}
          <g className="dealer-figure__head">
            <path d="M143 76c-7-7-11-18-11-31 0-23 13-39 32-40 23-1 37 16 36 42-1 19-6 34-17 43l-8-19z" fill="url(#dealer-hair)" />
            <path d="M147 76h26v24c-7 5-18 5-26 0z" fill="url(#dealer-skin)" />
            <path d="M136 35c0-18 11-30 27-30 17 0 28 12 28 31v13c0 22-12 36-28 36s-28-14-28-36V35z" fill="url(#dealer-skin)" />
            <path d="M135 41c-5-3-8 0-7 6 1 5 4 8 9 8M192 41c5-3 8 0 7 6-1 5-4 8-9 8" fill="url(#dealer-skin)" stroke="#bd8068" strokeWidth="1.3" />
            <circle cx="132" cy="55" r="2.2" fill="#d5b36d" />
            <circle cx="195" cy="55" r="2.2" fill="#d5b36d" />
            <path d="M143 48c4-3 9-3 13-1M164 47c4-2 9-2 13 1" fill="none" stroke="#49302a" strokeWidth="1.8" strokeLinecap="round" />
            <g className="dealer-figure__eyes">
              <path d="M143 54c3-4 9-4 13 0-1 5-4 7-7 7-3 0-5-2-6-7zM164 54c3-4 9-4 13 0-1 5-4 7-7 7-3 0-5-2-6-7z" fill="#fffaf1" />
              <ellipse cx="151" cy="56" rx="2.6" ry="3.2" fill="#352923" />
              <ellipse cx="172" cy="56" rx="2.6" ry="3.2" fill="#352923" />
              <circle cx="152" cy="55" r=".8" fill="#fff" />
              <circle cx="173" cy="55" r=".8" fill="#fff" />
            </g>
            <path d="M160 55c-1 5-3 9-2 11 1 1 3 1 4 0" fill="none" stroke="#bc7b65" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M154 72c4 3 9 3 13 0" fill="none" stroke="#984d4b" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M156 73c3 1 6 1 9 0" stroke="#fff0dd" strokeWidth=".75" strokeLinecap="round" />
            <path d="M133 41c3-20 15-30 31-30 15 0 24 8 27 22-8-3-15-10-18-17-7 13-20 20-39 22l-1 16c-5-7-7-16-6-23z" fill="url(#dealer-hair)" />
            <path d="M137 33c8-15 21-20 34-17M139 39c10-5 17-11 21-18M180 18c5 4 8 8 10 14" fill="none" stroke="#604840" strokeWidth="1.4" strokeLinecap="round" opacity=".78" />
            <path d="M137 79c5 9 13 14 23 15 11 0 19-6 24-17" fill="none" stroke="#332523" strokeWidth="4" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  )
}
