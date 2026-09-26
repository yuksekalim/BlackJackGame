import type { PlayerHand } from '../game/types'

export type RoundTone = 'win' | 'loss' | 'even'

export interface RoundResult {
  net: number
  tone: RoundTone
  label: string
}

const numberFormat = new Intl.NumberFormat('en-US')

/** Each hand's returned chips include its original stake; net removes that stake. */
export function summarizeRound(hands: readonly Pick<PlayerHand, 'bet' | 'payout'>[]): RoundResult {
  const net = hands.reduce((sum, hand) => sum + (hand.payout ?? 0) - hand.bet, 0)

  if (net > 0) {
    return { net, tone: 'win', label: `You won +${numberFormat.format(net)} chips` }
  }
  if (net < 0) {
    return { net, tone: 'loss', label: `You lost -${numberFormat.format(-net)} chips` }
  }
  return { net, tone: 'even', label: 'You broke even · 0 chips' }
}
