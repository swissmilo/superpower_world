'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AoeEffectProps {
  position: [number, number, number]
  color: string
  maxRadius?: number
  duration?: number
  onExpire: () => void
}

export function AoeEffect({
  position,
  color,
  maxRadius = 6,
  duration = 0.8,
  onExpire,
}: AoeEffectProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    if (!ringRef.current) return

    elapsed.current += delta
    const progress = elapsed.current / duration

    if (progress >= 1) {
      onExpire()
      return
    }

    // Expand ring
    const scale = progress * maxRadius
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
