'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { playerRefs } from '@/stores/playerRefs'

interface SpeedBoostProps {
  color: string
  particleColor: string
  multiplier?: number
  duration?: number
  onExpire: () => void
}

export function SpeedBoost({
  color,
  particleColor,
  multiplier = 2,
  duration = 5,
  onExpire,
}: SpeedBoostProps) {
  const elapsed = useRef(0)
  const applied = useRef(false)

  useFrame((_, delta) => {
    elapsed.current += delta

    // Apply speed boost
    if (!applied.current) {
      playerRefs.speedMultiplier = multiplier
      applied.current = true
    }

    if (elapsed.current >= duration) {
      playerRefs.speedMultiplier = 1
      onExpire()
      return
    }

    // Flash warning in last second
    if (elapsed.current > duration - 1) {
      playerRefs.speedMultiplier = multiplier * (0.5 + 0.5 * Math.sin(elapsed.current * 10))
    }
  })

  return (
    <group>
      <Sparkles
        count={20}
        scale={2}
        size={3}
        speed={5}
        color={particleColor}
      />
    </group>
  )
}
