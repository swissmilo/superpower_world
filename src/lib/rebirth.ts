export function calculateRebirthBonus(rebirthCount: number): number {
  return 1 + 0.25 * rebirthCount
}

export function getRebirthCost(rebirthCount: number): number {
  return Math.floor(10000 * Math.pow(2, rebirthCount))
}
