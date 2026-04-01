import { useCallback, useEffect, useRef } from 'react'

interface PointerLockState {
  isLocked: boolean
  movementX: number
  movementY: number
}

export function usePointerLock() {
  const state = useRef<PointerLockState>({
    isLocked: false,
    movementX: 0,
    movementY: 0,
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        state.current.movementX += e.movementX
        state.current.movementY += e.movementY
      }
    }

    const handleLockChange = () => {
      state.current.isLocked = !!document.pointerLockElement
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('pointerlockchange', handleLockChange)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('pointerlockchange', handleLockChange)
    }
  }, [])

  const requestLock = useCallback(() => {
    document.body.requestPointerLock()
  }, [])

  const consumeMovement = useCallback(() => {
    const x = state.current.movementX
    const y = state.current.movementY
    state.current.movementX = 0
    state.current.movementY = 0
    return { x, y }
  }, [])

  return { state, requestLock, consumeMovement }
}
