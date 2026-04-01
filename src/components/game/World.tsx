'use client'

import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useMemo } from 'react'

// Helper to check if a point is inside the amusement park zone
function inParkZone(x: number, z: number): boolean {
  const dx = x - 200
  const dz = z - 200
  return Math.sqrt(dx * dx + dz * dz) < 45
}

function Tree({ position }: { position: [number, number, number] }) {
  const scale = 0.8 + Math.random() * 0.6
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider args={[0.15 * scale, scale * 0.8, 0.15 * scale]} position={[0, scale * 0.8, 0]} />
      {/* Trunk */}
      <mesh position={[0, scale * 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.12 * scale, 0.18 * scale, scale * 1.6, 8]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      {/* Foliage - bottom */}
      <mesh position={[0, scale * 1.8, 0]} castShadow>
        <coneGeometry args={[scale * 0.9, scale * 1.2, 8]} />
        <meshStandardMaterial color="#2D8B2D" />
      </mesh>
      {/* Foliage - top */}
      <mesh position={[0, scale * 2.5, 0]} castShadow>
        <coneGeometry args={[scale * 0.6, scale * 1.0, 8]} />
        <meshStandardMaterial color="#3CA63C" />
      </mesh>
    </RigidBody>
  )
}

function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <RigidBody type="fixed" position={position} colliders="hull">
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[0.5 * scale, 0]} />
        <meshStandardMaterial color="#888888" flatShading />
      </mesh>
    </RigidBody>
  )
}

function Flower({ position }: { position: [number, number, number] }) {
  const color = ['#FF69B4', '#FFD700', '#FF6347', '#9370DB', '#FF4500'][
    Math.floor(Math.random() * 5)
  ]
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 4]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

export function World() {
  const trees = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 300; i++) {
      const x = (Math.random() - 0.5) * 900
      const z = (Math.random() - 0.5) * 900
      // Keep trees away from spawn area and amusement park
      if ((Math.abs(x) > 15 || Math.abs(z) > 15) && !inParkZone(x, z)) {
        positions.push([x, 0, z])
      }
    }
    return positions
  }, [])

  const rocks = useMemo(() => {
    const positions: { pos: [number, number, number]; scale: number }[] = []
    for (let i = 0; i < 150; i++) {
      const x = (Math.random() - 0.5) * 800
      const z = (Math.random() - 0.5) * 800
      if ((Math.abs(x) > 10 || Math.abs(z) > 10) && !inParkZone(x, z)) {
        positions.push({ pos: [x, 0.3, z], scale: 0.5 + Math.random() * 1.5 })
      }
    }
    return positions
  }, [])

  const flowers = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 400; i++) {
      const x = (Math.random() - 0.5) * 800
      const z = (Math.random() - 0.5) * 800
      if (!inParkZone(x, z)) {
        positions.push([x, 0, z])
      }
    }
    return positions
  }, [])

  return (
    <>
      {/* Ground */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#4CAF50" />
        </mesh>
      </RigidBody>

      {/* Lake */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-200, 0.05, -200]}>
        <circleGeometry args={[40, 48]} />
        <meshStandardMaterial
          color="#1E90FF"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Second pond */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[150, 0.05, -250]}>
        <circleGeometry args={[20, 32]} />
        <meshStandardMaterial
          color="#1E90FF"
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* River connecting lake to second pond */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, 0.04, -225]}>
        <planeGeometry args={[8, 200]} />
        <meshStandardMaterial
          color="#1E90FF"
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Central hill (King of the Hill zone) */}
      <RigidBody type="fixed" colliders="hull">
        <mesh position={[0, 0.6, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[8, 10, 1.2, 16]} />
          <meshStandardMaterial color="#5D9B3A" />
        </mesh>
      </RigidBody>

      {/* Paths radiating from center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 30]}>
        <planeGeometry args={[4, 50]} />
        <meshStandardMaterial color="#C4A76C" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -30]}>
        <planeGeometry args={[4, 50]} />
        <meshStandardMaterial color="#C4A76C" />
      </mesh>
      {/* Path toward amusement park */}
      <mesh rotation={[-Math.PI / 2, Math.PI / 4, 0]} position={[100, 0.01, 100]}>
        <planeGeometry args={[4, 200]} />
        <meshStandardMaterial color="#C4A76C" />
      </mesh>

      {/* Trees */}
      {trees.map((pos, i) => (
        <Tree key={`tree-${i}`} position={pos} />
      ))}

      {/* Rocks */}
      {rocks.map((rock, i) => (
        <Rock key={`rock-${i}`} position={rock.pos} scale={rock.scale} />
      ))}

      {/* Flowers */}
      {flowers.map((pos, i) => (
        <Flower key={`flower-${i}`} position={pos} />
      ))}

      {/* World boundary walls (invisible) */}
      <RigidBody type="fixed" position={[0, 5, -500]} colliders="cuboid">
        <mesh visible={false}>
          <boxGeometry args={[1000, 10, 1]} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 5, 500]} colliders="cuboid">
        <mesh visible={false}>
          <boxGeometry args={[1000, 10, 1]} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-500, 5, 0]} colliders="cuboid">
        <mesh visible={false}>
          <boxGeometry args={[1, 10, 1000]} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[500, 5, 0]} colliders="cuboid">
        <mesh visible={false}>
          <boxGeometry args={[1, 10, 1000]} />
        </mesh>
      </RigidBody>
    </>
  )
}
