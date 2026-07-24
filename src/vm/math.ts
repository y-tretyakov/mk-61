export function toRad(val: number, unit: string): number {
  if (unit === 'DEG') return val * Math.PI / 180
  if (unit === 'GRAD') return val * Math.PI / 200
  return val
}

export function fromRad(val: number, unit: string): number {
  if (unit === 'DEG') return val * 180 / Math.PI
  if (unit === 'GRAD') return val * 200 / Math.PI
  return val
}
