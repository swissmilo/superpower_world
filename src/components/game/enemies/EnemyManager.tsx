'use client'

import { useState, useCallback, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/stores/gameStore'
import { ENEMY_TYPES, SPAWN_POINTS } from '@/lib/enemies'
import type { EnemyInstance } from '@/types/enemy'
import { Enemy } from './Enemy'

const RESPAWN_DELAY = 8

let nextEnemyId = 0

export function EnemyManager() {
  const [enemies, setEnemies] = useState<EnemyInstance[]>([])
  const respawnTimers = useRef<Map<number, number>>(new Map())
  const initialized = useRef(false)

  const removeEnemy = useCallback((id: number, spawnIndex: number) => {
    setEnemies((prev) => prev.filter((e) => e.id !== id))
    // Start respawn timer for this spawn point
    respawnTimers.current.set(spawnIndex, RESPAWN_DELAY)
  }, [])

  useFrame((_, delta) => {
    const phase = useGameStore.getState().phase
    if (phase !== 'playing') return

    // Initial spawn
    if (!initialized.current) {
      initialized.current = true
      const initial: EnemyInstance[] = SPAWN_POINTS.map((sp, i) => ({
        id: nextEnemyId++,
        defKey: sp.type,
        spawnPosition: sp.position,
      }))
      setEnemies(initial)
      return
    }

    // Tick respawn timers
    for (const [spawnIndex, timer] of respawnTimers.current.entries()) {
      const newTimer = timer - delta
      if (newTimer <= 0) {
        respawnTimers.current.delete(spawnIndex)
        const sp = SPAWN_POINTS[spawnIndex]
        if (sp) {
          setEnemies((prev) => [
            ...prev,
            {
              id: nextEnemyId++,
              defKey: sp.type,
              spawnPosition: sp.position,
            },
          ])
        }
      } else {
        respawnTimers.current.set(spawnIndex, newTimer)
      }
    }
  })

  return (
    <>
      {enemies.map((enemy) => {
        const def = ENEMY_TYPES[enemy.defKey]
        if (!def) return null
        const spawnIndex = SPAWN_POINTS.findIndex(
          (sp) =>
            sp.position[0] === enemy.spawnPosition[0] &&
            sp.position[2] === enemy.spawnPosition[2]
        )
        return (
          <Enemy
            key={enemy.id}
            def={def}
            spawnPosition={enemy.spawnPosition}
            onDeath={() => removeEnemy(enemy.id, spawnIndex)}
          />
        )
      })}
    </>
  )
}
