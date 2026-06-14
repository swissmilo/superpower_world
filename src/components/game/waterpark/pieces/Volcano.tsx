'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Volcano() {
  const lavaRef = useRef<THREE.MeshStandardMaterial>(null)

  const steps = useMemo(() => {
    const result: { y: number; radius: number }[] = []
    const levels = 5
    for (let i = 0; i < levels; i++) {
      result.push({ y: 0.4 + i * 1.6, radius: 5 - i * 0.85 })
    }
    return result
  }, [])

  useFrame((state) => {
    if (!lavaRef.current) return
    lavaRef.current.emissiveIntensity =
      1 + Math.sin(state.clock.elapsedTime * 3) * 0.5
  })

  return (
    <group>
      {/* Stepped volcano body */}
      {steps.map((s, i) => (
        <mesh key={i} position={[0, s.y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[s.radius * 0.82, s.radius, 1.6, 16]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#7A4030' : '#8A4D3A'} />
        </mesh>
      ))}
      {/* Crater lava */}
      <mesh position={[0, 8.3, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.4, 16]} />
        <meshStandardMaterial
          ref={lavaRef}
          color="#FF5522"
          emissive="#FF3300"
          emissiveIntensity={1}
        />
      </mesh>
      <pointLight position={[0, 9, 0]} color="#FF5522" intensity={2} distance={14} />
    </group>
  )
}
