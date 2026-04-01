'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CharacterModelProps {
  elementColor?: string
  isMoving?: boolean
}

export function CharacterModel({
  elementColor = '#4488ff',
  isMoving = false,
}: CharacterModelProps) {
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!leftLegRef.current || !rightLegRef.current) return
    if (!leftArmRef.current || !rightArmRef.current) return
    if (!bodyRef.current) return

    if (isMoving) {
      // Walk animation: swing legs and arms
      const time = performance.now() * 0.008
      const swing = Math.sin(time) * 0.6

      leftLegRef.current.rotation.x = swing
      rightLegRef.current.rotation.x = -swing
      leftArmRef.current.rotation.x = -swing * 0.8
      rightArmRef.current.rotation.x = swing * 0.8

      // Subtle body bob
      bodyRef.current.position.y = Math.abs(Math.sin(time * 2)) * 0.05
    } else {
      // Idle: gentle breathing bob
      const time = performance.now() * 0.002
      const bob = Math.sin(time) * 0.03

      leftLegRef.current.rotation.x = 0
      rightLegRef.current.rotation.x = 0
      leftArmRef.current.rotation.x = 0
      rightArmRef.current.rotation.x = 0
      bodyRef.current.position.y = bob
    }
  })

  return (
    <group ref={bodyRef}>
      {/* Head */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#FFDAB9" />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.12, 1.15, 0.26]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh position={[0.12, 1.15, 0.26]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 0.7, 0.35]} />
        <meshStandardMaterial color={elementColor} />
      </mesh>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.45, 0.7, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.2, 0.55, 0.25]} />
          <meshStandardMaterial color={elementColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.55, 0]}>
          <boxGeometry args={[0.18, 0.12, 0.22]} />
          <meshStandardMaterial color="#FFDAB9" />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.45, 0.7, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.2, 0.55, 0.25]} />
          <meshStandardMaterial color={elementColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.55, 0]}>
          <boxGeometry args={[0.18, 0.12, 0.22]} />
          <meshStandardMaterial color="#FFDAB9" />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.15, 0.15, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.22, 0.55, 0.28]} />
          <meshStandardMaterial color="#2255AA" />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -0.6, 0.05]}>
          <boxGeometry args={[0.24, 0.1, 0.35]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.15, 0.15, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.22, 0.55, 0.28]} />
          <meshStandardMaterial color="#2255AA" />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -0.6, 0.05]}>
          <boxGeometry args={[0.24, 0.1, 0.35]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
    </group>
  )
}
