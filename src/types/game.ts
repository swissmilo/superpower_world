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
