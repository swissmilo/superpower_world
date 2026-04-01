'use client'

import { useGameStore } from '@/stores/gameStore'

export function CurrencyDisplay() {
  const currency = useGameStore((s) => s.currency)

  return (
    <div className="flex items-center gap-2 bg-gray-900/80 px-4 py-2 rounded-full border border-yellow-600/50">
      <span className="text-yellow-400 text-lg">●</span>
      <span className="text-yellow-300 font-bold text-lg font-mono">{currency}</span>
    </div>
  )
}
