import { describe, expect, it } from 'vitest'
import { summarizeRound } from '../../src/ui/round-result'

describe('round result copy', () => {
  it('shows net chips after returning the original wager', () => {
    expect(summarizeRound([{ bet: 100, payout: 200 }])).toEqual({
      net: 100, tone: 'win', label: 'You won +100 chips',
    })
    expect(summarizeRound([{ bet: 100, payout: 0 }])).toEqual({
      net: -100, tone: 'loss', label: 'You lost -100 chips',
    })
  })

  it('sums split and doubled hands instead of reporting gross payouts', () => {
    expect(summarizeRound([{ bet: 100, payout: 200 }, { bet: 200, payout: 0 }])).toEqual({
      net: -100, tone: 'loss', label: 'You lost -100 chips',
    })
    expect(summarizeRound([{ bet: 100, payout: 200 }, { bet: 100, payout: 0 }])).toEqual({
      net: 0, tone: 'even', label: 'You broke even · 0 chips',
    })
    expect(summarizeRound([{ bet: 100, payout: 250 }]).net).toBe(150)
  })
})
