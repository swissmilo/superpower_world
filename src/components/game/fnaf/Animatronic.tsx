'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'

interface AnimatronicProps {
  character: 'freddy' | 'chica' | 'foxy' | 'bonnie'
  worldOffset?: [number, number, number]
  patrolPoints: [number, number, number][]
}

/* ------------------------------------------------------------------ */
/*  Character sub-components                                          */
/* ------------------------------------------------------------------ */

function FreddyModel({ eyeIntensity }: { eyeIntensity: number }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 0.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      {/* Left ear */}
      <mesh position={[-0.3, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#6B3410" />
      </mesh>
      {/* Right ear */}
      <mesh position={[0.3, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#6B3410" />
      </mesh>
      {/* Top hat */}
      <mesh position={[0, 1.95, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 12]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Hat brim */}
      <mesh position={[0, 1.78, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 12]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Bow tie */}
      <mesh position={[0, 0.95, 0.26]} castShadow>
        <boxGeometry args={[0.2, 0.1, 0.05]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.14, 1.45, 0.35]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={eyeIntensity} />
      </mesh>
      {/* Left pupil */}
      <mesh position={[-0.14, 1.45, 0.41]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.14, 1.45, 0.35]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={eyeIntensity} />
      </mesh>
      {/* Right pupil */}
      <mesh position={[0.14, 1.45, 0.41]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Mouth */}
      <mesh position={[0, 1.25, 0.38]}>
        <boxGeometry args={[0.18, 0.06, 0.04]} />
        <meshStandardMaterial color="#3A1A0A" />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.2, -0.3, 0]} castShadow>
        <boxGeometry args={[0.25, 0.6, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.2, -0.3, 0]} castShadow>
        <boxGeometry args={[0.25, 0.6, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.55, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.7, 0.2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.55, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.7, 0.2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  )
}

function ChicaModel({ eyeIntensity }: { eyeIntensity: number }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 0.5]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      {/* Head - slightly wider */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshStandardMaterial color="#FFEC8B" />
      </mesh>
      {/* Beak */}
      <mesh position={[0, 1.3, 0.45]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.1, 0.2, 8]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.16, 1.48, 0.38]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={eyeIntensity} />
      </mesh>
      {/* Left pupil - purple */}
      <mesh position={[-0.16, 1.48, 0.45]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial color="#8B00FF" />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.16, 1.48, 0.38]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={eyeIntensity} />
      </mesh>
      {/* Right pupil - purple */}
      <mesh position={[0.16, 1.48, 0.45]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial color="#8B00FF" />
      </mesh>
      {/* Bib on chest */}
      <mesh position={[0, 0.6, 0.26]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.06]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* Pink spot on bib */}
      <mesh position={[0, 0.6, 0.3]}>
        <boxGeometry args={[0.15, 0.1, 0.02]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.2, -0.3, 0]} castShadow>
        <boxGeometry args={[0.25, 0.6, 0.3]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.2, -0.3, 0]} castShadow>
        <boxGeometry args={[0.25, 0.6, 0.3]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.55, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.7, 0.2]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      {/* Right arm - angled to hold cupcake */}
      <group position={[0.55, 0.5, 0]}>
        <mesh rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        {/* Cupcake */}
        <group position={[0, -0.2, 0.3]}>
          {/* Cupcake base */}
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.08, 0.12, 8]} />
            <meshStandardMaterial color="#DEB887" />
          </mesh>
          {/* Cupcake top */}
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#FF69B4" />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function FoxyModel({ eyeIntensity }: { eyeIntensity: number }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.7, 1, 0.45]} />
        <meshStandardMaterial color="#CD3333" />
      </mesh>
      {/* Head - angular (box) */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#B22222" />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 1.2, 0.35]} castShadow>
        <boxGeometry args={[0.25, 0.15, 0.2]} />
        <meshStandardMaterial color="#CD5555" />
      </mesh>
      {/* Jaw - slightly open */}
      <mesh position={[0, 1.08, 0.35]}>
        <boxGeometry args={[0.22, 0.06, 0.18]} />
        <meshStandardMaterial color="#8B1A1A" />
      </mesh>
      {/* Left ear (cone rotated) */}
      <mesh position={[-0.22, 1.65, 0]} rotation={[0, 0, -0.2]} castShadow>
        <coneGeometry args={[0.08, 0.25, 6]} />
        <meshStandardMaterial color="#8B1A1A" />
      </mesh>
      {/* Right ear */}
      <mesh position={[0.22, 1.65, 0]} rotation={[0, 0, 0.2]} castShadow>
        <coneGeometry args={[0.08, 0.25, 6]} />
        <meshStandardMaterial color="#8B1A1A" />
      </mesh>
      {/* Eye patch over left eye */}
      <mesh position={[-0.12, 1.35, 0.26]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.12, 1.35, 0.26]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={eyeIntensity} />
      </mesh>
      {/* Right eye pupil - golden */}
      <mesh position={[0.12, 1.35, 0.31]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#DAA520" />
      </mesh>
      {/* Left arm - hook hand */}
      <group position={[-0.5, 0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshStandardMaterial color="#CD3333" />
        </mesh>
        {/* Hook */}
        <mesh position={[0, -0.45, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.04, 0.15, 6]} />
          <meshStandardMaterial color="#AAAAAA" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      {/* Right arm - normal hand */}
      <mesh position={[0.5, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.7, 0.2]} />
        <meshStandardMaterial color="#CD3333" />
      </mesh>
      {/* Left leg - tattered */}
      <mesh position={[-0.18, -0.3, 0]} castShadow>
        <boxGeometry args={[0.22, 0.55, 0.28]} />
        <meshStandardMaterial color="#CD3333" />
      </mesh>
      <mesh position={[-0.18, -0.45, 0.05]}>
        <boxGeometry args={[0.08, 0.2, 0.06]} />
        <meshStandardMaterial color="#8B1A1A" />
      </mesh>
      {/* Right leg - tattered */}
      <mesh position={[0.18, -0.3, 0]} castShadow>
        <boxGeometry args={[0.22, 0.55, 0.28]} />
        <meshStandardMaterial color="#CD3333" />
      </mesh>
      <mesh position={[0.18, -0.5, -0.05]}>
        <boxGeometry args={[0.06, 0.15, 0.08]} />
        <meshStandardMaterial color="#8B1A1A" />
      </mesh>
    </group>
  )
}

function BonnieModel({ eyeIntensity }: { eyeIntensity: number }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 0.5]} />
        <meshStandardMaterial color="#6A5ACD" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshStandardMaterial color="#7B68EE" />
      </mesh>
      {/* Left ear - long */}
      <mesh position={[-0.15, 2.0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.6, 0.08]} />
        <meshStandardMaterial color="#7B68EE" />
      </mesh>
      {/* Left ear inner */}
      <mesh position={[-0.15, 2.0, 0.03]}>
        <boxGeometry args={[0.08, 0.5, 0.04]} />
        <meshStandardMaterial color="#9B88FF" />
      </mesh>
      {/* Right ear - long */}
      <mesh position={[0.15, 2.0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.6, 0.08]} />
        <meshStandardMaterial color="#7B68EE" />
      </mesh>
      {/* Right ear inner */}
      <mesh position={[0.15, 2.0, 0.03]}>
        <boxGeometry args={[0.08, 0.5, 0.04]} />
        <meshStandardMaterial color="#9B88FF" />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.14, 1.45, 0.35]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={eyeIntensity} />
      </mesh>
      {/* Left pupil - red */}
      <mesh position={[-0.14, 1.45, 0.41]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#CC0000" />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.14, 1.45, 0.35]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={eyeIntensity} />
      </mesh>
      {/* Right pupil - red */}
      <mesh position={[0.14, 1.45, 0.41]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#CC0000" />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.2, -0.3, 0]} castShadow>
        <boxGeometry args={[0.25, 0.6, 0.3]} />
        <meshStandardMaterial color="#6A5ACD" />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.2, -0.3, 0]} castShadow>
        <boxGeometry args={[0.25, 0.6, 0.3]} />
        <meshStandardMaterial color="#6A5ACD" />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.55, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.7, 0.2]} />
        <meshStandardMaterial color="#6A5ACD" />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.55, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.7, 0.2]} />
        <meshStandardMaterial color="#6A5ACD" />
      </mesh>
      {/* Guitar body */}
      <mesh position={[0.2, 0.2, 0.3]} rotation={[0.2, -0.1, 0.15]} castShadow>
        <boxGeometry args={[0.3, 0.8, 0.08]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      {/* Guitar neck */}
      <mesh position={[0.15, 0.75, 0.35]} rotation={[0.2, -0.1, 0.15]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
        <meshStandardMaterial color="#5C3A1E" />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Animatronic component                                        */
/* ------------------------------------------------------------------ */

export function Animatronic({ character, worldOffset = [0, 0, 0], patrolPoints }: AnimatronicProps) {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)

  // Patrol state stored in refs to avoid re-renders
  const patrol = useRef({
    currentPointIndex: 0,
    elapsedAtPoint: 0,
    pauseDuration: 3 + Math.random() * 2,
    isMoving: false,
  })

  // Eye glow intensity ref
  const eyeIntensityRef = useRef(0.3)

  // Memoize initial position
  const startPos = useMemo<[number, number, number]>(() => {
    if (patrolPoints.length > 0) return patrolPoints[0]
    return [0, 0, 0]
  }, [patrolPoints])

  // Temp vectors to avoid allocation in frame loop
  const _targetPos = useMemo(() => new THREE.Vector3(), [])
  const _currentPos = useMemo(() => new THREE.Vector3(), [])
  const _toPlayer = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    if (!groupRef.current || patrolPoints.length === 0) return

    const p = patrol.current
    const pos = groupRef.current.position

    // World position of this animatronic
    const worldX = worldOffset[0] + pos.x
    const worldZ = worldOffset[2] + pos.z

    // Distance to player
    const dx = playerRefs.position.x - worldX
    const dz = playerRefs.position.z - worldZ
    const distToPlayer = Math.sqrt(dx * dx + dz * dz)

    // --- Eye intensity ---
    const targetIntensity = distToPlayer < 5 ? 0.8 : 0.3
    eyeIntensityRef.current += (targetIntensity - eyeIntensityRef.current) * delta * 3

    // --- Patrol AI ---
    if (!p.isMoving) {
      // Pausing at current point
      p.elapsedAtPoint += delta
      if (p.elapsedAtPoint >= p.pauseDuration) {
        p.isMoving = true
        p.currentPointIndex = (p.currentPointIndex + 1) % patrolPoints.length
      }
    } else {
      // Moving toward target
      const target = patrolPoints[p.currentPointIndex]
      _targetPos.set(target[0], target[1], target[2])
      _currentPos.set(pos.x, pos.y, pos.z)

      const dist = _currentPos.distanceTo(_targetPos)

      if (dist < 0.5) {
        // Arrived at patrol point
        pos.x = target[0]
        pos.y = target[1]
        pos.z = target[2]
        p.isMoving = false
        p.elapsedAtPoint = 0
        p.pauseDuration = 3 + Math.random() * 2
      } else {
        // Lerp toward target
        const speed = 1.0
        const step = Math.min(speed * delta, dist)
        const direction = _targetPos.clone().sub(_currentPos).normalize()
        pos.x += direction.x * step
        pos.y += direction.y * step
        pos.z += direction.z * step

        // Face movement direction
        const moveAngle = Math.atan2(direction.x, direction.z)
        groupRef.current.rotation.y = moveAngle
      }
    }

    // --- Head tracking (creepy!) ---
    if (headRef.current && distToPlayer < 8) {
      // Angle from animatronic to player in world space
      const angleToPlayer = Math.atan2(dx, dz)
      // Relative to body facing direction
      const bodyAngle = groupRef.current.rotation.y
      let relativeAngle = angleToPlayer - bodyAngle

      // Normalize to -PI..PI
      while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2
      while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2

      // Clamp to +/- 60 degrees
      const maxTurn = (60 * Math.PI) / 180
      relativeAngle = Math.max(-maxTurn, Math.min(maxTurn, relativeAngle))

      // Smoothly rotate head
      headRef.current.rotation.y += (relativeAngle - headRef.current.rotation.y) * delta * 4
    } else if (headRef.current) {
      // Return head to forward
      headRef.current.rotation.y += (0 - headRef.current.rotation.y) * delta * 2
    }
  })

  // Select the character model
  const CharacterBody = useMemo(() => {
    switch (character) {
      case 'freddy': return FreddyModel
      case 'chica': return ChicaModel
      case 'foxy': return FoxyModel
      case 'bonnie': return BonnieModel
    }
  }, [character])

  return (
    <group ref={groupRef} position={startPos}>
      {/* Head group wraps the character for head tracking rotation */}
      <group ref={headRef}>
        {/* Offset so the character's feet are at y=0 and total height is ~2.5 */}
        <group position={[0, 0.6, 0]}>
          <CharacterBody eyeIntensity={eyeIntensityRef.current} />
        </group>
      </group>
    </group>
  )
}
