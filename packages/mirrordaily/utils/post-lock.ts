// Lock expiry timestamp `durationMinutes` from now. Computed from a single
// Date.now() so the duration is exact — deriving it from two separate Date
// instances (the previous pattern) could roll the expiry past an extra hour
// when the wall clock crossed a minute boundary between the two reads.
export function computeLockExpireAt(durationMinutes: number): string {
  return new Date(Date.now() + durationMinutes * 60_000).toISOString()
}
