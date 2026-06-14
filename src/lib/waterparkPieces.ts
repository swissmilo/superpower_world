// Waterpark builder: piece catalog + grid helpers.
// The Waterpark group is placed at PARK_WORLD_OFFSET in Scene.tsx, so piece
// meshes render in LOCAL coordinates while ride mount-zone checks (which read
// the world-space player position) use the world offset.

export const PARK_WORLD_OFFSET: [number, number, number] = [-200, 0, 200]

export const GRID = 16 // cells per side
export const CELL_SIZE = 4 // world units per cell
export const HALF_EXTENT = (GRID * CELL_SIZE) / 2 // 32

export type PieceType =
  | 'pool'
  | 'spiral_slide'
  | 'drop_slide'
  | 'wave_pool'
  | 'lazy_river'
  | 'burger_shop'
  | 'restrooms'
  | 'volcano'
  // Extra water-slide variants
  | 'speed_slide'
  | 'funnel_slide'
  | 'halfpipe_slide'
  | 'twister_slide'
  | 'rainbow_slide'
  | 'boomerang_slide'
  | 'tornado_slide'
  | 'cannonball_slide'
  | 'python_slide'
  | 'aqualoop_slide'

export interface PieceDef {
  type: PieceType
  name: string
  icon: string
  color: string
  cost: number
  cardCost: number
  footprint: [number, number] // [width, depth] in cells
  rideable: boolean
  incomePerTick: number // money accrued per income tick when customers present
  starValue: number
}

export const PIECES: Record<PieceType, PieceDef> = {
  pool: {
    type: 'pool',
    name: 'Pool',
    icon: '🏊',
    color: '#2A8FE0',
    cost: 50,
    cardCost: 1,
    footprint: [2, 2],
    rideable: false,
    incomePerTick: 1,
    starValue: 1,
  },
  spiral_slide: {
    type: 'spiral_slide',
    name: 'Spiral Slide',
    icon: '🌀',
    color: '#4488FF',
    cost: 200,
    cardCost: 1,
    footprint: [2, 2],
    rideable: true,
    incomePerTick: 5,
    starValue: 3,
  },
  drop_slide: {
    type: 'drop_slide',
    name: 'Drop Slide',
    icon: '🛝',
    color: '#FF5577',
    cost: 300,
    cardCost: 1,
    footprint: [2, 3],
    rideable: true,
    incomePerTick: 7,
    starValue: 4,
  },
  wave_pool: {
    type: 'wave_pool',
    name: 'Wave Pool',
    icon: '🌊',
    color: '#1E78C8',
    cost: 250,
    cardCost: 1,
    footprint: [3, 2],
    rideable: false,
    incomePerTick: 4,
    starValue: 3,
  },
  lazy_river: {
    type: 'lazy_river',
    name: 'Lazy River',
    icon: '🛟',
    color: '#33AADD',
    cost: 350,
    cardCost: 1,
    footprint: [3, 3],
    rideable: true,
    incomePerTick: 6,
    starValue: 4,
  },
  burger_shop: {
    type: 'burger_shop',
    name: 'Burger Shop',
    icon: '🍔',
    color: '#E0A030',
    cost: 120,
    cardCost: 1,
    footprint: [1, 1],
    rideable: false,
    incomePerTick: 3,
    starValue: 1,
  },
  restrooms: {
    type: 'restrooms',
    name: 'Restrooms',
    icon: '🚻',
    color: '#88AA99',
    cost: 80,
    cardCost: 1,
    footprint: [1, 1],
    rideable: false,
    incomePerTick: 0,
    starValue: 1,
  },
  volcano: {
    type: 'volcano',
    name: 'Volcano',
    icon: '🌋',
    color: '#7A4030',
    cost: 500,
    cardCost: 2,
    footprint: [3, 3],
    rideable: false,
    incomePerTick: 2,
    starValue: 5,
  },

  // ---- Extra water-slide variants (all rideable, routed to GenericSlide) ----
  speed_slide: {
    type: 'speed_slide',
    name: 'Speed Racer',
    icon: '🏁',
    color: '#FF3B30',
    cost: 260,
    cardCost: 1,
    footprint: [2, 3],
    rideable: true,
    incomePerTick: 6,
    starValue: 3,
  },
  funnel_slide: {
    type: 'funnel_slide',
    name: 'Funnel',
    icon: '🕳️',
    color: '#9B59B6',
    cost: 400,
    cardCost: 1,
    footprint: [3, 3],
    rideable: true,
    incomePerTick: 8,
    starValue: 4,
  },
  halfpipe_slide: {
    type: 'halfpipe_slide',
    name: 'Half-Pipe',
    icon: '🛹',
    color: '#1ABC9C',
    cost: 320,
    cardCost: 1,
    footprint: [2, 3],
    rideable: true,
    incomePerTick: 7,
    starValue: 4,
  },
  twister_slide: {
    type: 'twister_slide',
    name: 'Twister',
    icon: '🌪️',
    color: '#34D1BF',
    cost: 360,
    cardCost: 1,
    footprint: [2, 2],
    rideable: true,
    incomePerTick: 7,
    starValue: 4,
  },
  rainbow_slide: {
    type: 'rainbow_slide',
    name: 'Rainbow Racer',
    icon: '🌈',
    color: '#FF8AD8',
    cost: 300,
    cardCost: 1,
    footprint: [2, 3],
    rideable: true,
    incomePerTick: 6,
    starValue: 3,
  },
  boomerang_slide: {
    type: 'boomerang_slide',
    name: 'Boomerang',
    icon: '🪃',
    color: '#E67E22',
    cost: 420,
    cardCost: 1,
    footprint: [2, 3],
    rideable: true,
    incomePerTick: 9,
    starValue: 5,
  },
  tornado_slide: {
    type: 'tornado_slide',
    name: 'Tornado',
    icon: '🌀',
    color: '#5DADE2',
    cost: 460,
    cardCost: 1,
    footprint: [3, 3],
    rideable: true,
    incomePerTick: 9,
    starValue: 5,
  },
  cannonball_slide: {
    type: 'cannonball_slide',
    name: 'Cannonball',
    icon: '💣',
    color: '#2C3E50',
    cost: 380,
    cardCost: 1,
    footprint: [2, 2],
    rideable: true,
    incomePerTick: 8,
    starValue: 4,
  },
  python_slide: {
    type: 'python_slide',
    name: 'Python',
    icon: '🐍',
    color: '#27AE60',
    cost: 340,
    cardCost: 1,
    footprint: [2, 3],
    rideable: true,
    incomePerTick: 7,
    starValue: 4,
  },
  aqualoop_slide: {
    type: 'aqualoop_slide',
    name: 'Aqua Loop',
    icon: '➿',
    color: '#F1C40F',
    cost: 520,
    cardCost: 2,
    footprint: [2, 2],
    rideable: true,
    incomePerTick: 11,
    starValue: 6,
  },
}

export const PIECE_TYPES = Object.keys(PIECES) as PieceType[]

// Local-space center of a piece whose min corner is cell (gx, gz).
export function pieceLocalCenter(
  gx: number,
  gz: number,
  footprint: [number, number]
): [number, number, number] {
  const [w, d] = footprint
  const x = (gx + w / 2) * CELL_SIZE - HALF_EXTENT
  const z = (gz + d / 2) * CELL_SIZE - HALF_EXTENT
  return [x, 0, z]
}

// World-space center, for ride mount-zone distance checks.
export function pieceWorldCenter(
  gx: number,
  gz: number,
  footprint: [number, number]
): [number, number, number] {
  const [lx, ly, lz] = pieceLocalCenter(gx, gz, footprint)
  return [
    PARK_WORLD_OFFSET[0] + lx,
    PARK_WORLD_OFFSET[1] + ly,
    PARK_WORLD_OFFSET[2] + lz,
  ]
}

// Convert a world-space point on the park ground to a grid cell (min corner).
export function worldToCell(worldX: number, worldZ: number): [number, number] {
  const lx = worldX - PARK_WORLD_OFFSET[0]
  const lz = worldZ - PARK_WORLD_OFFSET[2]
  const gx = Math.floor((lx + HALF_EXTENT) / CELL_SIZE)
  const gz = Math.floor((lz + HALF_EXTENT) / CELL_SIZE)
  return [gx, gz]
}
