import { Bet, BetResponse, BetStats } from "../types"

const headers = {
  accept: "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9,fr;q=0.8",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "sec-ch-ua": '"Not)A;Brand";v="24", "Chromium";v="116"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
  "x-client": process.env.BETCLIC_X_CLIENT as string,
  Referer: "https://www.betclic.fr/",
  "Referrer-Policy": "strict-origin-when-cross-origin",
}

export const fetchBets = async (offset = 0, limit = 10): Promise<Bet[]> => {
  const response = await fetch(
    `https://betting.begmedia.com/api/v2/me/bets/ended?limit=${limit}&offset=${offset}&embed=Scoreboard&embed=Metagame`,
    {
      headers,
      body: null,
      method: "GET",
    }
  )
  const data: BetResponse = await response.json()
  const bets = data.bets
  if (bets.length === limit) {
    const nextBets = await fetchBets(offset + limit, limit)
    return [...bets, ...nextBets]
  }
  return bets
}

export const calculateStats = (bets: Bet[]): BetStats => {
  const totalBets = bets.length
  const winningBets = bets.filter((bet) => bet.result === "Win").length
  const losingBets = bets.filter((bet) => bet.result === "Lose").length
  const winRate = winningBets / totalBets
  const profitAndLoss = bets.reduce((total, bet) => total + (bet.winnings - bet.stake), 0)

  const profitBySport = bets.reduce((acc: { [key: string]: number }, bet: Bet) => {
    const profit = bet.winnings - bet.stake
    bet.bet_selections.forEach((selection) => {
      acc[selection.sport_label] = (acc[selection.sport_label] || 0) + profit / bet.bet_selections.length
    })
    return acc
  }, {})

  const profitByBetType = bets.reduce((acc: { [key: string]: number }, bet: Bet) => {
    const profit = bet.winnings - bet.stake
    acc[bet.bet_type] = (acc[bet.bet_type] || 0) + profit
    return acc
  }, {})

  const winRateBySport = bets.reduce(
    (acc: { [key: string]: { wins: number; total: number; rate?: number } }, bet: Bet) => {
      bet.bet_selections.forEach((selection) => {
        acc[selection.sport_label] = acc[selection.sport_label] || { wins: 0, total: 0 }
        acc[selection.sport_label].total++
        if (bet.result === "Win") {
          acc[selection.sport_label].wins++
        }
      })
      return acc
    },
    {}
  )

  for (const sport in winRateBySport) {
    winRateBySport[sport].rate = winRateBySport[sport].wins / winRateBySport[sport].total
  }

  const winRateByBetType = bets.reduce(
    (acc: { [key: string]: { wins: number; total: number; rate?: number } }, bet: Bet) => {
      acc[bet.bet_type] = acc[bet.bet_type] || { wins: 0, total: 0 }
      acc[bet.bet_type].total++
      if (bet.result === "Win") {
        acc[bet.bet_type].wins++
      }
      return acc
    },
    {}
  )

  for (const betType in winRateByBetType) {
    winRateByBetType[betType].rate = winRateByBetType[betType].wins / winRateByBetType[betType].total
  }

  return {
    totalBets,
    winningBets,
    losingBets,
    winRate,
    profitAndLoss,
    profitBySport,
    profitByBetType,
    winRateBySport,
    winRateByBetType,
  }
}

export const logStats = (stats: BetStats) => {
  console.log(`Total bets: ${stats.totalBets}`)
  console.log(`Winning bets: ${stats.winningBets}`)
  console.log(`Losing bets: ${stats.losingBets}`)
  console.log(`Win rate: ${stats.winRate}`)
  console.log(`Profit and Loss: ${stats.profitAndLoss}`)
  console.log("Profit by Sport:", stats.profitBySport)
  console.log("Profit by Bet Type:", stats.profitByBetType)
  console.log("Win Rate by Sport:", stats.winRateBySport)
  console.log("Win Rate by Bet Type:", stats.winRateByBetType)
}

export const recommend = (stats: BetStats) => {
  // Find the sport with the highest win rate
  let bestSport
  let bestSportRate = 0
  for (const sport in stats.winRateBySport) {
    if (stats.winRateBySport[sport].rate !== undefined && stats.winRateBySport[sport].rate! > bestSportRate) {
      bestSport = sport
      bestSportRate = stats.winRateBySport[sport].rate!
    }
  }

  // Find the bet type with the highest win rate
  let bestBetType
  let bestBetTypeRate = 0
  for (const betType in stats.winRateByBetType) {
    if (stats.winRateByBetType[betType].rate !== undefined && stats.winRateByBetType[betType].rate! > bestBetTypeRate) {
      bestBetType = betType
      bestBetTypeRate = stats.winRateByBetType[betType].rate!
    }
  }

  console.log(`Based on past data, your best sport to bet on is ${bestSport} with a win rate of ${bestSportRate}`)
  console.log(`Your best bet type is ${bestBetType} with a win rate of ${bestBetTypeRate}`)
}
