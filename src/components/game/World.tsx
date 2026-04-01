'use client'

import { RigidBody } from '@react-three/rapier'
import { useMemo } from 'react'

function Tree({ position }: { position: [number, number, number] }) {
  const scale = 0.8 + Math.random() * 0.6
  return (
    <group position={position}>
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
    </group>
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
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 90
      const z = (Math.random() - 0.5) * 90
      // Keep trees away from spawn area
      if (Math.abs(x) > 8 || Math.abs(z) > 8) {
        positions.push([x, 0, z])
      }
    }
    return positions
  }, [])

  const rocks = useMemo(() => {
    const positions: { pos: [number, number, number]; scale: number }[] = []
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 80
      const z = (Math.random() - 0.5) * 80
      if (Math.abs(x) > 6 || Math.abs(z) > 6) {
        positions.push({ pos: [x, 0.3, z], scale: 0.5 + Math.random() * 1.5 })
      }
    }
    return positions
  }, [])

  const flowers = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 80
      const z = (Math.random() - 0.5) * 80
      positions.push([x, 0, z])
    }
    return positions
  }, [])

  return (
    <>
      {/* Ground */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#4CAF50" />
        </mesh>
      </RigidBody>

      {/* Water pond */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, 0.05, -20]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial
          color="#1E90FF"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Central hill (future King of the Hill zone) */}
      <RigidBody type="fixed" colliders="hull">
        <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[5, 6, 1, 16]} />
          <meshStandardMaterial color="#5D9B3A" />
        </mesh>
      </RigidBody>

      {/* Decorative path from spawn to center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 5]}>
        <planeGeometry args={[3, 10]} />
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
      <RigidBody type="fixed" position={[0, 5, -50]} colliders="cuboid">
        <mesh visible={false}>
          <boxGeometry args={[100, 10, 1]} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 5, 50]} colliders="cuboid">
        <mesh visible={false}>
          <boxGeometry args={[100, 10, 1]} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-50, 5, 0]} colliders="cuboid">
        <mesh visible={false}>
          <boxGeometry args={[1, 10, 100]} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[50, 5, 0]} colliders="cuboid">
        <mesh visible={false}>
          <boxGeometry args={[1, 10, 100]} />
        </mesh>
      </RigidBody>
    </>
  )
}
