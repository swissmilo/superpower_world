'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'

const RIDE_ID = 'ferris_wheel'
const WHEEL_RADIUS = 12
const NUM_GONDOLAS = 8
const ROTATION_SPEED = (2 * Math.PI) / 30 // full rotation in ~30 seconds
const MOUNT_RANGE = 4
const GONDOLA_COLORS = ['#DD3333', '#3366DD', '#DDCC00', '#33AA33', '#DD3333', '#3366DD', '#DDCC00', '#33AA33']

function Gondola({ color }: { color: string }) {
  return (
    <group>
      {/* Cabin body */}
      <mesh castShadow>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.1, 0.1, 1.1]} />
        <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Floor */}
      <mesh position={[0, -0.45, 0]}>
        <boxGeometry args={[1.1, 0.1, 1.1]} />
        <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function FerrisWheel({ worldOffset = [0, 0, 0] }: { worldOffset?: [number, number, number] }) {
  const wheelRef = useRef<THREE.Group>(null)
  const angleRef = useRef(0)
  const gondolaRefs = useRef<THREE.Group[]>([])

  const gondolaData = useMemo(() => {
    return Array.from({ length: NUM_GONDOLAS }, (_, i) => {
      const angle = (i / NUM_GONDOLAS) * Math.PI * 2
      return { angle, color: GONDOLA_COLORS[i % GONDOLA_COLORS.length] }
    })
  }, [])

  // Spoke geometry data
  const spokeData = useMemo(() => {
    const spokes: { angle: number }[] = []
    for (let i = 0; i < 16; i++) {
      spokes.push({ angle: (i / 16) * Math.PI * 2 })
    }
    return spokes
  }, [])

  useFrame((_, delta) => {
    angleRef.current += ROTATION_SPEED * delta

    if (wheelRef.current) {
      wheelRef.current.rotation.z = angleRef.current
    }

    // Counter-rotate gondolas to keep them level
    gondolaRefs.current.forEach((gondola) => {
      if (gondola) {
        gondola.rotation.z = -angleRef.current
      }
    })

    // Mount zone: gondola #0 passes near the bottom
    // Gondola #0 position on the wheel
    const gondola0Angle = gondolaData[0].angle + angleRef.current
    const gondola0LocalX = Math.sin(gondola0Angle) * WHEEL_RADIUS
    const gondola0LocalY = WHEEL_RADIUS + 1 - Math.cos(gondola0Angle) * WHEEL_RADIUS

    // World position of the mount point (bottom of wheel)
    const mountWorldX = worldOffset[0]
    const mountWorldY = worldOffset[1] + 1 // base height
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

    // Update ride position when player is riding
    if (playerRefs.isOnRide && playerRefs.currentRide === RIDE_ID) {
      // Gondola #0 world position
      const rideX = worldOffset[0] + gondola0LocalX
      const rideY = worldOffset[1] + gondola0LocalY
      const rideZ = worldOffset[2]
      playerRefs.ridePosition.set(rideX, rideY, rideZ)
      playerRefs.rideLookAt.set(rideX, rideY + 2, rideZ)
    }
  })

  return (
    <group>
      {/* A-frame support - left */}
      <group position={[0, 0, -1.5]}>
        {/* Left leg */}
        <mesh position={[-3, WHEEL_RADIUS / 2 + 1, 0]} rotation={[0, 0, 0.25]} castShadow>
          <boxGeometry args={[0.3, WHEEL_RADIUS + 2, 0.3]} />
          <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Right leg */}
        <mesh position={[3, WHEEL_RADIUS / 2 + 1, 0]} rotation={[0, 0, -0.25]} castShadow>
          <boxGeometry args={[0.3, WHEEL_RADIUS + 2, 0.3]} />
          <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Cross beam */}
        <mesh position={[0, WHEEL_RADIUS * 0.5, 0]}>
          <boxGeometry args={[4, 0.2, 0.2]} />
          <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* A-frame support - right */}
      <group position={[0, 0, 1.5]}>
        <mesh position={[-3, WHEEL_RADIUS / 2 + 1, 0]} rotation={[0, 0, 0.25]} castShadow>
          <boxGeometry args={[0.3, WHEEL_RADIUS + 2, 0.3]} />
          <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[3, WHEEL_RADIUS / 2 + 1, 0]} rotation={[0, 0, -0.25]} castShadow>
          <boxGeometry args={[0.3, WHEEL_RADIUS + 2, 0.3]} />
          <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, WHEEL_RADIUS * 0.5, 0]}>
          <boxGeometry args={[4, 0.2, 0.2]} />
          <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Central axle */}
      <mesh position={[0, WHEEL_RADIUS + 1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 4, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rotating wheel group */}
      <group ref={wheelRef} position={[0, WHEEL_RADIUS + 1, 0]}>
        {/* Outer rim - two torus rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[WHEEL_RADIUS, 0.15, 8, 48]} />
          <meshStandardMaterial color="#AAAAAA" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Spokes */}
        {spokeData.map((spoke, i) => {
          const x = Math.sin(spoke.angle) * (WHEEL_RADIUS / 2)
          const y = -Math.cos(spoke.angle) * (WHEEL_RADIUS / 2)
          return (
            <mesh
              key={`spoke-${i}`}
              position={[x, y, 0]}
              rotation={[0, 0, spoke.angle]}
            >
              <boxGeometry args={[0.08, WHEEL_RADIUS, 0.08]} />
              <meshStandardMaterial color="#BBBBBB" metalness={0.6} roughness={0.4} />
            </mesh>
          )
        })}

        {/* Gondolas */}
        {gondolaData.map((gondola, i) => {
          const x = Math.sin(gondola.angle) * WHEEL_RADIUS
          const y = -Math.cos(gondola.angle) * WHEEL_RADIUS
          return (
            <group
              key={`gondola-${i}`}
              position={[x, y, 0]}
              ref={(el) => {
                if (el) gondolaRefs.current[i] = el
              }}
            >
              {/* Hanging rod */}
              <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
                <meshStandardMaterial color="#999999" metalness={0.6} roughness={0.4} />
              </mesh>
              <Gondola color={gondola.color} />
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
