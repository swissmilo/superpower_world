'use client'

import { Text } from '@react-three/drei'

export function Stage() {
  return (
    <group>
      {/* Raised platform */}
      <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[10, 0.4, 10]} />
        <meshStandardMaterial color="#5C3A1E" />
      </mesh>

      {/* Left curtain panel */}
      <mesh position={[-4.85, 2.2, 0]} castShadow>
        <boxGeometry args={[0.3, 4, 8]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>

      {/* Right curtain panel */}
      <mesh position={[4.85, 2.2, 0]} castShadow>
        <boxGeometry args={[0.3, 4, 8]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>

      {/* Curtain valance across top */}
      <mesh position={[0, 4.45, 0]} castShadow>
        <boxGeometry args={[10, 0.5, 0.3]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>

      {/* Spotlights - 3 small spheres above the stage */}
      <mesh position={[-3, 4.8, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial
          color="#FFDD00"
          emissive="#FFDD00"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[0, 4.8, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial
          color="#FFDD00"
          emissive="#FFDD00"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[3, 4.8, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial
          color="#FFDD00"
          emissive="#FFDD00"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Star decoration on back wall - box rotated 45 degrees */}
      <mesh position={[0, 3, -4.8]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Second rotated box for star cross */}
      <mesh position={[0, 3, -4.79]}>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* "SHOW TIME!" text above the stage */}
      <Text
        position={[0, 5.5, 0]}
        fontSize={0.8}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        SHOW TIME!
      </Text>
    </group>
  )
}
