'use client'

import { Billboard, Text } from '@react-three/drei'

export function Restrooms() {
  return (
    <group>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[3, 2, 3]} />
        <meshStandardMaterial color="#88AA99" />
      </mesh>
      {/* Flat roof */}
      <mesh position={[0, 2.05, 0]} castShadow>
        <boxGeometry args={[3.3, 0.2, 3.3]} />
        <meshStandardMaterial color="#5C7A6B" />
      </mesh>
      {/* Doors */}
      <mesh position={[-0.7, 0.8, 1.51]}>
        <boxGeometry args={[1, 1.6, 0.05]} />
        <meshStandardMaterial color="#33576B" />
      </mesh>
      <mesh position={[0.7, 0.8, 1.51]}>
        <boxGeometry args={[1, 1.6, 0.05]} />
        <meshStandardMaterial color="#8B3A52" />
      </mesh>
      <Billboard position={[0, 3, 0]}>
        <Text fontSize={0.7} anchorX="center" anchorY="middle">
          🚻
        </Text>
      </Billboard>
    </group>
  )
}
