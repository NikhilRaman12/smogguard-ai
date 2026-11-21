import React, { useEffect, useState, useRef } from 'react';

function getAQIColorHex(aqi) {
  if (aqi <= 50) return '#00e400';
  if (aqi <= 100) return '#ffff00';
  if (aqi <= 150) return '#ff7e00';
  if (aqi <= 200) return '#ff0000';
  if (aqi <= 300) return '#8f3f97';
  return '#7e0023';
}

function getAQICategory(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getAQIGradientStops() {
  return [
    { offset: '0%', color: '#00e400' },
    { offset: '17%', color: '#ffff00' },
    { offset: '33%', color: '#ff7e00' },
    { offset: '50%', color: '#ff0000' },
    { offset: '67%', color: '#8f3f97' },
    { offset: '100%', color: '#7e0023' },
  ];
}

export default function AQIGauge({ aqi = 0, category, dominantPollutant }) {
  const [animatedAqi, setAnimatedAqi] = useState(0);
  const gaugeRef = useRef(null);

  const radius = 90;
  const strokeWidth = 16;
  const cx = 120;
  const cy = 120;
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle; // 270 degrees
  const circumference = (totalAngle / 360) * 2 * Math.PI * radius;

  const maxAqi = 500;
  const clampedAqi = Math.min(aqi, maxAqi);
  const fillPct = clampedAqi / maxAqi;
  const offset = circumference * (1 - fillPct);

  useEffect(() => {
    let frame;
    const duration = 1200;
    const start = performance.now();
    const startVal = 0;
    const endVal = aqi;

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimatedAqi(Math.round(startVal + (endVal - startVal) * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [aqi]);

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  const gradientId = 'aqiGradient';

  return (
    <div className="flex flex-col items-center">
      <svg width="240" height="200" viewBox="0 0 240 200" ref={gaugeRef}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {getAQIGradientStops().map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={describeArc(cx, cy, radius, startAngle, endAngle)}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        <path
          d={describeArc(cx, cy, radius, startAngle, endAngle)}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.2s ease-out',
          }}
        />

        {/* AQI number in center */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          className="fill-slate-900 dark:fill-white"
          style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'Inter, system-ui' }}
        >
          {animatedAqi}
        </text>

        {/* "AQI" label */}
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          className="fill-slate-500 dark:fill-slate-400"
          style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '0.1em' }}
        >
          AQI
        </text>
      </svg>

      {/* Category */}
      <div className="mt-1 text-center">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
          style={{
            backgroundColor: getAQIColorHex(aqi) + '20',
            color: getAQIColorHex(aqi),
          }}
        >
          {category || getAQICategory(aqi)}
        </span>
      </div>

      {/* Dominant Pollutant */}
      {dominantPollutant && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Dominant: <span className="font-semibold text-slate-700 dark:text-slate-300">{dominantPollutant}</span>
        </p>
      )}
    </div>
  );
}
