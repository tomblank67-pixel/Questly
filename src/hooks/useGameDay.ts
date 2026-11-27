import { useEffect, useState } from 'react';
import { getGameDay } from '../lib/date';

/**
 * Current game day; re-checked every 30 s and whenever the app comes back to
 * the foreground (important for a PWA that stays open in the background).
 */
export function useGameDay(rolloverHour: number): string {
  const [day, setDay] = useState(() => getGameDay(new Date(), rolloverHour));

  useEffect(() => {
    const update = () => setDay(getGameDay(new Date(), rolloverHour));
    update();
    const timer = window.setInterval(update, 30_000);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('focus', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('focus', update);
    };
  }, [rolloverHour]);

  return day;
}
