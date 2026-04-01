import type { EnemyDef } from '@/types/enemy'

export const ENEMY_TYPES: Record<string, EnemyDef> = {
  slime: {
    name: 'Slime',
    health: 40,
    speed: 2,
    damage: 5,
    attackRange: 1.5,
    attackCooldown: 1.5,
    currencyDrop: 10,
    color: '#44DD44',
    bodyColor: '#33BB33',
    scale: 0.7,
    detectionRange: 12,
    modelType: 'slime',
  },
  golem: {
    name: 'Golem',
    health: 100,
    speed: 1.5,
    damage: 15,
    attackRange: 2,
    attackCooldown: 2,
    currencyDrop: 30,
    color: '#888888',
    bodyColor: '#666666',
    scale: 1.2,
    detectionRange: 15,
    modelType: 'golem',
  },
  elemental: {
    name: 'Elemental',
    health: 70,
    speed: 3.5,
    damage: 10,
    attackRange: 2,
    attackCooldown: 1,
    currencyDrop: 20,
    color: '#CC44FF',
    bodyColor: '#AA22DD',
    scale: 0.9,
    detectionRange: 18,
    modelType: 'elemental',
  },
}

// Spawn points around the map
export const SPAWN_POINTS: { position: [number, number, number]; type: string }[] = [
  // Slimes - closer to spawn, easier
  { position: [15, 1, 5], type: 'slime' },
  { position: [-15, 1, 5], type: 'slime' },
  { position: [10, 1, -15], type: 'slime' },
  { position: [-10, 1, -10], type: 'slime' },
  { position: [20, 1, 15], type: 'slime' },
  { position: [-20, 1, 15], type: 'slime' },

  // Golems - mid range
  { position: [30, 1, 0], type: 'golem' },
  { position: [-30, 1, 0], type: 'golem' },
  { position: [0, 1, -30], type: 'golem' },
  { position: [25, 1, -25], type: 'golem' },

  // Elementals - far out, fast and dangerous
  { position: [35, 1, 20], type: 'elemental' },
  { position: [-35, 1, -20], type: 'elemental' },
  { position: [20, 1, -35], type: 'elemental' },
  { position: [-25, 1, 30], type: 'elemental' },
]
