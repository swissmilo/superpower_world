'use client'

import { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'
import { useGameStore } from '@/stores/gameStore'
import { ELEMENTS } from '@/lib/elements'

export type CaptureState = 'neutral' | 'capturing' | 'captured'

const ZONE_POSITION: [number, number, number] = [0, 0, 0]
const ZONE_RADIUS = 4
const CAPTURE_TIME = 5 // seconds to capture
const INCOME_INTERVAL = 1 // seconds between income ticks

interface CaptureZoneProps {
  onStateChange?: (state: CaptureState, progress: number) => void
}

export function CaptureZone({ onStateChange }: CaptureZoneProps) {
  const [captureState, setCaptureState] = useState<CaptureState>('neutral')
  const captureProgress = useRef(0)
  const incomeTimer = useRef(0)
  const ringRef = useRef<THREE.Mesh>(null)
  const cylinderRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)

  const updateState = useCallback(
    (newState: CaptureState, progress: number) => {
      setCaptureState(newState)
      onStateChange?.(newState, progress)
    },
    [onStateChange]
  )

  useFrame((_, delta) => {
    const phase = useGameStore.getState().phase
    if (phase !== 'playing') return

    const playerPos = playerRefs.position
    const distToZone = Math.sqrt(
      (playerPos.x - ZONE_POSITION[0]) ** 2 +
      (playerPos.z - ZONE_POSITION[2]) ** 2
    )

    const isPlayerInZone = distToZone <= ZONE_RADIUS

    // Rotate ring
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.8
    }

    // Handle capture logic
    if (captureState === 'neutral' || captureState === 'capturing') {
      if (isPlayerInZone) {
        captureProgress.current = Math.min(CAPTURE_TIME, captureProgress.current + delta)
        const progress = captureProgress.current / CAPTURE_TIME

        if (captureProgress.current >= CAPTURE_TIME) {
          updateState('captured', 1)
        } else {
          updateState('capturing', progress)
        }
      } else {
        // Reset progress when player leaves
        if (captureProgress.current > 0) {
          captureProgress.current = 0
          updateState('neutral', 0)
        }
      }
    }

    if (captureState === 'captured') {
      if (isPlayerInZone) {
        // Income tick
        incomeTimer.current += delta
        if (incomeTimer.current >= INCOME_INTERVAL) {
          incomeTimer.current -= INCOME_INTERVAL
          useGameStore.getState().addCurrency(1)
        }
      } else {
        // Zone reverts when player leaves
        captureProgress.current = 0
        incomeTimer.current = 0
        updateState('neutral', 0)
      }
    }

    // Update visual color
    if (materialRef.current) {
      const playerElement = useGameStore.getState().playerElement
      let color: string
      let emissiveIntensity: number

      switch (captureState) {
        case 'neutral':
          color = '#888888'
          emissiveIntensity = 0.2
          break
        case 'capturing': {
          const pulse = Math.sin(performance.now() * 0.008) * 0.3 + 0.7
          color = '#FFD700'
          emissiveIntensity = 0.5 * pulse
          break
        }
        case 'captured':
          color = playerElement ? ELEMENTS[playerElement].color : '#44FF44'
          emissiveIntensity = 0.6
          break
      }

      materialRef.current.color.set(color)
      materialRef.current.emissive.set(color)
      materialRef.current.emissiveIntensity = emissiveIntensity
    }
  })

  return (
    <group position={ZONE_POSITION}>
      {/* Translucent cylinder base */}
      <mesh ref={cylinderRef} position={[0, 0.15, 0]}>
        <cylinderGeometry args={[ZONE_RADIUS, ZONE_RADIUS, 0.3, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#888888"
          emissive="#888888"
          emissiveIntensity={0.2}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rotating ring above zone */}
      <mesh ref={ringRef} position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ZONE_RADIUS * 0.7, 0.08, 8, 32]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Center pillar marker */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
        <meshStandardMaterial
          color="#CCCCCC"
          emissive="#FFFFFF"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  )
}
