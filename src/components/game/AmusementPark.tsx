'use client'

import { useMemo } from 'react'
import { AirplaneCarousel } from './rides/AirplaneCarousel'
import { RollerCoaster } from './rides/RollerCoaster'
import { FerrisWheel } from './rides/FerrisWheel'
import { MerryGoRound } from './rides/MerryGoRound'
import { WaterSlide } from './rides/WaterSlide'
import { Dropper } from './rides/Dropper'

const FENCE_RADIUS = 33
const FENCE_POST_SPACING = 5
const FENCE_POST_HEIGHT = 1
const FENCE_POST_RADIUS = 0.05
const NUM_LAMP_POSTS = 8

// The park is placed at [200, 0, 200] in the scene — rides need this for mount zone checks
const PARK_WORLD_OFFSET: [number, number, number] = [200, 0, 200]

function FenceSection() {
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
      postData.push({ position: [x, FENCE_POST_HEIGHT / 2, z], angle })

      const nextAngle = ((i + 1) / numPosts) * Math.PI * 2
      const nextX = Math.sin(nextAngle) * FENCE_RADIUS
      const nextZ = Math.cos(nextAngle) * FENCE_RADIUS

      const midX = (x + nextX) / 2
      const midZ = (z + nextZ) / 2
      const dx = nextX - x
      const dz = nextZ - z
      const length = Math.sqrt(dx * dx + dz * dz)
      const railAngle = Math.atan2(dx, dz)

      railData.push({
        position: [midX, FENCE_POST_HEIGHT * 0.7, midZ],
        rotation: [0, railAngle, 0],
        length,
      })
      railData.push({
        position: [midX, FENCE_POST_HEIGHT * 0.35, midZ],
        rotation: [0, railAngle, 0],
        length,
      })
    }

    return { posts: postData, rails: railData }
  }, [])

  return (
    <>
      {posts.map((post, i) => (
        <mesh key={`fence-post-${i}`} position={post.position}>
          <cylinderGeometry args={[FENCE_POST_RADIUS, FENCE_POST_RADIUS, FENCE_POST_HEIGHT, 6]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}
      {rails.map((rail, i) => (
        <mesh key={`fence-rail-${i}`} position={rail.position} rotation={rail.rotation}>
          <boxGeometry args={[0.03, 0.03, rail.length]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}
    </>
  )
}

function LampPost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 4, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.2, 0]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial
          color="#FFDD44"
          emissive="#FFDD44"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[0.35, 0.3, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function EntryArch() {
  return (
    <group position={[0, 0, -FENCE_RADIUS + 1]}>
      <mesh position={[-2.5, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 5, 12]} />
        <meshStandardMaterial color="#DD2222" />
      </mesh>
      <mesh position={[2.5, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 5, 12]} />
        <meshStandardMaterial color="#DD2222" />
      </mesh>
      <mesh position={[0, 5.2, 0]} castShadow>
        <boxGeometry args={[6, 0.6, 0.6]} />
        <meshStandardMaterial color="#FFCC00" />
      </mesh>
      <mesh position={[0, 5.8, 0]}>
        <boxGeometry args={[4, 0.3, 0.3]} />
        <meshStandardMaterial color="#DD2222" />
      </mesh>
    </group>
  )
}

export function AmusementPark() {
  const lampPositions = useMemo<[number, number, number][]>(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < NUM_LAMP_POSTS; i++) {
      const angle = (i / NUM_LAMP_POSTS) * Math.PI * 2
      const radius = 20
      positions.push([
        Math.sin(angle) * radius,
        0,
        Math.cos(angle) * radius,
      ])
    }
    return positions
  }, [])

  // Each ride's local offset within the park + the park's world offset
  const carouselOffset: [number, number, number] = [
    PARK_WORLD_OFFSET[0] + (-10),
    PARK_WORLD_OFFSET[1] + 0.15,
    PARK_WORLD_OFFSET[2] + 0,
  ]
  const coasterOffset: [number, number, number] = [
    PARK_WORLD_OFFSET[0] + 10,
    PARK_WORLD_OFFSET[1] + 0.15,
    PARK_WORLD_OFFSET[2] + 5,
  ]
  const ferrisOffset: [number, number, number] = [
    PARK_WORLD_OFFSET[0] + 0,
    PARK_WORLD_OFFSET[1] + 0.15,
    PARK_WORLD_OFFSET[2] + 20,
  ]
  const merryOffset: [number, number, number] = [
    PARK_WORLD_OFFSET[0] + (-22),
    PARK_WORLD_OFFSET[1] + 0.15,
    PARK_WORLD_OFFSET[2] + 15,
  ]
  const slideOffset: [number, number, number] = [
    PARK_WORLD_OFFSET[0] + 18,
    PARK_WORLD_OFFSET[1] + 0.15,
    PARK_WORLD_OFFSET[2] + (-18),
  ]
  const dropperOffset: [number, number, number] = [
    PARK_WORLD_OFFSET[0] + (-15),
    PARK_WORLD_OFFSET[1] + 0.15,
    PARK_WORLD_OFFSET[2] + (-18),
  ]

  return (
    <group>
      {/* Ground platform */}
      <mesh position={[0, 0.075, 0]} receiveShadow>
        <cylinderGeometry args={[35, 35, 0.15, 48]} />
        <meshStandardMaterial color="#BBBBBB" />
      </mesh>

      {/* Entry arch */}
      <EntryArch />

      {/* Perimeter fence */}
      <FenceSection />

      {/* Airplane Carousel */}
      <group position={[-10, 0.15, 0]}>
        <AirplaneCarousel worldOffset={carouselOffset} />
      </group>

      {/* Roller Coaster */}
      <group position={[10, 0.15, 5]}>
        <RollerCoaster worldOffset={coasterOffset} />
      </group>

      {/* Ferris Wheel */}
      <group position={[0, 0.15, 20]}>
        <FerrisWheel worldOffset={ferrisOffset} />
      </group>

      {/* Merry-Go-Round */}
      <group position={[-22, 0.15, 15]}>
        <MerryGoRound worldOffset={merryOffset} />
      </group>

      {/* Water Slide */}
      <group position={[18, 0.15, -18]}>
        <WaterSlide worldOffset={slideOffset} />
      </group>

      {/* Dropper */}
      <group position={[-15, 0.15, -18]}>
        <Dropper worldOffset={dropperOffset} />
      </group>

      {/* Lamp posts */}
      {lampPositions.map((pos, i) => (
        <LampPost key={`lamp-${i}`} position={pos} />
      ))}
    </group>
  )
}
