'use client'

import type { CaptureState } from '@/components/game/CaptureZone'

interface CaptureZoneIndicatorProps {
  state: CaptureState
  progress: number // 0-1
}

export function CaptureZoneIndicator({ state, progress }: CaptureZoneIndicatorProps) {
  if (state === 'neutral') return null

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="flex flex-col items-center gap-1.5">
        {state === 'capturing' && (
          <>
            <span className="text-yellow-300 text-sm font-bold tracking-wide uppercase">
              Capture Zone
            </span>

            {/* Progress bar */}
            <div className="w-48 h-3 bg-gray-900 rounded-full overflow-hidden border border-yellow-600/50">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${progress * 100}%`,
                  background: 'linear-gradient(to right, #EAB308, #FACC15)',
                }}
              />
            </div>

            <span className="text-gray-400 text-xs font-mono">
              {Math.round(progress * 100)}%
            </span>
          </>
        )}

        {state === 'captured' && (
          <span className="text-green-400 text-sm font-bold tracking-wide">
            Zone Captured! +1/sec
          </span>
        )}
      </div>
    </div>
  )
}
