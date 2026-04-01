'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface EnemyModelProps {
  modelType: 'slime' | 'golem' | 'elemental'
  color: string
  bodyColor: string
  scale: number
  isMoving: boolean
}

function SlimeModel({ color, bodyColor, isMoving }: { color: string; bodyColor: string; isMoving: boolean }) {
  const bodyRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!bodyRef.current) return
    const time = performance.now() * 0.004
    // Squish bounce
    const squish = isMoving ? 0.15 : 0.05
    bodyRef.current.scale.y = 1 + Math.sin(time) * squish
    bodyRef.current.scale.x = 1 - Math.sin(time) * squish * 0.5
    bodyRef.current.scale.z = 1 - Math.sin(time) * squish * 0.5
    bodyRef.current.position.y = 0.3 + Math.abs(Math.sin(time)) * (isMoving ? 0.2 : 0.05)
  })

  return (
    <group>
      <mesh ref={bodyRef} position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.5, 12, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.15, 0.5, 0.35]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.15, 0.5, 0.35]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.15, 0.5, 0.4]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.15, 0.5, 0.4]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  )
}

function GolemModel({ color, bodyColor }: { color: string; bodyColor: string }) {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.5]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.15, 1.65, 0.26]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#FF4444" emissive="#FF0000" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.15, 1.65, 0.26]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#FF4444" emissive="#FF0000" emissiveIntensity={0.5} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.9, 1, 0.6]} />
        <meshStandardMaterial color={bodyColor} flatShading />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.65, 0.9, 0]} castShadow>
        <boxGeometry args={[0.35, 0.9, 0.35]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0.65, 0.9, 0]} castShadow>
        <boxGeometry args={[0.35, 0.9, 0.35]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.2, 0.25, 0]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.4]} />
        <meshStandardMaterial color={bodyColor} flatShading />
      </mesh>
      <mesh position={[0.2, 0.25, 0]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.4]} />
        <meshStandardMaterial color={bodyColor} flatShading />
      </mesh>
    </group>
  )
}

function ElementalModel({ color, bodyColor }: { color: string; bodyColor: string }) {
  const coreRef = useRef<THREE.Mesh>(null)
  const orbitRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!coreRef.current || !orbitRef.current) return
    const time = performance.now() * 0.003
    coreRef.current.rotation.y += 0.02
    coreRef.current.position.y = 0.8 + Math.sin(time) * 0.15
    orbitRef.current.rotation.y += 0.04
  })

  return (
    <group>
      {/* Core */}
      <mesh ref={coreRef} position={[0, 0.8, 0]} castShadow>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={bodyColor}
          emissiveIntensity={0.8}
        />
      </mesh>
      {/* Orbiting shards */}
      <group ref={orbitRef} position={[0, 0.8, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 2) * 0.7,
              Math.sin(i * 0.5) * 0.2,
              Math.sin((i * Math.PI) / 2) * 0.7,
            ]}
          >
            <octahedronGeometry args={[0.1, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function EnemyModel({ modelType, color, bodyColor, scale, isMoving }: EnemyModelProps) {
  return (
    <group scale={scale}>
      {modelType === 'slime' && <SlimeModel color={color} bodyColor={bodyColor} isMoving={isMoving} />}
      {modelType === 'golem' && <GolemModel color={color} bodyColor={bodyColor} />}
      {modelType === 'elemental' && <ElementalModel color={color} bodyColor={bodyColor} />}
    </group>
  )
}
