'use client'

import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { ElementSelector } from '@/components/ui/ElementSelector'
import { UpgradeShop } from '@/components/ui/UpgradeShop'
import { RebirthPanel } from '@/components/ui/RebirthPanel'
import { calculateRebirthBonus, getRebirthCost } from '@/lib/rebirth'

type SubPanel = 'menu' | 'elements' | 'shop' | 'rebirth'

export function MainMenu() {
  const currency = useGameStore((s) => s.currency)
  const rebirthCount = useGameStore((s) => s.rebirthCount)
  const unlockedElements = useGameStore((s) => s.unlockedElements)

  const [subPanel, setSubPanel] = useState<SubPanel>('menu')

  const rebirthMultiplier = calculateRebirthBonus(rebirthCount)
  const rebirthCost = getRebirthCost(rebirthCount)
  const canRebirth = currency >= rebirthCost

  if (subPanel === 'elements') {
    return <ElementSelector />
  }

  if (subPanel === 'shop') {
    return <UpgradeShop />
  }

  if (subPanel === 'rebirth') {
    return <RebirthPanel onClose={() => setSubPanel('menu')} />
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 p-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-6xl font-extrabold text-white mb-2 tracking-tight">
            SUPERPOWER WORLD
          </h1>
          {rebirthCount > 0 && (
            <p className="text-purple-400 text-lg mt-2">
              Rebirth {rebirthCount} &middot; {rebirthMultiplier.toFixed(2)}x Multiplier
            </p>
          )}
          {currency > 0 && (
            <p className="text-yellow-400 mt-1">● {currency.toLocaleString()} coins</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 min-w-[280px]">
          <button
            onClick={() => setSubPanel('elements')}
            className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl transition-colors cursor-pointer"
          >
            Play
          </button>

          <button
            onClick={() => setSubPanel('shop')}
            className="px-8 py-4 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-xl transition-colors cursor-pointer"
          >
            Upgrades
          </button>

          <button
            onClick={() => setSubPanel('rebirth')}
            disabled={!canRebirth}
            className={`px-8 py-4 rounded-xl font-bold text-xl transition-colors cursor-pointer ${
              canRebirth
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Rebirth
            {!canRebirth && (
              <span className="block text-sm font-normal mt-0.5">
                Requires {rebirthCost.toLocaleString()} ●
              </span>
            )}
          </button>
        </div>

        {/* Info */}
        {unlockedElements.length > 0 && (
          <p className="text-gray-500 text-sm">
            {unlockedElements.length} element{unlockedElements.length !== 1 ? 's' : ''} unlocked
          </p>
        )}

        <p className="text-gray-500 text-sm">
          WASD to move · Mouse to look · Space to jump · 1/2/3 for abilities · Tab for shop
        </p>
      </div>
    </div>
  )
}
