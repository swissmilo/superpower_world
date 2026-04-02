'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function SecurityRoom() {
  const fanRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (fanRef.current) {
      fanRef.current.rotation.z += delta * 3
    }
  })

  return (
    <group>
      {/* Desk */}
      <mesh position={[0, 0.4, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.8, 1]} />
        <meshStandardMaterial color="#3C2415" />
      </mesh>

      {/* Monitor 1 (left) */}
      <mesh position={[-0.5, 1.0, -1.6]} castShadow>
        <boxGeometry args={[0.4, 0.35, 0.05]} />
        <meshStandardMaterial
          color="#003322"
          emissive="#00FF88"
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Monitor 2 (center) */}
      <mesh position={[0, 1.0, -1.6]} castShadow>
        <boxGeometry args={[0.4, 0.35, 0.05]} />
        <meshStandardMaterial
          color="#003322"
          emissive="#00FF88"
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Monitor 3 (right) */}
      <mesh position={[0.5, 1.0, -1.6]} castShadow>
        <boxGeometry args={[0.4, 0.35, 0.05]} />
        <meshStandardMaterial
          color="#003322"
          emissive="#00FF88"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Office chair */}
      {/* Base */}
      <mesh position={[0, 0.025, -0.5]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 12]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      {/* Post */}
      <mesh position={[0, 0.25, -0.5]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 6]} />
        <meshStandardMaterial color="#333333" metalness={0.6} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, 0.475, -0.5]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.5]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.75, -0.75]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Fan on desk */}
      <group position={[0.7, 0.95, -1.3]}>
        {/* Fan body */}
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 8]} />
          <meshStandardMaterial color="#555555" metalness={0.5} />
        </mesh>
        {/* Fan blades - rotating group */}
        <group ref={fanRef} position={[0, 0, 0.06]}>
          {/* Blade 1 */}
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[0.2, 0.04, 0.01]} />
            <meshStandardMaterial color="#888888" metalness={0.4} />
          </mesh>
          {/* Blade 2 */}
          <mesh rotation={[0, 0, Math.PI / 3 * 2]}>
            <boxGeometry args={[0.2, 0.04, 0.01]} />
            <meshStandardMaterial color="#888888" metalness={0.4} />
          </mesh>
          {/* Blade 3 */}
          <mesh rotation={[0, 0, Math.PI / 3 * 4]}>
            <boxGeometry args={[0.2, 0.04, 0.01]} />
            <meshStandardMaterial color="#888888" metalness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Papers scattered on desk */}
      <mesh position={[-0.6, 0.82, -1.2]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.2, 0.005, 0.28]} />
        <meshStandardMaterial color="#EEEEEE" />
      </mesh>
      <mesh position={[-0.35, 0.82, -1.35]} rotation={[0, -0.15, 0]}>
        <boxGeometry args={[0.18, 0.005, 0.25]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      <mesh position={[0.3, 0.82, -1.15]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[0.15, 0.005, 0.22]} />
        <meshStandardMaterial color="#EEEEEE" />
      </mesh>

      {/* Poster on wall */}
      <mesh position={[1.5, 1.5, -1.99]} castShadow>
        <boxGeometry args={[0.8, 1, 0.02]} />
        <meshStandardMaterial color="#DD6644" />
      </mesh>
    </group>
  )
}
