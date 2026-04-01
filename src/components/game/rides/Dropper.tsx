'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'

const RIDE_ID = 'dropper'
const TOWER_HEIGHT = 25
const PLATFORM_MIN_Y = 1
const PLATFORM_MAX_Y = 24
const RISE_DURATION = 5 // seconds
const TOP_PAUSE = 2 // seconds
const DROP_DURATION = 0.8 // seconds
const BOTTOM_PAUSE = 2 // seconds
const TOTAL_CYCLE = RISE_DURATION + TOP_PAUSE + DROP_DURATION + BOTTOM_PAUSE
const MOUNT_RANGE = 4

// Easing functions
function easeIn(t: number): number {
  return t * t
}

export function Dropper({ worldOffset = [0, 0, 0] }: { worldOffset?: [number, number, number] }) {
  const platformRef = useRef<THREE.Mesh>(null)
  const cycleTimeRef = useRef(0)
  const platformYRef = useRef(PLATFORM_MIN_Y)

  const railPositions = useMemo<[number, number, number][]>(() => [
    [1, TOWER_HEIGHT / 2, 1],
    [-1, TOWER_HEIGHT / 2, 1],
    [-1, TOWER_HEIGHT / 2, -1],
    [1, TOWER_HEIGHT / 2, -1],
  ], [])

  const crossBeams = useMemo(() => {
    const beams: { position: [number, number, number]; rotation: [number, number, number]; length: number }[] = []
    // Top cross beams connecting the 4 rails
    const topY = TOWER_HEIGHT
    beams.push({ position: [0, topY, 1], rotation: [0, 0, 0], length: 2 })
    beams.push({ position: [0, topY, -1], rotation: [0, 0, 0], length: 2 })
    beams.push({ position: [1, topY, 0], rotation: [0, Math.PI / 2, 0], length: 2 })
    beams.push({ position: [-1, topY, 0], rotation: [0, Math.PI / 2, 0], length: 2 })

    // Intermediate cross beams
    for (let y = 5; y < TOWER_HEIGHT; y += 5) {
      beams.push({ position: [0, y, 1], rotation: [0, 0, 0], length: 2 })
      beams.push({ position: [0, y, -1], rotation: [0, 0, 0], length: 2 })
      beams.push({ position: [1, y, 0], rotation: [0, Math.PI / 2, 0], length: 2 })
      beams.push({ position: [-1, y, 0], rotation: [0, Math.PI / 2, 0], length: 2 })
    }

    return beams
  }, [])

  useFrame((_, delta) => {
    // Advance cycle time (always animating)
    cycleTimeRef.current = (cycleTimeRef.current + delta) % TOTAL_CYCLE
    const ct = cycleTimeRef.current

    let platformY: number

    if (ct < RISE_DURATION) {
      // Rising phase (ease-in: slow start, accelerates)
      const t = ct / RISE_DURATION
      const eased = easeIn(t)
      platformY = PLATFORM_MIN_Y + (PLATFORM_MAX_Y - PLATFORM_MIN_Y) * eased
    } else if (ct < RISE_DURATION + TOP_PAUSE) {
      // Pause at top
      platformY = PLATFORM_MAX_Y
    } else if (ct < RISE_DURATION + TOP_PAUSE + DROP_DURATION) {
      // Drop phase (fast linear)
      const t = (ct - RISE_DURATION - TOP_PAUSE) / DROP_DURATION
      platformY = PLATFORM_MAX_Y - (PLATFORM_MAX_Y - PLATFORM_MIN_Y) * t
    } else {
      // Pause at bottom
      platformY = PLATFORM_MIN_Y
    }

    platformYRef.current = platformY

    if (platformRef.current) {
      platformRef.current.position.y = platformY
    }

    // Mount zone at the base
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

    // Update ride position when riding
    if (playerRefs.isOnRide && playerRefs.currentRide === RIDE_ID) {
      const rideX = worldOffset[0]
      const rideY = worldOffset[1] + platformYRef.current + 0.5 // sit on top of platform
      const rideZ = worldOffset[2]
      playerRefs.ridePosition.set(rideX, rideY, rideZ)
      playerRefs.rideLookAt.set(rideX, rideY + 2, rideZ + 5)
    }
  })

  return (
    <group>
      {/* Central column */}
      <mesh position={[0, TOWER_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, TOWER_HEIGHT, 12]} />
        <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 4 rail columns at corners */}
      {railPositions.map((pos, i) => (
        <mesh key={`rail-${i}`} position={pos} castShadow>
          <cylinderGeometry args={[0.1, 0.1, TOWER_HEIGHT, 8]} />
          <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Cross beams */}
      {crossBeams.map((beam, i) => (
        <mesh key={`beam-${i}`} position={beam.position} rotation={beam.rotation}>
          <boxGeometry args={[beam.length, 0.12, 0.12]} />
          <meshStandardMaterial color="#777777" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Base platform (decorative) */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[3, 0.2, 3]} />
        <meshStandardMaterial color="#555555" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Moving platform/seat */}
      <mesh ref={platformRef} position={[0, PLATFORM_MIN_Y, 0]} castShadow>
        <boxGeometry args={[2, 0.3, 2]} />
        <meshStandardMaterial color="#DD6600" />
      </mesh>

      {/* Safety bar markers on platform (small boxes on edges) */}
      <group>
        {/* These move with the platform - using the same Y via a separate group that we update */}
      </group>

      {/* Top cap / crown */}
      <mesh position={[0, TOWER_HEIGHT + 0.3, 0]}>
        <boxGeometry args={[2.5, 0.4, 2.5]} />
        <meshStandardMaterial color="#DD2222" />
      </mesh>

      {/* Warning lights at top */}
      <mesh position={[0, TOWER_HEIGHT + 0.8, 0]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial
          color="#FF4444"
          emissive="#FF4444"
          emissiveIntensity={0.5}
        />
      </mesh>

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
