'use client'

import { useMemo } from 'react'
import { AirplaneCarousel } from './rides/AirplaneCarousel'
import { RollerCoaster } from './rides/RollerCoaster'

const FENCE_RADIUS = 33
const FENCE_POST_SPACING = 5
const FENCE_POST_HEIGHT = 1
const FENCE_POST_RADIUS = 0.05
const NUM_LAMP_POSTS = 6

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

      // Rail connecting this post to the next
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
      {/* Pole */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 4, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Lamp bulb */}
      <mesh position={[0, 4.2, 0]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial
          color="#FFDD44"
          emissive="#FFDD44"
          emissiveIntensity={0.8}
        />
      </mesh>
      {/* Lamp cap */}
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
      {/* Left pillar */}
      <mesh position={[-2.5, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 5, 12]} />
        <meshStandardMaterial color="#DD2222" />
      </mesh>
      {/* Right pillar */}
      <mesh position={[2.5, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 5, 12]} />
        <meshStandardMaterial color="#DD2222" />
      </mesh>
      {/* Horizontal beam on top */}
      <mesh position={[0, 5.2, 0]} castShadow>
        <boxGeometry args={[6, 0.6, 0.6]} />
        <meshStandardMaterial color="#FFCC00" />
      </mesh>
      {/* Decorative top piece */}
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
        <AirplaneCarousel />
      </group>

      {/* Roller Coaster */}
      <group position={[10, 0.15, 5]}>
        <RollerCoaster />
      </group>

      {/* Lamp posts */}
      {lampPositions.map((pos, i) => (
        <LampPost key={`lamp-${i}`} position={pos} />
      ))}
    </group>
  )
}
