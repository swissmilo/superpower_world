'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'
import { useGameStore } from '@/stores/gameStore'
import { ELEMENTS } from '@/lib/elements'

export function AimIndicator() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    if (!useGameStore.getState().playerElement) return

    const pos = playerRefs.position
    const az = playerRefs.azimuth

    // Forward direction — must match projectile direction in PowerManager
    const fx = -Math.sin(az)
    const fz = -Math.cos(az)

    // Place arrow 2 units ahead of the player on the ground
    groupRef.current.position.set(
      pos.x + fx * 2.5,
      0.12,
      pos.z + fz * 2.5
    )

    // Point the arrow in the forward direction
    // atan2(fx, fz) gives the Y-rotation that aligns +Z with (fx, fz)
    groupRef.current.rotation.y = Math.atan2(fx, fz)
  })

  const element = useGameStore((s) => s.playerElement)
  if (!element) return null
  const color = ELEMENTS[element].color

  return (
    <group ref={groupRef}>
      {/* Arrow shaft — flat plane along +Z */}
      <mesh position={[0, 0, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Arrow head — cone pointing along +Z */}
      <mesh position={[0, 0, 0.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.22, 0.45, 3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  )
}
