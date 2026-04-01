'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const TRACK_SPEED = 1 / 15 // full loop in ~15 seconds (t increments per second)
const RAIL_OFFSET = 0.2 // distance between the two rails
const TUBE_RADIUS = 0.15
const SUPPORT_SPACING = 5
const SUPPORT_RADIUS = 0.08

function createTrackCurve(): THREE.CatmullRomCurve3 {
  const points = [
    // Station / start area
    new THREE.Vector3(-20, 0.5, -12),
    new THREE.Vector3(-15, 0.5, -14),

    // Initial climb
    new THREE.Vector3(-10, 2, -14),
    new THREE.Vector3(-5, 5, -13),
    new THREE.Vector3(0, 9, -12),
    new THREE.Vector3(5, 13, -11),
    new THREE.Vector3(8, 15, -10),

    // Top of first hill and steep drop
    new THREE.Vector3(10, 15, -8),
    new THREE.Vector3(12, 12, -5),
    new THREE.Vector3(13, 6, -2),
    new THREE.Vector3(13, 1, 0),

    // Lead into the loop - approach
    new THREE.Vector3(12, 0.5, 2),
    new THREE.Vector3(10, 0.5, 4),

    // Vertical loop (circular path in the XZ->XY plane)
    new THREE.Vector3(8, 1, 6),
    new THREE.Vector3(6, 4, 7),
    new THREE.Vector3(5, 8, 7.5),
    new THREE.Vector3(5, 12, 7),
    new THREE.Vector3(6, 14, 6),
    new THREE.Vector3(8, 14, 5),
    new THREE.Vector3(10, 12, 5),
    new THREE.Vector3(10, 8, 5.5),
    new THREE.Vector3(9, 4, 6),
    new THREE.Vector3(8, 1, 7),

    // Exit loop, gentle turns
    new THREE.Vector3(6, 0.5, 9),
    new THREE.Vector3(2, 0.5, 11),
    new THREE.Vector3(-3, 0.5, 12),
    new THREE.Vector3(-8, 1, 11),
    new THREE.Vector3(-12, 2, 8),
    new THREE.Vector3(-15, 2, 4),
    new THREE.Vector3(-18, 1.5, 0),
    new THREE.Vector3(-20, 1, -4),
    new THREE.Vector3(-22, 0.5, -8),

    // Return to start
    new THREE.Vector3(-22, 0.5, -10),
    new THREE.Vector3(-21, 0.5, -12),
  ]

  return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5)
}

function TrackRails({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const { leftGeometry, rightGeometry } = useMemo(() => {
    const numPoints = 300
    const leftPoints: THREE.Vector3[] = []
    const rightPoints: THREE.Vector3[] = []

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints
      const point = curve.getPointAt(t)
      const tangent = curve.getTangentAt(t).normalize()

      // Compute a side vector (perpendicular to tangent in the XZ plane)
      const up = new THREE.Vector3(0, 1, 0)
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize()

      // If tangent is nearly vertical, use a different up vector
      if (side.lengthSq() < 0.01) {
        const altUp = new THREE.Vector3(1, 0, 0)
        side.crossVectors(tangent, altUp).normalize()
      }

      leftPoints.push(
        new THREE.Vector3(
          point.x + side.x * RAIL_OFFSET,
          point.y + side.y * RAIL_OFFSET,
          point.z + side.z * RAIL_OFFSET
        )
      )
      rightPoints.push(
        new THREE.Vector3(
          point.x - side.x * RAIL_OFFSET,
          point.y - side.y * RAIL_OFFSET,
          point.z - side.z * RAIL_OFFSET
        )
      )
    }

    const leftCurve = new THREE.CatmullRomCurve3(leftPoints, true)
    const rightCurve = new THREE.CatmullRomCurve3(rightPoints, true)

    return {
      leftGeometry: new THREE.TubeGeometry(leftCurve, 300, TUBE_RADIUS, 8, true),
      rightGeometry: new THREE.TubeGeometry(rightCurve, 300, TUBE_RADIUS, 8, true),
    }
  }, [curve])

  return (
    <>
      <mesh geometry={leftGeometry} castShadow>
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh geometry={rightGeometry} castShadow>
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
    </>
  )
}

function SupportPillars({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const pillars = useMemo(() => {
    const result: { position: [number, number, number]; height: number }[] = []
    const curveLength = curve.getLength()
    const numSupports = Math.floor(curveLength / SUPPORT_SPACING)

    for (let i = 0; i < numSupports; i++) {
      const t = i / numSupports
      const point = curve.getPointAt(t)

      // Only place pillars where track is above ground level
      if (point.y > 1) {
        const height = point.y
        result.push({
          position: [point.x, height / 2, point.z],
          height,
        })
      }
    }

    return result
  }, [curve])

  return (
    <>
      {pillars.map((pillar, i) => (
        <mesh key={`pillar-${i}`} position={pillar.position} castShadow>
          <cylinderGeometry args={[SUPPORT_RADIUS, SUPPORT_RADIUS, pillar.height, 8]} />
          <meshStandardMaterial color="#666666" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
    </>
  )
}

function Cart({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const cartRef = useRef<THREE.Group>(null)
  const tRef = useRef(0)
  const lookTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    if (!cartRef.current) return

    tRef.current = (tRef.current + TRACK_SPEED * delta) % 1

    const point = curve.getPointAt(tRef.current)
    const tangent = curve.getTangentAt(tRef.current)

    cartRef.current.position.copy(point)

    // Orient cart along the track using tangent
    lookTarget.copy(point).add(tangent)
    cartRef.current.lookAt(lookTarget)
  })

  return (
    <group ref={cartRef}>
      {/* Cart body */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.6, 0.8]} />
        <meshStandardMaterial color="#DD2222" />
      </mesh>
      {/* Seats (two small boxes on top) */}
      <mesh position={[-0.3, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.6]} />
        <meshStandardMaterial color="#882222" />
      </mesh>
      <mesh position={[0.3, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.6]} />
        <meshStandardMaterial color="#882222" />
      </mesh>
      {/* Front lip */}
      <mesh position={[0.7, 0.15, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.8]} />
        <meshStandardMaterial color="#AA2222" />
      </mesh>
    </group>
  )
}

export function RollerCoaster() {
  const curve = useMemo(() => createTrackCurve(), [])

  return (
    <group>
      <TrackRails curve={curve} />
      <SupportPillars curve={curve} />
      <Cart curve={curve} />
    </group>
  )
}
