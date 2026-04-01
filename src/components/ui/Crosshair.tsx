'use client'

export function Crosshair() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-2 h-2 rounded-full bg-white/60 border border-white/30" />
    </div>
  )
}
