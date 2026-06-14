'use client'

import { useEffect } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import { useWaterparkStore } from '@/stores/waterparkStore'
import {
  PIECES,
  GRID,
  CELL_SIZE,
  HALF_EXTENT,
  PARK_WORLD_OFFSET,
  worldToCell,
} from '@/lib/waterparkPieces'
import { PlacedPieces } from './waterpark/PlacedPieces'
import { BuildGhost } from './waterpark/BuildGhost'
import { Customers } from './waterpark/Customers'
import { buildRefs } from './waterpark/buildRefs'

const SIZE = GRID * CELL_SIZE // 64

function Walls() {
  const t = 0.4
  const h = 1.2
  return (
    <group>
      {/* back + sides; front (south, -z) left open for the entrance gap */}
      <mesh position={[0, h / 2, HALF_EXTENT]} castShadow>
        <boxGeometry args={[SIZE, h, t]} />
        <meshStandardMaterial color="#E8E2D0" />
      </mesh>
      <mesh position={[-HALF_EXTENT, h / 2, 0]} castShadow>
        <boxGeometry args={[t, h, SIZE]} />
        <meshStandardMaterial color="#E8E2D0" />
      </mesh>
      <mesh position={[HALF_EXTENT, h / 2, 0]} castShadow>
        <boxGeometry args={[t, h, SIZE]} />
        <meshStandardMaterial color="#E8E2D0" />
      </mesh>
      {/* front wall segments flanking the entrance */}
      <mesh position={[-HALF_EXTENT / 2 - 2, h / 2, -HALF_EXTENT]} castShadow>
        <boxGeometry args={[SIZE / 2 - 4, h, t]} />
        <meshStandardMaterial color="#E8E2D0" />
      </mesh>
      <mesh position={[HALF_EXTENT / 2 + 2, h / 2, -HALF_EXTENT]} castShadow>
        <boxGeometry args={[SIZE / 2 - 4, h, t]} />
        <meshStandardMaterial color="#E8E2D0" />
      </mesh>
    </group>
  )
}

function EntryArch() {
  return (
    <group position={[0, 0, -HALF_EXTENT]}>
      <mesh position={[-4, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 5, 12]} />
        <meshStandardMaterial color="#1E88C8" />
      </mesh>
      <mesh position={[4, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 5, 12]} />
        <meshStandardMaterial color="#1E88C8" />
      </mesh>
      <mesh position={[0, 5.3, 0]} castShadow>
        <boxGeometry args={[9, 0.7, 0.6]} />
        <meshStandardMaterial color="#33AADD" />
      </mesh>
      <Billboard position={[0, 6.2, 0]}>
        <Text fontSize={0.9} color="#0A3A5A" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#ffffff">
          💦 SPLASH PARK 💦
        </Text>
      </Billboard>
    </group>
  )
}

function MoneySign() {
  // Visual indicator near the entrance; the live amount + collect action are in the HUD.
  return (
    <group position={[10, 0, -HALF_EXTENT + 4]}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 2, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[1.4, 1, 0.15]} />
        <meshStandardMaterial color="#2E7D32" />
      </mesh>
      <Billboard position={[0, 2.2, 0.12]}>
        <Text fontSize={0.7} color="#FFD54F" anchorX="center" anchorY="middle">
          $
        </Text>
      </Billboard>
    </group>
  )
}

export function Waterpark() {
  const mode = useWaterparkStore((s) => s.mode)

  // Per-frame park economy simulation.
  useFrame((_, delta) => {
    useWaterparkStore.getState().tick(delta)
  })

  // R rotates the piece being placed while in build mode.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && useWaterparkStore.getState().mode === 'build') {
        buildRefs.rot = (buildRefs.rot + 1) % 4
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    const store = useWaterparkStore.getState()
    const selected = store.selectedPiece
    if (!selected) {
      buildRefs.active = false
      return
    }
    const [cx, cz] = worldToCell(e.point.x, e.point.z)
    const [bw, bd] = PIECES[selected].footprint
    const [w, d] = buildRefs.rot % 2 === 0 ? [bw, bd] : [bd, bw]
    let gx = cx - Math.floor(w / 2)
    let gz = cz - Math.floor(d / 2)
    gx = Math.max(0, Math.min(GRID - w, gx))
    gz = Math.max(0, Math.min(GRID - d, gz))
    buildRefs.active = true
    buildRefs.ghostGx = gx
    buildRefs.ghostGz = gz
    const def = PIECES[selected]
    buildRefs.valid =
      store.canPlace(selected, gx, gz, buildRefs.rot) &&
      store.money >= def.cost &&
      (store.cards[selected] ?? 0) >= def.cardCost
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const store = useWaterparkStore.getState()
    const selected = store.selectedPiece
    if (!selected || !buildRefs.active) return
    store.placePiece(selected, buildRefs.ghostGx, buildRefs.ghostGz, buildRefs.rot)
  }

  return (
    <group>
      {/* Ground platform */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[SIZE, 0.1, SIZE]} />
        <meshStandardMaterial color="#CDE8F0" />
      </mesh>

      <Walls />
      <EntryArch />
      <MoneySign />

      <PlacedPieces />
      <Customers />

      {/* Build-mode interaction layer */}
      {mode === 'build' && (
        <>
          <gridHelper args={[SIZE, GRID, '#3388aa', '#88bbcc']} position={[0, 0.12, 0]} />
          <BuildGhost />
          <mesh
            position={[0, 0.1, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerMove={handleMove}
            onPointerOut={() => {
              buildRefs.active = false
            }}
            onClick={handleClick}
          >
            <planeGeometry args={[SIZE, SIZE]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </>
      )}
    </group>
  )
}

// Re-export for callers that want the world offset.
export { PARK_WORLD_OFFSET }
