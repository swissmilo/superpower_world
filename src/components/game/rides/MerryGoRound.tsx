'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'

const RIDE_ID = 'merry_go_round'
const PLATFORM_RADIUS = 5
const HORSE_RADIUS = 4
const NUM_HORSES = 8
const ROTATION_SPEED = 0.4 // rad/s
const BOB_SPEED = 2 // cycles per rotation
const BOB_AMPLITUDE = 0.4
const MOUNT_RANGE = 5
const HORSE_COLORS = ['#FFFFFF', '#8B6914', '#222222', '#DAA520', '#FFFFFF', '#8B6914', '#222222', '#DAA520']

function Horse({ color }: { color: string }) {
  return (
    <group>
      {/* Body (elongated box) */}
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.4, 0.35]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Head (angled forward) */}
      <group position={[0.5, 0.35, 0]} rotation={[0, 0, 0.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.35, 0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {/* Front left leg */}
      <mesh position={[0.3, -0.35, 0.12]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.08]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Front right leg */}
      <mesh position={[0.3, -0.35, -0.12]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.08]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Back left leg */}
      <mesh position={[-0.3, -0.35, 0.12]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.08]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Back right leg */}
      <mesh position={[-0.3, -0.35, -0.12]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.08]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.55, 0.1, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.06, 0.35, 0.06]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

export function MerryGoRound({ worldOffset = [0, 0, 0] }: { worldOffset?: [number, number, number] }) {
  const platformRef = useRef<THREE.Group>(null)
  const horseGroupRefs = useRef<THREE.Group[]>([])
  const angleRef = useRef(0)

  const horseData = useMemo(() => {
    return Array.from({ length: NUM_HORSES }, (_, i) => {
      const angle = (i / NUM_HORSES) * Math.PI * 2
      return { angle, color: HORSE_COLORS[i % HORSE_COLORS.length] }
    })
  }, [])

  useFrame((_, delta) => {
    angleRef.current += ROTATION_SPEED * delta

    if (platformRef.current) {
      platformRef.current.rotation.y = angleRef.current
    }

    // Bob the horses up and down
    horseGroupRefs.current.forEach((horseGroup, i) => {
      if (horseGroup) {
        const phase = (i / NUM_HORSES) * Math.PI * 2
        const bobY = Math.sin(angleRef.current * BOB_SPEED + phase) * BOB_AMPLITUDE
        horseGroup.position.y = bobY
      }
    })

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

    // Update ride position when riding (follow horse #0)
    if (playerRefs.isOnRide && playerRefs.currentRide === RIDE_ID) {
      const horse0Angle = horseData[0].angle + angleRef.current
      const horse0X = Math.sin(horse0Angle) * HORSE_RADIUS
      const horse0Z = Math.cos(horse0Angle) * HORSE_RADIUS
      const phase0 = (0 / NUM_HORSES) * Math.PI * 2
      const bobY = Math.sin(angleRef.current * BOB_SPEED + phase0) * BOB_AMPLITUDE

      const rideX = worldOffset[0] + horse0X
      const rideY = worldOffset[1] + 1.2 + bobY // platform height + horse height + bob
      const rideZ = worldOffset[2] + horse0Z
      playerRefs.ridePosition.set(rideX, rideY, rideZ)
      playerRefs.rideLookAt.set(rideX, rideY + 2, rideZ)
    }
  })

  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[PLATFORM_RADIUS, PLATFORM_RADIUS, 0.3, 32]} />
        <meshStandardMaterial color="#CC8833" />
      </mesh>

      {/* Central pole */}
      <mesh position={[0, 2.65, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 5, 12]} />
        <meshStandardMaterial color="#DDDDDD" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Conical canopy */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <coneGeometry args={[PLATFORM_RADIUS + 0.5, 2, 32]} />
        <meshStandardMaterial color="#DD2222" />
      </mesh>

      {/* Canopy trim ring */}
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[PLATFORM_RADIUS + 0.5, PLATFORM_RADIUS + 0.5, 0.1, 32]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Second canopy stripe */}
      <mesh position={[0, 5.8, 0]}>
        <coneGeometry args={[PLATFORM_RADIUS - 0.5, 1.5, 32]} />
        <meshStandardMaterial color="#FFFFFF" opacity={0.7} transparent />
      </mesh>

      {/* Rotating platform group */}
      <group ref={platformRef} position={[0, 0.3, 0]}>
        {/* Decorative platform edge */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[PLATFORM_RADIUS, 0.1, 8, 32]} />
          <meshStandardMaterial color="#FFCC00" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Horses on poles */}
        {horseData.map((horse, i) => {
          const x = Math.sin(horse.angle) * HORSE_RADIUS
          const z = Math.cos(horse.angle) * HORSE_RADIUS
          return (
            <group
              key={`horse-${i}`}
              position={[x, 0, z]}
              ref={(el) => {
                if (el) horseGroupRefs.current[i] = el
              }}
            >
              {/* Pole */}
              <mesh position={[0, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
                <meshStandardMaterial color="#DDDDDD" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Horse at center of pole */}
              <group position={[0, 1.2, 0]} rotation={[0, -horse.angle + Math.PI / 2, 0]}>
                <Horse color={horse.color} />
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
