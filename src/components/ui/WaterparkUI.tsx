'use client'

import { useEffect, useState } from 'react'
import { playerRefs } from '@/stores/playerRefs'
import { useGameStore } from '@/stores/gameStore'
import { useWaterparkStore } from '@/stores/waterparkStore'
import { PIECES, PIECE_TYPES, PARK_WORLD_OFFSET, HALF_EXTENT } from '@/lib/waterparkPieces'

const PARK_RANGE = HALF_EXTENT + 8 // consider "in park" a bit outside the walls

function lockPointer() {
  try {
    const p = document.body.requestPointerLock()
    // Newer browsers return a promise that can reject during the exit cooldown.
    if (p && typeof (p as Promise<void>).catch === 'function') (p as Promise<void>).catch(() => {})
  } catch {
    /* ignore */
  }
}

function unlockPointer() {
  try {
    document.exitPointerLock()
  } catch {
    /* ignore */
  }
}

// Park actions — shared by the on-screen buttons and the keyboard shortcuts so
// they work even while the pointer is locked for camera look.
function doToggleBuild() {
  const s = useWaterparkStore.getState()
  if (s.mode === 'build') {
    s.setMode('explore')
    lockPointer()
  } else {
    s.setMode('build')
    unlockPointer()
  }
}
function doToggleBag() {
  const s = useWaterparkStore.getState()
  const willOpen = !s.showInventory
  s.toggleInventory()
  if (willOpen) unlockPointer()
  else if (s.mode === 'explore') lockPointer()
}
function doCloseBag() {
  const s = useWaterparkStore.getState()
  if (s.showInventory) s.toggleInventory()
  if (s.mode === 'explore') lockPointer()
}

function inParkNow() {
  const dx = playerRefs.position.x - PARK_WORLD_OFFSET[0]
  const dz = playerRefs.position.z - PARK_WORLD_OFFSET[2]
  return Math.abs(dx) < PARK_RANGE && Math.abs(dz) < PARK_RANGE
}

export function WaterparkUI() {
  const [inPark, setInPark] = useState(false)

  const mode = useWaterparkStore((s) => s.mode)
  const money = useGameStore((s) => s.currency)
  const stars = useWaterparkStore((s) => s.stars)
  const cards = useWaterparkStore((s) => s.cards)
  const selectedPiece = useWaterparkStore((s) => s.selectedPiece)
  const showInventory = useWaterparkStore((s) => s.showInventory)

  const totalCards = PIECE_TYPES.reduce((sum, t) => sum + (cards[t] ?? 0), 0)

  // Poll player position to know when to show the park UI + live pending money.
  useEffect(() => {
    const id = setInterval(() => {
      const dx = playerRefs.position.x - PARK_WORLD_OFFSET[0]
      const dz = playerRefs.position.z - PARK_WORLD_OFFSET[2]
      const within = Math.abs(dx) < PARK_RANGE && Math.abs(dz) < PARK_RANGE
      setInPark(within)
    }, 150)
    return () => clearInterval(id)
  }, [])

  // Keyboard shortcuts work even while the pointer is locked for camera look,
  // so you can collect/build/open inventory without first pressing Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (!inParkNow()) return
      const k = e.key.toLowerCase()
      if (k === 'b') doToggleBuild()
      else if (k === 'i') doToggleBag()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!inPark) return null

  const toggleMode = (e: React.MouseEvent) => {
    e.stopPropagation()
    doToggleBuild()
  }

  const onBag = (e: React.MouseEvent) => {
    e.stopPropagation()
    doToggleBag()
  }

  const closeInventory = (e: React.MouseEvent) => {
    e.stopPropagation()
    doCloseBag()
  }

  return (
    <div className="absolute inset-0 z-40 pointer-events-none select-none">
      {/* Top toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-4 bg-black/70 text-white px-5 py-2 rounded-xl font-bold text-lg">
          <span>💵 ${money.toLocaleString()}</span>
          <span className="text-cyan-300">🃏 {totalCards}</span>
          <span className="text-yellow-300">⭐ {stars}</span>
        </div>
        <button
          onClick={toggleMode}
          className={`px-4 py-2 rounded-xl font-bold text-lg shadow-lg transition-colors ${
            mode === 'build'
              ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {mode === 'build' ? '✓ Play' : '🔨 Build'}
        </button>
      </div>

      {/* Build hint */}
      {mode === 'build' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-1.5 rounded-lg pointer-events-none">
          {selectedPiece
            ? 'Click a tile to build · R to rotate · click a ride to sell'
            : 'Pick a piece below to start building'}
        </div>
      )}

      {/* Red inventory button (above the modal so it can toggle it closed) */}
      <button
        onClick={onBag}
        className="absolute bottom-6 left-6 z-50 w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 border-4 border-red-800 shadow-xl text-white text-2xl font-bold pointer-events-auto flex items-center justify-center"
        title="Inventory"
      >
        🎒
      </button>

      {/* Bottom build menu */}
      {mode === 'build' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/70 px-3 py-3 rounded-2xl pointer-events-auto max-w-[80vw] overflow-x-auto">
          {PIECE_TYPES.map((type) => {
            const def = PIECES[type]
            const owned = cards[type] ?? 0
            const affordable = money >= def.cost && owned >= def.cardCost
            const selected = selectedPiece === type
            return (
              <button
                key={type}
                onClick={(e) => {
                  e.stopPropagation()
                  useWaterparkStore.getState().selectPiece(selected ? null : type)
                }}
                className={`flex flex-col items-center justify-between w-24 shrink-0 px-2 py-2 rounded-xl border-2 transition-colors ${
                  selected
                    ? 'border-yellow-400 bg-yellow-400/20'
                    : 'border-transparent bg-white/10 hover:bg-white/20'
                } ${affordable ? 'opacity-100' : 'opacity-40'}`}
              >
                <span className="text-2xl">{def.icon}</span>
                <span className="text-white text-xs font-semibold leading-tight text-center mt-1">
                  {def.name}
                </span>
                <span className="text-green-300 text-xs font-bold mt-1">${def.cost}</span>
                <span
                  className={`text-xs font-bold ${owned >= def.cardCost ? 'text-cyan-300' : 'text-red-400'}`}
                >
                  🃏 {owned}/{def.cardCost}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Inventory modal */}
      {showInventory && (
        <div
          onClick={closeInventory}
          className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto bg-black/40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-600 rounded-2xl p-6 w-[420px] max-w-[90vw]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">🎒 Building Cards</h2>
              <button
                onClick={closeInventory}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
              {PIECE_TYPES.map((type) => {
                const def = PIECES[type]
                const owned = cards[type] ?? 0
                return (
                  <div
                    key={type}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                      owned > 0 ? 'bg-slate-800' : 'bg-slate-800/40'
                    }`}
                  >
                    <span className="text-2xl">{def.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-semibold truncate">{def.name}</div>
                      <div className="text-slate-400 text-xs">${def.cost}</div>
                    </div>
                    <span className="text-cyan-300 font-bold text-lg">×{owned}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-slate-400 text-xs mt-4 text-center">
              Cards arrive over time as guests enjoy your park.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
