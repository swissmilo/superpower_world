'use client'

export function Crosshair() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
    </div>
  )
}
