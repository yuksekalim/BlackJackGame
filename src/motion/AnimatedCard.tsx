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
}

interface DealState {
  identity: string
  speed: AnimatedCardProps['speed']
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

function getSiblingDealDelay(wrapper: HTMLDivElement): number {
  const slot = wrapper.closest('.bj-card-slot')
  const slotParent = slot?.parentElement

  if (slot && slotParent) {
    const siblingSlots = Array.from(slotParent.children).filter((child) => {
      return child.classList.contains('bj-card-slot')
    })
    const slotIndex = siblingSlots.indexOf(slot)
    if (slotIndex >= 0) return Math.min(slotIndex, 3) * 38
  }

  const parent = wrapper.parentElement
  if (!parent) return 0

  const siblingCards = Array.from(parent.children).filter((child) => {
    return child.classList.contains('animated-card')
  })
  const siblingIndex = siblingCards.indexOf(wrapper)
  return Math.min(Math.max(siblingIndex, 0), 3) * 38
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
}: AnimatedCardProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(readReducedMotionPreference)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<HTMLDivElement>(null)
  const dealAnimationRef = useRef<Animation | null>(null)
  const flipAnimationRef = useRef<Animation | null>(null)
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
    const identityChanged = previous?.identity !== identity
    const activeAnimation = dealAnimationRef.current
    let continuedFrom: Keyframe | null = null

    if (!identityChanged && activeAnimation && previous?.speed !== speed) {
      const currentStyle = window.getComputedStyle(wrapper)
      continuedFrom = {
        opacity: currentStyle.opacity,
        transform: currentStyle.transform,
      }
    }

    cancelAnimation(dealAnimationRef)
    dealStateRef.current = { identity, speed }

    if (speed === 'instant' || prefersReducedMotion || typeof wrapper.animate !== 'function') return
    if (!identityChanged && !continuedFrom) return

    const to: Keyframe = {
      opacity: 1,
      transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
    }
    const from: Keyframe = identityChanged
      ? {
          opacity: 0,
          transform: 'translate3d(-34px, -42px, 0) rotate(-7deg) scale(0.95)',
        }
      : continuedFrom!
    const staggerDelay = getSiblingDealDelay(wrapper)
    const animation = wrapper.animate([from, to], {
      duration: speed === 'fast' ? 210 : 420,
      delay: speed === 'fast' ? Math.round(staggerDelay / 2) : staggerDelay,
      easing: 'cubic-bezier(0.18, 0.82, 0.24, 1)',
      fill: 'both',
    })

    dealAnimationRef.current = animation
    finishAnimation(animation, dealAnimationRef)
  }, [identity, speed, prefersReducedMotion])

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
      duration: speed === 'fast' ? 150 : 300,
      easing: 'cubic-bezier(0.2, 0.72, 0.25, 1)',
      fill: 'both',
    })

    flipAnimationRef.current = animation
    finishAnimation(animation, flipAnimationRef)
  }, [identity, hidden, speed, prefersReducedMotion])

  useSafeLayoutEffect(() => {
    return () => {
      cancelAnimation(dealAnimationRef)
      cancelAnimation(flipAnimationRef)
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
