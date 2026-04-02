'use client'

import { useMemo } from 'react'

function Chair({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
        <meshStandardMaterial color="#CC3333" />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.7, -0.175]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.05]} />
        <meshStandardMaterial color="#CC3333" />
      </mesh>
      {/* 4 legs */}
      <mesh position={[-0.15, 0.225, -0.15]}>
        <cylinderGeometry args={[0.03, 0.03, 0.45, 6]} />
        <meshStandardMaterial color="#CC3333" />
      </mesh>
      <mesh position={[0.15, 0.225, -0.15]}>
        <cylinderGeometry args={[0.03, 0.03, 0.45, 6]} />
        <meshStandardMaterial color="#CC3333" />
      </mesh>
      <mesh position={[-0.15, 0.225, 0.15]}>
        <cylinderGeometry args={[0.03, 0.03, 0.45, 6]} />
        <meshStandardMaterial color="#CC3333" />
      </mesh>
      <mesh position={[0.15, 0.225, 0.15]}>
        <cylinderGeometry args={[0.03, 0.03, 0.45, 6]} />
        <meshStandardMaterial color="#CC3333" />
      </mesh>
    </group>
  )
}

function PartyHat({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <coneGeometry args={[0.06, 0.15, 8]} />
      <meshStandardMaterial color={['#FF69B4', '#00BFFF', '#FFD700', '#32CD32'][Math.floor(Math.random() * 4)]} />
    </mesh>
  )
}

function Table({ position, hasPartyHats }: { position: [number, number, number]; hasPartyHats: boolean }) {
  return (
    <group position={position}>
      {/* Table top */}
      <mesh position={[0, 0.825, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.05, 1.2]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      {/* Table leg */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      {/* 4 chairs around the table */}
      <Chair position={[0, 0, 0.8]} rotation={[0, 0, 0]} />
      <Chair position={[0, 0, -0.8]} rotation={[0, Math.PI, 0]} />
      <Chair position={[0.8, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <Chair position={[-0.8, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      {/* Party hats on some tables */}
      {hasPartyHats && (
        <>
          <PartyHat position={[-0.3, 0.925, 0.2]} />
          <PartyHat position={[0.25, 0.925, -0.15]} />
        </>
      )}
    </group>
  )
}

export function EatingArea() {
  const tablePositions = useMemo<{ pos: [number, number, number]; hats: boolean }[]>(() => [
    { pos: [-2.5, 0, -1.5], hats: true },
    { pos: [0, 0, -1.5], hats: false },
    { pos: [2.5, 0, -1.5], hats: true },
    { pos: [-2.5, 0, 1.5], hats: false },
    { pos: [0, 0, 1.5], hats: true },
    { pos: [2.5, 0, 1.5], hats: false },
  ], [])

  return (
    <group>
      {/* Warm tile floor */}
      <mesh position={[0, 0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#D4A847" />
      </mesh>

      {/* Tables */}
      {tablePositions.map((table, i) => (
        <Table key={`table-${i}`} position={table.pos} hasPartyHats={table.hats} />
      ))}

      {/* Birthday banner hanging from ceiling */}
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[4, 0.5]} />
        <meshStandardMaterial color="#FF69B4" side={2} />
      </mesh>
      {/* Banner string left */}
      <mesh position={[-2, 3.85, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.7, 4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Banner string right */}
      <mesh position={[2, 3.85, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.7, 4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}
