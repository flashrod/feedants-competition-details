import { useEffect, useState } from 'react';

/** Ticking countdown to a target date. Returns null parts when passed. */
export function useCountdown(targetIso: string | null, tickMs = 1000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!targetIso) return;
    const id = setInterval(() => setTick((t) => t + 1), tickMs);
    return () => clearInterval(id);
  }, [targetIso, tickMs]);

  if (!targetIso) return null;
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return { days, hours, mins, secs, totalMs: diff };
}

export function formatCountdown(c: NonNullable<ReturnType<typeof useCountdown>>): string {
  const p = (n: number) => String(n).padStart(2, '0');
  if (c.days > 0) return `${c.days}d : ${p(c.hours)}h : ${p(c.mins)}m`;
  return `${p(c.hours)}h : ${p(c.mins)}m : ${p(c.secs)}s`;
}
