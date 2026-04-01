'use client'

import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Suspense } from 'react'
import { useKeyboardMap } from '@/hooks/useKeyboard'
import { usePointerLock } from '@/hooks/usePointerLock'
import { useGameStore } from '@/stores/gameStore'
import { Scene } from './Scene'
import { ElementSelector } from '@/components/ui/ElementSelector'
import { HUD } from '@/components/ui/HUD'

function GameCanvas() {
  const { requestLock } = usePointerLock()
  const phase = useGameStore((s) => s.phase)

  return (
    <div
      style={{ width: '100vw', height: '100vh' }}
      onClick={phase === 'playing' ? requestLock : undefined}
    >
      <Canvas
        shadows
        camera={{ fov: 60, near: 0.1, far: 200 }}
      >
        <Suspense fallback={null}>
          <Physics gravity={[0, -20, 0]} colliders={false}>
            <Scene />
          </Physics>
        </Suspense>
      </Canvas>

      {/* UI Overlays */}
      {phase === 'menu' && <ElementSelector />}
      {phase === 'playing' && <HUD />}
    </div>
  )
}

export default function Game() {
  const keyboardMap = useKeyboardMap()

  return (
    <KeyboardControls map={keyboardMap}>
      <GameCanvas />
    </KeyboardControls>
  )
}
