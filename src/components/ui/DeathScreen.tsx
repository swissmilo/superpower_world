'use client'

import { useGameStore } from '@/stores/gameStore'

interface DeathScreenProps {
  enemiesKilled?: number
}

export function DeathScreen({ enemiesKilled = 0 }: DeathScreenProps) {
  const currency = useGameStore((s) => s.currency)
  const setPhase = useGameStore((s) => s.setPhase)
  const playerMaxHealth = useGameStore((s) => s.playerMaxHealth)
  const resetGame = useGameStore((s) => s.resetGame)

  const handleRespawn = () => {
    useGameStore.setState({ playerHealth: playerMaxHealth })
    setPhase('playing')
  }

  const handleMenu = () => {
    resetGame()
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="flex flex-col items-center gap-6 p-8">
        <h1 className="text-5xl font-extrabold text-red-500 tracking-tight">
          You were defeated!
        </h1>

        {/* Stats */}
        <div className="bg-gray-900/80 rounded-xl border border-gray-700 p-6 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400">Coins Earned</span>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">●</span>
              <span className="text-yellow-300 font-bold">{currency.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Enemies Killed</span>
            <span className="text-white font-bold">{enemiesKilled}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleRespawn}
            className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-lg transition-colors cursor-pointer"
          >
            Respawn
          </button>
          <button
            onClick={handleMenu}
            className="px-8 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg transition-colors cursor-pointer"
          >
            Menu
          </button>
        </div>
      </div>
    </div>
  )
}
