'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { ELEMENTS } from '@/lib/elements'
import { touchAbilities } from '@/hooks/useTouch'

const OUTER_RADIUS = 60
const INNER_RADIUS = 20
const ABILITY_SIZE = 56
const JUMP_SIZE = 50

export function TouchControls() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const playerElement = useGameStore((s) => s.playerElement)

  const joystickRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const joystickTouchId = useRef<number | null>(null)
  const joystickCenter = useRef({ x: 0, y: 0 })

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const handleJoystickTouchStart = useCallback((e: React.TouchEvent) => {
    if (joystickTouchId.current !== null) return
    const touch = e.changedTouches[0]
    if (!touch) return

    joystickTouchId.current = touch.identifier
    const rect = joystickRef.current?.getBoundingClientRect()
    if (rect) {
      joystickCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }
    }

    if (thumbRef.current) {
      thumbRef.current.style.transform = 'translate(0px, 0px)'
    }
  }, [])

  const handleJoystickTouchMove = useCallback((e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier !== joystickTouchId.current) continue

      const dx = touch.clientX - joystickCenter.current.x
      const dy = touch.clientY - joystickCenter.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxDist = OUTER_RADIUS - INNER_RADIUS

      let clampedX = dx
      let clampedY = dy
      if (dist > maxDist) {
        const scale = maxDist / dist
        clampedX = dx * scale
        clampedY = dy * scale
      }

      if (thumbRef.current) {
        thumbRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`
      }
    }
  }, [])

  const handleJoystickTouchEnd = useCallback((e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId.current) {
        joystickTouchId.current = null
        if (thumbRef.current) {
          thumbRef.current.style.transform = 'translate(0px, 0px)'
        }
      }
    }
  }, [])

  const handleAbilityPress = useCallback((index: number) => {
    if (index === 0) touchAbilities.ability1 = true
    else if (index === 1) touchAbilities.ability2 = true
    else if (index === 2) touchAbilities.ability3 = true
  }, [])

  if (!isTouchDevice) return null

  const element = playerElement ? ELEMENTS[playerElement] : null
  const abilityColors = element
    ? [element.color, element.secondaryColor, element.particleColor]
    : ['#888', '#888', '#888']

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Virtual Joystick - bottom left */}
      <div
        ref={joystickRef}
        className="absolute pointer-events-auto"
        style={{
          left: 40,
          bottom: 80,
          width: OUTER_RADIUS * 2,
          height: OUTER_RADIUS * 2,
        }}
        onTouchStart={handleJoystickTouchStart}
        onTouchMove={handleJoystickTouchMove}
        onTouchEnd={handleJoystickTouchEnd}
        onTouchCancel={handleJoystickTouchEnd}
      >
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          style={{ backgroundColor: 'rgba(128, 128, 128, 0.3)' }}
        />
        {/* Inner thumb */}
        <div
          ref={thumbRef}
          className="absolute rounded-full bg-white/80"
          style={{
            width: INNER_RADIUS * 2,
            height: INNER_RADIUS * 2,
            left: OUTER_RADIUS - INNER_RADIUS,
            top: OUTER_RADIUS - INNER_RADIUS,
          }}
        />
      </div>

      {/* Jump button - above joystick */}
      <div
        className="absolute pointer-events-auto flex items-center justify-center rounded-full border-2 border-white/40"
        style={{
          left: 40 + OUTER_RADIUS - JUMP_SIZE / 2,
          bottom: 80 + OUTER_RADIUS * 2 + 16,
          width: JUMP_SIZE,
          height: JUMP_SIZE,
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
        }}
        onTouchStart={(e) => {
          e.stopPropagation()
        }}
      >
        <span className="text-white text-xs font-bold select-none">JUMP</span>
      </div>

      {/* Ability buttons - bottom right */}
      <div className="absolute bottom-20 right-6 flex gap-3 pointer-events-auto">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            className="flex items-center justify-center rounded-full border-2 border-white/40 active:scale-90 transition-transform"
            style={{
              width: ABILITY_SIZE,
              height: ABILITY_SIZE,
              backgroundColor: abilityColors[i] + '88',
              borderColor: abilityColors[i],
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
              handleAbilityPress(i)
            }}
          >
            <span className="text-white text-sm font-bold select-none">
              {i + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
