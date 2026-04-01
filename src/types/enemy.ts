export interface EnemyDef {
  name: string
  health: number
  speed: number
  damage: number
  attackRange: number
  attackCooldown: number
  currencyDrop: number
  color: string
  bodyColor: string
  scale: number
  detectionRange: number
  modelType: 'slime' | 'golem' | 'elemental'
}

export type EnemyState = 'idle' | 'patrol' | 'chase' | 'attack' | 'dead'

export interface EnemyInstance {
  id: number
  defKey: string
  spawnPosition: [number, number, number]
}
