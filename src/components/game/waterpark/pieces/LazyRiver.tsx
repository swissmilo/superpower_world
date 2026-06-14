'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'

const RADIUS = 4.5
const RIDE_DURATION = 12 // slow lazy loop
const MOUNT_RANGE = 5

function createRiverCurve(): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = []
  const steps = 24
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2
    // Oval channel
    points.push(new THREE.Vector3(Math.cos(a) * RADIUS, 0.6, Math.sin(a) * (RADIUS * 0.8)))
  }
  return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5)
}

export function LazyRiver({
  worldOffset = [0, 0, 0],
  rideId = 'lazy_river',
}: {
  worldOffset?: [number, number, number]
  rideId?: string
}) {
  const tRef = useRef(0)
  const riding = useRef(false)
  const curve = useMemo(() => createRiverCurve(), [])
  const channelGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, 120, 1.1, 12, true),
    [curve]
  )

  useFrame((_, delta) => {
    const mountPoint = new THREE.Vector3(...worldOffset)
    const dist = playerRefs.position.distanceTo(mountPoint)

    if (dist < MOUNT_RANGE && !playerRefs.isOnRide) {
      playerRefs.nearRide = rideId
      playerRefs.mountRide = () => {
        playerRefs.isOnRide = true
        playerRefs.currentRide = rideId
        tRef.current = 0
        riding.current = true
      }
      playerRefs.dismountRide = () => {
        playerRefs.isOnRide = false
        playerRefs.currentRide = null
        playerRefs.nearRide = null
        riding.current = false
      }
    } else if (playerRefs.nearRide === rideId && !playerRefs.isOnRide) {
      playerRefs.nearRide = null
      playerRefs.mountRide = null
    }

    if (playerRefs.isOnRide && playerRefs.currentRide === rideId && riding.current) {
      tRef.current += delta / RIDE_DURATION
      if (tRef.current >= 1) {
        riding.current = false
        playerRefs.isOnRide = false
        playerRefs.currentRide = null
        playerRefs.nearRide = null
        playerRefs.mountRide = null
        playerRefs.dismountRide = null
        return
      }
      const t = tRef.current % 1
      const point = curve.getPointAt(t)
      playerRefs.ridePosition.set(
        worldOffset[0] + point.x,
        worldOffset[1] + point.y + 0.5,
        worldOffset[2] + point.z
      )
      const lookPoint = curve.getPointAt((t + 0.03) % 1)
      playerRefs.rideLookAt.set(
        worldOffset[0] + lookPoint.x,
        worldOffset[1] + lookPoint.y + 1,
        worldOffset[2] + lookPoint.z
      )
    }
  })

  return (
    <group>
      {/* Channel water */}
      <mesh geometry={channelGeometry}>
        <meshStandardMaterial color="#33AADD" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Center island */}
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <cylinderGeometry args={[RADIUS - 1.6, RADIUS - 1.4, 0.5, 24]} />
        <meshStandardMaterial color="#6FBF6F" />
      </mesh>
      {/* Palm trunk on island */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 2.4, 8]} />
        <meshStandardMaterial color="#8B5A2B" />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color="#3FA53F" />
      </mesh>

      {playerRefs.nearRide === rideId && !playerRefs.isOnRide && (
        <Billboard position={[0, 3.5, 0]}>
          <Text fontSize={0.5} color="white" anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#000000">
            Press Space to Float
          </Text>
        </Billboard>
      )}
    </group>
  )
}
