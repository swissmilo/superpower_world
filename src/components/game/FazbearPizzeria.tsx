'use client'

import { RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import { Stage } from './fnaf/Stage'
import { EatingArea } from './fnaf/EatingArea'
import { Kitchen } from './fnaf/Kitchen'
import { StorageRoom } from './fnaf/StorageRoom'
import { SecurityRoom } from './fnaf/SecurityRoom'
import { TicketGate } from './fnaf/TicketGate'
import { Animatronic } from './fnaf/Animatronic'

const FACILITY_WORLD_OFFSET: [number, number, number] = [200, 0, -200]

// Building dimensions
const BUILDING_W = 30 // x
const BUILDING_D = 25 // z
const WALL_H = 4
const WALL_T = 0.3

function Wall({ position, args }: { position: [number, number, number]; args: [number, number, number] }) {
  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <mesh castShadow receiveShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial color="#8B7D6B" />
      </mesh>
    </RigidBody>
  )
}

function InteriorWall({ position, args, color = '#A0937D' }: { position: [number, number, number]; args: [number, number, number]; color?: string }) {
  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <mesh>
        <boxGeometry args={args} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

export function FazbearPizzeria() {
  // Building is centered at [0,0,0] in local coords
  // Front faces +Z (toward world center)
  const bx = BUILDING_W / 2
  const bz = BUILDING_D / 2

  return (
    <group>
      {/* Parking lot ground */}
      <mesh position={[0, 0.02, 5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Building floor */}
      <RigidBody type="fixed" position={[0, 0.05, 0]} colliders="cuboid">
        <mesh receiveShadow>
          <boxGeometry args={[BUILDING_W, 0.1, BUILDING_D]} />
          <meshStandardMaterial color="#D4A847" />
        </mesh>
      </RigidBody>

      {/* Floor tile accent (darker checkerboard feel) */}
      <mesh position={[0, 0.11, 0]} receiveShadow>
        <boxGeometry args={[BUILDING_W - 0.5, 0.01, BUILDING_D - 0.5]} />
        <meshStandardMaterial color="#C49837" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, WALL_H, 0]}>
        <boxGeometry args={[BUILDING_W, 0.2, BUILDING_D]} />
        <meshStandardMaterial color="#666655" />
      </mesh>

      {/* Ceiling lights */}
      {[-8, 0, 8].map((x, i) => (
        <mesh key={`light-${i}`} position={[x, WALL_H - 0.3, 0]}>
          <boxGeometry args={[1.5, 0.1, 0.3]} />
          <meshStandardMaterial color="#FFFFEE" emissive="#FFFFCC" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* === EXTERIOR WALLS === */}
      {/* Back wall (full) */}
      <Wall position={[0, WALL_H / 2, -bz]} args={[BUILDING_W, WALL_H, WALL_T]} />
      {/* Left wall (full) */}
      <Wall position={[-bx, WALL_H / 2, 0]} args={[WALL_T, WALL_H, BUILDING_D]} />
      {/* Right wall (full) */}
      <Wall position={[bx, WALL_H / 2, 0]} args={[WALL_T, WALL_H, BUILDING_D]} />
      {/* Front wall - left section */}
      <Wall position={[-8, WALL_H / 2, bz]} args={[14, WALL_H, WALL_T]} />
      {/* Front wall - right section (entrance gap ~6 units wide on the right) */}
      <Wall position={[11, WALL_H / 2, bz]} args={[8, WALL_H, WALL_T]} />
      {/* Front wall - above entrance */}
      <Wall position={[4, WALL_H - 0.5, bz]} args={[6, 1, WALL_T]} />

      {/* === INTERIOR WALLS === */}
      {/* Wall between stage and eating area (runs front-to-back, with doorway gap at front) */}
      <InteriorWall position={[-5, WALL_H / 2, 2]} args={[WALL_T, WALL_H, 10]} />
      {/* Wall between stage and eating area (upper section) */}
      <InteriorWall position={[-5, WALL_H / 2, -6]} args={[WALL_T, WALL_H, 6]} />

      {/* Wall between kitchen and storage (back rooms divider) */}
      <InteriorWall position={[0, WALL_H / 2, -9]} args={[WALL_T, WALL_H, 8]} />

      {/* Wall separating back rooms from front rooms */}
      {/* Left section (behind stage, with doorway) */}
      <InteriorWall position={[-10, WALL_H / 2, -5]} args={[10, WALL_H, WALL_T]} />
      {/* Right section (behind eating area, with doorway) */}
      <InteriorWall position={[8, WALL_H / 2, -5]} args={[14, WALL_H, WALL_T]} />

      {/* Security room walls */}
      <InteriorWall position={[-5, WALL_H / 2, 8]} args={[WALL_T, WALL_H, 5]} />
      <InteriorWall position={[-9, WALL_H / 2, 5.5]} args={[8, WALL_H, WALL_T]} />

      {/* === SIGN === */}
      <group position={[4, WALL_H + 1, bz + 0.5]}>
        {/* Sign backing */}
        <mesh>
          <boxGeometry args={[10, 2, 0.2]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <Text
          position={[0, 0, 0.15]}
          fontSize={0.7}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#FF4500"
          font={undefined}
        >
          {"FREDDY FAZBEAR'S PIZZA"}
        </Text>
      </group>

      {/* Stars on sign */}
      {[-4, 4].map((x, i) => (
        <mesh key={`star-${i}`} position={[4 + x, WALL_H + 1, bz + 0.7]}>
          <dodecahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* === ROOMS === */}
      {/* Stage (left side, middle area) */}
      <group position={[-10, 0.1, 0]}>
        <Stage />
      </group>

      {/* Eating Area (right side, middle area) */}
      <group position={[5, 0.1, 2]}>
        <EatingArea />
      </group>

      {/* Kitchen (back left) */}
      <group position={[-10, 0.1, -9]}>
        <Kitchen />
      </group>

      {/* Storage Room (back right) */}
      <group position={[8, 0.1, -9]}>
        <StorageRoom />
      </group>

      {/* Security Room (front left) */}
      <group position={[-10, 0.1, 8]}>
        <SecurityRoom />
      </group>

      {/* Ticket Gate (at entrance) */}
      <group position={[4, 0.1, bz - 1]}>
        <TicketGate />
      </group>

      {/* === ANIMATRONICS === */}
      <Animatronic
        character="freddy"
        worldOffset={FACILITY_WORLD_OFFSET}
        patrolPoints={[
          [-10, 0.1, 0],     // Stage (home)
          [-3, 0.1, 2],      // Near stage entrance
          [5, 0.1, 3],       // Eating area
          [5, 0.1, -2],      // Eating area back
          [-3, 0.1, -2],     // Hallway
          [-10, 0.1, 0],     // Back to stage
        ]}
      />
      <Animatronic
        character="chica"
        worldOffset={FACILITY_WORLD_OFFSET}
        patrolPoints={[
          [-8, 0.1, 0],      // Stage (home)
          [5, 0.1, 5],       // Eating area front
          [10, 0.1, 2],      // Eating area right
          [-10, 0.1, -9],    // Kitchen
          [5, 0.1, 0],       // Back to eating area
          [-8, 0.1, 0],      // Back to stage
        ]}
      />
      <Animatronic
        character="foxy"
        worldOffset={FACILITY_WORLD_OFFSET}
        patrolPoints={[
          [8, 0.1, -9],      // Storage (home - Pirate Cove vibes)
          [8, 0.1, -3],      // Hallway
          [5, 0.1, 5],       // Eating area
          [-3, 0.1, 8],      // Near security
          [5, 0.1, 0],       // Eating area center
          [8, 0.1, -9],      // Back to storage
        ]}
      />
      <Animatronic
        character="bonnie"
        worldOffset={FACILITY_WORLD_OFFSET}
        patrolPoints={[
          [-12, 0.1, 0],     // Stage (home)
          [-5, 0.1, 3],      // Stage entrance
          [3, 0.1, 6],       // Eating area
          [-10, 0.1, 8],     // Security room area
          [-5, 0.1, 0],      // Hallway
          [-12, 0.1, 0],     // Back to stage
        ]}
      />
    </group>
  )
}
