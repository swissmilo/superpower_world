'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'
import { useGameStore } from '@/stores/gameStore'

const RIDE_ID = 'grappling_tower'
const MOUNT_RANGE = 4
const GRAPPLE_DURATION = 1.5 // seconds per platform
const NUM_PLATFORMS = 6
const PLATFORM_HEIGHTS = [5, 10, 15, 20, 25, 30]
const TOWER_HEIGHT = 32
const CELEBRATION_DURATION = 2 // seconds at top before auto-dismount
const REWARD_COINS = 50

interface ClimbState {
  currentPlatform: number // 0-5
  elapsed: number // time since started moving to next platform
  celebrating: boolean
  celebrationTimer: number
}

function getPlatformWorldPos(index: number): THREE.Vector3 {
  return new THREE.Vector3(0, PLATFORM_HEIGHTS[index], 0)
}

function getBasePos(): THREE.Vector3 {
  return new THREE.Vector3(0, 0.15, 0)
}

export function GrapplingTower({ worldOffset = [0, 0, 0] }: { worldOffset?: [number, number, number] }) {
  const [climbing, setClimbing] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const climbStateRef = useRef<ClimbState>({
    currentPlatform: -1,
    elapsed: 0,
    celebrating: false,
    celebrationTimer: 0,
  })
  const ropeRef = useRef<THREE.Mesh>(null)
  const ropeLengthRef = useRef(0)

  // Corner positions for tower beams
  const cornerPositions = useMemo<[number, number, number][]>(() => [
    [1, TOWER_HEIGHT / 2, 1],
    [-1, TOWER_HEIGHT / 2, 1],
    [-1, TOWER_HEIGHT / 2, -1],
    [1, TOWER_HEIGHT / 2, -1],
  ], [])

  // Cross-beams at intervals
  const crossBeams = useMemo(() => {
    const beams: { position: [number, number, number]; rotation: [number, number, number]; length: number }[] = []
    for (let y = 5; y <= 30; y += 5) {
      // Connect front-left to front-right
      beams.push({ position: [0, y, 1], rotation: [0, 0, 0], length: 2 })
      // Connect back-left to back-right
      beams.push({ position: [0, y, -1], rotation: [0, 0, 0], length: 2 })
      // Connect front-left to back-left
      beams.push({ position: [-1, y, 0], rotation: [0, Math.PI / 2, 0], length: 2 })
      // Connect front-right to back-right
      beams.push({ position: [1, y, 0], rotation: [0, Math.PI / 2, 0], length: 2 })
    }
    return beams
  }, [])

  // Platform data
  const platforms = useMemo(() => {
    return PLATFORM_HEIGHTS.map((h, i) => ({
      position: [0, h, 0] as [number, number, number],
      anchorPosition: [0, h + 1.5, 0] as [number, number, number],
      index: i,
    }))
  }, [])

  // Temp vectors for lerp calculations
  const tempFrom = useMemo(() => new THREE.Vector3(), [])
  const tempTo = useMemo(() => new THREE.Vector3(), [])
  const tempCurrent = useMemo(() => new THREE.Vector3(), [])
  const tempRopeDir = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    // Mount zone check
    const mountPoint = new THREE.Vector3(worldOffset[0], worldOffset[1], worldOffset[2])
    const dist = playerRefs.position.distanceTo(mountPoint)

    if (dist < MOUNT_RANGE && !playerRefs.isOnRide && !climbing) {
      playerRefs.nearRide = RIDE_ID
      playerRefs.mountRide = () => {
        playerRefs.isOnRide = true
        playerRefs.currentRide = RIDE_ID
        playerRefs.hideOnRide = false
        setClimbing(true)
        climbStateRef.current = {
          currentPlatform: -1, // start below first platform
          elapsed: 0,
          celebrating: false,
          celebrationTimer: 0,
        }
      }
      playerRefs.dismountRide = () => {
        playerRefs.isOnRide = false
        playerRefs.currentRide = null
        playerRefs.nearRide = null
        playerRefs.hideOnRide = true
        setClimbing(false)
        setCelebrating(false)
        climbStateRef.current.currentPlatform = -1
      }
    } else if (playerRefs.nearRide === RIDE_ID && !playerRefs.isOnRide && !climbing) {
      playerRefs.nearRide = null
      playerRefs.mountRide = null
    }

    // Handle climbing
    if (playerRefs.isOnRide && playerRefs.currentRide === RIDE_ID && climbing) {
      const cs = climbStateRef.current

      if (cs.celebrating) {
        // At the top, celebration timer
        cs.celebrationTimer += delta
        const topPos = getPlatformWorldPos(NUM_PLATFORMS - 1)
        playerRefs.ridePosition.set(
          worldOffset[0] + topPos.x,
          worldOffset[1] + topPos.y + 1,
          worldOffset[2] + topPos.z
        )
        playerRefs.rideLookAt.set(
          worldOffset[0] + topPos.x,
          worldOffset[1] + topPos.y + 4,
          worldOffset[2] + topPos.z
        )

        if (cs.celebrationTimer >= CELEBRATION_DURATION) {
          // Auto-dismount, teleport player to base
          playerRefs.isOnRide = false
          playerRefs.currentRide = null
          playerRefs.nearRide = null
          playerRefs.hideOnRide = true
          // Set ride position to base so player lands near base
          playerRefs.ridePosition.set(worldOffset[0], worldOffset[1] + 1, worldOffset[2])
          setClimbing(false)
          setCelebrating(false)
          cs.currentPlatform = -1
          cs.celebrating = false
        }
        return
      }

      cs.elapsed += delta
      const t = Math.min(cs.elapsed / GRAPPLE_DURATION, 1)

      // Determine from/to positions
      const nextPlatform = cs.currentPlatform + 1
      if (cs.currentPlatform < 0) {
        tempFrom.copy(getBasePos())
      } else {
        tempFrom.copy(getPlatformWorldPos(cs.currentPlatform))
        tempFrom.y += 1 // stand on top of platform
      }

      if (nextPlatform < NUM_PLATFORMS) {
        tempTo.copy(getPlatformWorldPos(nextPlatform))
        tempTo.y += 1 // stand on top
      }

      // Lerp position
      tempCurrent.lerpVectors(tempFrom, tempTo, t)

      playerRefs.ridePosition.set(
        worldOffset[0] + tempCurrent.x,
        worldOffset[1] + tempCurrent.y,
        worldOffset[2] + tempCurrent.z
      )
      playerRefs.rideLookAt.set(
        worldOffset[0] + tempCurrent.x,
        worldOffset[1] + tempCurrent.y + 3,
        worldOffset[2] + tempCurrent.z
      )

      // Update rope visual
      if (ropeRef.current && nextPlatform < NUM_PLATFORMS) {
        const anchorPos = new THREE.Vector3(0, PLATFORM_HEIGHTS[nextPlatform] + 1.5, 0)
        tempRopeDir.subVectors(anchorPos, tempCurrent)
        const ropeLength = tempRopeDir.length()
        ropeLengthRef.current = ropeLength

        // Position rope at midpoint between player and anchor
        const midX = (tempCurrent.x + anchorPos.x) / 2
        const midY = (tempCurrent.y + anchorPos.y) / 2
        const midZ = (tempCurrent.z + anchorPos.z) / 2
        ropeRef.current.position.set(midX, midY, midZ)

        // Orient rope to point from player toward anchor
        ropeRef.current.lookAt(anchorPos)
        ropeRef.current.rotateX(Math.PI / 2)
        ropeRef.current.scale.set(1, ropeLength, 1)
      }

      // Advance to next platform when timer completes
      if (t >= 1) {
        cs.currentPlatform = nextPlatform
        cs.elapsed = 0

        // Check if reached the top
        if (cs.currentPlatform >= NUM_PLATFORMS - 1) {
          cs.celebrating = true
          cs.celebrationTimer = 0
          setCelebrating(true)
          useGameStore.getState().addCurrency(REWARD_COINS)
        }
      }
    }
  })

  const showRope = climbing && !celebrating && climbStateRef.current.currentPlatform < NUM_PLATFORMS - 1

  return (
    <group>
      {/* 4 vertical beam columns */}
      {cornerPositions.map((pos, i) => (
        <mesh key={`beam-${i}`} position={pos} castShadow>
          <cylinderGeometry args={[0.12, 0.12, TOWER_HEIGHT, 8]} />
          <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Cross-beams */}
      {crossBeams.map((beam, i) => (
        <mesh key={`cross-${i}`} position={beam.position} rotation={beam.rotation}>
          <boxGeometry args={[beam.length, 0.1, 0.1]} />
          <meshStandardMaterial color="#666666" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

      {/* Base platform */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[4, 0.3, 4]} />
        <meshStandardMaterial color="#777777" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Climbing platforms with anchor points */}
      {platforms.map((plat) => (
        <group key={`plat-${plat.index}`}>
          {/* Platform */}
          <mesh position={plat.position} castShadow>
            <boxGeometry args={[3, 0.3, 3]} />
            <meshStandardMaterial color="#8B6914" />
          </mesh>
          {/* Anchor point (glowing sphere) */}
          <mesh position={plat.anchorPosition}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* Flag at the top */}
      <group position={[0, 30.15, 0]}>
        {/* Pole */}
        <mesh position={[1.2, 2, 1.2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 4, 6]} />
          <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Flag triangle - approximated with a flat box */}
        <mesh position={[1.7, 3.5, 1.2]} castShadow>
          <boxGeometry args={[1, 0.6, 0.02]} />
          <meshStandardMaterial color="#CC2222" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Rope visual (thin cylinder oriented between player and anchor) */}
      {showRope && (
        <mesh ref={ropeRef}>
          <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
          <meshStandardMaterial color="#DEB887" />
        </mesh>
      )}

      {/* Celebration sparkles at top */}
      {celebrating && (
        <group position={[0, 31, 0]}>
          <Sparkles
            count={40}
            scale={4}
            size={3}
            speed={2}
            color="#FFD700"
          />
        </group>
      )}

      {/* "Press Space" indicator */}
      {playerRefs.nearRide === RIDE_ID && !playerRefs.isOnRide && (
        <Billboard position={[0, 3, 0]}>
          <Text
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            Press Space to Climb
          </Text>
        </Billboard>
      )}

      {/* Climbing indicator */}
      {climbing && !celebrating && (
        <Billboard position={[0, 4, 0]}>
          <Text
            fontSize={0.35}
            color="#00FF88"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#000000"
          >
            {`Platform ${climbStateRef.current.currentPlatform + 2}/${NUM_PLATFORMS} - Space to cancel`}
          </Text>
        </Billboard>
      )}

      {/* Celebration text */}
      {celebrating && (
        <Billboard position={[0, 34, 0]}>
          <Text
            fontSize={0.6}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {`+${REWARD_COINS} coins!`}
          </Text>
        </Billboard>
      )}
    </group>
  )
}
