const map = new Map<string, { count: number; until: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60 * 1000) {
  const now = Date.now();
  const entry = map.get(key);

  if (!entry || entry.until < now) {
    map.set(key, { count: 1, until: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.until - now) / 1000) };
  }

  entry.count += 1;
  map.set(key, entry);
  return { ok: true, remaining: limit - entry.count };
}
