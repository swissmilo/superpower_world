import { create } from 'zustand'
import type { ElementType, GamePhase } from '@/types/game'

interface GameState {
  // Game phase
  phase: GamePhase
  setPhase: (phase: GamePhase) => void

  // Player
  playerHealth: number
  playerMaxHealth: number
  playerElement: ElementType | null
  currency: number

  // Actions
  setPlayerElement: (element: ElementType) => void
  takeDamage: (amount: number) => void
  heal: (amount: number) => void
  addCurrency: (amount: number) => void
  resetGame: () => void

  // Ability cooldowns (seconds remaining)
  abilityCooldowns: [number, number, number]
  startCooldown: (index: number, duration: number) => void
  tickCooldowns: (delta: number) => void
}

const INITIAL_HEALTH = 100

export const useGameStore = create<GameState>()((set, get) => ({
  phase: 'menu',
  setPhase: (phase) => set({ phase }),

  playerHealth: INITIAL_HEALTH,
  playerMaxHealth: INITIAL_HEALTH,
  playerElement: null,
  currency: 0,

  setPlayerElement: (element) => set({ playerElement: element, phase: 'playing' }),

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
    set((state) => ({ currency: state.currency + amount }))
  },

  resetGame: () =>
    set({
      phase: 'menu',
      playerHealth: INITIAL_HEALTH,
      playerMaxHealth: INITIAL_HEALTH,
      playerElement: null,
      currency: 0,
      abilityCooldowns: [0, 0, 0],
    }),

  abilityCooldowns: [0, 0, 0],

  startCooldown: (index, duration) => {
    const cooldowns = [...get().abilityCooldowns] as [number, number, number]
    cooldowns[index] = duration
    set({ abilityCooldowns: cooldowns })
  },

  tickCooldowns: (delta) => {
    const cooldowns = get().abilityCooldowns.map((cd) =>
      Math.max(0, cd - delta)
    ) as [number, number, number]
    set({ abilityCooldowns: cooldowns })
  },
}))
