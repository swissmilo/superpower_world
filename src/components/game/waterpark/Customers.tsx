'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWaterparkStore } from '@/stores/waterparkStore'
import { HALF_EXTENT } from '@/lib/waterparkPieces'

const SHIRT_COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C']
const ROAM = HALF_EXTENT - 4

interface Customer {
  pos: THREE.Vector3
  target: THREE.Vector3
  speed: number
  color: string
}

function randomPoint(): THREE.Vector3 {
  return new THREE.Vector3((Math.random() * 2 - 1) * ROAM, 0, (Math.random() * 2 - 1) * ROAM)
}

export function Customers() {
  const placedCount = useWaterparkStore((s) => s.placed.length)
  const count = Math.min(2 + placedCount * 2, 16)

  const customers = useMemo<Customer[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const pos = randomPoint()
      return {
        pos,
        target: randomPoint(),
        speed: 1.5 + Math.random() * 1.5,
        color: SHIRT_COLORS[i % SHIRT_COLORS.length],
      }
    })
  }, [count])

  const groupRefs = useRef<(THREE.Group | null)[]>([])

  useFrame((_, delta) => {
    customers.forEach((c, i) => {
      const dir = c.target.clone().sub(c.pos)
      const dist = dir.length()
      if (dist < 0.5) {
        c.target.copy(randomPoint())
      } else {
        dir.normalize()
        c.pos.addScaledVector(dir, c.speed * delta)
      }
      const g = groupRefs.current[i]
      if (g) {
        g.position.set(c.pos.x, 0, c.pos.z)
        g.rotation.y = Math.atan2(dir.x, dir.z)
        // gentle bob
        g.position.y = Math.abs(Math.sin(performance.now() * 0.005 + i)) * 0.1
      }
    })
  })

  return (
    <>
      {customers.map((c, i) => (
        <group key={i} ref={(el) => { groupRefs.current[i] = el }}>
          {/* body */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <capsuleGeometry args={[0.22, 0.5, 4, 8]} />
            <meshStandardMaterial color={c.color} />
          </mesh>
          {/* head */}
          <mesh position={[0, 1.15, 0]} castShadow>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshStandardMaterial color="#F0C8A0" />
          </mesh>
        </group>
      ))}
    </>
  )
}
