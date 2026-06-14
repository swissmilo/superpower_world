import { create } from 'zustand'
import {
  PIECES,
  PIECE_TYPES,
  GRID,
  type PieceType,
} from '@/lib/waterparkPieces'

export interface PlacedPiece {
  id: string
  type: PieceType
  gx: number
  gz: number
  rot: number // 0..3 quarter turns
}

interface WaterparkState {
  mode: 'explore' | 'build'
  money: number
  stars: number
  cards: Record<PieceType, number>
  placed: PlacedPiece[]
  pendingMoney: number
  selectedPiece: PieceType | null
  showInventory: boolean

  // UI / mode
  setMode: (mode: 'explore' | 'build') => void
  selectPiece: (type: PieceType | null) => void
  toggleInventory: () => void

  // Building
  effectiveFootprint: (type: PieceType, rot: number) => [number, number]
  canPlace: (type: PieceType, gx: number, gz: number, rot: number) => boolean
  placePiece: (type: PieceType, gx: number, gz: number, rot: number) => boolean
  removePiece: (id: string) => void

  // Economy
  collectMoney: () => void
  getTotalCards: () => number
  tick: (delta: number) => void

  // Persistence
  save: () => void
  load: () => void
}

const SAVE_KEY = 'superpower_world_waterpark'
const STAR_FACTOR = 8 // higher = slower star accrual

let idCounter = 0
const nextId = () => `wp_${idCounter++}_${(globalThis.performance?.now?.() ?? 0) | 0}`

function emptyCards(): Record<PieceType, number> {
  const c = {} as Record<PieceType, number>
  for (const t of PIECE_TYPES) c[t] = 0
  return c
}

function starterCards(): Record<PieceType, number> {
  const c = emptyCards()
  c.pool = 2
  c.spiral_slide = 1
  c.burger_shop = 1
  c.restrooms = 1
  return c
}

interface SaveData {
  money: number
  stars: number
  cards: Record<PieceType, number>
  placed: PlacedPiece[]
}

// Non-persisted accumulators for the income/card/star simulation.
let cardTimer = 0
let starProgress = 0

export const useWaterparkStore = create<WaterparkState>()((set, get) => ({
  mode: 'explore',
  money: 400,
  stars: 0,
  cards: starterCards(),
  placed: [],
  pendingMoney: 0,
  selectedPiece: null,
  showInventory: false,

  setMode: (mode) => {
    if (mode === 'explore') set({ mode, selectedPiece: null })
    else set({ mode })
  },

  selectPiece: (type) => set({ selectedPiece: type }),

  toggleInventory: () => set((s) => ({ showInventory: !s.showInventory })),

  effectiveFootprint: (type, rot) => {
    const [w, d] = PIECES[type].footprint
    return rot % 2 === 0 ? [w, d] : [d, w]
  },

  canPlace: (type, gx, gz, rot) => {
    const [w, d] = get().effectiveFootprint(type, rot)
    if (gx < 0 || gz < 0 || gx + w > GRID || gz + d > GRID) return false

    const occupied = new Set<string>()
    for (const p of get().placed) {
      const [pw, pd] = get().effectiveFootprint(p.type, p.rot)
      for (let x = p.gx; x < p.gx + pw; x++) {
        for (let z = p.gz; z < p.gz + pd; z++) occupied.add(`${x},${z}`)
      }
    }
    for (let x = gx; x < gx + w; x++) {
      for (let z = gz; z < gz + d; z++) {
        if (occupied.has(`${x},${z}`)) return false
      }
    }
    return true
  },

  placePiece: (type, gx, gz, rot) => {
    const def = PIECES[type]
    const { money, cards } = get()
    if (money < def.cost) return false
    if ((cards[type] ?? 0) < def.cardCost) return false
    if (!get().canPlace(type, gx, gz, rot)) return false

    set((s) => ({
      money: s.money - def.cost,
      cards: { ...s.cards, [type]: s.cards[type] - def.cardCost },
      placed: [...s.placed, { id: nextId(), type, gx, gz, rot }],
    }))
    get().save()
    return true
  },

  removePiece: (id) => {
    const piece = get().placed.find((p) => p.id === id)
    if (!piece) return
    const refund = Math.floor(PIECES[piece.type].cost * 0.5)
    set((s) => ({
      money: s.money + refund,
      placed: s.placed.filter((p) => p.id !== id),
    }))
    get().save()
  },

  collectMoney: () => {
    set((s) => ({
      money: s.money + Math.floor(s.pendingMoney),
      pendingMoney: 0,
    }))
    get().save()
  },

  getTotalCards: () => {
    const { cards } = get()
    return PIECE_TYPES.reduce((sum, t) => sum + (cards[t] ?? 0), 0)
  },

  tick: (delta) => {
    const { placed } = get()
    if (placed.length === 0) return

    // Income accrues over the money sign while the park has attractions.
    const incomeRate = placed.reduce(
      (sum, p) => sum + PIECES[p.type].incomePerTick,
      0
    )

    // Cards drip in over time — faster as the park grows (more customers).
    cardTimer += delta
    const cardInterval = Math.max(5, 15 - placed.length)
    let cardUpdate: Partial<Record<PieceType, number>> | null = null
    if (cardTimer >= cardInterval) {
      cardTimer = 0
      const type = PIECE_TYPES[Math.floor((starProgress * 7.13) % PIECE_TYPES.length)]
      cardUpdate = { [type]: (get().cards[type] ?? 0) + 1 }
    }

    // Stars accrue gradually based on how well-built the park is.
    const starRate = placed.reduce((sum, p) => sum + PIECES[p.type].starValue, 0)
    starProgress += (delta * starRate) / STAR_FACTOR

    set((s) => ({
      pendingMoney: s.pendingMoney + incomeRate * delta,
      stars: Math.floor(starProgress),
      ...(cardUpdate ? { cards: { ...s.cards, ...cardUpdate } } : {}),
    }))
  },

  save: () => {
    const { money, stars, cards, placed } = get()
    const data: SaveData = { money, stars, cards, placed }
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    } catch {
      // localStorage not available
    }
  },

  load: () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const data: SaveData = JSON.parse(raw)
      starProgress = data.stars ?? 0
      set({
        money: data.money ?? 400,
        stars: data.stars ?? 0,
        cards: { ...emptyCards(), ...(data.cards ?? {}) },
        placed: data.placed ?? [],
      })
    } catch {
      // Invalid save data
    }
  },
}))
