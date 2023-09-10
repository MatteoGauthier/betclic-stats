import { calculateStats, fetchBets, logStats, recommend } from "./lib/helpers"
import { Bet } from "./types"
;(async () => {
  let bets: Bet[] = []

  if (await Bun.file("bets.json").exists()) {
    bets = await Bun.file("bets.json").json()
  } else {
    bets = await fetchBets()
    Bun.write("bets.json", JSON.stringify(bets, null, 2))
  }

  const stats = calculateStats(bets)
  logStats(stats)
  recommend(stats)
})()
