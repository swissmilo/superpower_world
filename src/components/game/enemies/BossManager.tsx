'use client'

import { useState, useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useGameStore } from '@/stores/gameStore'
import { Boss } from './Boss'

const BOSS_SPAWN_INTERVAL = 120
const BOSS_WARNING_DURATION = 3
const BOSS_SPAWN_POSITION: [number, number, number] = [0, 2, -80]

export function BossManager() {
  const [isBossActive, setIsBossActive] = useState(false)
  const [bossName] = useState('Void Titan')
  const [warning, setWarning] = useState<string | null>(null)
  const [bossHealth, setBossHealth] = useState(500)

  const spawnTimer = useRef(BOSS_SPAWN_INTERVAL)
  const warningTimer = useRef(0)
  const isWarning = useRef(false)

  const handleBossDeath = useCallback(() => {
    setIsBossActive(false)
    setWarning(null)
    spawnTimer.current = BOSS_SPAWN_INTERVAL
    isWarning.current = false
    setBossHealth(0)
  }, [])

  useFrame((_, delta) => {
    const phase = useGameStore.getState().phase
    if (phase !== 'playing') return

    if (isBossActive) return

    if (isWarning.current) {
      warningTimer.current -= delta
      if (warningTimer.current <= 0) {
        // Spawn boss
        isWarning.current = false
        setWarning(null)
        setIsBossActive(true)
        setBossHealth(500)
      }
      return
    }

    spawnTimer.current -= delta
    if (spawnTimer.current <= 0) {
      // Start warning phase
      isWarning.current = true
      warningTimer.current = BOSS_WARNING_DURATION
      setWarning(`${bossName} approaches!`)
    }
  })

  return (
    <>
      {/* Warning text overlay in 3D */}
      {warning && (
        <Html center position={[0, 10, 0]} zIndexRange={[50, 60]}>
          <div className="pointer-events-none select-none whitespace-nowrap">
            <div className="text-4xl font-bold text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
              {warning}
            </div>
          </div>
        </Html>
      )}

      {/* Boss */}
      {isBossActive && (
        <Boss
          position={BOSS_SPAWN_POSITION}
          onDeath={handleBossDeath}
        />
      )}
    </>
  )
}

// Export state accessor for BossHealthBar UI
export function useBossState() {
  return {
    isBossActive: false,
    bossName: 'Void Titan',
    bossHealth: 0,
    bossMaxHealth: 500,
  }
}
