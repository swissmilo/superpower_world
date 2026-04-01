import * as THREE from 'three'

// Shared refs for player state that needs to be read per-frame
// by multiple systems (camera, powers, enemies) without going through Zustand
export const playerRefs = {
  position: new THREE.Vector3(0, 3, 10),
  azimuth: 0,
  speedMultiplier: 1,
}
