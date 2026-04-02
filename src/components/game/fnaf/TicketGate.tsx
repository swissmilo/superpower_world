'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

export function TicketGate() {
  const turnstileRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (turnstileRef.current) {
      turnstileRef.current.rotation.z += delta * 0.5
    }
  })

  return (
    <group>
      {/* Left post */}
      <mesh position={[-1, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 12]} />
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Right post */}
      <mesh position={[1, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 12]} />
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Horizontal turnstile bar - slowly rotating */}
      <mesh ref={turnstileRef} position={[0, 0.7, 0]}>
        <boxGeometry args={[1.8, 0.05, 0.05]} />
        <meshStandardMaterial color="#999999" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* "TICKETS" sign above */}
      {/* Sign background */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[1.5, 0.5, 0.05]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <Text
        position={[0, 1.8, 0.03]}
        fontSize={0.25}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        TICKETS
      </Text>

      {/* Ticket booth on one side */}
      {/* Booth counter */}
      <mesh position={[2.2, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.6]} />
        <meshStandardMaterial color="#5C3A1E" />
      </mesh>
      {/* Glass window on top of booth */}
      <mesh position={[2.2, 1.3, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.4]} />
        <meshStandardMaterial
          color="#88CCFF"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}
