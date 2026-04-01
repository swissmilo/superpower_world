'use client'

import { useGameStore } from '@/stores/gameStore'

export function HealthBar() {
  const health = useGameStore((s) => s.playerHealth)
  const maxHealth = useGameStore((s) => s.playerMaxHealth)
  const percent = (health / maxHealth) * 100

  return (
    <div className="flex items-center gap-2">
      <span className="text-red-400 text-sm font-bold">HP</span>
      <div className="w-48 h-5 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percent}%`,
            backgroundColor: percent > 50 ? '#22c55e' : percent > 25 ? '#eab308' : '#ef4444',
          }}
        />
      </div>
      <span className="text-white text-sm font-mono">
        {health}/{maxHealth}
      </span>
    </div>
  )
}
