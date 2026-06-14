'use client'

export function Pool() {
  return (
    <group>
      {/* Pool basin rim */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[7.4, 0.4, 7.4]} />
        <meshStandardMaterial color="#DDE3E8" />
      </mesh>
      {/* Water */}
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.6, 6.6]} />
        <meshStandardMaterial
          color="#2A8FE0"
          transparent
          opacity={0.75}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>
    </group>
  )
}
