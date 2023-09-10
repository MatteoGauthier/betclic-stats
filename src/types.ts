export type Bet = {
  id: number
  bet_reference: string
  bet_type: string
  placed_date_utc: string
  closed_date_utc: string
  result: string
  odds: number
  stake: number
  winnings: number
  is_freebet: boolean
  bet_selections: {
    id: number
    odds: number
    result: string
    selection_label: string
    market_id: number
    market_label: string
    match_label: string
    match_id: number
    match_status: string
    match_date_utc: string
    sport_label: string
    sport_id: number
    competition_label: string
  }[]
}

export type BetResponse = {
  bets: Bet[]
}

export type BetStats = {
  totalBets: number
  winningBets: number
  losingBets: number
  winRate: number
  profitAndLoss: number
  profitBySport: { [key: string]: number }
  profitByBetType: { [key: string]: number }
  winRateBySport: { [key: string]: { wins: number; total: number; rate?: number } }
  winRateByBetType: { [key: string]: { wins: number; total: number; rate?: number } }
}
