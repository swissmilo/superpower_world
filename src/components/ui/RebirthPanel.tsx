'use client'

import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { calculateRebirthBonus, getRebirthCost } from '@/lib/rebirth'

interface RebirthPanelProps {
  onClose: () => void
}

export function RebirthPanel({ onClose }: RebirthPanelProps) {
  const currency = useGameStore((s) => s.currency)
  const rebirthCount = useGameStore((s) => s.rebirthCount)
  const performRebirth = useGameStore((s) => s.performRebirth)

  const [confirming, setConfirming] = useState(false)

  const currentMultiplier = calculateRebirthBonus(rebirthCount)
  const nextMultiplier = calculateRebirthBonus(rebirthCount + 1)
  const cost = getRebirthCost(rebirthCount)
  const canAfford = currency >= cost

  const handleRebirth = () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    performRebirth()
    onClose()
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Rebirth</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Current Status */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Rebirth Count</span>
            <span className="text-white font-bold">{rebirthCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Current Multiplier</span>
            <span className="text-green-400 font-bold">{currentMultiplier.toFixed(2)}x</span>
          </div>
        </div>

        {/* What you gain */}
        <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 mb-4">
          <h3 className="text-green-400 font-semibold mb-2">What You Gain</h3>
          <p className="text-green-300 text-sm">
            Permanent multiplier: {currentMultiplier.toFixed(2)}x → {nextMultiplier.toFixed(2)}x
          </p>
          <p className="text-green-300 text-sm mt-1">
            +25% to damage, currency, and max health
          </p>
        </div>

        {/* What you lose */}
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-4">
          <h3 className="text-red-400 font-semibold mb-2">What Will Be Reset</h3>
          <ul className="text-red-300 text-sm space-y-1">
            <li>- All upgrades</li>
            <li>- All unlocked elements (except your first)</li>
            <li>- All currency</li>
          </ul>
        </div>

        {/* Cost */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Cost</span>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">●</span>
              <span className={`font-bold text-lg ${canAfford ? 'text-yellow-300' : 'text-red-400'}`}>
                {cost.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-500 text-sm">Your currency</span>
            <span className="text-gray-400 text-sm">{currency.toLocaleString()}</span>
          </div>
        </div>

        {/* Rebirth Button */}
        <button
          onClick={handleRebirth}
          disabled={!canAfford}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-colors cursor-pointer ${
            !canAfford
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : confirming
                ? 'bg-red-700 hover:bg-red-600 text-white animate-pulse'
                : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
        >
          {!canAfford
            ? 'Not Enough Currency'
            : confirming
              ? 'Click Again to Confirm'
              : 'Rebirth'}
        </button>

        {confirming && (
          <button
            onClick={() => setConfirming(false)}
            className="w-full mt-2 py-2 rounded-lg text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
