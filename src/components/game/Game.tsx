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
import { MainMenu } from '@/components/ui/MainMenu'
import { HUD } from '@/components/ui/HUD'
import { UpgradeShop } from '@/components/ui/UpgradeShop'
import { CurrencyPopup } from '@/components/ui/CurrencyPopup'
import { DeathScreen } from '@/components/ui/DeathScreen'
import { BossHealthBar } from '@/components/ui/BossHealthBar'
import { CaptureZoneIndicator } from '@/components/ui/CaptureZoneIndicator'
import { TouchControls } from '@/components/ui/TouchControls'

function GameCanvas() {
  const { requestLock } = usePointerLock()
  const phase = useGameStore((s) => s.phase)
  const showShop = useGameStore((s) => s.showShop)
  const toggleShop = useGameStore((s) => s.toggleShop)
  const isBossActive = useGameStore((s) => s.isBossActive)
  const bossHealth = useGameStore((s) => s.bossHealth)
  const bossMaxHealth = useGameStore((s) => s.bossMaxHealth)
  const bossWarning = useGameStore((s) => s.bossWarning)
  const captureZoneState = useGameStore((s) => s.captureZoneState)
  const captureProgress = useGameStore((s) => s.captureProgress)

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
      {phase === 'menu' && <MainMenu />}
      {phase === 'playing' && <HUD />}
      {phase === 'playing' && showShop && <UpgradeShop />}
      {phase === 'playing' && isBossActive && (
        <BossHealthBar name="BOSS" health={bossHealth} maxHealth={bossMaxHealth} />
      )}
      {phase === 'playing' && bossWarning && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <p className="text-4xl font-extrabold text-red-500 animate-pulse">{bossWarning}</p>
        </div>
      )}
      {phase === 'playing' && captureZoneState !== 'neutral' && (
        <CaptureZoneIndicator state={captureZoneState} progress={captureProgress} />
      )}
      {phase === 'gameover' && <DeathScreen />}
      <CurrencyPopup />
      <TouchControls />
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
