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

/** Spec format: "01d : 06h : 28m : 32s" (zero-padded, spaces around colons). */
export function formatCountdownFull(c: NonNullable<ReturnType<typeof useCountdown>>): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(c.days)}d : ${p(c.hours)}h : ${p(c.mins)}m : ${p(c.secs)}s`;
}

/** Spec date quirks: "10 Aug 26" (day not padded, 2-digit year, "Sept"). */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export function formatSpecDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

/** Spec time: 12-hour, zero-padded hour — "11:50 PM", "04:00 AM". */
export function formatSpecTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`;
}

export function formatMoney(amount: number): string {
  return `₹ ${amount.toLocaleString('en-IN')}`;
}
