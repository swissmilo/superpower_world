'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const AIRPLANE_COLORS = ['#FF4444', '#4488FF', '#44CC44', '#FFAA00', '#CC44CC', '#44CCCC']
const NUM_ARMS = 6
const ARM_LENGTH = 5
const ARM_ANGLE = -0.15 // slight downward angle in radians
const AIRPLANE_TILT = 0.26 // ~15 degrees outward tilt
const ROTATION_SPEED = 0.5 // rad/s
const CHAIN_LENGTH = 1.2

function Airplane({ color }: { color: string }) {
  return (
    <group>
      {/* Fuselage */}
      <mesh>
        <boxGeometry args={[1.2, 0.3, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.05, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tail vertical fin */}
      <mesh position={[-0.5, 0.15, 0]}>
        <boxGeometry args={[0.3, 0.25, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tail horizontal stabilizer */}
      <mesh position={[-0.5, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.04, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0.7, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.12, 0.3, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
      </mesh>
    </group>
  )
}

export function AirplaneCarousel() {
  const rotatingGroupRef = useRef<THREE.Group>(null)

  const armData = useMemo(() => {
    return Array.from({ length: NUM_ARMS }, (_, i) => {
      const angle = (i / NUM_ARMS) * Math.PI * 2
      return { angle, color: AIRPLANE_COLORS[i] }
    })
  }, [])

  useFrame((_, delta) => {
    if (rotatingGroupRef.current) {
      rotatingGroupRef.current.rotation.y += ROTATION_SPEED * delta
    }
  })

  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[4, 4, 0.3, 32]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Central pole */}
      <mesh position={[0, 4.15, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 8, 16]} />
        <meshStandardMaterial color="#AAAAAA" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Top canopy (cone) */}
      <mesh position={[0, 8.9, 0]} castShadow>
        <coneGeometry args={[3, 1.5, 32]} />
        <meshStandardMaterial color="#DD2222" />
      </mesh>

      {/* Canopy rim */}
      <mesh position={[0, 8.15, 0]}>
        <cylinderGeometry args={[3, 3, 0.1, 32]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Rotating assembly: arms + chains + airplanes */}
      <group ref={rotatingGroupRef} position={[0, 8.15, 0]}>
        {armData.map((arm, i) => {
          const armDirX = Math.sin(arm.angle)
          const armDirZ = Math.cos(arm.angle)

          // Arm midpoint
          const armMidX = armDirX * (ARM_LENGTH / 2)
          const armMidZ = armDirZ * (ARM_LENGTH / 2)

          // Arm tip
          const armTipX = armDirX * ARM_LENGTH
          const armTipZ = armDirZ * ARM_LENGTH
          const armTipY = Math.sin(ARM_ANGLE) * ARM_LENGTH

          // Chain hangs from arm tip downward
          const chainY = armTipY - CHAIN_LENGTH / 2

          // Airplane position below chain
          const airplaneY = armTipY - CHAIN_LENGTH

          return (
            <group key={`arm-${i}`}>
              {/* Arm (thin box rotated to point outward and downward) */}
              <group
                position={[armMidX, Math.sin(ARM_ANGLE) * ARM_LENGTH / 2, armMidZ]}
                rotation={[
                  armDirZ * ARM_ANGLE,
                  -arm.angle,
                  -armDirX * ARM_ANGLE,
                ]}
              >
                <mesh castShadow>
                  <boxGeometry args={[0.08, 0.08, ARM_LENGTH]} />
                  <meshStandardMaterial color="#CCCCCC" metalness={0.7} roughness={0.3} />
                </mesh>
              </group>

              {/* Chain (thin cylinder hanging down from arm tip) */}
              <mesh position={[armTipX, chainY, armTipZ]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, CHAIN_LENGTH, 6]} />
                <meshStandardMaterial color="#999999" metalness={0.6} roughness={0.4} />
              </mesh>

              {/* Airplane at bottom of chain, tilted outward */}
              <group
                position={[armTipX, airplaneY, armTipZ]}
                rotation={[0, -arm.angle + Math.PI / 2, AIRPLANE_TILT]}
              >
                <Airplane color={arm.color} />
              </group>
            </group>
          )
        })}
      </group>
    </group>
  )
}
