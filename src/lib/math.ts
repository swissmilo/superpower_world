export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function distanceBetween(x1: number, z1: number, x2: number, z2: number): number {
  const dx = x2 - x1
  const dz = z2 - z1
  return Math.sqrt(dx * dx + dz * dz)
}

export function sphericalToCartesian(
  radius: number,
  polar: number,
  azimuth: number
): [number, number, number] {
  const x = radius * Math.sin(polar) * Math.sin(azimuth)
  const y = radius * Math.cos(polar)
  const z = radius * Math.sin(polar) * Math.cos(azimuth)
  return [x, y, z]
}

export function forwardFromAzimuth(azimuth: number): [number, number, number] {
  return [Math.sin(azimuth), 0, Math.cos(azimuth)]
}
