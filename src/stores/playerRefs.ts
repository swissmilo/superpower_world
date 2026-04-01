import * as THREE from 'three'

// Shared refs for player state that needs to be read per-frame
// by multiple systems (camera, powers, enemies) without going through Zustand
export const playerRefs = {
  position: new THREE.Vector3(0, 3, 10),
  azimuth: 0,
  speedMultiplier: 1,

  // Ride system
  isOnRide: false,
  currentRide: null as string | null,
  nearRide: null as string | null,
  ridePosition: new THREE.Vector3(),
  rideLookAt: new THREE.Vector3(),
  mountRide: null as (() => void) | null,
  dismountRide: null as (() => void) | null,
  hideOnRide: true,
}
