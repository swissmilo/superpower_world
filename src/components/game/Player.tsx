'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, type RapierRigidBody } from '@react-three/rapier'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { Controls } from '@/hooks/useKeyboard'
import { CharacterModel } from './CharacterModel'
import { ThirdPersonCamera } from './ThirdPersonCamera'
import { useGameStore } from '@/stores/gameStore'
import { playerRefs } from '@/stores/playerRefs'

const MOVE_SPEED = 6
const JUMP_VELOCITY = 8
const PLAYER_SPAWN: [number, number, number] = [0, 3, 10]

const ELEMENT_COLORS: Record<string, string> = {
  fire: '#FF4500',
  water: '#1E90FF',
  ice: '#00CED1',
  lightning: '#FFD700',
  earth: '#8B4513',
  nature: '#32CD32',
}

export function Player() {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const playerPositionRef = useRef(new THREE.Vector3(...PLAYER_SPAWN))
  const azimuthRef = useRef(0)
  const isGrounded = useRef(true)
  const regenAccum = useRef(0)
  const [isMoving, setIsMoving] = useState(false)
  const characterRef = useRef<THREE.Group>(null)
  const prevJump = useRef(false)
  const dismountCooldown = useRef(0)

  const [, getKeys] = useKeyboardControls<Controls>()
  const playerElement = useGameStore((s) => s.playerElement)

  const color = playerElement ? ELEMENT_COLORS[playerElement] : '#4488ff'

  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return

    // Check for respawn teleport
    const respawnPos = useGameStore.getState().respawnPosition
    if (respawnPos) {
      rigidBodyRef.current.setTranslation(
        { x: respawnPos[0], y: respawnPos[1], z: respawnPos[2] },
        true
      )
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      useGameStore.setState({ respawnPosition: null })
      if (playerRefs.isOnRide) {
        playerRefs.isOnRide = false
        playerRefs.currentRide = null
      }
    }

    // Tick dismount cooldown (prevents immediate re-mount)
    if (dismountCooldown.current > 0) {
      dismountCooldown.current -= delta
    }

    const keys = getKeys()
    const jumpJustPressed = keys.jump && !prevJump.current
    prevJump.current = keys.jump

    // Ride mount/dismount on Space press
    if (jumpJustPressed && dismountCooldown.current <= 0) {
      if (playerRefs.isOnRide) {
        // Dismount
        if (playerRefs.dismountRide) {
          playerRefs.dismountRide()
        }
        playerRefs.isOnRide = false
        playerRefs.currentRide = null
        playerRefs.mountRide = null
        playerRefs.dismountRide = null
        playerRefs.nearRide = null
        dismountCooldown.current = 1.0 // 1 second cooldown before can remount
        // Teleport player away from ride
        const rp = playerRefs.ridePosition
        rigidBodyRef.current.setTranslation({ x: rp.x + 3, y: rp.y + 1.5, z: rp.z + 3 }, true)
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        // Update position refs immediately
        const pos = rigidBodyRef.current.translation()
        playerPositionRef.current.set(pos.x, pos.y, pos.z)
        playerRefs.position.set(pos.x, pos.y, pos.z)
        return
      } else if (playerRefs.nearRide && playerRefs.mountRide) {
        // Mount
        playerRefs.mountRide()
        return
      }
    }

    // When on a ride: freeze player, follow ride position
    if (playerRefs.isOnRide) {
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      rigidBodyRef.current.setTranslation(
        { x: playerRefs.ridePosition.x, y: playerRefs.ridePosition.y, z: playerRefs.ridePosition.z },
        true
      )
      const pos = rigidBodyRef.current.translation()
      playerPositionRef.current.set(pos.x, pos.y, pos.z)
      playerRefs.position.set(pos.x, pos.y, pos.z)
      setIsMoving(false)

      // Hide character while riding
      if (characterRef.current) characterRef.current.visible = false
      return
    }

    // Show character when not riding
    if (characterRef.current && !characterRef.current.visible) {
      characterRef.current.visible = true
    }

    const velocity = rigidBodyRef.current.linvel()

    // Calculate movement direction relative to camera azimuth
    const az = azimuthRef.current
    const forward = new THREE.Vector3(
      -Math.sin(az),
      0,
      -Math.cos(az)
    )
    const right = new THREE.Vector3(
      Math.cos(az),
      0,
      -Math.sin(az)
    )

    const moveDirection = new THREE.Vector3(0, 0, 0)
    if (keys.forward) moveDirection.add(forward)
    if (keys.backward) moveDirection.sub(forward)
    if (keys.left) moveDirection.sub(right)
    if (keys.right) moveDirection.add(right)

    const moving = moveDirection.length() > 0.1
    setIsMoving(moving)

    if (moving) {
      moveDirection.normalize()
    }

    // Apply horizontal velocity (with speed multiplier from powers + upgrades)
    const upgradeSpeed = useGameStore.getState().getSpeedMultiplier()
    const speed = MOVE_SPEED * playerRefs.speedMultiplier * upgradeSpeed
    rigidBodyRef.current.setLinvel(
      {
        x: moveDirection.x * speed,
        y: velocity.y,
        z: moveDirection.z * speed,
      },
      true
    )

    // Jump (only when not near a ride, so Space is used for ride mount)
    if (keys.jump && isGrounded.current && !playerRefs.nearRide) {
      rigidBodyRef.current.setLinvel(
        { x: velocity.x, y: JUMP_VELOCITY, z: velocity.z },
        true
      )
      isGrounded.current = false
    }

    // Check if grounded (simple y-velocity check)
    if (Math.abs(velocity.y) < 0.1) {
      isGrounded.current = true
    }

    // Health regeneration (2 HP per second)
    const store = useGameStore.getState()
    if (store.playerHealth < store.playerMaxHealth && store.phase === 'playing') {
      regenAccum.current += 2 * delta
      if (regenAccum.current >= 1) {
        const amount = Math.floor(regenAccum.current)
        store.heal(amount)
        regenAccum.current -= amount
      }
    }

    // Update player position ref for camera and shared refs for powers
    const pos = rigidBodyRef.current.translation()
    playerPositionRef.current.set(pos.x, pos.y, pos.z)
    playerRefs.position.set(pos.x, pos.y, pos.z)
    playerRefs.azimuth = azimuthRef.current

    // Rotate character model to face movement direction
    if (moving && characterRef.current) {
      const targetAngle = Math.atan2(moveDirection.x, moveDirection.z)
      const currentRotation = characterRef.current.rotation.y
      const diff = targetAngle - currentRotation
      const wrappedDiff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
      characterRef.current.rotation.y += wrappedDiff * Math.min(1, delta * 10)
    }

    // Reset if fallen off world
    if (pos.y < -20) {
      rigidBodyRef.current.setTranslation(
        { x: PLAYER_SPAWN[0], y: PLAYER_SPAWN[1], z: PLAYER_SPAWN[2] },
        true
      )
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
  })

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        type="dynamic"
        position={PLAYER_SPAWN}
        lockRotations
        mass={1}
        linearDamping={0.5}
      >
        <CapsuleCollider args={[0.35, 0.3]} position={[0, 0.75, 0]} />
        <group ref={characterRef}>
          <CharacterModel elementColor={color} isMoving={isMoving} />
        </group>
      </RigidBody>

      <ThirdPersonCamera
        playerPositionRef={playerPositionRef}
        azimuthRef={azimuthRef}
      />
    </>
  )
}
