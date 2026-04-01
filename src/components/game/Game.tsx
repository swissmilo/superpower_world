'use client'

import { useEffect } from 'react'
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
import { UpgradeShop } from '@/components/ui/UpgradeShop'
import { CurrencyPopup } from '@/components/ui/CurrencyPopup'

function GameCanvas() {
  const { requestLock } = usePointerLock()
  const phase = useGameStore((s) => s.phase)
  const showShop = useGameStore((s) => s.showShop)
  const toggleShop = useGameStore((s) => s.toggleShop)

  // Tab key to toggle shop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && phase === 'playing') {
        e.preventDefault()
        toggleShop()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, toggleShop])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      useGameStore.getState().saveGame()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{ width: '100vw', height: '100vh' }}
      onClick={phase === 'playing' && !showShop ? requestLock : undefined}
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
      {phase === 'playing' && showShop && <UpgradeShop />}
      <CurrencyPopup />
    </div>
  )
}

export default function Game() {
  const keyboardMap = useKeyboardMap()

  // Load saved game on mount
  useEffect(() => {
    useGameStore.getState().loadGame()
  }, [])

  return (
    <KeyboardControls map={keyboardMap}>
      <GameCanvas />
    </KeyboardControls>
  )
}
