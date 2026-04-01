'use client'

import { useGameStore } from '@/stores/gameStore'
import { ELEMENTS } from '@/lib/elements'

export function AbilityBar() {
  const playerElement = useGameStore((s) => s.playerElement)
  const cooldowns = useGameStore((s) => s.abilityCooldowns)

  if (!playerElement) return null

  const element = ELEMENTS[playerElement]
  const keybinds = ['1', '2', '3']

  return (
    <div className="flex gap-3">
      {element.abilities.map((ability, i) => {
        const onCooldown = cooldowns[i] > 0
        const cooldownPercent = onCooldown
          ? (cooldowns[i] / ability.cooldown) * 100
          : 0

        return (
          <div
            key={i}
            className="relative flex flex-col items-center gap-1"
          >
            {/* Ability slot */}
            <div
              className="relative w-14 h-14 rounded-lg border-2 flex items-center justify-center overflow-hidden"
              style={{
                borderColor: onCooldown ? '#666' : element.color,
                backgroundColor: 'rgba(0,0,0,0.7)',
              }}
            >
              {/* Cooldown overlay */}
              {onCooldown && (
                <div
                  className="absolute bottom-0 left-0 right-0 bg-black/60"
                  style={{ height: `${cooldownPercent}%` }}
                />
              )}

              {/* Ability type icon */}
              <span className="text-xl relative z-10" style={{ opacity: onCooldown ? 0.4 : 1 }}>
                {ability.type === 'projectile' && '💥'}
                {ability.type === 'aoe' && '💫'}
                {ability.type === 'shield' && '🛡️'}
                {ability.type === 'heal' && '💚'}
                {ability.type === 'speed_boost' && '⚡'}
              </span>

              {/* Cooldown timer text */}
              {onCooldown && (
                <span className="absolute text-white text-xs font-bold z-20">
                  {Math.ceil(cooldowns[i])}s
                </span>
              )}
            </div>

            {/* Keybind */}
            <span className="text-xs text-gray-400 bg-gray-800 px-1.5 rounded">
              {keybinds[i]}
            </span>

            {/* Ability name */}
            <span className="text-xs text-gray-300 max-w-16 text-center leading-tight">
              {ability.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
