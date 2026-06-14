'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWaterparkStore } from '@/stores/waterparkStore'
import { PIECES, CELL_SIZE, pieceLocalCenter } from '@/lib/waterparkPieces'
import { buildRefs } from './buildRefs'

export function BuildGhost() {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  const mode = useWaterparkStore((s) => s.mode)
  const selectedPiece = useWaterparkStore((s) => s.selectedPiece)

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    const show = mode === 'build' && !!selectedPiece && buildRefs.active
    g.visible = show
    if (!show || !selectedPiece) return

    const [bw, bd] = PIECES[selectedPiece].footprint
    const [w, d] = buildRefs.rot % 2 === 0 ? [bw, bd] : [bd, bw]
    const [x, , z] = pieceLocalCenter(buildRefs.ghostGx, buildRefs.ghostGz, [w, d])
    g.position.set(x, 0, z)
    g.scale.set(w * CELL_SIZE, 1, d * CELL_SIZE)
    if (matRef.current) {
      matRef.current.color.set(buildRefs.valid ? '#22dd55' : '#dd2233')
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshBasicMaterial ref={matRef} color="#22dd55" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  )
}
