'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'

const RIDE_ID = 'airplane_carousel'
const AIRPLANE_COLORS = ['#FF4444', '#4488FF', '#44CC44', '#FFAA00', '#CC44CC', '#44CCCC']
const NUM_ARMS = 6
const ARM_LENGTH = 5
const ARM_ANGLE = -0.15 // slight downward angle in radians
const AIRPLANE_TILT = 0.26 // ~15 degrees outward tilt
const ROTATION_SPEED = 0.5 // rad/s
const CHAIN_LENGTH = 1.2
const MOUNT_RANGE = 5

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

export function AirplaneCarousel({ worldOffset = [0, 0, 0] }: { worldOffset?: [number, number, number] }) {
  const rotatingGroupRef = useRef<THREE.Group>(null)
  const rotationAngleRef = useRef(0)

  const armData = useMemo(() => {
    return Array.from({ length: NUM_ARMS }, (_, i) => {
      const angle = (i / NUM_ARMS) * Math.PI * 2
      return { angle, color: AIRPLANE_COLORS[i] }
    })
  }, [])

  useFrame((_, delta) => {
    rotationAngleRef.current += ROTATION_SPEED * delta

    if (rotatingGroupRef.current) {
      rotatingGroupRef.current.rotation.y = rotationAngleRef.current
    }

    // Mount zone check
    const mountWorldX = worldOffset[0]
    const mountWorldY = worldOffset[1]
    const mountWorldZ = worldOffset[2]
    const mountPoint = new THREE.Vector3(mountWorldX, mountWorldY, mountWorldZ)
    const dist = playerRefs.position.distanceTo(mountPoint)

    if (dist < MOUNT_RANGE && !playerRefs.isOnRide) {
      playerRefs.nearRide = RIDE_ID
      playerRefs.mountRide = () => {
        playerRefs.isOnRide = true
        playerRefs.currentRide = RIDE_ID
      }
      playerRefs.dismountRide = () => {
        playerRefs.isOnRide = false
        playerRefs.currentRide = null
        playerRefs.nearRide = null
      }
    } else if (playerRefs.nearRide === RIDE_ID && !playerRefs.isOnRide) {
      playerRefs.nearRide = null
      playerRefs.mountRide = null
    }

    // Update ride position when riding (follow airplane #0)
    if (playerRefs.isOnRide && playerRefs.currentRide === RIDE_ID) {
      const arm0 = armData[0]
      const currentAngle = arm0.angle + rotationAngleRef.current

      // Arm tip position in local space (relative to rotating group at y=8.15)
      const armTipX = Math.sin(currentAngle) * ARM_LENGTH
      const armTipZ = Math.cos(currentAngle) * ARM_LENGTH
      const armTipY = Math.sin(ARM_ANGLE) * ARM_LENGTH

      // Airplane hangs below chain from arm tip
      // Rotating group is at y=8.15 in the carousel's local space
      const airplaneLocalY = 8.15 + armTipY - CHAIN_LENGTH

      const rideX = worldOffset[0] + armTipX
      const rideY = worldOffset[1] + airplaneLocalY
      const rideZ = worldOffset[2] + armTipZ
      playerRefs.ridePosition.set(rideX, rideY, rideZ)
      playerRefs.rideLookAt.set(rideX, rideY + 2, rideZ)
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

      {/* "Press Space" indicator */}
      {playerRefs.nearRide === RIDE_ID && !playerRefs.isOnRide && (
        <Billboard position={[0, 3, 0]}>
          <Text
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            Press Space to Ride
          </Text>
        </Billboard>
      )}
    </group>
  )
}
