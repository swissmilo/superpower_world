import type { UpgradeDef } from '@/types/upgrades'
import type { ElementType } from '@/types/game'

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'power_damage',
    name: 'Power Damage',
    description: 'Increase ability damage',
    icon: '⚔️',
    baseCost: 50,
    costMultiplier: 1.8,
    maxLevel: 10,
    effectPerLevel: 10,
    effectUnit: '%',
  },
  {
    id: 'max_health',
    name: 'Max Health',
    description: 'Increase maximum health',
    icon: '❤️',
    baseCost: 40,
    costMultiplier: 1.6,
    maxLevel: 10,
    effectPerLevel: 20,
    effectUnit: 'HP',
  },
  {
    id: 'move_speed',
    name: 'Move Speed',
    description: 'Move faster',
    icon: '👟',
    baseCost: 60,
    costMultiplier: 2,
    maxLevel: 5,
    effectPerLevel: 8,
    effectUnit: '%',
  },
  {
    id: 'cooldown_reduction',
    name: 'Cooldown Reduction',
    description: 'Use abilities more often',
    icon: '⏱️',
    baseCost: 80,
    costMultiplier: 2,
    maxLevel: 5,
    effectPerLevel: 8,
    effectUnit: '%',
  },
  {
    id: 'currency_bonus',
    name: 'Currency Bonus',
    description: 'Earn more coins from kills',
    icon: '💰',
    baseCost: 100,
    costMultiplier: 2.2,
    maxLevel: 5,
    effectPerLevel: 15,
    effectUnit: '%',
  },
]

export function getUpgradeCost(upgrade: UpgradeDef, currentLevel: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel))
}

export function getUpgradeEffect(upgrade: UpgradeDef, level: number): number {
  return upgrade.effectPerLevel * level
}

// Element unlock costs (in order of unlock)
export const ELEMENT_UNLOCK_COSTS: Record<ElementType, number> = {
  fire: 0,      // first element is free (chosen at start)
  water: 0,
  ice: 0,
  lightning: 0,
  earth: 0,
  nature: 0,
}

// The cost to unlock additional elements beyond the first
export const EXTRA_ELEMENT_COSTS = [500, 1000, 2000, 5000, 10000]
