'use client'

import { Billboard, Text } from '@react-three/drei'

export function BurgerShop() {
  return (
    <group>
      {/* Hut body */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[3, 2, 3]} />
        <meshStandardMaterial color="#E0A030" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.6, 1, 4]} />
        <meshStandardMaterial color="#B5392E" />
      </mesh>
      {/* Counter */}
      <mesh position={[0, 0.9, 1.55]}>
        <boxGeometry args={[2.4, 0.15, 0.4]} />
        <meshStandardMaterial color="#7A4B1E" />
      </mesh>
      <Billboard position={[0, 3.4, 0]}>
        <Text fontSize={0.8} anchorX="center" anchorY="middle">
          🍔
        </Text>
      </Billboard>
    </group>
  )
}
