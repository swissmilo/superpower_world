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
  ability4 = 'ability4',
  ability5 = 'ability5',
  ability6 = 'ability6',
  ability7 = 'ability7',
  ability8 = 'ability8',
  ability9 = 'ability9',
}

export const ABILITY_CONTROLS = [
  Controls.ability1, Controls.ability2, Controls.ability3,
  Controls.ability4, Controls.ability5, Controls.ability6,
  Controls.ability7, Controls.ability8, Controls.ability9,
]

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
      { name: Controls.ability4, keys: ['Digit4'] },
      { name: Controls.ability5, keys: ['Digit5'] },
      { name: Controls.ability6, keys: ['Digit6'] },
      { name: Controls.ability7, keys: ['Digit7'] },
      { name: Controls.ability8, keys: ['Digit8'] },
      { name: Controls.ability9, keys: ['Digit9'] },
    ],
    []
  )
}

export function useInput() {
  const [, getKeys] = useKeyboardControls<Controls>()
  return getKeys
}
