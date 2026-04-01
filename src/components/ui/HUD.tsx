'use client'

import { HealthBar } from './HealthBar'
import { CurrencyDisplay } from './CurrencyDisplay'
import { AbilityBar } from './AbilityBar'
import { Crosshair } from './Crosshair'

export function HUD() {
  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Top left - Health */}
      <div className="absolute top-4 left-4">
        <HealthBar />
      </div>

      {/* Top right - Currency */}
      <div className="absolute top-4 right-4">
        <CurrencyDisplay />
      </div>

      {/* Center - Crosshair */}
      <Crosshair />

      {/* Bottom center - Abilities */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <AbilityBar />
      </div>
    </div>
  )
}
