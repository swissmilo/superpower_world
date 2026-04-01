import { useCallback, useEffect, useRef } from 'react'

export interface TouchInput {
  movement: { x: number; z: number }
  lookDelta: { x: number; y: number }
  jump: boolean
  abilities: [boolean, boolean, boolean]
}

/** Shared mutable ref for ability buttons set by TouchControls */
export const touchAbilities = {
  ability1: false,
  ability2: false,
  ability3: false,
}

interface JoystickTouch {
  id: number
  startX: number
  startY: number
}

interface LookTouch {
  id: number
  lastX: number
  lastY: number
}

const JOYSTICK_DEAD_ZONE = 8
const TAP_MAX_DURATION = 200 // ms
const TAP_MAX_DISTANCE = 15 // px

export function useTouch() {
  const joystickTouch = useRef<JoystickTouch | null>(null)
  const lookTouch = useRef<LookTouch | null>(null)

  const movement = useRef({ x: 0, z: 0 })
  const lookDelta = useRef({ x: 0, y: 0 })
  const jump = useRef(false)

  // For tap detection (jump)
  const tapStart = useRef<{ time: number; x: number; y: number } | null>(null)

  const isJoystickZone = useCallback((x: number, y: number) => {
    const w = window.innerWidth
    const h = window.innerHeight
    return x < w * 0.4 && y > h * 0.6
  }, [])

  const isRightSide = useCallback((x: number) => {
    return x > window.innerWidth * 0.5
  }, [])

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        const { clientX, clientY, identifier } = touch

        if (isJoystickZone(clientX, clientY) && !joystickTouch.current) {
          joystickTouch.current = { id: identifier, startX: clientX, startY: clientY }
          tapStart.current = { time: Date.now(), x: clientX, y: clientY }
          movement.current = { x: 0, z: 0 }
        } else if (isRightSide(clientX) && !lookTouch.current) {
          lookTouch.current = { id: identifier, lastX: clientX, lastY: clientY }
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        const { clientX, clientY, identifier } = touch

        if (joystickTouch.current && joystickTouch.current.id === identifier) {
          const dx = clientX - joystickTouch.current.startX
          const dy = clientY - joystickTouch.current.startY
          const dist = Math.sqrt(dx * dx + dy * dy)

          // Cancel tap if dragged too far
          if (tapStart.current && dist > TAP_MAX_DISTANCE) {
            tapStart.current = null
          }

          if (dist > JOYSTICK_DEAD_ZONE) {
            const maxRadius = 50
            const normDist = Math.min(dist, maxRadius) / maxRadius
            const angle = Math.atan2(dx, -dy) // -dy because screen Y is inverted
            movement.current = {
              x: Math.sin(angle) * normDist,
              z: Math.cos(angle) * normDist,
            }
          } else {
            movement.current = { x: 0, z: 0 }
          }
        }

        if (lookTouch.current && lookTouch.current.id === identifier) {
          const dx = clientX - lookTouch.current.lastX
          const dy = clientY - lookTouch.current.lastY
          lookDelta.current.x += dx
          lookDelta.current.y += dy
          lookTouch.current.lastX = clientX
          lookTouch.current.lastY = clientY
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        const { clientX, clientY, identifier } = touch

        if (joystickTouch.current && joystickTouch.current.id === identifier) {
          // Check for tap (jump)
          if (tapStart.current) {
            const elapsed = Date.now() - tapStart.current.time
            const dx = clientX - tapStart.current.x
            const dy = clientY - tapStart.current.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (elapsed < TAP_MAX_DURATION && dist < TAP_MAX_DISTANCE) {
              jump.current = true
            }
          }
          joystickTouch.current = null
          tapStart.current = null
          movement.current = { x: 0, z: 0 }
        }

        if (lookTouch.current && lookTouch.current.id === identifier) {
          lookTouch.current = null
        }
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    document.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [isJoystickZone, isRightSide])

  /** Consume accumulated look delta (resets after read) */
  const consumeLookDelta = useCallback(() => {
    const x = lookDelta.current.x
    const y = lookDelta.current.y
    lookDelta.current.x = 0
    lookDelta.current.y = 0
    return { x, y }
  }, [])

  /** Consume jump flag (resets after read) */
  const consumeJump = useCallback(() => {
    const j = jump.current
    jump.current = false
    return j
  }, [])

  /** Read current movement (does not reset, it's continuous) */
  const getMovement = useCallback(() => {
    return { ...movement.current }
  }, [])

  /** Read and reset ability flags from touchAbilities */
  const consumeAbilities = useCallback((): [boolean, boolean, boolean] => {
    const a1 = touchAbilities.ability1
    const a2 = touchAbilities.ability2
    const a3 = touchAbilities.ability3
    touchAbilities.ability1 = false
    touchAbilities.ability2 = false
    touchAbilities.ability3 = false
    return [a1, a2, a3]
  }, [])

  return { getMovement, consumeLookDelta, consumeJump, consumeAbilities }
}
