'use client'

import { useMemo } from 'react'
import { AxeThrow } from './training/AxeThrow'
import { GrapplingTower } from './training/GrapplingTower'
import { ObstacleCourse } from './training/ObstacleCourse'

const FENCE_RADIUS = 30
const FENCE_POST_SPACING = 4
const NUM_LANTERNS = 6
const FACILITY_WORLD_OFFSET: [number, number, number] = [-200, 0, -200]

function ToriiGate() {
  return (
    <group position={[0, 0, FENCE_RADIUS - 1]}>
      {/* Left pillar */}
      <mesh position={[-2.5, 3, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 6, 12]} />
        <meshStandardMaterial color="#CC2222" />
      </mesh>
      {/* Right pillar */}
      <mesh position={[2.5, 3, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 6, 12]} />
        <meshStandardMaterial color="#CC2222" />
      </mesh>
      {/* Top beam (kasagi) - curved look with a box */}
      <mesh position={[0, 6.2, 0]} castShadow>
        <boxGeometry args={[7, 0.4, 0.5]} />
        <meshStandardMaterial color="#CC2222" />
      </mesh>
      {/* Second beam (nuki) */}
      <mesh position={[0, 5.2, 0]} castShadow>
        <boxGeometry args={[5.5, 0.25, 0.35]} />
        <meshStandardMaterial color="#CC2222" />
      </mesh>
      {/* Beam ends (extend past pillars) */}
      <mesh position={[-3.3, 6.2, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.6]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh position={[3.3, 6.2, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.6]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  )
}

function WoodenFence() {
  const { posts, rails } = useMemo(() => {
    const circumference = 2 * Math.PI * FENCE_RADIUS
    const numPosts = Math.floor(circumference / FENCE_POST_SPACING)

    const postData: { position: [number, number, number]; angle: number }[] = []
    const railData: {
      position: [number, number, number]
      rotation: [number, number, number]
      length: number
    }[] = []

    for (let i = 0; i < numPosts; i++) {
      const angle = (i / numPosts) * Math.PI * 2
      const x = Math.sin(angle) * FENCE_RADIUS
      const z = Math.cos(angle) * FENCE_RADIUS

      // Leave gap for the gate
      if (Math.abs(x) < 3 && z > FENCE_RADIUS - 3) continue

      postData.push({ position: [x, 0.6, z], angle })

      const nextAngle = ((i + 1) / numPosts) * Math.PI * 2
      const nextX = Math.sin(nextAngle) * FENCE_RADIUS
      const nextZ = Math.cos(nextAngle) * FENCE_RADIUS

      if (Math.abs(nextX) < 3 && nextZ > FENCE_RADIUS - 3) continue

      const midX = (x + nextX) / 2
      const midZ = (z + nextZ) / 2
      const dx = nextX - x
      const dz = nextZ - z
      const length = Math.sqrt(dx * dx + dz * dz)
      const railAngle = Math.atan2(dx, dz)

      railData.push({
        position: [midX, 0.9, midZ],
        rotation: [0, railAngle, 0],
        length,
      })
      railData.push({
        position: [midX, 0.4, midZ],
        rotation: [0, railAngle, 0],
        length,
      })
    }

    return { posts: postData, rails: railData }
  }, [])

  return (
    <>
      {posts.map((post, i) => (
        <mesh key={`nf-post-${i}`} position={post.position}>
          <cylinderGeometry args={[0.06, 0.08, 1.2, 6]} />
          <meshStandardMaterial color="#8B5E3C" />
        </mesh>
      ))}
      {rails.map((rail, i) => (
        <mesh key={`nf-rail-${i}`} position={rail.position} rotation={rail.rotation}>
          <boxGeometry args={[0.04, 0.06, rail.length]} />
          <meshStandardMaterial color="#A0704A" />
        </mesh>
      ))}
    </>
  )
}

function Lantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 3, 6]} />
        <meshStandardMaterial color="#5C3A1E" />
      </mesh>
      {/* Lantern body */}
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial
          color="#FFCC44"
          emissive="#FF8800"
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Lantern cap */}
      <mesh position={[0, 3.55, 0]}>
        <coneGeometry args={[0.3, 0.2, 4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}

function TrainingDummy({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Post */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      {/* Body (straw) */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.7, 8]} />
        <meshStandardMaterial color="#D4A847" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#D4A847" />
      </mesh>
      {/* Arms */}
      <mesh position={[0, 1.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1, 6]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
    </group>
  )
}

export function NinjaFacility() {
  const lanternPositions = useMemo<[number, number, number][]>(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < NUM_LANTERNS; i++) {
      const angle = (i / NUM_LANTERNS) * Math.PI * 2
      const radius = 18
      positions.push([
        Math.sin(angle) * radius,
        0,
        Math.cos(angle) * radius,
      ])
    }
    return positions
  }, [])

  const axeOffset: [number, number, number] = [
    FACILITY_WORLD_OFFSET[0] + 12,
    FACILITY_WORLD_OFFSET[1] + 0.15,
    FACILITY_WORLD_OFFSET[2] + 0,
  ]
  const towerOffset: [number, number, number] = [
    FACILITY_WORLD_OFFSET[0] + (-12),
    FACILITY_WORLD_OFFSET[1] + 0.15,
    FACILITY_WORLD_OFFSET[2] + 0,
  ]
  const courseOffset: [number, number, number] = [
    FACILITY_WORLD_OFFSET[0] + 0,
    FACILITY_WORLD_OFFSET[1] + 0.15,
    FACILITY_WORLD_OFFSET[2] + (-15),
  ]

  return (
    <group>
      {/* Ground platform (sand/wood) */}
      <mesh position={[0, 0.075, 0]} receiveShadow>
        <cylinderGeometry args={[32, 32, 0.15, 48]} />
        <meshStandardMaterial color="#C4A76C" />
      </mesh>

      {/* Inner training ground (darker) */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[20, 20, 0.12, 32]} />
        <meshStandardMaterial color="#B89858" />
      </mesh>

      {/* Torii Gate entrance */}
      <ToriiGate />

      {/* Wooden perimeter fence */}
      <WoodenFence />

      {/* Axe Throwing Range (east) */}
      <group position={[12, 0.15, 0]}>
        <AxeThrow worldOffset={axeOffset} />
      </group>

      {/* Grappling Tower (west) */}
      <group position={[-12, 0.15, 0]}>
        <GrapplingTower worldOffset={towerOffset} />
      </group>

      {/* Obstacle Course (south) */}
      <group position={[0, 0.15, -15]}>
        <ObstacleCourse worldOffset={courseOffset} />
      </group>

      {/* Training dummies (decorative) */}
      <TrainingDummy position={[5, 0, 8]} />
      <TrainingDummy position={[-5, 0, 8]} />
      <TrainingDummy position={[8, 0, 5]} />

      {/* Lanterns */}
      {lanternPositions.map((pos, i) => (
        <Lantern key={`lantern-${i}`} position={pos} />
      ))}
    </group>
  )
}
