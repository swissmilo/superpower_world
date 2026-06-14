// Per-frame build-mode cursor state, kept outside React to avoid re-rendering
// the scene on every pointer-move (mirrors stores/playerRefs.ts).
export const buildRefs = {
  active: false, // cursor currently over the build grid
  ghostGx: 0,
  ghostGz: 0,
  rot: 0, // 0..3 quarter turns for the piece being placed
  valid: false,
}
