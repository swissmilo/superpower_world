'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function WavePool() {
  const wavesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!wavesRef.current) return
    const t = state.clock.elapsedTime
    wavesRef.current.children.forEach((child, i) => {
      child.position.y = 0.45 + Math.sin(t * 2 + i * 0.8) * 0.12
    })
  })

  return (
    <group>
      {/* Basin */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[11.4, 0.4, 7.4]} />
        <meshStandardMaterial color="#DDE3E8" />
      </mesh>
      {/* Water */}
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10.6, 6.6]} />
        <meshStandardMaterial color="#1E78C8" transparent opacity={0.75} />
      </mesh>
      {/* Wave crests */}
      <group ref={wavesRef}>
        {[-3.5, -1, 1.5, 4].map((x, i) => (
          <mesh key={i} position={[x, 0.45, 0]}>
            <boxGeometry args={[0.6, 0.25, 6.4]} />
            <meshStandardMaterial color="#7FC4F0" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
