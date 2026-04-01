'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'
import { useGameStore } from '@/stores/gameStore'

const RIDE_ID = 'axe_throw'
const MOUNT_RANGE = 3
const AXE_LIFETIME = 2 // seconds
const AXE_FLY_DURATION = 1.5 // seconds
const THROW_COOLDOWN = 0.5 // seconds between throws

interface AxeProjectile {
  id: number
  elapsed: number
  startPos: THREE.Vector3
  spread: number // random X offset
  targetZ: number // -15 (middle target)
  scored: boolean
  hitFlash: number // >0 means flashing
}

const TARGET_POSITIONS: [number, number, number][] = [
  [0, 2, -10],
  [0, 2, -15],
  [0, 2, -20],
]

// Trajectory arc preview positions (parabolic path from z=0 toward z=-15)
function getArcPosition(t: number, spread: number): THREE.Vector3 {
  const z = -15 * t
  const x = spread * t
  const y = 1.5 + 4 * t * (1 - t) // parabolic arc peaking at y=2.5
  return new THREE.Vector3(x, y, z)
}

function TargetBoard({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* A-frame stand - left leg */}
      <mesh position={[-0.5, -1, 0.2]} rotation={[0.1, 0, 0.15]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 2.2, 6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* A-frame stand - right leg */}
      <mesh position={[0.5, -1, 0.2]} rotation={[0.1, 0, -0.15]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 2.2, 6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Target backing board */}
      <mesh castShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.1, 32]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>
      {/* Outer ring - red */}
      <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.08, 8, 32]} />
        <meshStandardMaterial color="#CC2222" />
      </mesh>
      {/* Middle ring - white */}
      <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.08, 8, 32]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* Inner ring / bullseye - yellow */}
      <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.08, 8, 32]} />
        <meshStandardMaterial color="#DDCC00" />
      </mesh>
      {/* Bullseye center fill */}
      <mesh position={[0, 0, 0.07]}>
        <circleGeometry args={[0.18, 16]} />
        <meshStandardMaterial color="#DDCC00" />
      </mesh>
    </group>
  )
}

function AxeMesh({ flash }: { flash: boolean }) {
  return (
    <group>
      {/* Handle */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Blade */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.15, 0.04]} />
        <meshStandardMaterial
          color={flash ? '#FFFFFF' : '#AAAAAA'}
          metalness={0.7}
          roughness={0.3}
          emissive={flash ? '#FFFFFF' : '#000000'}
          emissiveIntensity={flash ? 1 : 0}
        />
      </mesh>
    </group>
  )
}

export function AxeThrow({ worldOffset = [0, 0, 0] }: { worldOffset?: [number, number, number] }) {
  const [axes, setAxes] = useState<AxeProjectile[]>([])
  const axeIdRef = useRef(0)
  const throwCooldownRef = useRef(0)
  const mouseDownRef = useRef(false)
  const axeGroupRefs = useRef<Map<number, THREE.Group>>(new Map())

  // Track hit flashes on targets (index -> remaining flash time)
  const targetFlashRef = useRef<number[]>([0, 0, 0])

  const trajectoryPreview = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 5; i++) {
      points.push(getArcPosition(i / 5, 0))
    }
    return points
  }, [])

  useFrame((state, delta) => {
    // Update throw cooldown
    if (throwCooldownRef.current > 0) {
      throwCooldownRef.current -= delta
    }

    // Update target flashes
    for (let i = 0; i < 3; i++) {
      if (targetFlashRef.current[i] > 0) {
        targetFlashRef.current[i] -= delta
      }
    }

    // Mount zone check at the throwing line
    const mountPoint = new THREE.Vector3(
      worldOffset[0],
      worldOffset[1],
      worldOffset[2]
    )
    const dist = playerRefs.position.distanceTo(mountPoint)

    if (dist < MOUNT_RANGE && !playerRefs.isOnRide) {
      playerRefs.nearRide = RIDE_ID
      playerRefs.mountRide = () => {
        playerRefs.isOnRide = true
        playerRefs.currentRide = RIDE_ID
        // Register mousedown listener
        const onMouseDown = () => { mouseDownRef.current = true }
        const onMouseUp = () => { mouseDownRef.current = false }
        window.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mouseup', onMouseUp)
        // Store cleanup references
        playerRefs.dismountRide = () => {
          playerRefs.isOnRide = false
          playerRefs.currentRide = null
          playerRefs.nearRide = null
          window.removeEventListener('mousedown', onMouseDown)
          window.removeEventListener('mouseup', onMouseUp)
          mouseDownRef.current = false
        }
      }
      playerRefs.dismountRide = () => {
        playerRefs.isOnRide = false
        playerRefs.currentRide = null
        playerRefs.nearRide = null
      }
    } else if (playerRefs.nearRide === RIDE_ID && !playerRefs.isOnRide) {
      playerRefs.nearRide = null
      playerRefs.mountRide = null
    }

    // When mounted, lock player and handle throwing
    if (playerRefs.isOnRide && playerRefs.currentRide === RIDE_ID) {
      // Lock player at throwing line
      playerRefs.ridePosition.set(
        worldOffset[0],
        worldOffset[1] + 1,
        worldOffset[2] + 1
      )
      playerRefs.rideLookAt.set(
        worldOffset[0],
        worldOffset[1] + 2,
        worldOffset[2] - 15
      )

      // Handle throwing on click
      if (mouseDownRef.current && throwCooldownRef.current <= 0) {
        mouseDownRef.current = false // consume the click
        throwCooldownRef.current = THROW_COOLDOWN

        const spread = (Math.random() - 0.5) * 1.0 // random X spread
        const newAxe: AxeProjectile = {
          id: axeIdRef.current++,
          elapsed: 0,
          startPos: new THREE.Vector3(0, 1.5, 0),
          spread,
          targetZ: -15,
          scored: false,
          hitFlash: 0,
        }
        setAxes(prev => [...prev, newAxe])
      }
    }

    // Update axe projectiles
    setAxes(prev => {
      const updated: AxeProjectile[] = []
      for (const axe of prev) {
        const newElapsed = axe.elapsed + delta
        if (newElapsed > AXE_LIFETIME) continue // remove expired axes

        const t = Math.min(newElapsed / AXE_FLY_DURATION, 1)
        const pos = getArcPosition(t, axe.spread)

        // Update mesh position
        const group = axeGroupRefs.current.get(axe.id)
        if (group) {
          group.position.copy(pos)
          // Spin on Z axis while flying
          group.rotation.z = newElapsed * 12
        }

        // Check scoring when projectile reaches target zone
        if (!axe.scored && t >= 1) {
          let bestScore = 0
          let hitTargetIdx = -1

          for (let ti = 0; ti < TARGET_POSITIONS.length; ti++) {
            const targetPos = TARGET_POSITIONS[ti]
            const dx = pos.x - targetPos[0]
            const dy = pos.y - targetPos[1]
            const dz = pos.z - targetPos[2]
            const distToTarget = Math.sqrt(dx * dx + dy * dy + dz * dz)

            let score = 0
            if (distToTarget < 0.3) score = 10
            else if (distToTarget < 0.7) score = 5
            else if (distToTarget < 1.2) score = 2

            if (score > bestScore) {
              bestScore = score
              hitTargetIdx = ti
            }
          }

          if (bestScore > 0) {
            useGameStore.getState().addCurrency(bestScore)
            if (hitTargetIdx >= 0) {
              targetFlashRef.current[hitTargetIdx] = 0.3
            }
          }

          updated.push({ ...axe, elapsed: newElapsed, scored: true, hitFlash: bestScore > 0 ? 0.3 : 0 })
        } else {
          updated.push({ ...axe, elapsed: newElapsed })
        }
      }
      return updated
    })
  })

  const isActive = playerRefs.isOnRide && playerRefs.currentRide === RIDE_ID

  return (
    <group>
      {/* Target boards */}
      {TARGET_POSITIONS.map((pos, i) => (
        <TargetBoard key={`target-${i}`} position={pos} />
      ))}

      {/* Throwing line - red stripe on ground */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 0.1]} />
        <meshStandardMaterial color="#CC2222" />
      </mesh>

      {/* Left side wall */}
      <mesh position={[-2.5, 1.5, -10]} castShadow>
        <boxGeometry args={[0.2, 3, 22]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Right side wall */}
      <mesh position={[2.5, 1.5, -10]} castShadow>
        <boxGeometry args={[0.2, 3, 22]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Trajectory preview when mounted */}
      {isActive && trajectoryPreview.map((pos, i) => (
        <mesh key={`traj-${i}`} position={pos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color="#FFFF00"
            emissive="#FFFF00"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      {/* Axe projectiles */}
      {axes.map(axe => (
        <group
          key={axe.id}
          ref={(el) => {
            if (el) axeGroupRefs.current.set(axe.id, el)
            else axeGroupRefs.current.delete(axe.id)
          }}
        >
          <AxeMesh flash={axe.hitFlash > 0} />
        </group>
      ))}

      {/* "Press Space" indicator */}
      {playerRefs.nearRide === RIDE_ID && !playerRefs.isOnRide && (
        <Billboard position={[0, 3, 0]}>
          <Text
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            Press Space to Throw
          </Text>
        </Billboard>
      )}

      {/* Active mode indicator */}
      {isActive && (
        <Billboard position={[0, 4, 0]}>
          <Text
            fontSize={0.35}
            color="#FFFF00"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#000000"
          >
            Click to throw! Space to exit
          </Text>
        </Billboard>
      )}
    </group>
  )
}
