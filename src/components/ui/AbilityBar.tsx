'use client'

import { useGameStore } from '@/stores/gameStore'
import { ELEMENTS } from '@/lib/elements'
import type { ElementType } from '@/types/game'
import { SKILL_XP_THRESHOLDS } from '@/types/game'

const ELEMENT_ICONS: Record<ElementType, string> = {
  fire: '🔥',
  water: '🌊',
  ice: '❄️',
  lightning: '⚡',
  earth: '🪨',
  nature: '🌿',
}

export function AbilityBar() {
  const activeElements = useGameStore((s) => s.activeElements)
  const playerElement = useGameStore((s) => s.playerElement)
  const cooldowns = useGameStore((s) => s.abilityCooldowns)
  const skillLevels = useGameStore((s) => s.skillLevels)
  const skillXP = useGameStore((s) => s.skillXP)

  // Fallback to single element
  const elements = activeElements.length > 0
    ? activeElements
    : playerElement ? [playerElement] : []

  if (elements.length === 0) return null

  return (
    <div className="flex gap-1 items-end">
      {elements.map((elementType, ei) => {
        const element = ELEMENTS[elementType]

        return (
          <div key={elementType} className="flex items-end gap-0.5">
            {/* Element group separator */}
            {ei > 0 && (
              <div className="w-px h-12 bg-gray-600 mx-1" />
            )}

            {/* Element icon header */}
            <div className="flex flex-col items-center mr-0.5">
              <span className="text-xs mb-0.5">{ELEMENT_ICONS[elementType]}</span>
            </div>

            {/* 3 ability slots for this element */}
            {element.abilities.map((ability, ai) => {
              const globalIndex = ei * 3 + ai
              const keybind = `${globalIndex + 1}`
              const skillKey = `${elementType}_${ai}`
              const level = skillLevels[skillKey] ?? 1
              const xp = skillXP[skillKey] ?? 0
              const nextThreshold = level < 5 ? SKILL_XP_THRESHOLDS[level - 1] : null

              const onCooldown = (cooldowns[globalIndex] ?? 0) > 0
              const cooldownPercent = onCooldown && ability.cooldown > 0
                ? ((cooldowns[globalIndex] ?? 0) / ability.cooldown) * 100
                : 0

              return (
                <div
                  key={ai}
                  className="relative flex flex-col items-center gap-0.5"
                >
                  {/* Ability slot */}
                  <div
                    className="relative w-12 h-12 rounded-lg border-2 flex items-center justify-center overflow-hidden"
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
                    <span className="text-lg relative z-10" style={{ opacity: onCooldown ? 0.4 : 1 }}>
                      {ability.type === 'projectile' && '💥'}
                      {ability.type === 'aoe' && '💫'}
                      {ability.type === 'shield' && '🛡️'}
                      {ability.type === 'heal' && '💚'}
                      {ability.type === 'speed_boost' && '⚡'}
                    </span>

                    {/* Cooldown timer text */}
                    {onCooldown && (
                      <span className="absolute text-white text-xs font-bold z-20">
                        {Math.ceil(cooldowns[globalIndex] ?? 0)}s
                      </span>
                    )}

                    {/* Skill level badge */}
                    <span
                      className="absolute top-0 right-0 text-[9px] px-0.5 rounded-bl font-bold z-20"
                      style={{
                        backgroundColor: level >= 5 ? '#FFD700' : '#374151',
                        color: level >= 5 ? '#000' : '#FCD34D',
                      }}
                    >
                      {level}
                    </span>

                    {/* XP progress bar (thin line at bottom) */}
                    {nextThreshold && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-800 z-20">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${Math.min(100, (xp / nextThreshold) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Keybind */}
                  <span className="text-[10px] text-gray-400 bg-gray-800 px-1 rounded">
                    {keybind}
                  </span>

                  {/* Ability name */}
                  <span className="text-[9px] text-gray-400 max-w-12 text-center leading-tight truncate">
                    {ability.name}
                  </span>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
