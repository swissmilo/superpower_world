'use client'

interface BossHealthBarProps {
  name: string
  health: number
  maxHealth: number
}

export function BossHealthBar({ name, health, maxHealth }: BossHealthBarProps) {
  const percent = (health / maxHealth) * 100

  if (health <= 0) return null

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="flex flex-col items-center gap-1">
        {/* Boss name */}
        <span className="text-red-400 text-lg font-bold tracking-wider uppercase drop-shadow-lg">
          {name}
        </span>

        {/* Health bar container */}
        <div className="w-96 h-6 bg-gray-900 rounded-sm overflow-hidden border border-gray-600 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
          {/* Health fill */}
          <div
            className="h-full transition-all duration-300 rounded-sm"
            style={{
              width: `${percent}%`,
              background: 'linear-gradient(to right, #8B0000, #DC2626, #EF4444)',
            }}
          />
        </div>

        {/* Health numbers */}
        <span className="text-gray-300 text-xs font-mono">
          {health} / {maxHealth}
        </span>
      </div>
    </div>
  )
}
