'use client'

import dynamic from 'next/dynamic'

const Game = dynamic(() => import('@/components/game/Game'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Superpower World</h1>
        <p className="text-lg text-gray-400">Loading...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  return <Game />
}
