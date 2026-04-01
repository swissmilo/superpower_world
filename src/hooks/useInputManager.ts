import { useCallback } from 'react'
import { useKeyboardControls } from '@react-three/drei'
import { Controls } from '@/hooks/useKeyboard'
import { useTouch } from '@/hooks/useTouch'
import { usePointerLock } from '@/hooks/usePointerLock'

export interface UnifiedInput {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
  ability1: boolean
  ability2: boolean
  ability3: boolean
  lookDelta: { x: number; y: number }
}

export function useInputManager() {
  const [, getKeys] = useKeyboardControls<Controls>()
  const { getMovement, consumeLookDelta, consumeJump, consumeAbilities } = useTouch()
  const { consumeMovement: consumeMouseMovement } = usePointerLock()

  const getInput = useCallback((): UnifiedInput => {
    const keys = getKeys()
    const touchMove = getMovement()
    const touchLook = consumeLookDelta()
    const mouseLook = consumeMouseMovement()
    const touchJump = consumeJump()
    const [tAbility1, tAbility2, tAbility3] = consumeAbilities()

    // Keyboard takes priority for movement if any WASD key is pressed
    const keyboardMoving = keys.forward || keys.backward || keys.left || keys.right

    let forward: boolean
    let backward: boolean
    let left: boolean
    let right: boolean

    if (keyboardMoving) {
      forward = keys.forward
      backward = keys.backward
      left = keys.left
      right = keys.right
    } else {
      // Convert touch joystick to booleans (threshold at 0.3)
      const threshold = 0.3
      forward = touchMove.z > threshold
      backward = touchMove.z < -threshold
      left = touchMove.x < -threshold
      right = touchMove.x > threshold
    }

    // Sum mouse and touch look deltas
    const lookDelta = {
      x: mouseLook.x + touchLook.x,
      y: mouseLook.y + touchLook.y,
    }

    return {
      forward,
      backward,
      left,
      right,
      jump: keys.jump || touchJump,
      ability1: keys.ability1 || tAbility1,
      ability2: keys.ability2 || tAbility2,
      ability3: keys.ability3 || tAbility3,
      lookDelta,
    }
  }, [getKeys, getMovement, consumeLookDelta, consumeMouseMovement, consumeJump, consumeAbilities])

  return getInput
}
