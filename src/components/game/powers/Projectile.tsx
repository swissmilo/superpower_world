'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'
import { enemyRegistry } from '@/stores/enemyRegistry'
import { useGameStore } from '@/stores/gameStore'

interface ProjectileProps {
  position: [number, number, number]
  direction: [number, number, number]
  color: string
  secondaryColor: string
  damage?: number
  speed?: number
  size?: number
  piercing?: boolean
  onHitHeal?: number
  hasTrail?: boolean
  hasArc?: boolean
  onDamageDealt?: (damage: number) => void
  onExpire: () => void
}

const MAX_LIFETIME = 2.5
const DEFAULT_SPEED = 25
const HIT_RADIUS = 2.5

export function Projectile({
  position,
  direction,
  color,
  secondaryColor,
  damage = 25,
  speed = DEFAULT_SPEED,
  size = 0.3,
  piercing,
  onHitHeal,
  hasTrail,
  hasArc,
  onDamageDealt,
  onExpire,
}: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const lifetime = useRef(0)
  const dir = useRef(new THREE.Vector3(...direction).normalize())
  const hasHit = useRef(false)
  const checkPos = useRef(new THREE.Vector3())
  const hitEnemies = useRef(new Set<number>())

  useFrame((_, delta) => {
    if (!meshRef.current || hasHit.current) return

    lifetime.current += delta
    if (lifetime.current > MAX_LIFETIME) {
      onExpire()
      return
    }

    // Move forward
    meshRef.current.position.x += dir.current.x * speed * delta
    meshRef.current.position.y += dir.current.y * speed * delta - (hasArc ? 2.0 : 0.5) * delta + (hasArc ? 4 * delta * Math.max(0, 1 - lifetime.current) : 0)
    meshRef.current.position.z += dir.current.z * speed * delta

    // Rotate for visual flair
    meshRef.current.rotation.x += delta * 5
    meshRef.current.rotation.z += delta * 3

    // Check for enemy hits
    checkPos.current.copy(meshRef.current.position)

    if (piercing) {
      const enemies = enemyRegistry.getEnemiesInRange(checkPos.current, HIT_RADIUS)
      for (const enemy of enemies) {
        if (hitEnemies.current.has(enemy.id)) continue
        hitEnemies.current.add(enemy.id)
        enemy.takeDamage(damage)
        onDamageDealt?.(damage)
      }
    } else {
      const enemy = enemyRegistry.getClosestEnemy(checkPos.current, HIT_RADIUS)
      if (enemy) {
        enemy.takeDamage(damage)
        onDamageDealt?.(damage)
        if (onHitHeal) {
          useGameStore.getState().heal(onHitHeal)
        }
        hasHit.current = true
        onExpire()
        return
      }
    }

    // Remove if hits ground
    if (meshRef.current.position.y < 0) {
      onExpire()
    }
  })

  return (
    <Trail
      width={hasTrail ? size * 5 : size * 3}
      length={hasTrail ? 12 : 6}
      color={color}
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef} position={position} castShadow>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={secondaryColor}
          emissiveIntensity={2}
        />
      </mesh>
    </Trail>
  )
}
