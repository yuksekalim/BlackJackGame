import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Card } from '../game/types'
import CARD_BACK_URL from '../../assets/cards/back.svg?url'
import './animated-card.css'
import './motion-feedback.css'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const CARD_FACE_FILES = import.meta.glob<string>('../../assets/cards/faces/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
})
const CARD_FACE_URLS = Object.fromEntries(
  Object.entries(CARD_FACE_FILES).map(([assetPath, url]) => {
    const fileName = assetPath.slice(assetPath.lastIndexOf('/') + 1).replace(/\.svg$/, '')
    return [fileName, url]
  }),
) as Record<string, string>

export interface AnimatedCardProps {
  card: Card
  cardId: string
  hidden?: boolean
  speed: 'normal' | 'fast' | 'instant'
  className?: string
  /** False for already-dealt cards that move between lanes, such as the second split card. */
  animateOnMount?: boolean
  /** Change this token to replay the entrance for a deliberately re-dealt card identity. */
  entranceKey?: string | number
}

interface DealState {
  identity: string
  speed: AnimatedCardProps['speed']
  entranceKey?: string | number
}

interface FlipState extends DealState {
  hidden: boolean
}

const useSafeLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

function readReducedMotionPreference(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function cancelAnimation(animationRef: { current: Animation | null }): void {
  const animation = animationRef.current
  if (!animation) return

  animationRef.current = null
  animation.onfinish = null
  animation.cancel()
}

function cancelScheduledDeal(timerRef: { current: number | null }): void {
  if (timerRef.current === null) return

  window.clearTimeout(timerRef.current)
  timerRef.current = null
}

function finishAnimation(animation: Animation, animationRef: { current: Animation | null }): void {
  animation.onfinish = () => {
    if (animationRef.current !== animation) return
    animationRef.current = null
    animation.onfinish = null
    // The rendered transform/visibility is already authoritative. Clearing the
    // finished effect returns the element to that rendered state.
    animation.cancel()
  }
}

function getShoeOffset(wrapper: HTMLDivElement): { x: number; y: number } {
  const table = wrapper.closest('.bj-table')
  // The release point lives inside the animated SVG hand, so it may be an
  // SVGElement rather than an HTMLElement. Both expose getBoundingClientRect.
  const shoe = table?.querySelector('[data-motion-shoe]')
    ?? document.querySelector('[data-motion-shoe]')
  const target = wrapper.getBoundingClientRect()

  if (!shoe) return { x: -Math.max(target.width * 1.45, 92), y: -Math.max(target.height * 1.1, 78) }

  const source = shoe.getBoundingClientRect()
  return {
    x: source.left + source.width / 2 - (target.left + target.width / 2),
    y: source.top + source.height / 2 - (target.top + target.height / 2),
  }
}

function getFaceUrl(card: Card): string {
  const fileName = `${card.suit}-${card.rank}`
  const url = CARD_FACE_URLS[fileName]

  if (!url) {
    throw new Error(`Missing card artwork: ${fileName}.svg`)
  }

  return url
}

export function AnimatedCard({
  card,
  cardId,
  hidden = false,
  speed,
  className,
  animateOnMount = true,
  entranceKey,
}: AnimatedCardProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(readReducedMotionPreference)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<HTMLDivElement>(null)
  const dealAnimationRef = useRef<Animation | null>(null)
  const flipAnimationRef = useRef<Animation | null>(null)
  const dealStartTimerRef = useRef<number | null>(null)
  const dealStateRef = useRef<DealState | null>(null)
  const flipStateRef = useRef<FlipState | null>(null)
  const identity = `${cardId}:${card.suit}-${card.rank}`
  const faceUrl = getFaceUrl(card)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)
    updatePreference()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference)
      return () => mediaQuery.removeEventListener('change', updatePreference)
    }

    mediaQuery.addListener(updatePreference)
    return () => mediaQuery.removeListener(updatePreference)
  }, [])

  useSafeLayoutEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const previous = dealStateRef.current
    const pendingLaunch = dealStartTimerRef.current !== null
    // Clearing an entrance token when the sequence completes must not replay
    // the last card. Only a new explicit token requests another entrance.
    const identityChanged = previous?.identity !== identity
      || (entranceKey !== undefined && previous?.entranceKey !== entranceKey)
    const activeAnimation = dealAnimationRef.current
    let continuedFrom: Keyframe | null = null

    if (!identityChanged && activeAnimation && previous?.speed !== speed) {
      const currentStyle = window.getComputedStyle(wrapper)
      continuedFrom = {
        opacity: currentStyle.opacity,
        transform: currentStyle.transform,
      }
    }

    const resumePendingLaunch = pendingLaunch && previous?.speed !== speed
    cancelScheduledDeal(dealStartTimerRef)
    cancelAnimation(dealAnimationRef)
    wrapper.style.opacity = ''
    dealStateRef.current = { identity, speed, entranceKey }

    if (speed === 'instant' || prefersReducedMotion || typeof wrapper.animate !== 'function') return
    if (identityChanged && !animateOnMount) return
    if (!identityChanged && !continuedFrom && !resumePendingLaunch) return

    const startDeal = () => {
      dealStartTimerRef.current = null
      wrapper.style.opacity = ''
      if (!wrapper.isConnected) return

      // Sample at release time: the dealer has begun the arm sweep, and this
      // point follows the articulated SVG wrist rather than a fixed table spot.
      const { x, y } = getShoeOffset(wrapper)
      const arcLift = Math.min(74, Math.max(24, Math.abs(y) * 0.14))
      const to: Keyframe = {
        opacity: 1,
        transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
      }
      const from: Keyframe = continuedFrom ?? {
        opacity: 0.16,
        filter: 'brightness(1.18) drop-shadow(0 17px 12px rgba(0, 0, 0, .34))',
        transform: `translate3d(${x}px, ${y}px, 0) rotate(-15deg) scale(.78)`,
      }
      const middle: Keyframe = {
        offset: 0.62,
        opacity: 1,
        filter: 'brightness(1.08) drop-shadow(0 12px 9px rgba(0, 0, 0, .3))',
        transform: `translate3d(${x * 0.34}px, ${y * 0.34 - arcLift}px, 0) rotate(5deg) scale(1.045)`,
      }
      const landing: Keyframe = {
        offset: 0.87,
        opacity: 1,
        filter: 'brightness(1.03) drop-shadow(0 7px 6px rgba(0, 0, 0, .28))',
        transform: 'translate3d(0, -5px, 0) rotate(-1deg) scale(1.012)',
      }
      const keyframes = continuedFrom ? [from, to] : [from, middle, landing, to]
      const animation = wrapper.animate(keyframes, {
        duration: speed === 'fast' ? 250 : 510,
        easing: 'cubic-bezier(0.16, 0.76, 0.22, 1)',
        fill: 'both',
      })

      dealAnimationRef.current = animation
      finishAnimation(animation, dealAnimationRef)
    }

    if (continuedFrom) {
      startDeal()
      return
    }

    // Give the articulated hand a short windup, then measure its live release
    // point. The brief hidden interval prevents a flash at the landing slot.
    wrapper.style.opacity = '0'
    dealStartTimerRef.current = window.setTimeout(startDeal, speed === 'fast' ? 24 : 48)
  }, [identity, speed, prefersReducedMotion, animateOnMount, entranceKey])

  useSafeLayoutEffect(() => {
    const flip = flipRef.current
    if (!flip) return

    const previous = flipStateRef.current
    const isSameCard = previous?.identity === identity
    const hiddenChanged = isSameCard && previous.hidden !== hidden
    const activeAnimation = flipAnimationRef.current
    const shouldRetarget = isSameCard
      && !hiddenChanged
      && activeAnimation !== null
      && previous.speed !== speed
    const currentTransform = activeAnimation
      ? window.getComputedStyle(flip).transform
      : null
    const previousHidden = previous?.hidden ?? hidden

    cancelAnimation(flipAnimationRef)
    flipStateRef.current = { identity, hidden, speed }

    if (!isSameCard || (!hiddenChanged && !shouldRetarget)) return
    if (speed === 'instant' || prefersReducedMotion || typeof flip.animate !== 'function') return

    const from = currentTransform ?? (previousHidden ? 'rotateY(180deg)' : 'rotateY(0deg)')
    const to = hidden ? 'rotateY(180deg)' : 'rotateY(0deg)'
    const animation = flip.animate([{ transform: from }, { transform: to }], {
      duration: speed === 'fast' ? 180 : 390,
      easing: 'cubic-bezier(0.2, 0.72, 0.25, 1)',
      fill: 'both',
    })

    flipAnimationRef.current = animation
    finishAnimation(animation, flipAnimationRef)
  }, [identity, hidden, speed, prefersReducedMotion])

  useSafeLayoutEffect(() => {
    return () => {
      cancelScheduledDeal(dealStartTimerRef)
      cancelAnimation(dealAnimationRef)
      cancelAnimation(flipAnimationRef)
      if (wrapperRef.current) wrapperRef.current.style.opacity = ''
      // Reset refs so React Strict Mode's development remount can replay the
      // entrance animation, while a real unmount leaves no active effects.
      dealStateRef.current = null
      flipStateRef.current = null
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={className ? `animated-card ${className}` : 'animated-card'}
      data-motion-speed={speed}
      role="img"
      aria-label={hidden ? 'Face-down card' : `${card.rank} of ${card.suit}`}
    >
      <div
        ref={flipRef}
        className="animated-card__flip"
        style={{ transform: hidden ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <img className="animated-card__face" src={faceUrl} alt="" aria-hidden="true" draggable={false} />
        <img className="animated-card__back" src={CARD_BACK_URL} alt="" aria-hidden="true" draggable={false} />
      </div>
    </div>
  )
}
