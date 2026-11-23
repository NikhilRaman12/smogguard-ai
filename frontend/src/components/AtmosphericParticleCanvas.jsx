import React, { useEffect, useRef } from 'react';

/**
 * AtmosphericParticleCanvas:
 * Meta-style interactive particle physics visualizer.
 * Simulates ambient particulate matter (PM2.5/PM10) Brownian motion and wind drift
 * proportional to live AQI severity and wind speed.
 */
export default function AtmosphericParticleCanvas({ aqi = 150, windSpeed = 8, dominantPollutant = 'pm25' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle count scaled by AQI severity
    const count = Math.min(180, Math.max(30, Math.floor(aqi * 0.45)));
    const particles = [];

    // Color palette based on pollutant severity
    const getParticleColor = (aqiVal) => {
      if (aqiVal <= 50) return 'rgba(52, 211, 153, '; // Emerald
      if (aqiVal <= 100) return 'rgba(251, 191, 36, '; // Amber
      if (aqiVal <= 200) return 'rgba(249, 115, 22, '; // Orange
      if (aqiVal <= 300) return 'rgba(239, 68, 68, '; // Red
      return 'rgba(168, 85, 247, '; // Purple / Hazardous
    };

    const baseColor = getParticleColor(aqi);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.6,
        vx: (Math.random() - 0.5) * 0.4 + (windSpeed / 18),
        vy: (Math.random() - 0.5) * 0.35 + (aqi > 200 ? 0.25 : 0.05), // Inversion subsidence causes slight downward settling
        alpha: Math.random() * 0.55 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw atmospheric depth fog
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) / 1.1
      );
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
      gradient.addColorStop(1, aqi > 250 ? 'rgba(88, 28, 135, 0.08)' : 'rgba(15, 23, 42, 0.15)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Pulse alpha
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;
        p.alpha = Math.max(0.1, Math.min(0.7, p.alpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${baseColor}${p.alpha})`;
        ctx.shadowBlur = p.radius > 1.8 ? 8 : 0;
        ctx.shadowColor = `${baseColor}0.8)`;
        ctx.fill();

        // Update positions with boundary wrap
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [aqi, windSpeed, dominantPollutant]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl z-0 opacity-80"
    />
  );
}
