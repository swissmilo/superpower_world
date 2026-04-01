'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import type { Group } from 'three'

interface DamageNumberProps {
  position: [number, number, number]
  damage: number
  color: string
  onExpire: () => void
}

export function DamageNumber({ position, damage, color, onExpire }: DamageNumberProps) {
  const groupRef = useRef<Group>(null)
  const elapsedRef = useRef(0)
  const duration = 1

  useFrame((_, delta) => {
    if (!groupRef.current) return

    elapsedRef.current += delta
    const t = elapsedRef.current / duration

    if (t >= 1) {
      onExpire()
      return
    }

    // Float upward
    groupRef.current.position.y += delta * 2

    // Scale: pop up then shrink
    const scaleCurve = t < 0.15
      ? 1 + t * 4 // Scale up to ~1.6 in first 15%
      : 1.6 - (t - 0.15) * 1.2 // Then shrink back down
    const scale = Math.max(0.1, scaleCurve)
    groupRef.current.scale.set(scale, scale, scale)

    // Fade out
    const opacity = 1 - t * t
    const textMesh = groupRef.current.children[0]?.children[0]
    if (textMesh && 'material' in textMesh) {
      const material = textMesh.material as { opacity: number; transparent: boolean }
      material.opacity = opacity
      material.transparent = true
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <Billboard>
        <Text
          fontSize={0.5}
          fontWeight="bold"
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#000000"
        >
          {Math.round(damage)}
        </Text>
      </Billboard>
    </group>
  )
}
