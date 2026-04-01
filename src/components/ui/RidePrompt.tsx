'use client'

import { useState, useEffect } from 'react'
import { playerRefs } from '@/stores/playerRefs'

export function RidePrompt() {
  const [prompt, setPrompt] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRefs.isOnRide) {
        setPrompt('Press Space to dismount')
      } else if (playerRefs.nearRide) {
        setPrompt('Press Space to ride')
      } else {
        setPrompt('')
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  if (!prompt) return null

  return (
    <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-black/70 text-white px-6 py-3 rounded-xl text-lg font-bold animate-pulse">
        {prompt}
      </div>
    </div>
  )
}
