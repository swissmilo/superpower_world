'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, type RapierRigidBody } from '@react-three/rapier'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { EnemyDef, EnemyState } from '@/types/enemy'
import { playerRefs } from '@/stores/playerRefs'
import { useGameStore } from '@/stores/gameStore'
import { enemyRegistry } from '@/stores/enemyRegistry'
import { EnemyModel } from './EnemyModel'

interface EnemyProps {
  def: EnemyDef
  spawnPosition: [number, number, number]
  onDeath: () => void
}

let enemyIdCounter = 0

export function Enemy({ def, spawnPosition, onDeath }: EnemyProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [health, setHealth] = useState(def.health)
  const [state, setState] = useState<EnemyState>('idle')
  const [isMoving, setIsMoving] = useState(false)
  const enemyId = useRef(enemyIdCounter++)
  const enemyPos = useRef(new THREE.Vector3(...spawnPosition))

  const attackTimer = useRef(0)
  const patrolTarget = useRef<THREE.Vector3 | null>(null)
  const patrolWaitTimer = useRef(2)
  const deathTimer = useRef(0)
  const hitFlash = useRef(0)

  const takeDamage = useCallback(
    (amount: number) => {
      setHealth((prev) => {
        const newHealth = prev - amount
        if (newHealth <= 0) {
          setState('dead')
          useGameStore.getState().addCurrency(def.currencyDrop)
          enemyRegistry.unregister(enemyId.current)
        }
        return Math.max(0, newHealth)
      })
      hitFlash.current = 0.15
    },
    [def.currencyDrop]
  )

  // Register with enemy registry
  useEffect(() => {
    const id = enemyId.current
    enemyRegistry.register(id, enemyPos.current, takeDamage)
    return () => {
      enemyRegistry.unregister(id)
    }
  }, [takeDamage])

  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return

    const pos = rigidBodyRef.current.translation()
    enemyPos.current.set(pos.x, pos.y, pos.z)
    enemyRegistry.updatePosition(enemyId.current, enemyPos.current)

    const playerPos = playerRefs.position
    const distToPlayer = Math.sqrt(
      (pos.x - playerPos.x) ** 2 + (pos.z - playerPos.z) ** 2
    )

    hitFlash.current = Math.max(0, hitFlash.current - delta)

    // Dead state
    if (state === 'dead') {
      deathTimer.current += delta
      if (groupRef.current) {
        groupRef.current.scale.setScalar(Math.max(0, 1 - deathTimer.current * 2))
        groupRef.current.position.y -= delta * 0.5
      }
      if (deathTimer.current > 0.6) {
        onDeath()
      }
      return
    }

    // State transitions
    if (distToPlayer < def.attackRange && state !== 'attack') {
      setState('attack')
    } else if (distToPlayer < def.detectionRange && state !== 'chase' && distToPlayer >= def.attackRange) {
      setState('chase')
    } else if (distToPlayer >= def.detectionRange && state !== 'idle' && state !== 'patrol') {
      setState('idle')
      patrolWaitTimer.current = 1 + Math.random() * 2
    }

    // Behavior per state
    const velocity = rigidBodyRef.current.linvel()

    switch (state) {
      case 'idle': {
        rigidBodyRef.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true)
        setIsMoving(false)
        patrolWaitTimer.current -= delta
        if (patrolWaitTimer.current <= 0) {
          // Pick random patrol point near spawn
          const angle = Math.random() * Math.PI * 2
          const dist = 3 + Math.random() * 5
          patrolTarget.current = new THREE.Vector3(
            spawnPosition[0] + Math.cos(angle) * dist,
            0,
            spawnPosition[2] + Math.sin(angle) * dist
          )
          setState('patrol')
        }
        break
      }
      case 'patrol': {
        if (!patrolTarget.current) {
          setState('idle')
          break
        }
        const dx = patrolTarget.current.x - pos.x
        const dz = patrolTarget.current.z - pos.z
        const dist = Math.sqrt(dx * dx + dz * dz)

        if (dist < 1) {
          setState('idle')
          patrolWaitTimer.current = 1 + Math.random() * 3
          setIsMoving(false)
        } else {
          const nx = dx / dist
          const nz = dz / dist
          rigidBodyRef.current.setLinvel(
            { x: nx * def.speed, y: velocity.y, z: nz * def.speed },
            true
          )
          setIsMoving(true)
          // Face movement direction
          if (groupRef.current) {
            groupRef.current.rotation.y = Math.atan2(nx, nz)
          }
        }
        break
      }
      case 'chase': {
        const dx = playerPos.x - pos.x
        const dz = playerPos.z - pos.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist > 0.5) {
          const nx = dx / dist
          const nz = dz / dist
          rigidBodyRef.current.setLinvel(
            { x: nx * def.speed * 1.2, y: velocity.y, z: nz * def.speed * 1.2 },
            true
          )
          setIsMoving(true)
          if (groupRef.current) {
            groupRef.current.rotation.y = Math.atan2(nx, nz)
          }
        }
        break
      }
      case 'attack': {
        rigidBodyRef.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true)
        setIsMoving(false)

        // Face player
        const dx = playerPos.x - pos.x
        const dz = playerPos.z - pos.z
        if (groupRef.current) {
          groupRef.current.rotation.y = Math.atan2(dx, dz)
        }

        // Attack on cooldown
        attackTimer.current -= delta
        if (attackTimer.current <= 0 && distToPlayer < def.attackRange * 1.2) {
          useGameStore.getState().takeDamage(def.damage)
          attackTimer.current = def.attackCooldown
        }

        // Switch to chase if player moves away
        if (distToPlayer > def.attackRange * 1.5) {
          setState('chase')
        }
        break
      }
    }

    // Keep upright and on ground
    if (pos.y < -10) {
      rigidBodyRef.current.setTranslation(
        { x: spawnPosition[0], y: spawnPosition[1], z: spawnPosition[2] },
        true
      )
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
  })

  const healthPercent = health / def.health

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      position={spawnPosition}
      lockRotations
      mass={2}
      linearDamping={2}
      userData={{ type: 'enemy', takeDamage }}
    >
      <CapsuleCollider
        args={[0.3 * def.scale, 0.3 * def.scale]}
        position={[0, 0.6 * def.scale, 0]}
      />

      <group ref={groupRef}>
        <EnemyModel
          modelType={def.modelType}
          color={hitFlash.current > 0 ? '#FFFFFF' : def.color}
          bodyColor={hitFlash.current > 0 ? '#FFAAAA' : def.bodyColor}
          scale={def.scale}
          isMoving={isMoving}
        />

        {/* Health bar - only show when damaged */}
        {healthPercent < 1 && state !== 'dead' && (
          <Billboard position={[0, def.scale * 1.8 + 0.3, 0]}>
            {/* Background */}
            <mesh position={[0, 0, 0]}>
              <planeGeometry args={[0.8, 0.1]} />
              <meshBasicMaterial color="#333333" />
            </mesh>
            {/* Health fill */}
            <mesh position={[(healthPercent - 1) * 0.35, 0, 0.01]}>
              <planeGeometry args={[0.7 * healthPercent, 0.06]} />
              <meshBasicMaterial
                color={healthPercent > 0.5 ? '#44DD44' : healthPercent > 0.25 ? '#DDDD44' : '#DD4444'}
              />
            </mesh>
            {/* Name */}
            <Text
              position={[0, 0.12, 0]}
              fontSize={0.1}
              color="white"
              anchorX="center"
              anchorY="bottom"
            >
              {def.name}
            </Text>
          </Billboard>
        )}
      </group>
    </RigidBody>
  )
}
