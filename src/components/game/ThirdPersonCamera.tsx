'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { usePointerLock } from '@/hooks/usePointerLock'

const CAMERA_DISTANCE_DEFAULT = 10
const CAMERA_DISTANCE_MIN = 4
const CAMERA_DISTANCE_MAX = 18
const CAMERA_SENSITIVITY = 0.003
const CAMERA_SMOOTHING = 5
const CAMERA_HEIGHT_OFFSET = 1.5

interface ThirdPersonCameraProps {
  playerPositionRef: React.RefObject<THREE.Vector3 | null>
  azimuthRef: React.RefObject<number>
}

export function ThirdPersonCamera({ playerPositionRef, azimuthRef }: ThirdPersonCameraProps) {
  const { camera } = useThree()
  const { consumeMovement } = usePointerLock()

  const polar = useRef(Math.PI / 4)
  const distance = useRef(CAMERA_DISTANCE_DEFAULT)
  const currentPos = useRef(new THREE.Vector3(0, 8, 10))

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      distance.current = THREE.MathUtils.clamp(
        distance.current + e.deltaY * 0.01,
        CAMERA_DISTANCE_MIN,
        CAMERA_DISTANCE_MAX
      )
    }
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  useFrame((_, delta) => {
    if (!playerPositionRef.current) return

    // Consume mouse movement for camera rotation
    const movement = consumeMovement()
    if (azimuthRef.current !== undefined) {
      ;(azimuthRef as React.MutableRefObject<number>).current -= movement.x * CAMERA_SENSITIVITY
    }
    polar.current = THREE.MathUtils.clamp(
      polar.current - movement.y * CAMERA_SENSITIVITY,
      0.2,
      Math.PI / 2.2
    )

    const az = azimuthRef.current ?? 0

    // Calculate target camera position using spherical coordinates
    const targetPos = new THREE.Vector3(
      playerPositionRef.current.x + distance.current * Math.sin(polar.current) * Math.sin(az),
      playerPositionRef.current.y + CAMERA_HEIGHT_OFFSET + distance.current * Math.cos(polar.current),
      playerPositionRef.current.z + distance.current * Math.sin(polar.current) * Math.cos(az)
    )

    // Smooth camera follow
    const smoothFactor = 1 - Math.exp(-CAMERA_SMOOTHING * delta)
    currentPos.current.lerp(targetPos, smoothFactor)

    camera.position.copy(currentPos.current)

    // Look at player (slightly above feet)
    const lookTarget = new THREE.Vector3(
      playerPositionRef.current.x,
      playerPositionRef.current.y + CAMERA_HEIGHT_OFFSET,
      playerPositionRef.current.z
    )
    camera.lookAt(lookTarget)
  })

  return null
}
