'use client'

import { useGameStore } from '@/stores/gameStore'
import { ELEMENTS } from '@/lib/elements'
import type { ElementType } from '@/types/game'

const ELEMENT_ICONS: Record<ElementType, string> = {
  fire: '🔥',
  water: '🌊',
  ice: '❄️',
  lightning: '⚡',
  earth: '🪨',
  nature: '🌿',
}

const ALL_ELEMENTS: ElementType[] = ['fire', 'water', 'ice', 'lightning', 'earth', 'nature']

export function ElementSelector() {
  const setPlayerElement = useGameStore((s) => s.setPlayerElement)
  const unlockedElements = useGameStore((s) => s.unlockedElements)
  const currency = useGameStore((s) => s.currency)

  // If no elements unlocked yet, show all (first pick is free)
  const availableElements = unlockedElements.length > 0 ? unlockedElements : ALL_ELEMENTS

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 p-8">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold text-white mb-2 tracking-tight">
            SUPERPOWER WORLD
          </h1>
          <p className="text-xl text-gray-300">Choose your element</p>
          {currency > 0 && (
            <p className="text-yellow-400 mt-1">● {currency} coins saved</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-2xl">
          {availableElements.map((key) => {
            const element = ELEMENTS[key]
            return (
              <button
                key={key}
                onClick={() => setPlayerElement(key)}
                className="group relative flex flex-col items-center gap-3 rounded-xl bg-gray-900/80 p-6 border-2 border-gray-700 transition-all duration-200 hover:scale-105 hover:border-opacity-100 cursor-pointer"
                style={{
                  borderColor: `${element.color}80`,
                }}
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"
                  style={{ backgroundColor: element.color }}
                />

                <span className="text-4xl">{ELEMENT_ICONS[key]}</span>
                <span
                  className="text-xl font-bold"
                  style={{ color: element.color }}
                >
                  {element.name}
                </span>
                <span className="text-sm text-gray-400 text-center">
                  {element.description}
                </span>

                {/* Ability preview */}
                <div className="flex gap-1 mt-1">
                  {element.abilities.map((ability, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300"
                    >
                      {ability.name}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-gray-500 text-sm">
          WASD to move · Mouse to look · Space to jump · 1/2/3 for abilities · Tab for shop
        </p>
      </div>
    </div>
  )
}
