import { useEffect, useMemo, useState } from 'react';

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

function getTimeParts(targetDate) {
  const now = Date.now();
  const target = targetDate.getTime();
  const difference = Math.max(target - now, 0);

  return {
    total: difference,
    days: Math.floor(difference / DAY),
    hours: Math.floor((difference % DAY) / HOUR),
    minutes: Math.floor((difference % HOUR) / MINUTE),
    seconds: Math.floor((difference % MINUTE) / SECOND),
  };
}

function pad(value) {
  return String(value).padStart(2, '0');
}

export default function DropCountdown({ target = '2026-10-04T10:00:00+01:00' }) {
  const targetDate = useMemo(() => new Date(target), [target]);
  const [time, setTime] = useState(() => getTimeParts(targetDate));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(getTimeParts(targetDate));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  const isLive = time.total <= 0;

  return (
    <div className="drop-countdown" aria-live="polite">
      <p className="drops-eyebrow">Drop 002 Countdown</p>
      <h3>{isLive ? 'DROP 002 IS LIVE' : 'DROP 002 OPENS IN'}</h3>
      <div className="drop-countdown__grid" role="timer" aria-label="Drop 002 countdown timer">
        <div>
          <strong>{time.days}</strong>
          <span>Days</span>
        </div>
        <div>
          <strong>{pad(time.hours)}</strong>
          <span>Hours</span>
        </div>
        <div>
          <strong>{pad(time.minutes)}</strong>
          <span>Minutes</span>
        </div>
        <div>
          <strong>{pad(time.seconds)}</strong>
          <span>Seconds</span>
        </div>
      </div>
      <p className="drop-countdown__date">Target release: 04 October 2026</p>
    </div>
  );
}
