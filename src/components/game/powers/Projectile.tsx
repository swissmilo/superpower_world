'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

interface ProjectileProps {
  position: [number, number, number]
  direction: [number, number, number]
  color: string
  secondaryColor: string
  speed?: number
  size?: number
  onExpire: () => void
}

const MAX_LIFETIME = 2.5
const DEFAULT_SPEED = 25

export function Projectile({
  position,
  direction,
  color,
  secondaryColor,
  speed = DEFAULT_SPEED,
  size = 0.3,
  onExpire,
}: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const lifetime = useRef(0)
  const dir = useRef(new THREE.Vector3(...direction).normalize())

  useFrame((_, delta) => {
    if (!meshRef.current) return

    lifetime.current += delta
    if (lifetime.current > MAX_LIFETIME) {
      onExpire()
      return
    }

    // Move forward
    meshRef.current.position.x += dir.current.x * speed * delta
    meshRef.current.position.y += dir.current.y * speed * delta - 0.5 * delta // slight arc
    meshRef.current.position.z += dir.current.z * speed * delta

    // Rotate for visual flair
    meshRef.current.rotation.x += delta * 5
    meshRef.current.rotation.z += delta * 3

    // Remove if hits ground
    if (meshRef.current.position.y < 0) {
      onExpire()
    }
  })

  return (
    <Trail
      width={size * 3}
      length={6}
      color={color}
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef} position={position} castShadow>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={secondaryColor}
          emissiveIntensity={2}
        />
      </mesh>
    </Trail>
  )
}
