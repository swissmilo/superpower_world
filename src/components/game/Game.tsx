'use client'

import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Suspense } from 'react'
import { useKeyboardMap } from '@/hooks/useKeyboard'
import { usePointerLock } from '@/hooks/usePointerLock'
import { Scene } from './Scene'

function GameCanvas() {
  const { requestLock } = usePointerLock()

  return (
    <div
      style={{ width: '100vw', height: '100vh' }}
      onClick={requestLock}
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
