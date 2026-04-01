'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, type RapierRigidBody } from '@react-three/rapier'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'
import { useGameStore } from '@/stores/gameStore'
import { enemyRegistry } from '@/stores/enemyRegistry'

interface BossProps {
  position: [number, number, number]
  onDeath: () => void
}

const BOSS_HEALTH = 500
const BOSS_DAMAGE = 25
const BOSS_CURRENCY_DROP = 200
const BOSS_SCALE = 3
const BOSS_SPEED = 3
const BOSS_DETECTION_RANGE = 30
const BOSS_MELEE_RANGE = 3
const BOSS_RANGED_RANGE = 15
const BOSS_MELEE_COOLDOWN = 1.5
const BOSS_RANGED_COOLDOWN = 3

let bossIdCounter = 10000

interface BossProjectile {
  id: number
  position: THREE.Vector3
  direction: THREE.Vector3
  lifetime: number
}

let projectileIdCounter = 0

export function Boss({ position, onDeath }: BossProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [health, setHealth] = useState(BOSS_HEALTH)
  const [state, setState] = useState<'idle' | 'chase' | 'attack' | 'dead'>('idle')
  const [isMoving, setIsMoving] = useState(false)
  const [projectiles, setProjectiles] = useState<BossProjectile[]>([])
  const enemyId = useRef(bossIdCounter++)
  const enemyPos = useRef(new THREE.Vector3(...position))

  const meleeTimer = useRef(0)
  const rangedTimer = useRef(0)
  const deathTimer = useRef(0)
  const hitFlash = useRef(0)
  const armSwing = useRef(0)

  const takeDamage = useCallback(
    (amount: number) => {
      setHealth((prev) => {
        const newHealth = prev - amount
        if (newHealth <= 0) {
          setState('dead')
          useGameStore.getState().addCurrency(BOSS_CURRENCY_DROP)
          enemyRegistry.unregister(enemyId.current)
        }
        return Math.max(0, newHealth)
      })
      hitFlash.current = 0.15
    },
    []
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
        groupRef.current.scale.setScalar(Math.max(0, BOSS_SCALE - deathTimer.current * 3))
        groupRef.current.position.y -= delta * 0.5
      }
      if (deathTimer.current > 1) {
        onDeath()
      }
      return
    }

    // Decrement attack timers
    meleeTimer.current = Math.max(0, meleeTimer.current - delta)
    rangedTimer.current = Math.max(0, rangedTimer.current - delta)

    // Arm swing animation decay
    armSwing.current = Math.max(0, armSwing.current - delta * 3)

    // State transitions
    if (distToPlayer < BOSS_MELEE_RANGE && state !== 'attack') {
      setState('attack')
    } else if (distToPlayer < BOSS_DETECTION_RANGE && distToPlayer >= BOSS_MELEE_RANGE) {
      // In ranged/chase zone
      if (distToPlayer <= BOSS_RANGED_RANGE) {
        setState('attack')
      } else {
        setState('chase')
      }
    } else if (distToPlayer >= BOSS_DETECTION_RANGE && state !== 'idle') {
      setState('idle')
    }

    const velocity = rigidBodyRef.current.linvel()

    switch (state) {
      case 'idle': {
        rigidBodyRef.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true)
        setIsMoving(false)
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
            { x: nx * BOSS_SPEED, y: velocity.y, z: nz * BOSS_SPEED },
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
        // Face player
        const dx = playerPos.x - pos.x
        const dz = playerPos.z - pos.z
        if (groupRef.current) {
          groupRef.current.rotation.y = Math.atan2(dx, dz)
        }

        if (distToPlayer < BOSS_MELEE_RANGE) {
          // Melee attack
          rigidBodyRef.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true)
          setIsMoving(false)

          if (meleeTimer.current <= 0) {
            useGameStore.getState().takeDamage(BOSS_DAMAGE)
            meleeTimer.current = BOSS_MELEE_COOLDOWN
            armSwing.current = 1
          }
        } else if (distToPlayer <= BOSS_RANGED_RANGE) {
          // Ranged attack - move slowly toward player
          const dist = Math.sqrt(dx * dx + dz * dz)
          if (dist > BOSS_MELEE_RANGE) {
            const nx = dx / dist
            const nz = dz / dist
            rigidBodyRef.current.setLinvel(
              { x: nx * BOSS_SPEED * 0.5, y: velocity.y, z: nz * BOSS_SPEED * 0.5 },
              true
            )
            setIsMoving(true)
          }

          if (rangedTimer.current <= 0) {
            // Fire projectile
            const dir = new THREE.Vector3(
              playerPos.x - pos.x,
              0,
              playerPos.z - pos.z
            ).normalize()

            setProjectiles((prev) => [
              ...prev,
              {
                id: projectileIdCounter++,
                position: new THREE.Vector3(pos.x, pos.y + 2, pos.z),
                direction: dir,
                lifetime: 3,
              },
            ])
            rangedTimer.current = BOSS_RANGED_COOLDOWN
          }
        } else {
          setState('chase')
        }
        break
      }
    }

    // Update projectiles
    setProjectiles((prev) => {
      const updated: BossProjectile[] = []
      for (const proj of prev) {
        proj.position.addScaledVector(proj.direction, delta * 12)
        proj.lifetime -= delta

        // Check if hit player
        const distToPlayerXZ = Math.sqrt(
          (proj.position.x - playerPos.x) ** 2 +
          (proj.position.z - playerPos.z) ** 2
        )
        if (distToPlayerXZ < 1) {
          useGameStore.getState().takeDamage(BOSS_DAMAGE * 0.6)
          continue
        }

        if (proj.lifetime > 0) {
          updated.push(proj)
        }
      }
      return updated
    })

    // Keep boss in bounds
    if (pos.y < -10) {
      rigidBodyRef.current.setTranslation(
        { x: position[0], y: position[1], z: position[2] },
        true
      )
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
  })

  const healthPercent = health / BOSS_HEALTH
  const bodyColor = hitFlash.current > 0 ? '#FFFFFF' : '#660066'
  const accentColor = hitFlash.current > 0 ? '#FFAAAA' : '#AA00AA'

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        type="dynamic"
        position={position}
        lockRotations
        mass={10}
        linearDamping={2}
        userData={{ type: 'enemy', takeDamage }}
      >
        <CapsuleCollider
          args={[0.5 * BOSS_SCALE, 0.5 * BOSS_SCALE]}
          position={[0, 1 * BOSS_SCALE, 0]}
        />

        <group ref={groupRef} scale={BOSS_SCALE}>
          {/* Body - large icosahedron */}
          <mesh position={[0, 1, 0]} castShadow>
            <icosahedronGeometry args={[0.7, 1]} />
            <meshStandardMaterial
              color={bodyColor}
              flatShading
            />
          </mesh>

          {/* Left arm */}
          <mesh
            position={[-0.9, 0.8, 0]}
            rotation={[0, 0, armSwing.current * 1.5]}
            castShadow
          >
            <boxGeometry args={[0.35, 0.8, 0.35]} />
            <meshStandardMaterial color={accentColor} flatShading />
          </mesh>

          {/* Right arm */}
          <mesh
            position={[0.9, 0.8, 0]}
            rotation={[0, 0, -armSwing.current * 1.5]}
            castShadow
          >
            <boxGeometry args={[0.35, 0.8, 0.35]} />
            <meshStandardMaterial color={accentColor} flatShading />
          </mesh>

          {/* Glowing eyes */}
          <mesh position={[-0.2, 1.2, 0.55]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshStandardMaterial
              color="#FF0044"
              emissive="#FF0044"
              emissiveIntensity={2}
            />
          </mesh>
          <mesh position={[0.2, 1.2, 0.55]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshStandardMaterial
              color="#FF0044"
              emissive="#FF0044"
              emissiveIntensity={2}
            />
          </mesh>

          {/* Crown / horns */}
          <mesh position={[-0.3, 1.7, 0]} castShadow>
            <coneGeometry args={[0.1, 0.4, 4]} />
            <meshStandardMaterial color={accentColor} flatShading />
          </mesh>
          <mesh position={[0.3, 1.7, 0]} castShadow>
            <coneGeometry args={[0.1, 0.4, 4]} />
            <meshStandardMaterial color={accentColor} flatShading />
          </mesh>

          {/* Health bar */}
          {healthPercent < 1 && state !== 'dead' && (
            <Billboard position={[0, 2.2, 0]}>
              <mesh position={[0, 0, 0]}>
                <planeGeometry args={[1.2, 0.12]} />
                <meshBasicMaterial color="#333333" />
              </mesh>
              <mesh position={[(healthPercent - 1) * 0.5, 0, 0.01]}>
                <planeGeometry args={[1.0 * healthPercent, 0.08]} />
                <meshBasicMaterial
                  color={healthPercent > 0.5 ? '#44DD44' : healthPercent > 0.25 ? '#DDDD44' : '#DD4444'}
                />
              </mesh>
              <Text
                position={[0, 0.15, 0]}
                fontSize={0.12}
                color="white"
                anchorX="center"
                anchorY="bottom"
              >
                Void Titan
              </Text>
            </Billboard>
          )}
        </group>
      </RigidBody>

      {/* Boss projectiles */}
      {projectiles.map((proj) => (
        <mesh key={proj.id} position={proj.position}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial
            color="#AA00FF"
            emissive="#AA00FF"
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </>
  )
}
