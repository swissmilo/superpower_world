'use client'

import { Sky } from '@react-three/drei'
import { Player } from './Player'
import { World } from './World'
import { PowerManager } from './powers/PowerManager'

export function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 80, 30]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={150}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />

      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={[100, 80, 50]}
        inclination={0.5}
        azimuth={0.25}
      />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#87CEEB', 40, 120]} />

      {/* World environment */}
      <World />

      {/* Player */}
      <Player />

      {/* Powers */}
      <PowerManager />
    </>
  )
}
