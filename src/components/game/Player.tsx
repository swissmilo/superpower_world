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
  const [isMoving, setIsMoving] = useState(false)
  const characterRef = useRef<THREE.Group>(null)

  const [, getKeys] = useKeyboardControls<Controls>()
  const playerElement = useGameStore((s) => s.playerElement)

  const color = playerElement ? ELEMENT_COLORS[playerElement] : '#4488ff'

  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return

    const keys = getKeys()
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

    // Jump
    if (keys.jump && isGrounded.current) {
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
        <CapsuleCollider args={[0.35, 0.3]} position={[0, 0.65, 0]} />
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
