'use client'

import { useGameStore } from '@/stores/gameStore'
import { UPGRADES, getUpgradeCost, getUpgradeEffect } from '@/lib/upgrades'
import { ELEMENTS } from '@/lib/elements'
import type { ElementType } from '@/types/game'

const ALL_ELEMENTS: ElementType[] = ['fire', 'water', 'ice', 'lightning', 'earth', 'nature']

const ELEMENT_ICONS: Record<ElementType, string> = {
  fire: '🔥',
  water: '🌊',
  ice: '❄️',
  lightning: '⚡',
  earth: '🪨',
  nature: '🌿',
}

export function UpgradeShop() {
  const currency = useGameStore((s) => s.currency)
  const upgradeLevels = useGameStore((s) => s.upgradeLevels)
  const unlockedElements = useGameStore((s) => s.unlockedElements)
  const activeElements = useGameStore((s) => s.activeElements)
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade)
  const unlockElement = useGameStore((s) => s.unlockElement)
  const equipElement = useGameStore((s) => s.equipElement)
  const unequipElement = useGameStore((s) => s.unequipElement)
  const toggleShop = useGameStore((s) => s.toggleShop)
  const getNextElementCost = useGameStore((s) => s.getNextElementCost)

  const nextElementCost = getNextElementCost()
  const lockedElements = ALL_ELEMENTS.filter((e) => !unlockedElements.includes(e))
  const equippableElements = unlockedElements.filter((e) => !activeElements.includes(e))

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Upgrade Shop</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">●</span>
              <span className="text-yellow-300 font-bold text-lg">{currency}</span>
            </div>
            <button
              onClick={toggleShop}
              className="text-gray-400 hover:text-white text-xl px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Active Loadout */}
        <h3 className="text-lg font-bold text-white mb-3">Active Loadout</h3>
        <div className="flex gap-2 mb-6">
          {[0, 1, 2].map((slotIndex) => {
            const elementType = activeElements[slotIndex]
            if (elementType) {
              const def = ELEMENTS[elementType]
              return (
                <div
                  key={slotIndex}
                  className="flex items-center gap-2 bg-gray-800 rounded-lg p-3 border-2 flex-1"
                  style={{ borderColor: `${def.color}80` }}
                >
                  <span className="text-2xl">{ELEMENT_ICONS[elementType]}</span>
                  <div className="flex-1">
                    <span className="text-sm font-semibold" style={{ color: def.color }}>
                      {def.name}
                    </span>
                    <p className="text-gray-500 text-[10px]">Keys {slotIndex * 3 + 1}-{slotIndex * 3 + 3}</p>
                  </div>
                  {activeElements.length > 1 && (
                    <button
                      onClick={() => unequipElement(elementType)}
                      className="text-gray-500 hover:text-red-400 text-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )
            }
            return (
              <div
                key={slotIndex}
                className="flex items-center justify-center bg-gray-800/50 rounded-lg p-3 border-2 border-dashed border-gray-700 flex-1"
              >
                <span className="text-gray-600 text-sm">Empty slot</span>
              </div>
            )
          })}
        </div>

        {/* Equip unlocked elements */}
        {equippableElements.length > 0 && activeElements.length < 3 && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-2">Equip an element:</p>
            <div className="flex gap-2 flex-wrap">
              {equippableElements.map((element) => {
                const def = ELEMENTS[element]
                return (
                  <button
                    key={element}
                    onClick={() => equipElement(element)}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 border border-gray-600 cursor-pointer transition-colors"
                  >
                    <span className="text-lg">{ELEMENT_ICONS[element]}</span>
                    <span className="text-sm" style={{ color: def.color }}>{def.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Upgrades */}
        <h3 className="text-lg font-bold text-white mb-3">Upgrades</h3>
        <div className="space-y-3 mb-6">
          {UPGRADES.map((upgrade) => {
            const level = upgradeLevels[upgrade.id] ?? 0
            const maxed = level >= upgrade.maxLevel
            const cost = getUpgradeCost(upgrade, level)
            const canAfford = currency >= cost
            const effect = getUpgradeEffect(upgrade, level)
            const nextEffect = getUpgradeEffect(upgrade, level + 1)

            return (
              <div
                key={upgrade.id}
                className="flex items-center gap-4 bg-gray-800 rounded-lg p-3"
              >
                <span className="text-2xl w-10 text-center">{upgrade.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{upgrade.name}</span>
                    <span className="text-gray-400 text-sm">
                      Lv.{level}/{upgrade.maxLevel}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">{upgrade.description}</p>
                  {!maxed && (
                    <p className="text-green-400 text-xs mt-0.5">
                      +{effect}{upgrade.effectUnit} → +{nextEffect}{upgrade.effectUnit}
                    </p>
                  )}
                </div>
                {maxed ? (
                  <span className="text-yellow-500 font-bold text-sm px-3">MAX</span>
                ) : (
                  <button
                    onClick={() => purchaseUpgrade(upgrade.id)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                      canAfford
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {cost} ●
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Element Unlocks */}
        {lockedElements.length > 0 && (
          <>
            <h3 className="text-lg font-bold text-white mb-3">Unlock Elements</h3>
            <div className="grid grid-cols-3 gap-2">
              {lockedElements.map((element) => {
                const def = ELEMENTS[element]
                const canAfford = currency >= nextElementCost

                return (
                  <button
                    key={element}
                    onClick={() => unlockElement(element)}
                    disabled={!canAfford}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors cursor-pointer ${
                      canAfford
                        ? 'bg-gray-800 border-gray-600 hover:border-gray-400'
                        : 'bg-gray-800/50 border-gray-700/50 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="text-2xl">{ELEMENT_ICONS[element]}</span>
                    <span className="text-sm font-semibold" style={{ color: def.color }}>
                      {def.name}
                    </span>
                    <span className="text-xs text-yellow-400">{nextElementCost} ●</span>
                  </button>
                )
              })}
            </div>
          </>
        )}

        <p className="text-gray-600 text-xs text-center mt-4">Press Tab to close</p>
      </div>
    </div>
  )
}
