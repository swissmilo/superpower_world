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

// Spawn points spread across the 1000x1000 world
export const SPAWN_POINTS: { position: [number, number, number]; type: string }[] = [
  // Slimes - near spawn, easy area
  { position: [30, 1, 20], type: 'slime' },
  { position: [-30, 1, 20], type: 'slime' },
  { position: [20, 1, -30], type: 'slime' },
  { position: [-20, 1, -25], type: 'slime' },
  { position: [40, 1, 40], type: 'slime' },
  { position: [-40, 1, 40], type: 'slime' },
  // Slimes - scattered mid
  { position: [100, 1, 50], type: 'slime' },
  { position: [-100, 1, 50], type: 'slime' },
  { position: [50, 1, -100], type: 'slime' },
  { position: [-60, 1, -80], type: 'slime' },

  // Golems - mid range
  { position: [150, 1, 0], type: 'golem' },
  { position: [-150, 1, 0], type: 'golem' },
  { position: [0, 1, -150], type: 'golem' },
  { position: [120, 1, -120], type: 'golem' },
  { position: [-120, 1, 100], type: 'golem' },
  { position: [200, 1, -100], type: 'golem' },

  // Golems - near amusement park
  { position: [160, 1, 180], type: 'golem' },
  { position: [250, 1, 160], type: 'golem' },

  // Elementals - far out, fast and dangerous
  { position: [300, 1, 100], type: 'elemental' },
  { position: [-300, 1, -100], type: 'elemental' },
  { position: [100, 1, -300], type: 'elemental' },
  { position: [-200, 1, 250], type: 'elemental' },
  { position: [350, 1, -200], type: 'elemental' },
  { position: [-250, 1, -300], type: 'elemental' },
  { position: [250, 1, 300], type: 'elemental' },
  { position: [-350, 1, 150], type: 'elemental' },
]
