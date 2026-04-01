'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { enemyRegistry } from '@/stores/enemyRegistry'
import { useGameStore } from '@/stores/gameStore'

interface AoeEffectProps {
  position: [number, number, number]
  color: string
  damage?: number
  maxRadius?: number
  duration?: number
  knockback?: boolean
  slowDuration?: number
  chainHits?: number
  selfHealPercent?: number
  onDamageDealt?: (totalDamage: number) => void
  onExpire: () => void
}

export function AoeEffect({
  position,
  color,
  damage = 30,
  maxRadius = 6,
  duration = 0.8,
  knockback,
  slowDuration,
  chainHits,
  selfHealPercent,
  onDamageDealt,
  onExpire,
}: AoeEffectProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const elapsed = useRef(0)
  const hasDamaged = useRef(false)
  const center = useRef(new THREE.Vector3(...position))
  const damageCount = useRef(0)
  const totalDamageDealt = useRef(0)

  useFrame((_, delta) => {
    if (!ringRef.current) return

    elapsed.current += delta
    const progress = elapsed.current / duration

    if (progress >= 1) {
      onExpire()
      return
    }

    if (chainHits && chainHits > 0) {
      // Deal damage in multiple hits spread across the duration
      if (progress > (damageCount.current + 1) / (chainHits + 1)) {
        damageCount.current++
        const hitDamage = Math.floor(damage / chainHits)
        const enemies = enemyRegistry.getEnemiesInRange(center.current, maxRadius)
        for (const enemy of enemies) {
          enemy.takeDamage(hitDamage)
          totalDamageDealt.current += hitDamage
          if (slowDuration) {
            enemy.applySlow?.(0.4, slowDuration)
          }
        }
        if (damageCount.current >= chainHits) {
          onDamageDealt?.(totalDamageDealt.current)
          if (selfHealPercent) {
            useGameStore.getState().heal(Math.floor(totalDamageDealt.current * selfHealPercent / 100))
          }
        }
      }
    } else {
      // Damage enemies once at the peak of the effect
      if (!hasDamaged.current && progress > 0.3) {
        hasDamaged.current = true
        const enemies = enemyRegistry.getEnemiesInRange(center.current, maxRadius)
        let totalDmg = 0
        for (const enemy of enemies) {
          enemy.takeDamage(damage)
          totalDmg += damage
          if (slowDuration) {
            enemy.applySlow?.(0.4, slowDuration)
          }
        }
        onDamageDealt?.(totalDmg)
        if (selfHealPercent && totalDmg > 0) {
          useGameStore.getState().heal(Math.floor(totalDmg * selfHealPercent / 100))
        }
      }
    }

    // Expand ring
    const scale = progress * maxRadius * (knockback ? 1.5 : 1)
    ringRef.current.scale.set(scale, 1, scale)

    // Fade out
    const material = ringRef.current.material as THREE.MeshStandardMaterial
    material.opacity = 1 - progress
  })

  return (
    <group position={position}>
      {/* Expanding ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ground flash */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <circleGeometry args={[maxRadius, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
