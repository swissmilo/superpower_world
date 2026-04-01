'use client'

import { useCallback, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { Controls } from '@/hooks/useKeyboard'
import { useGameStore } from '@/stores/gameStore'
import { playerRefs } from '@/stores/playerRefs'
import { ELEMENTS } from '@/lib/elements'
import { Projectile } from './Projectile'
import { AoeEffect } from './AoeEffect'
import { ShieldEffect } from './ShieldEffect'
import { HealEffect } from './HealEffect'
import { SpeedBoost } from './SpeedBoost'
import { FollowPlayer } from './FollowPlayer'

interface ActiveEffect {
  id: number
  type: 'projectile' | 'aoe' | 'shield' | 'heal' | 'speed_boost'
  position: [number, number, number]
  direction: [number, number, number]
  color: string
  secondaryColor: string
  particleColor: string
  damage: number
}

let nextEffectId = 0

export function PowerManager() {
  const [effects, setEffects] = useState<ActiveEffect[]>([])
  const [, getKeys] = useKeyboardControls<Controls>()
  const prevKeys = useRef({ ability1: false, ability2: false, ability3: false })

  const removeEffect = useCallback((id: number) => {
    setEffects((prev) => prev.filter((e) => e.id !== id))
  }, [])

  useFrame((_, delta) => {
    const store = useGameStore.getState()
    if (store.phase !== 'playing' || !store.playerElement) return

    // Tick cooldowns
    store.tickCooldowns(delta)

    const keys = getKeys()
    const element = ELEMENTS[store.playerElement]

    // Check each ability key (fire on key-down, not hold)
    const abilityKeys = [
      { key: keys.ability1, prev: prevKeys.current.ability1, index: 0 },
      { key: keys.ability2, prev: prevKeys.current.ability2, index: 1 },
      { key: keys.ability3, prev: prevKeys.current.ability3, index: 2 },
    ]

    for (const { key, prev, index } of abilityKeys) {
      if (key && !prev) {
        // Key just pressed
        if (store.abilityCooldowns[index] <= 0) {
          const ability = element.abilities[index]
          store.startCooldown(index, ability.cooldown)

          // Calculate spawn position and direction
          const az = playerRefs.azimuth
          const forward: [number, number, number] = [
            -Math.sin(az),
            0,
            -Math.cos(az),
          ]
          const spawnPos: [number, number, number] = [
            playerRefs.position.x + forward[0] * 1.5,
            playerRefs.position.y + 1,
            playerRefs.position.z + forward[2] * 1.5,
          ]
          const playerPos: [number, number, number] = [
            playerRefs.position.x,
            playerRefs.position.y,
            playerRefs.position.z,
          ]

          const newEffect: ActiveEffect = {
            id: nextEffectId++,
            type: ability.type,
            position: ability.type === 'projectile' ? spawnPos : playerPos,
            direction: forward,
            color: element.color,
            secondaryColor: element.secondaryColor,
            particleColor: element.particleColor,
            damage: Math.floor(ability.damage * store.getDamageMultiplier()),
          }

          setEffects((prev) => [...prev, newEffect])
        }
      }
    }

    prevKeys.current = {
      ability1: keys.ability1,
      ability2: keys.ability2,
      ability3: keys.ability3,
    }
  })

  return (
    <>
      {effects.map((effect) => {
        switch (effect.type) {
          case 'projectile':
            return (
              <Projectile
                key={effect.id}
                position={effect.position}
                direction={effect.direction}
                color={effect.color}
                secondaryColor={effect.secondaryColor}
                damage={effect.damage}
                onExpire={() => removeEffect(effect.id)}
              />
            )
          case 'aoe':
            return (
              <AoeEffect
                key={effect.id}
                position={effect.position}
                color={effect.color}
                damage={effect.damage}
                onExpire={() => removeEffect(effect.id)}
              />
            )
          case 'shield':
            return (
              <FollowPlayer key={effect.id}>
                <ShieldEffect
                  color={effect.color}
                  particleColor={effect.particleColor}
                  onExpire={() => removeEffect(effect.id)}
                />
              </FollowPlayer>
            )
          case 'heal':
            return (
              <FollowPlayer key={effect.id}>
                <HealEffect
                  color={effect.color}
                  particleColor={effect.particleColor}
                  onExpire={() => removeEffect(effect.id)}
                />
              </FollowPlayer>
            )
          case 'speed_boost':
            return (
              <FollowPlayer key={effect.id}>
                <SpeedBoost
                  color={effect.color}
                  particleColor={effect.particleColor}
                  onExpire={() => removeEffect(effect.id)}
                />
              </FollowPlayer>
            )
          default:
            return null
        }
      })}
    </>
  )
}
