'use client'

import type { ThreeEvent } from '@react-three/fiber'
import { useWaterparkStore } from '@/stores/waterparkStore'
import { PIECES, CELL_SIZE, pieceLocalCenter, pieceWorldCenter, type PieceType } from '@/lib/waterparkPieces'
import { WaterSlide } from '../rides/WaterSlide'
import { Pool } from './pieces/Pool'
import { WavePool } from './pieces/WavePool'
import { LazyRiver } from './pieces/LazyRiver'
import { DropSlide } from './pieces/DropSlide'
import { BurgerShop } from './pieces/BurgerShop'
import { Restrooms } from './pieces/Restrooms'
import { Volcano } from './pieces/Volcano'

function effectiveFootprint(type: PieceType, rot: number): [number, number] {
  const [w, d] = PIECES[type].footprint
  return rot % 2 === 0 ? [w, d] : [d, w]
}

function PieceVisual({
  type,
  worldOffset,
  rideId,
}: {
  type: PieceType
  worldOffset: [number, number, number]
  rideId: string
}) {
  switch (type) {
    case 'pool':
      return <Pool />
    case 'wave_pool':
      return <WavePool />
    case 'burger_shop':
      return <BurgerShop />
    case 'restrooms':
      return <Restrooms />
    case 'volcano':
      return <Volcano />
    case 'spiral_slide':
      return <WaterSlide worldOffset={worldOffset} rideId={rideId} />
    case 'drop_slide':
      return <DropSlide worldOffset={worldOffset} rideId={rideId} />
    case 'lazy_river':
      return <LazyRiver worldOffset={worldOffset} rideId={rideId} />
    default:
      return null
  }
}

export function PlacedPieces() {
  const placed = useWaterparkStore((s) => s.placed)
  const mode = useWaterparkStore((s) => s.mode)
  const removePiece = useWaterparkStore((s) => s.removePiece)

  return (
    <>
      {placed.map((p) => {
        const fp = effectiveFootprint(p.type, p.rot)
        const local = pieceLocalCenter(p.gx, p.gz, fp)
        const world = pieceWorldCenter(p.gx, p.gz, fp)

        return (
          <group key={p.id} position={local}>
            <group rotation={[0, (p.rot * Math.PI) / 2, 0]}>
              <PieceVisual type={p.type} worldOffset={world} rideId={p.id} />
            </group>

            {/* Build-mode click target to sell the piece */}
            {mode === 'build' && (
              <mesh
                position={[0, 2, 0]}
                onClick={(e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation()
                  removePiece(p.id)
                }}
              >
                <boxGeometry args={[fp[0] * CELL_SIZE, 4, fp[1] * CELL_SIZE]} />
                <meshBasicMaterial color="#ff3344" transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
          </group>
        )
      })}
    </>
  )
}
