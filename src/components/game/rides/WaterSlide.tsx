'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'

const RIDE_ID = 'water_slide'
const TOWER_HEIGHT = 20
const SLIDE_DURATION = 6 // seconds to slide from top to bottom
const MOUNT_RANGE = 4
const TUBE_RADIUS = 0.8
const POOL_RADIUS = 4

function createSlideCurve(): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = []
  const loops = 3
  const stepsPerLoop = 12
  const totalSteps = loops * stepsPerLoop

  // Start at top
  points.push(new THREE.Vector3(0, TOWER_HEIGHT, 0))

  // Spiral down
  for (let i = 1; i <= totalSteps; i++) {
    const t = i / totalSteps
    const angle = t * loops * Math.PI * 2
    const radius = 3 + t * 2 // spiral outward slightly as we descend
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = TOWER_HEIGHT * (1 - t)
    points.push(new THREE.Vector3(x, Math.max(y, 0.5), z))
  }

  // End at splash pool
  points.push(new THREE.Vector3(5, 0.5, 5))

  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
}

function TowerStructure() {
  const beams = useMemo(() => {
    const result: { position: [number, number, number]; height: number; angle: number }[] = []
    // 4 main support columns
    const columnPositions: [number, number][] = [
      [1.5, 1.5],
      [-1.5, 1.5],
      [-1.5, -1.5],
      [1.5, -1.5],
    ]
    for (const [x, z] of columnPositions) {
      result.push({
        position: [x, TOWER_HEIGHT / 2, z],
        height: TOWER_HEIGHT,
        angle: 0,
      })
    }
    return result
  }, [])

  const crossBeams = useMemo(() => {
    const result: { position: [number, number, number]; rotation: [number, number, number]; length: number }[] = []
    // Horizontal cross beams every 4 units
    for (let y = 4; y <= TOWER_HEIGHT; y += 4) {
      // X-direction beams
      result.push({ position: [0, y, 1.5], rotation: [0, 0, 0], length: 3 })
      result.push({ position: [0, y, -1.5], rotation: [0, 0, 0], length: 3 })
      // Z-direction beams
      result.push({ position: [1.5, y, 0], rotation: [0, Math.PI / 2, 0], length: 3 })
      result.push({ position: [-1.5, y, 0], rotation: [0, Math.PI / 2, 0], length: 3 })
    }
    return result
  }, [])

  const ladderRungs = useMemo(() => {
    const result: { y: number }[] = []
    for (let y = 0.5; y <= TOWER_HEIGHT; y += 0.6) {
      result.push({ y })
    }
    return result
  }, [])

  return (
    <group>
      {/* Support columns */}
      {beams.map((beam, i) => (
        <mesh key={`col-${i}`} position={beam.position} castShadow>
          <cylinderGeometry args={[0.12, 0.12, beam.height, 8]} />
          <meshStandardMaterial color="#886644" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}

      {/* Cross beams */}
      {crossBeams.map((beam, i) => (
        <mesh key={`cross-${i}`} position={beam.position} rotation={beam.rotation}>
          <boxGeometry args={[beam.length, 0.1, 0.1]} />
          <meshStandardMaterial color="#886644" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}

      {/* Ladder */}
      {/* Ladder rails */}
      <mesh position={[1.5, TOWER_HEIGHT / 2, -1.8]} castShadow>
        <boxGeometry args={[0.06, TOWER_HEIGHT, 0.06]} />
        <meshStandardMaterial color="#AAAAAA" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[1.1, TOWER_HEIGHT / 2, -1.8]} castShadow>
        <boxGeometry args={[0.06, TOWER_HEIGHT, 0.06]} />
        <meshStandardMaterial color="#AAAAAA" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Ladder rungs */}
      {ladderRungs.map((rung, i) => (
        <mesh key={`rung-${i}`} position={[1.3, rung.y, -1.8]}>
          <boxGeometry args={[0.4, 0.05, 0.05]} />
          <meshStandardMaterial color="#AAAAAA" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Platform at top */}
      <mesh position={[0, TOWER_HEIGHT, 0]} receiveShadow>
        <boxGeometry args={[4, 0.2, 4]} />
        <meshStandardMaterial color="#886644" />
      </mesh>
    </group>
  )
}

export function WaterSlide({ worldOffset = [0, 0, 0] }: { worldOffset?: [number, number, number] }) {
  const slideTRef = useRef(0)
  const isSliding = useRef(false)
  const curve = useMemo(() => createSlideCurve(), [])

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 200, TUBE_RADIUS, 12, false)
  }, [curve])

  useFrame((_, delta) => {
    // Mount zone at base of tower
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
        slideTRef.current = 0
        isSliding.current = true
      }
      playerRefs.dismountRide = () => {
        playerRefs.isOnRide = false
        playerRefs.currentRide = null
        playerRefs.nearRide = null
        isSliding.current = false
      }
    } else if (playerRefs.nearRide === RIDE_ID && !playerRefs.isOnRide) {
      playerRefs.nearRide = null
      playerRefs.mountRide = null
    }

    // Slide animation when riding
    if (playerRefs.isOnRide && playerRefs.currentRide === RIDE_ID && isSliding.current) {
      slideTRef.current += (delta / SLIDE_DURATION)

      if (slideTRef.current >= 1) {
        // Auto-dismount at the bottom
        slideTRef.current = 1
        isSliding.current = false
        playerRefs.isOnRide = false
        playerRefs.currentRide = null
        playerRefs.nearRide = null
        playerRefs.mountRide = null
        playerRefs.dismountRide = null
        return
      }

      const t = Math.min(slideTRef.current, 1)
      const point = curve.getPointAt(t)
      const rideX = worldOffset[0] + point.x
      const rideY = worldOffset[1] + point.y
      const rideZ = worldOffset[2] + point.z
      playerRefs.ridePosition.set(rideX, rideY, rideZ)

      // Look slightly ahead on the curve
      const lookT = Math.min(t + 0.05, 1)
      const lookPoint = curve.getPointAt(lookT)
      playerRefs.rideLookAt.set(
        worldOffset[0] + lookPoint.x,
        worldOffset[1] + lookPoint.y + 1,
        worldOffset[2] + lookPoint.z
      )
    }
  })

  return (
    <group>
      {/* Tower structure */}
      <TowerStructure />

      {/* Slide tube */}
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial
          color="#4488FF"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Splash pool at bottom */}
      <mesh position={[5, 0.05, 5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[POOL_RADIUS, 32]} />
        <meshStandardMaterial
          color="#2266DD"
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Pool rim */}
      <mesh position={[5, 0.15, 5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[POOL_RADIUS, 0.15, 8, 32]} />
        <meshStandardMaterial color="#CCCCCC" />
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
