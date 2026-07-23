import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * ParticleBackground — ambient particles that pulse in sync with a heartbeat.
 * Particles drift slowly, and every ~1.2s a "heartbeat pulse" ripples from center,
 * accelerating nearby particles outward like a shockwave.
 * Color adapts to the active theme via CSS variable reads.
 */
export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useAuth();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Read theme accent color from CSS variable
    const getAccentColor = () => {
      const style = getComputedStyle(document.documentElement);
      return style.getPropertyValue('--accent-cyan').trim() || '#E879A0';
    };

    // Resize handler
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      baseVx: number; baseVy: number;
      radius: number;
      opacity: number;
      pulsePhase: number;
    }

    const COUNT = Math.min(80, Math.floor(window.innerWidth / 18));
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      baseVx: (Math.random() - 0.5) * 0.35,
      baseVy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.8 + 0.6,
      opacity: Math.random() * 0.5 + 0.1,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    let heartbeatTime = 0;
    let lastPulse = 0;
    let animId: number;
    let accentColor = getAccentColor();

    // Parse hex/rgb color to rgba
    const hexToRgb = (hex: string) => {
      const clean = hex.trim().replace('#', '');
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      return isNaN(r) ? { r: 232, g: 121, b: 160 } : { r, g, b };
    };

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(time - heartbeatTime, 50);
      heartbeatTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { r, g, b } = hexToRgb(accentColor);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Heartbeat pulse every 1.2s
      const pulseInterval = 1200;
      const timeSincePulse = time - lastPulse;
      if (timeSincePulse > pulseInterval) {
        lastPulse = time;
        // Give particles a burst velocity away from center
        particles.forEach(p => {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const strength = 1.2 / (dist * 0.01 + 1);
          p.vx += (dx / dist) * strength;
          p.vy += (dy / dist) * strength;
        });
      }

      // Draw subtle pulse ring
      if (timeSincePulse < 600) {
        const progress = timeSincePulse / 600;
        const eased = 1 - Math.pow(1 - progress, 3);
        const ringRadius = eased * Math.max(canvas.width, canvas.height) * 0.7;
        const ringOpacity = (1 - eased) * 0.08;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${ringOpacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Update + draw particles
      particles.forEach(p => {
        // Dampen velocity back to base
        p.vx += (p.baseVx - p.vx) * 0.04;
        p.vy += (p.baseVy - p.vy) * 0.04;

        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);

        // Wrap edges
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Gentle opacity breathing
        const breath = Math.sin(time * 0.001 + p.pulsePhase) * 0.15 + 0.15;
        const opacity = Math.min(p.opacity + breath, 0.55);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();
      });

      // Draw faint connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const lineOpacity = (1 - dist / 110) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    // Update accent color when theme changes
    accentColor = getAccentColor();
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.65 }}
    />
  );
};
