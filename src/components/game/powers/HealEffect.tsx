'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { useGameStore } from '@/stores/gameStore'

interface HealEffectProps {
  color: string
  particleColor: string
  healPerSecond?: number
  duration?: number
  onExpire: () => void
}

export function HealEffect({
  color,
  particleColor,
  healPerSecond = 15,
  duration = 4,
  onExpire,
}: HealEffectProps) {
  const elapsed = useRef(0)
  const healAccum = useRef(0)

  useFrame((_, delta) => {
    elapsed.current += delta

    if (elapsed.current >= duration) {
      onExpire()
      return
    }

    // Heal over time
    healAccum.current += healPerSecond * delta
    if (healAccum.current >= 1) {
      const amount = Math.floor(healAccum.current)
      useGameStore.getState().heal(amount)
      healAccum.current -= amount
    }
  })

  return (
    <group>
      {/* Rising heal particles */}
      <Sparkles
        count={40}
        scale={[3, 4, 3]}
        size={4}
        speed={3}
        color={particleColor}
      />

      {/* Ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <circleGeometry args={[2, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  )
}
