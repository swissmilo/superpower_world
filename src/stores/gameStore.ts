import { create } from 'zustand'
import type { ElementType, GamePhase } from '@/types/game'
import { UPGRADES, getUpgradeCost, getUpgradeEffect, EXTRA_ELEMENT_COSTS } from '@/lib/upgrades'

interface GameState {
  // Game phase
  phase: GamePhase
  setPhase: (phase: GamePhase) => void

  // Player
  playerHealth: number
  playerMaxHealth: number
  playerElement: ElementType | null
  currency: number

  // Upgrades
  upgradeLevels: Record<string, number>
  unlockedElements: ElementType[]
  showShop: boolean
  toggleShop: () => void

  // Actions
  setPlayerElement: (element: ElementType) => void
  takeDamage: (amount: number) => void
  heal: (amount: number) => void
  addCurrency: (amount: number) => void
  purchaseUpgrade: (upgradeId: string) => boolean
  unlockElement: (element: ElementType) => boolean
  resetGame: () => void

  // Computed helpers
  getDamageMultiplier: () => number
  getSpeedMultiplier: () => number
  getCooldownMultiplier: () => number
  getCurrencyMultiplier: () => number
  getEffectiveMaxHealth: () => number
  getNextElementCost: () => number

  // Ability cooldowns (seconds remaining)
  abilityCooldowns: [number, number, number]
  startCooldown: (index: number, duration: number) => void
  tickCooldowns: (delta: number) => void

  // Persistence
  saveGame: () => void
  loadGame: () => void
}

const INITIAL_HEALTH = 100
const SAVE_KEY = 'superpower_world_save'

interface SaveData {
  currency: number
  upgradeLevels: Record<string, number>
  unlockedElements: ElementType[]
}

export const useGameStore = create<GameState>()((set, get) => ({
  phase: 'menu',
  setPhase: (phase) => set({ phase }),

  playerHealth: INITIAL_HEALTH,
  playerMaxHealth: INITIAL_HEALTH,
  playerElement: null,
  currency: 0,

  upgradeLevels: {},
  unlockedElements: [],
  showShop: false,
  toggleShop: () => set((s) => ({ showShop: !s.showShop })),

  setPlayerElement: (element) => {
    const { unlockedElements } = get()
    // Auto-unlock the first chosen element
    const newUnlocked = unlockedElements.includes(element)
      ? unlockedElements
      : [...unlockedElements, element]
    set({
      playerElement: element,
      phase: 'playing',
      unlockedElements: newUnlocked,
    })
    // Recalculate max health with upgrades
    const maxHp = get().getEffectiveMaxHealth()
    set({ playerHealth: maxHp, playerMaxHealth: maxHp })
  },

  takeDamage: (amount) => {
    const { playerHealth } = get()
    const newHealth = Math.max(0, playerHealth - amount)
    set({ playerHealth: newHealth })
    if (newHealth <= 0) {
      set({ phase: 'gameover' })
    }
  },

  heal: (amount) => {
    const { playerHealth, playerMaxHealth } = get()
    set({ playerHealth: Math.min(playerMaxHealth, playerHealth + amount) })
  },

  addCurrency: (amount) => {
    const multiplier = get().getCurrencyMultiplier()
    const boosted = Math.floor(amount * multiplier)
    set((state) => ({ currency: state.currency + boosted }))
  },

  purchaseUpgrade: (upgradeId) => {
    const { currency, upgradeLevels } = get()
    const upgrade = UPGRADES.find((u) => u.id === upgradeId)
    if (!upgrade) return false

    const currentLevel = upgradeLevels[upgradeId] ?? 0
    if (currentLevel >= upgrade.maxLevel) return false

    const cost = getUpgradeCost(upgrade, currentLevel)
    if (currency < cost) return false

    const newLevels = { ...upgradeLevels, [upgradeId]: currentLevel + 1 }
    set({ currency: currency - cost, upgradeLevels: newLevels })

    // If max health upgraded, update current and max health
    if (upgradeId === 'max_health') {
      const maxHp = INITIAL_HEALTH + getUpgradeEffect(upgrade, currentLevel + 1)
      set((s) => ({
        playerMaxHealth: maxHp,
        playerHealth: Math.min(s.playerHealth + upgrade.effectPerLevel, maxHp),
      }))
    }

    get().saveGame()
    return true
  },

  unlockElement: (element) => {
    const { currency, unlockedElements } = get()
    if (unlockedElements.includes(element)) return false

    const cost = get().getNextElementCost()
    if (currency < cost) return false

    set({
      currency: currency - cost,
      unlockedElements: [...unlockedElements, element],
    })
    get().saveGame()
    return true
  },

  resetGame: () => {
    const { upgradeLevels, unlockedElements, currency } = get()
    // Keep persistent data, reset session state
    const maxHp = INITIAL_HEALTH + getUpgradeEffect(
      UPGRADES.find((u) => u.id === 'max_health')!,
      upgradeLevels['max_health'] ?? 0
    )
    set({
      phase: 'menu',
      playerHealth: maxHp,
      playerMaxHealth: maxHp,
      playerElement: null,
      abilityCooldowns: [0, 0, 0],
      showShop: false,
      // Keep: currency, upgradeLevels, unlockedElements
    })
  },

  // Computed helpers
  getDamageMultiplier: () => {
    const level = get().upgradeLevels['power_damage'] ?? 0
    return 1 + (level * 10) / 100
  },

  getSpeedMultiplier: () => {
    const level = get().upgradeLevels['move_speed'] ?? 0
    return 1 + (level * 8) / 100
  },

  getCooldownMultiplier: () => {
    const level = get().upgradeLevels['cooldown_reduction'] ?? 0
    return 1 - (level * 8) / 100
  },

  getCurrencyMultiplier: () => {
    const level = get().upgradeLevels['currency_bonus'] ?? 0
    return 1 + (level * 15) / 100
  },

  getEffectiveMaxHealth: () => {
    const level = get().upgradeLevels['max_health'] ?? 0
    return INITIAL_HEALTH + level * 20
  },

  getNextElementCost: () => {
    const unlocked = get().unlockedElements.length
    const costIndex = Math.max(0, unlocked - 1) // First is free
    return EXTRA_ELEMENT_COSTS[costIndex] ?? 99999
  },

  abilityCooldowns: [0, 0, 0],

  startCooldown: (index, duration) => {
    const multiplier = get().getCooldownMultiplier()
    const cooldowns = [...get().abilityCooldowns] as [number, number, number]
    cooldowns[index] = duration * multiplier
    set({ abilityCooldowns: cooldowns })
  },

  tickCooldowns: (delta) => {
    const cooldowns = get().abilityCooldowns.map((cd) =>
      Math.max(0, cd - delta)
    ) as [number, number, number]
    set({ abilityCooldowns: cooldowns })
  },

  saveGame: () => {
    const { currency, upgradeLevels, unlockedElements } = get()
    const data: SaveData = { currency, upgradeLevels, unlockedElements }
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    } catch {
      // localStorage not available
    }
  },

  loadGame: () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const data: SaveData = JSON.parse(raw)
      const maxHp = INITIAL_HEALTH + getUpgradeEffect(
        UPGRADES.find((u) => u.id === 'max_health')!,
        data.upgradeLevels['max_health'] ?? 0
      )
      set({
        currency: data.currency ?? 0,
        upgradeLevels: data.upgradeLevels ?? {},
        unlockedElements: data.unlockedElements ?? [],
        playerMaxHealth: maxHp,
        playerHealth: maxHp,
      })
    } catch {
      // Invalid save data
    }
  },
}))
