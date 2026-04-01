'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

interface ShieldEffectProps {
  color: string
  particleColor: string
  duration?: number
  onExpire: () => void
}

export function ShieldEffect({
  color,
  particleColor,
  duration = 5,
  onExpire,
}: ShieldEffectProps) {
  const shieldRef = useRef<THREE.Mesh>(null)
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    elapsed.current += delta

    if (elapsed.current >= duration) {
      onExpire()
      return
    }

    if (!shieldRef.current) return

    // Pulse effect
    const pulse = 1 + Math.sin(elapsed.current * 4) * 0.05
    shieldRef.current.scale.setScalar(pulse)

    // Rotate slowly
    shieldRef.current.rotation.y += delta * 0.5

    // Fade out in last second
    const material = shieldRef.current.material as THREE.MeshStandardMaterial
    if (elapsed.current > duration - 1) {
      material.opacity = (duration - elapsed.current)  * 0.3
    }
  })

  return (
    <group>
      {/* Shield sphere */}
      <mesh ref={shieldRef}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Orbiting particles */}
      <Sparkles
        count={30}
        scale={3}
        size={3}
        speed={2}
        color={particleColor}
      />
    </group>
  )
}
