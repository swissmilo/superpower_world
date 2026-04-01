'use client'

import { useCallback, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { Controls, ABILITY_CONTROLS } from '@/hooks/useKeyboard'
import { useGameStore } from '@/stores/gameStore'
import { playerRefs } from '@/stores/playerRefs'
import { ELEMENTS } from '@/lib/elements'
import type { AbilityDef } from '@/types/game'
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
  skillKey: string
  ability: AbilityDef
}

let nextEffectId = 0

export function PowerManager() {
  const [effects, setEffects] = useState<ActiveEffect[]>([])
  const [, getKeys] = useKeyboardControls<Controls>()
  const prevKeys = useRef<Record<string, boolean>>({})

  const removeEffect = useCallback((id: number) => {
    setEffects((prev) => prev.filter((e) => e.id !== id))
  }, [])

  useFrame((_, delta) => {
    const store = useGameStore.getState()
    if (store.phase !== 'playing' || store.isPaused()) return

    // Tick cooldowns
    store.tickCooldowns(delta)

    // Get active elements (fallback to playerElement for backward compat)
    const activeElements = store.activeElements.length > 0
      ? store.activeElements
      : store.playerElement ? [store.playerElement] : []

    if (activeElements.length === 0) return

    const keys = getKeys()

    // Check each ability slot (up to 9: 3 per active element)
    for (let ei = 0; ei < activeElements.length; ei++) {
      const elementType = activeElements[ei]
      const element = ELEMENTS[elementType]

      for (let ai = 0; ai < 3; ai++) {
        const globalIndex = ei * 3 + ai
        if (globalIndex >= 9) break

        const controlKey = ABILITY_CONTROLS[globalIndex]
        const isPressed = keys[controlKey]
        const wasPressed = prevKeys.current[controlKey] ?? false

        if (isPressed && !wasPressed) {
          // Key just pressed — check cooldown
          if ((store.abilityCooldowns[globalIndex] ?? 0) <= 0) {
            const ability = element.abilities[ai]
            const skillKey = `${elementType}_${ai}`

            // Start cooldown with both global and skill-level multipliers
            store.startCooldown(globalIndex, ability.cooldown, skillKey)

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

            // Apply both global upgrade and skill-level damage multipliers
            const totalDamage = Math.floor(
              ability.damage * store.getDamageMultiplier() * store.getSkillDamageMultiplier(skillKey)
            )

            const newEffect: ActiveEffect = {
              id: nextEffectId++,
              type: ability.type,
              position: ability.type === 'projectile' ? spawnPos : playerPos,
              direction: forward,
              color: element.color,
              secondaryColor: element.secondaryColor,
              particleColor: element.particleColor,
              damage: totalDamage,
              skillKey,
              ability,
            }

            setEffects((prev) => [...prev, newEffect])

            // Non-damage abilities get flat XP per cast
            if (ability.type === 'shield' || ability.type === 'heal' || ability.type === 'speed_boost') {
              store.addSkillXP(skillKey, 10)
            }
          }
        }
      }
    }

    // Update prev keys state
    const newPrevKeys: Record<string, boolean> = {}
    for (const control of ABILITY_CONTROLS) {
      newPrevKeys[control] = keys[control]
    }
    prevKeys.current = newPrevKeys
  })

  const handleDamageDealt = useCallback((skillKey: string, damage: number) => {
    useGameStore.getState().addSkillXP(skillKey, damage)
  }, [])

  return (
    <>
      {effects.map((effect) => {
        const { ability } = effect

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
                speed={ability.speed}
                size={ability.size}
                piercing={ability.piercing}
                onHitHeal={ability.onHitHeal}
                hasTrail={ability.hasTrail}
                hasArc={ability.hasArc}
                onDamageDealt={(dmg) => handleDamageDealt(effect.skillKey, dmg)}
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
                maxRadius={ability.aoeRadius}
                knockback={ability.knockback}
                slowDuration={ability.slowDuration}
                chainHits={ability.chainHits}
                selfHealPercent={ability.selfHealPercent}
                onDamageDealt={(dmg) => handleDamageDealt(effect.skillKey, dmg)}
                onExpire={() => removeEffect(effect.id)}
              />
            )
          case 'shield':
            return (
              <FollowPlayer key={effect.id}>
                <ShieldEffect
                  color={effect.color}
                  particleColor={effect.particleColor}
                  duration={ability.shieldDuration}
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
                  healPerSecond={ability.healPerSecond}
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
                  multiplier={ability.speedMultiplier}
                  duration={ability.boostDuration}
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
