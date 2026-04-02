'use client'

export function Kitchen() {
  return (
    <group>
      {/* L-shaped counter - along back wall (z-axis) */}
      <mesh position={[0, 0.45, -2.5]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.9, 0.8]} />
        <meshStandardMaterial color="#AAAAAA" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* L-shaped counter - along side wall (x-axis) */}
      <mesh position={[-2.5, 0.45, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.9, 3.2]} />
        <meshStandardMaterial color="#AAAAAA" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Stove body */}
      <mesh position={[1.5, 0.45, -2.5]} castShadow>
        <boxGeometry args={[1, 0.9, 0.6]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      {/* Stove top plate */}
      <mesh position={[1.5, 0.91, -2.5]}>
        <boxGeometry args={[0.9, 0.02, 0.5]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* 4 burner rings */}
      <mesh position={[1.25, 0.93, -2.35]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.015, 8, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[1.75, 0.93, -2.35]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.015, 8, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[1.25, 0.93, -2.65]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.015, 8, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[1.75, 0.93, -2.65]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.015, 8, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Refrigerator */}
      <mesh position={[-1.5, 1, -2.55]} castShadow>
        <boxGeometry args={[0.8, 2, 0.7]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Fridge handle */}
      <mesh position={[-1.2, 1.2, -2.19]}>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Sink area on counter - darker inset */}
      <mesh position={[-0.3, 0.88, -2.5]}>
        <boxGeometry args={[0.5, 0.06, 0.4]} />
        <meshStandardMaterial color="#777777" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Sink basin (darker inside) */}
      <mesh position={[-0.3, 0.82, -2.5]}>
        <boxGeometry args={[0.4, 0.1, 0.3]} />
        <meshStandardMaterial color="#555555" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Wall shelves */}
      <mesh position={[0.5, 1.5, -2.85]} castShadow>
        <boxGeometry args={[2, 0.05, 0.3]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      <mesh position={[0.5, 2.0, -2.85]} castShadow>
        <boxGeometry args={[2, 0.05, 0.3]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>

      {/* Pots on counter */}
      <mesh position={[-2.5, 1.0, -0.8]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 12]} />
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-2.5, 1.0, 0.0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 12]} />
        <meshStandardMaterial color="#999999" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-2.5, 1.0, 0.6]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.18, 12]} />
        <meshStandardMaterial color="#777777" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}
