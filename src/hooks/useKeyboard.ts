import { useMemo } from 'react'
import { useKeyboardControls } from '@react-three/drei'

export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
  ability1 = 'ability1',
  ability2 = 'ability2',
  ability3 = 'ability3',
}

export function useKeyboardMap() {
  return useMemo(
    () => [
      { name: Controls.forward, keys: ['KeyW', 'ArrowUp'] },
      { name: Controls.backward, keys: ['KeyS', 'ArrowDown'] },
      { name: Controls.left, keys: ['KeyA', 'ArrowLeft'] },
      { name: Controls.right, keys: ['KeyD', 'ArrowRight'] },
      { name: Controls.jump, keys: ['Space'] },
      { name: Controls.ability1, keys: ['Digit1', 'KeyQ'] },
      { name: Controls.ability2, keys: ['Digit2', 'KeyE'] },
      { name: Controls.ability3, keys: ['Digit3', 'KeyR'] },
    ],
    []
  )
}

export function useInput() {
  const [, getKeys] = useKeyboardControls<Controls>()
  return getKeys
}
