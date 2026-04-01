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
  enemiesKilled: number

  // Upgrades
  upgradeLevels: Record<string, number>
  unlockedElements: ElementType[]
  showShop: boolean
  toggleShop: () => void
  isPaused: () => boolean

  // Rebirth
  rebirthCount: number
  totalLifetimeCurrency: number
  getRebirthMultiplier: () => number
  performRebirth: () => boolean

  // Boss
  isBossActive: boolean
  bossHealth: number
  bossMaxHealth: number
  bossWarning: string
  setBossState: (active: boolean, health?: number, maxHealth?: number) => void
  setBossWarning: (warning: string) => void

  // Capture Zone
  captureZoneState: 'neutral' | 'capturing' | 'captured'
  captureProgress: number
  setCaptureZone: (state: 'neutral' | 'capturing' | 'captured', progress: number) => void

  // Actions
  setPlayerElement: (element: ElementType) => void
  takeDamage: (amount: number) => void
  heal: (amount: number) => void
  addCurrency: (amount: number) => void
  purchaseUpgrade: (upgradeId: string) => boolean
  unlockElement: (element: ElementType) => boolean
  resetGame: () => void
  respawnPosition: [number, number, number] | null
  respawn: () => void
  incrementKills: () => void

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
  rebirthCount: number
  totalLifetimeCurrency: number
}

export const useGameStore = create<GameState>()((set, get) => ({
  phase: 'menu',
  setPhase: (phase) => set({ phase }),

  playerHealth: INITIAL_HEALTH,
  playerMaxHealth: INITIAL_HEALTH,
  playerElement: null,
  currency: 0,
  enemiesKilled: 0,

  upgradeLevels: {},
  unlockedElements: [],
  showShop: false,
  toggleShop: () => set((s) => ({ showShop: !s.showShop })),

  isPaused: () => {
    const s = get()
    return s.phase !== 'playing' || s.showShop
  },

  // Rebirth
  rebirthCount: 0,
  totalLifetimeCurrency: 0,

  getRebirthMultiplier: () => {
    return 1 + 0.25 * get().rebirthCount
  },

  performRebirth: () => {
    const { rebirthCount, currency } = get()
    const cost = Math.floor(10000 * Math.pow(2, rebirthCount))
    if (currency < cost) return false

    const newCount = rebirthCount + 1
    set({
      rebirthCount: newCount,
      currency: 0,
      upgradeLevels: {},
      unlockedElements: [],
      playerElement: null,
      phase: 'menu',
      playerHealth: INITIAL_HEALTH,
      playerMaxHealth: INITIAL_HEALTH,
      abilityCooldowns: [0, 0, 0],
      showShop: false,
      enemiesKilled: 0,
    })
    get().saveGame()
    return true
  },

  // Boss
  isBossActive: false,
  bossHealth: 0,
  bossMaxHealth: 0,
  bossWarning: '',
  setBossState: (active, health, maxHealth) => {
    set({
      isBossActive: active,
      ...(health !== undefined && { bossHealth: health }),
      ...(maxHealth !== undefined && { bossMaxHealth: maxHealth }),
    })
  },
  setBossWarning: (warning) => set({ bossWarning: warning }),

  // Capture Zone
  captureZoneState: 'neutral',
  captureProgress: 0,
  setCaptureZone: (state, progress) => set({ captureZoneState: state, captureProgress: progress }),

  setPlayerElement: (element) => {
    const { unlockedElements } = get()
    const newUnlocked = unlockedElements.includes(element)
      ? unlockedElements
      : [...unlockedElements, element]
    set({
      playerElement: element,
      phase: 'playing',
      unlockedElements: newUnlocked,
    })
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
    const rebirthMult = get().getRebirthMultiplier()
    const boosted = Math.floor(amount * multiplier * rebirthMult)
    set((state) => ({
      currency: state.currency + boosted,
      totalLifetimeCurrency: state.totalLifetimeCurrency + boosted,
    }))
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
    const { upgradeLevels } = get()
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
      enemiesKilled: 0,
      isBossActive: false,
      bossWarning: '',
      captureZoneState: 'neutral',
      captureProgress: 0,
    })
  },

  respawnPosition: null as [number, number, number] | null,

  respawn: () => {
    const maxHp = get().getEffectiveMaxHealth()
    // Random spawn position away from enemies
    const angle = Math.random() * Math.PI * 2
    const dist = 30 + Math.random() * 50
    const spawnPos: [number, number, number] = [
      Math.cos(angle) * dist,
      3,
      Math.sin(angle) * dist,
    ]
    set({
      phase: 'playing',
      playerHealth: maxHp,
      playerMaxHealth: maxHp,
      abilityCooldowns: [0, 0, 0],
      respawnPosition: spawnPos,
    })
  },

  incrementKills: () => set((s) => ({ enemiesKilled: s.enemiesKilled + 1 })),

  // Computed helpers
  getDamageMultiplier: () => {
    const level = get().upgradeLevels['power_damage'] ?? 0
    const rebirthMult = get().getRebirthMultiplier()
    return (1 + (level * 10) / 100) * rebirthMult
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
    const rebirthMult = get().getRebirthMultiplier()
    return Math.floor((INITIAL_HEALTH + level * 20) * rebirthMult)
  },

  getNextElementCost: () => {
    const unlocked = get().unlockedElements.length
    const costIndex = Math.max(0, unlocked - 1)
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
    const { currency, upgradeLevels, unlockedElements, rebirthCount, totalLifetimeCurrency } = get()
    const data: SaveData = { currency, upgradeLevels, unlockedElements, rebirthCount, totalLifetimeCurrency }
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
        data.upgradeLevels?.['max_health'] ?? 0
      )
      set({
        currency: data.currency ?? 0,
        upgradeLevels: data.upgradeLevels ?? {},
        unlockedElements: data.unlockedElements ?? [],
        rebirthCount: data.rebirthCount ?? 0,
        totalLifetimeCurrency: data.totalLifetimeCurrency ?? 0,
        playerMaxHealth: maxHp,
        playerHealth: maxHp,
      })
    } catch {
      // Invalid save data
    }
  },
}))
