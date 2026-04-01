'use client'

import { Sky } from '@react-three/drei'
import { Player } from './Player'
import { World } from './World'
import { PowerManager } from './powers/PowerManager'
import { EnemyManager } from './enemies/EnemyManager'
import { BossManager } from './enemies/BossManager'
import { CaptureZone } from './CaptureZone'
import { AimIndicator } from './AimIndicator'
import { AmusementPark } from './AmusementPark'

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
        shadow-camera-far={500}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />

      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={[100, 80, 50]}
        inclination={0.5}
        azimuth={0.25}
      />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#87CEEB', 100, 600]} />

      {/* World environment */}
      <World />

      {/* Player */}
      <Player />

      {/* Powers */}
      <PowerManager />

      {/* Enemies */}
      <EnemyManager />

      {/* Boss */}
      <BossManager />

      {/* Capture Zone */}
      <CaptureZone />

      {/* Aim indicator */}
      <AimIndicator />

      {/* Amusement Park */}
      <group position={[200, 0, 200]}>
        <AmusementPark />
      </group>
    </>
  )
}
