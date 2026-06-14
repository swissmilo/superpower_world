'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'
import { PIECES, type PieceType } from '@/lib/waterparkPieces'

const MOUNT_RANGE = 4.5

type ShapeFn = (t: number, H: number) => [number, number, number]

interface SlideDef {
  height: number
  duration: number
  tube: number
  shape: ShapeFn
}

// Each shape maps progress t in [0,1] to a local (x, y, z) point. y descends
// from the tower height to the splash pool; x/z give each slide its character.
const SLIDE_DEFS: Partial<Record<PieceType, SlideDef>> = {
  speed_slide: {
    height: 16,
    duration: 2.2,
    tube: 0.7,
    shape: (t, H) => [0, Math.max(H * (1 - t) ** 1.6, 0.5), -1.5 + t * 9],
  },
  funnel_slide: {
    height: 15,
    duration: 5,
    tube: 0.8,
    shape: (t, H) => {
      const a = t * Math.PI * 6
      const r = (1 - t) * 3.2 + 0.3
      return [Math.cos(a) * r, Math.max(H * (1 - t), 0.5), Math.sin(a) * r]
    },
  },
  halfpipe_slide: {
    height: 14,
    duration: 4.5,
    tube: 0.8,
    shape: (t, H) => [Math.sin(t * Math.PI * 4) * 3, Math.max(H * (1 - t), 0.5), -1 + t * 8],
  },
  twister_slide: {
    height: 16,
    duration: 5,
    tube: 0.7,
    shape: (t, H) => {
      const a = t * Math.PI * 8
      return [Math.cos(a) * 2.6, Math.max(H * (1 - t), 0.5), Math.sin(a) * 1.6 + t * 1.5]
    },
  },
  rainbow_slide: {
    height: 13,
    duration: 4,
    tube: 0.75,
    shape: (t, H) => [
      Math.sin(t * Math.PI * 2) * 1.8,
      Math.max(H * (1 - t) - Math.sin(t * Math.PI) * 1.5, 0.5),
      -1 + t * 9,
    ],
  },
  boomerang_slide: {
    height: 17,
    duration: 4.5,
    tube: 0.8,
    shape: (t, H) => [
      Math.sin(t * Math.PI) * 0.5,
      Math.max(H * (1 - t) + Math.sin(t * Math.PI * 2) * 2, 0.5),
      Math.sin(t * Math.PI) * 7,
    ],
  },
  tornado_slide: {
    height: 18,
    duration: 5.5,
    tube: 0.9,
    shape: (t, H) => {
      const a = t * Math.PI * 5
      const r = (1 - t) * 4 + 0.5
      return [Math.cos(a) * r, Math.max(H * (1 - t) ** 1.4, 0.5), Math.sin(a) * r]
    },
  },
  cannonball_slide: {
    height: 18,
    duration: 2.6,
    tube: 0.7,
    shape: (t, H) => [0, Math.max(H * (1 - t * t), 0.5), t * 6],
  },
  python_slide: {
    height: 15,
    duration: 4.5,
    tube: 0.8,
    shape: (t, H) => [Math.sin(t * Math.PI * 3) * 3.5, Math.max(H * (1 - t), 0.5), -1 + t * 8],
  },
  aqualoop_slide: {
    height: 19,
    duration: 3.4,
    tube: 0.7,
    shape: (t, H) => {
      // Steep drop, then a vertical loop near the bottom.
      if (t < 0.45) return [0, Math.max(H - (H - 4) * (t / 0.45) ** 1.7, 0.5), t * 3]
      const lt = (t - 0.45) / 0.55
      const a = lt * Math.PI * 2
      return [Math.sin(a) * 2.2, Math.max(4 - Math.cos(a) * 2.2 + 0.2, 0.5), 1.4 + lt * 3]
    },
  },
}

function buildCurve(def: SlideDef): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = []
  const steps = 48
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const [x, y, z] = def.shape(t, def.height)
    pts.push(new THREE.Vector3(x, y, z))
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
}

function Tower({ height }: { height: number }) {
  const cols: [number, number][] = [
    [-1.2, -1.2],
    [1.2, -1.2],
    [-1.2, 1.2],
    [1.2, 1.2],
  ]
  return (
    <group>
      {cols.map(([x, z], i) => (
        <mesh key={i} position={[x, height / 2, z]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, height, 8]} />
          <meshStandardMaterial color="#8a8f96" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, height, 0]} receiveShadow>
        <boxGeometry args={[3, 0.2, 3]} />
        <meshStandardMaterial color="#9aa0a6" />
      </mesh>
    </group>
  )
}

export function GenericSlide({
  kind,
  worldOffset = [0, 0, 0],
  rideId = 'slide',
}: {
  kind: PieceType
  worldOffset?: [number, number, number]
  rideId?: string
}) {
  const def = SLIDE_DEFS[kind]
  const color = PIECES[kind].color
  const slideTRef = useRef(0)
  const isSliding = useRef(false)

  const curve = useMemo(() => (def ? buildCurve(def) : null), [def])
  const tubeGeometry = useMemo(
    () => (curve && def ? new THREE.TubeGeometry(curve, 160, def.tube, 10, false) : null),
    [curve, def]
  )

  useFrame((_, delta) => {
    if (!curve || !def) return
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
      slideTRef.current += delta / def.duration
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

  if (!def || !tubeGeometry) return null

  return (
    <group>
      <Tower height={def.height} />
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Splash pool */}
      <mesh position={[0, 0.1, 7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
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
