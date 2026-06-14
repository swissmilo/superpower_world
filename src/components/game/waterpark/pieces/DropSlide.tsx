'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'

const TOWER_HEIGHT = 16
const SLIDE_DURATION = 3
const MOUNT_RANGE = 4
const TUBE_RADIUS = 0.7

function createDropCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, TOWER_HEIGHT, -2),
      new THREE.Vector3(0, TOWER_HEIGHT - 1, -1.5),
      new THREE.Vector3(0, TOWER_HEIGHT * 0.55, -0.5),
      new THREE.Vector3(0, 2.5, 1),
      new THREE.Vector3(0, 0.8, 4),
      new THREE.Vector3(0, 0.5, 6.5),
    ],
    false,
    'catmullrom',
    0.5
  )
}

export function DropSlide({
  worldOffset = [0, 0, 0],
  rideId = 'drop_slide',
}: {
  worldOffset?: [number, number, number]
  rideId?: string
}) {
  const slideTRef = useRef(0)
  const isSliding = useRef(false)
  const curve = useMemo(() => createDropCurve(), [])
  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, 120, TUBE_RADIUS, 10, false),
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
        slideTRef.current = 0
        isSliding.current = true
      }
      playerRefs.dismountRide = () => {
        playerRefs.isOnRide = false
        playerRefs.currentRide = null
        playerRefs.nearRide = null
        isSliding.current = false
      }
    } else if (playerRefs.nearRide === rideId && !playerRefs.isOnRide) {
      playerRefs.nearRide = null
      playerRefs.mountRide = null
    }

    if (playerRefs.isOnRide && playerRefs.currentRide === rideId && isSliding.current) {
      slideTRef.current += delta / SLIDE_DURATION
      if (slideTRef.current >= 1) {
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
      playerRefs.ridePosition.set(
        worldOffset[0] + point.x,
        worldOffset[1] + point.y,
        worldOffset[2] + point.z
      )
      const lookPoint = curve.getPointAt(Math.min(t + 0.05, 1))
      playerRefs.rideLookAt.set(
        worldOffset[0] + lookPoint.x,
        worldOffset[1] + lookPoint.y + 1,
        worldOffset[2] + lookPoint.z
      )
    }
  })

  return (
    <group>
      {/* Tower columns */}
      {([[-1.3, -2.6], [1.3, -2.6], [-1.3, -0.6], [1.3, -0.6]] as [number, number][]).map(
        ([x, z], i) => (
          <mesh key={i} position={[x, TOWER_HEIGHT / 2, z]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, TOWER_HEIGHT, 8]} />
            <meshStandardMaterial color="#995544" />
          </mesh>
        )
      )}
      {/* Top platform */}
      <mesh position={[0, TOWER_HEIGHT, -1.8]} receiveShadow>
        <boxGeometry args={[3.5, 0.2, 3]} />
        <meshStandardMaterial color="#995544" />
      </mesh>
      {/* Slide tube */}
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial color="#FF5577" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Splash pool */}
      <mesh position={[0, 0.1, 6.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3, 24]} />
        <meshStandardMaterial color="#2266DD" transparent opacity={0.6} />
      </mesh>

      {playerRefs.nearRide === rideId && !playerRefs.isOnRide && (
        <Billboard position={[0, 3, 0]}>
          <Text fontSize={0.5} color="white" anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#000000">
            Press Space to Ride
          </Text>
        </Billboard>
      )}
    </group>
  )
}
