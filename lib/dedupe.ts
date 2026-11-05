const DEFAULT_TTL_MS = 15 * 60 * 1000;

const seen = new Map<string, number>();

function prune(now: number, ttlMs: number) {
  for (const [id, at] of seen) {
    if (now - at > ttlMs) {
      seen.delete(id);
    }
  }
}

/** Returns true when this id was already seen within the TTL window. */
export function isDuplicateMessage(
  id: string,
  ttlMs = DEFAULT_TTL_MS,
): boolean {
  const now = Date.now();
  prune(now, ttlMs);
  if (seen.has(id)) {
    return true;
  }
  seen.set(id, now);
  return false;
}
