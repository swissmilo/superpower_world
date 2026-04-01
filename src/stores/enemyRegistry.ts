import * as THREE from 'three'

interface RegisteredEnemy {
  id: number
  position: THREE.Vector3
  takeDamage: (amount: number) => void
  applySlow?: (multiplier: number, duration: number) => void
}

// Global registry for enemy positions and damage callbacks
// Used by projectiles and AoE to find and damage enemies without Rapier collision groups
class EnemyRegistry {
  private enemies = new Map<number, RegisteredEnemy>()

  register(id: number, position: THREE.Vector3, takeDamage: (amount: number) => void, applySlow?: (multiplier: number, duration: number) => void) {
    this.enemies.set(id, { id, position, takeDamage, applySlow })
  }

  unregister(id: number) {
    this.enemies.delete(id)
  }

  updatePosition(id: number, position: THREE.Vector3) {
    const enemy = this.enemies.get(id)
    if (enemy) {
      enemy.position.copy(position)
    }
  }

  // Find enemies within range of a point
  getEnemiesInRange(point: THREE.Vector3, range: number): RegisteredEnemy[] {
    const result: RegisteredEnemy[] = []
    for (const enemy of this.enemies.values()) {
      const dist = point.distanceTo(enemy.position)
      if (dist <= range) {
        result.push(enemy)
      }
    }
    return result
  }

  // Find the closest enemy to a point within a max range
  getClosestEnemy(point: THREE.Vector3, maxRange: number): RegisteredEnemy | null {
    let closest: RegisteredEnemy | null = null
    let closestDist = maxRange
    for (const enemy of this.enemies.values()) {
      const dist = point.distanceTo(enemy.position)
      if (dist < closestDist) {
        closest = enemy
        closestDist = dist
      }
    }
    return closest
  }
}

export const enemyRegistry = new EnemyRegistry()
