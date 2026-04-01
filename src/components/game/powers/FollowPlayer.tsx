'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'

interface FollowPlayerProps {
  children: React.ReactNode
}

export function FollowPlayer({ children }: FollowPlayerProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.copy(playerRefs.position)
  })

  return <group ref={groupRef}>{children}</group>
}
