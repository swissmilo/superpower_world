export type ElementType = 'fire' | 'water' | 'ice' | 'lightning' | 'earth' | 'nature'

export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameover'

export interface AbilityDef {
  name: string
  description: string
  cooldown: number
  damage: number
  range: number
  manaCost: number
  type: 'projectile' | 'aoe' | 'shield' | 'heal' | 'speed_boost'
  // Per-element projectile props
  speed?: number
  size?: number
  piercing?: boolean
  onHitHeal?: number
  hasTrail?: boolean
  hasArc?: boolean
  // Per-element AoE props
  aoeRadius?: number
  knockback?: boolean
  slowDuration?: number
  chainHits?: number
  selfHealPercent?: number
  // Support ability props
  shieldDuration?: number
  healPerSecond?: number
  speedMultiplier?: number
  boostDuration?: number
}

export interface ElementDef {
  name: string
  color: string
  secondaryColor: string
  particleColor: string
  description: string
  abilities: [AbilityDef, AbilityDef, AbilityDef]
}

export interface PlayerState {
  health: number
  maxHealth: number
  element: ElementType | null
  currency: number
  level: number
}

export type Vector3Tuple = [number, number, number]

// Skill XP thresholds: XP needed to reach level 2, 3, 4, 5
export const SKILL_XP_THRESHOLDS = [50, 150, 350, 750]
export const SKILL_MAX_LEVEL = 5
