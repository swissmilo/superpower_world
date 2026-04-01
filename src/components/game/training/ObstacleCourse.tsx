'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { playerRefs } from '@/stores/playerRefs'
import { useGameStore } from '@/stores/gameStore'

const RIDE_ID = 'obstacle_course'
const MOUNT_RANGE = 3
const MOVING_PLATFORM_INDICES = [3, 7, 11]
const BOB_AMPLITUDE = 1
const BOB_PERIOD = 3 // seconds
const FALL_THRESHOLD_Y = -1
const FINISH_RANGE = 3
const CELEBRATION_DURATION = 2 // seconds

const PLATFORM_POSITIONS: [number, number, number][] = [
  [0, 0, 0],
  [3, 1, -4],
  [6, 2, -2],
  [4, 3, -7],
  [7, 4, -10],
  [3, 5, -13],
  [0, 4, -16],
  [-3, 5, -13],
  [-2, 6, -9],
  [1, 7, -6],
  [4, 8, -8],
  [-1, 6, -11],
  [2, 5, -15],
  [-2, 4, -18],
  [0, 3, -22],
]

function PlatformMarkers({ position }: { position: [number, number, number] }) {
  // Small cylinders at corners for visibility
  const markers = useMemo(() => {
    const offsets: [number, number, number][] = [
      [0.9, 0.4, 0.9],
      [-0.9, 0.4, 0.9],
      [0.9, 0.4, -0.9],
      [-0.9, 0.4, -0.9],
    ]
    return offsets.map((offset, i) => ({
      key: i,
      pos: [
        position[0] + offset[0],
        position[1] + offset[1],
        position[2] + offset[2],
      ] as [number, number, number],
    }))
  }, [position])

  return (
    <>
      {markers.map(m => (
        <mesh key={m.key} position={m.pos}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
          <meshStandardMaterial color="#FF8800" emissive="#FF4400" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </>
  )
}

export function ObstacleCourse({ worldOffset = [0, 0, 0] }: { worldOffset?: [number, number, number] }) {
  const [courseActive, setCourseActive] = useState(false)
  const [completed, setCompleted] = useState(false)
  const elapsedRef = useRef(0)
  const celebrationTimerRef = useRef(0)
  const displayTimeRef = useRef('0.0')

  // Refs for moving platform positions (so we can update them in useFrame)
  const movingPlatformRefs = useRef<Map<number, THREE.Mesh>>(new Map())

  // Current offset for each moving platform
  const movingOffsetsRef = useRef<number[]>(MOVING_PLATFORM_INDICES.map(() => 0))

  // Memoize start and finish positions
  const startWorldPos = useMemo(() => new THREE.Vector3(
    worldOffset[0] + PLATFORM_POSITIONS[0][0],
    worldOffset[1] + PLATFORM_POSITIONS[0][1],
    worldOffset[2] + PLATFORM_POSITIONS[0][2]
  ), [worldOffset])

  const finishWorldPos = useMemo(() => {
    const last = PLATFORM_POSITIONS[PLATFORM_POSITIONS.length - 1]
    return new THREE.Vector3(
      worldOffset[0] + last[0],
      worldOffset[1] + last[1],
      worldOffset[2] + last[2]
    )
  }, [worldOffset])

  // Static platform data (non-moving)
  const staticPlatforms = useMemo(() => {
    return PLATFORM_POSITIONS.map((pos, i) => ({
      index: i,
      position: pos,
      isMoving: MOVING_PLATFORM_INDICES.includes(i),
      isStart: i === 0,
      isFinish: i === PLATFORM_POSITIONS.length - 1,
    }))
  }, [])

  useFrame((_, delta) => {
    // Animate moving platforms
    const time = performance.now() / 1000
    for (let mi = 0; mi < MOVING_PLATFORM_INDICES.length; mi++) {
      const platIdx = MOVING_PLATFORM_INDICES[mi]
      const offset = Math.sin((time / BOB_PERIOD) * Math.PI * 2 + mi * 1.5) * BOB_AMPLITUDE
      movingOffsetsRef.current[mi] = offset

      const mesh = movingPlatformRefs.current.get(platIdx)
      if (mesh) {
        mesh.position.y = PLATFORM_POSITIONS[platIdx][1] + offset
      }
    }

    // Mount zone: near start platform
    const distToStart = playerRefs.position.distanceTo(startWorldPos)

    if (distToStart < MOUNT_RANGE && !playerRefs.isOnRide && !courseActive) {
      playerRefs.nearRide = RIDE_ID
      playerRefs.mountRide = () => {
        // Teleport player to start platform
        playerRefs.isOnRide = true
        playerRefs.currentRide = RIDE_ID
        playerRefs.ridePosition.set(
          startWorldPos.x,
          startWorldPos.y + 1,
          startWorldPos.z
        )
        playerRefs.rideLookAt.set(
          startWorldPos.x,
          startWorldPos.y + 2,
          startWorldPos.z - 5
        )

        // Immediately release ride lock so player can move freely
        // Use a microtask to ensure ridePosition is picked up first
        setTimeout(() => {
          playerRefs.isOnRide = false
          playerRefs.currentRide = null
        }, 50)

        // Start the course
        setCourseActive(true)
        setCompleted(false)
        elapsedRef.current = 0
        celebrationTimerRef.current = 0
        displayTimeRef.current = '0.0'
      }
      playerRefs.dismountRide = null
    } else if (playerRefs.nearRide === RIDE_ID && !courseActive) {
      playerRefs.nearRide = null
      playerRefs.mountRide = null
    }

    // Allow restart when near start during active course
    if (courseActive && !completed && distToStart < MOUNT_RANGE && !playerRefs.isOnRide) {
      playerRefs.nearRide = RIDE_ID
      playerRefs.mountRide = () => {
        // Restart: teleport back to start
        playerRefs.isOnRide = true
        playerRefs.currentRide = RIDE_ID
        playerRefs.ridePosition.set(
          startWorldPos.x,
          startWorldPos.y + 1,
          startWorldPos.z
        )
        setTimeout(() => {
          playerRefs.isOnRide = false
          playerRefs.currentRide = null
        }, 50)
        elapsedRef.current = 0
        displayTimeRef.current = '0.0'
      }
    }

    // Track course progress
    if (courseActive && !completed) {
      elapsedRef.current += delta
      displayTimeRef.current = elapsedRef.current.toFixed(1)

      // Check if player reached finish
      const distToFinish = playerRefs.position.distanceTo(finishWorldPos)
      if (distToFinish < FINISH_RANGE) {
        // Complete!
        setCompleted(true)
        celebrationTimerRef.current = 0

        const elapsed = elapsedRef.current
        let coins = 25
        if (elapsed < 15) coins = 100
        else if (elapsed < 30) coins = 50

        useGameStore.getState().addCurrency(coins)
      }

      // Check if player fell off (Y below threshold relative to world)
      const playerRelativeY = playerRefs.position.y - worldOffset[1]
      if (playerRelativeY < FALL_THRESHOLD_Y) {
        // Teleport back to start
        playerRefs.isOnRide = true
        playerRefs.currentRide = RIDE_ID
        playerRefs.ridePosition.set(
          startWorldPos.x,
          startWorldPos.y + 1,
          startWorldPos.z
        )
        setTimeout(() => {
          playerRefs.isOnRide = false
          playerRefs.currentRide = null
        }, 50)
      }
    }

    // Handle celebration timer
    if (completed) {
      celebrationTimerRef.current += delta
      if (celebrationTimerRef.current >= CELEBRATION_DURATION) {
        setCourseActive(false)
        setCompleted(false)
        playerRefs.nearRide = null
      }
    }
  })

  return (
    <group>
      {/* Platforms */}
      {staticPlatforms.map((plat) => {
        const color = plat.isStart ? '#33AA33' : plat.isFinish ? '#FFD700' : plat.isMoving ? '#AA5500' : '#888888'

        return (
          <group key={`plat-${plat.index}`}>
            <mesh
              position={plat.position}
              castShadow
              receiveShadow
              ref={plat.isMoving ? (el) => {
                if (el) movingPlatformRefs.current.set(plat.index, el)
                else movingPlatformRefs.current.delete(plat.index)
              } : undefined}
            >
              <boxGeometry args={[2, 0.4, 2]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <PlatformMarkers position={plat.position} />
          </group>
        )
      })}

      {/* START text above first platform */}
      <Billboard position={[
        PLATFORM_POSITIONS[0][0],
        PLATFORM_POSITIONS[0][1] + 2,
        PLATFORM_POSITIONS[0][2],
      ]}>
        <Text
          fontSize={0.4}
          color="#33FF33"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#000000"
        >
          START
        </Text>
      </Billboard>

      {/* Flag at finish platform */}
      <group position={[
        PLATFORM_POSITIONS[PLATFORM_POSITIONS.length - 1][0],
        PLATFORM_POSITIONS[PLATFORM_POSITIONS.length - 1][1] + 0.2,
        PLATFORM_POSITIONS[PLATFORM_POSITIONS.length - 1][2],
      ]}>
        {/* Pole */}
        <mesh position={[0.8, 1.5, 0.8]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 3, 6]} />
          <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Flag */}
        <mesh position={[1.3, 2.7, 0.8]} castShadow>
          <boxGeometry args={[1, 0.6, 0.02]} />
          <meshStandardMaterial color="#FFD700" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* "Press Space to start" indicator */}
      {playerRefs.nearRide === RIDE_ID && !courseActive && (
        <Billboard position={[
          PLATFORM_POSITIONS[0][0],
          PLATFORM_POSITIONS[0][1] + 3.5,
          PLATFORM_POSITIONS[0][2],
        ]}>
          <Text
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            Press Space to Start
          </Text>
        </Billboard>
      )}

      {/* Timer display while course is active */}
      {courseActive && !completed && (
        <Billboard position={[
          playerRefs.position.x - worldOffset[0],
          playerRefs.position.y - worldOffset[1] + 2.5,
          playerRefs.position.z - worldOffset[2],
        ]}>
          <Text
            fontSize={0.4}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#000000"
          >
            {`Time: ${displayTimeRef.current}s`}
          </Text>
        </Billboard>
      )}

      {/* Completion celebration */}
      {completed && (
        <>
          <group position={[
            PLATFORM_POSITIONS[PLATFORM_POSITIONS.length - 1][0],
            PLATFORM_POSITIONS[PLATFORM_POSITIONS.length - 1][1] + 2,
            PLATFORM_POSITIONS[PLATFORM_POSITIONS.length - 1][2],
          ]}>
            <Sparkles
              count={30}
              scale={4}
              size={3}
              speed={2}
              color="#FFD700"
            />
          </group>
          <Billboard position={[
            PLATFORM_POSITIONS[PLATFORM_POSITIONS.length - 1][0],
            PLATFORM_POSITIONS[PLATFORM_POSITIONS.length - 1][1] + 4,
            PLATFORM_POSITIONS[PLATFORM_POSITIONS.length - 1][2],
          ]}>
            <Text
              fontSize={0.5}
              color="#FFD700"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.05}
              outlineColor="#000000"
            >
              {`Complete! ${displayTimeRef.current}s`}
            </Text>
          </Billboard>
        </>
      )}
    </group>
  )
}
