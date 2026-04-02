'use client'

import { useMemo } from 'react'

function ShelvingUnit({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Left upright */}
      <mesh position={[-0.9, 1.0, 0]} castShadow>
        <boxGeometry args={[0.05, 2.0, 0.4]} />
        <meshStandardMaterial color="#666666" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Right upright */}
      <mesh position={[0.9, 1.0, 0]} castShadow>
        <boxGeometry args={[0.05, 2.0, 0.4]} />
        <meshStandardMaterial color="#666666" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Shelf level 1 */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.85, 0.04, 0.4]} />
        <meshStandardMaterial color="#777777" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Shelf level 2 */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[1.85, 0.04, 0.4]} />
        <meshStandardMaterial color="#777777" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Shelf level 3 */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[1.85, 0.04, 0.4]} />
        <meshStandardMaterial color="#777777" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function StorageRoom() {
  const cardboardBoxes = useMemo(() => [
    { pos: [0.5, 0.3, 0.5] as [number, number, number], size: [0.6, 0.6, 0.6] as [number, number, number], rot: [0, 0.1, 0] as [number, number, number] },
    { pos: [1.2, 0.25, 0.3] as [number, number, number], size: [0.5, 0.5, 0.5] as [number, number, number], rot: [0, -0.15, 0] as [number, number, number] },
    { pos: [0.8, 0.35, 1.2] as [number, number, number], size: [0.7, 0.7, 0.7] as [number, number, number], rot: [0, 0.3, 0] as [number, number, number] },
    { pos: [0.6, 0.85, 0.6] as [number, number, number], size: [0.5, 0.5, 0.5] as [number, number, number], rot: [0, 0.45, 0.05] as [number, number, number] },
    { pos: [1.5, 0.4, 1.0] as [number, number, number], size: [0.8, 0.8, 0.8] as [number, number, number], rot: [0, -0.2, 0] as [number, number, number] },
    { pos: [0.3, 0.3, 1.5] as [number, number, number], size: [0.6, 0.6, 0.55] as [number, number, number], rot: [0.03, 0.5, 0] as [number, number, number] },
  ], [])

  return (
    <group>
      {/* Shelving units */}
      <ShelvingUnit position={[-2.0, 0, -1.5]} />
      <ShelvingUnit position={[2.0, 0, -1.5]} />

      {/* Stacked cardboard boxes */}
      {cardboardBoxes.map((box, i) => (
        <mesh key={`crate-${i}`} position={box.pos} rotation={box.rot} castShadow>
          <boxGeometry args={box.size} />
          <meshStandardMaterial color="#B8860B" />
        </mesh>
      ))}

      {/* Old animatronic parts in corner */}
      {/* Detached arm */}
      <mesh position={[-2.0, 0.15, 1.8]} rotation={[0, 0.4, 0.2]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#777777" />
      </mesh>
      {/* Detached head */}
      <mesh position={[-1.5, 0.25, 2.0]} castShadow>
        <sphereGeometry args={[0.25, 10, 10]} />
        <meshStandardMaterial color="#777777" />
      </mesh>
      {/* Scattered small parts */}
      <mesh position={[-1.8, 0.1, 2.3]} rotation={[0.1, 0.6, 0.3]}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color="#777777" />
      </mesh>
      <mesh position={[-2.2, 0.08, 2.1]} rotation={[0, 0.9, 0.1]}>
        <boxGeometry args={[0.12, 0.08, 0.2]} />
        <meshStandardMaterial color="#777777" />
      </mesh>

      {/* Single bare bulb at ceiling */}
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color="#FFEE88"
          emissive="#FFDD44"
          emissiveIntensity={1.5}
        />
      </mesh>
      {/* Bulb cord */}
      <mesh position={[0, 3.3, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.5, 4]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  )
}
