import React, { useEffect, useRef, useState } from 'react';

interface ECGStripProps {
  riskScore?: number;       // 0-100, affects BPM and wave amplitude
  compact?: boolean;        // if true, renders small in-dashboard strip
  showStats?: boolean;
  className?: string;
}

/**
 * LiveECGStrip — A real-time animated electrocardiogram canvas.
 * - Generates a clinically-shaped PQRST waveform
 * - BPM adapts to riskScore (higher risk = higher BPM, irregular rhythm)
 * - Scrolls left like a real cardiac monitor
 * - Glowing green (healthy) or amber/red (risk) trace
 */
export const LiveECGStrip: React.FC<ECGStripProps> = ({
  riskScore = 18,
  compact = false,
  showStats = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bpm, setBpm] = useState(72);
  const [rhythm, setRhythm] = useState('Normal Sinus');

  useEffect(() => {
    // Calculate physiological BPM from risk score
    const computedBpm = Math.round(60 + riskScore * 0.85);
    setBpm(computedBpm);
    if (riskScore < 25) setRhythm('Normal Sinus');
    else if (riskScore < 50) setRhythm('Sinus Tachycardia');
    else if (riskScore < 75) setRhythm('Borderline Arrhythmia');
    else setRhythm('Irregular Rhythm');
  }, [riskScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const midY = H / 2;

    // Color based on risk
    const traceColor = riskScore < 25 ? '#4ADE80'
      : riskScore < 50 ? '#FBBF24'
      : riskScore < 75 ? '#FB923C'
      : '#F43F5E';

    const glowColor = traceColor;

    // PQRST waveform generator (normalized 0-1 time within one heartbeat)
    const pqrstWave = (t: number, amplitude: number): number => {
      // t is 0..1 for one full beat
      // P wave: small bump at t=0.1
      const p = amplitude * 0.15 * Math.exp(-Math.pow((t - 0.1) / 0.04, 2));
      // Q dip: tiny negative at t=0.2
      const q = -amplitude * 0.05 * Math.exp(-Math.pow((t - 0.2) / 0.015, 2));
      // R spike: tall positive at t=0.25
      const r = amplitude * 1.0 * Math.exp(-Math.pow((t - 0.25) / 0.018, 2));
      // S dip: negative after R
      const s = -amplitude * 0.25 * Math.exp(-Math.pow((t - 0.32) / 0.022, 2));
      // T wave: broad bump at t=0.5
      const twave = amplitude * 0.35 * Math.exp(-Math.pow((t - 0.5) / 0.07, 2));
      // Slight noise for realism
      const noise = riskScore > 50 ? (Math.random() - 0.5) * amplitude * 0.04 : 0;
      return p + q + r + s + twave + noise;
    };

    // Precompute one full beat worth of Y values at current BPM
    const computedBpm = Math.round(60 + riskScore * 0.85);
    const beatDurationMs = (60 / computedBpm) * 1000;
    const amplitude = compact ? H * 0.28 : H * 0.34;

    // Data buffer — scrolling ECG
    const bufferLen = W;
    const dataBuffer = new Float32Array(bufferLen).fill(0);

    let phaseMs = 0;       // ms into current beat
    let lastTime = 0;
    let animId: number;

    // Extra irregularity for high risk
    let irregularOffset = 0;

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      const dt = Math.min(time - lastTime, 50);
      lastTime = time;

      // Advance phase
      phaseMs += dt;
      const effectiveDuration = beatDurationMs + irregularOffset;
      if (phaseMs > effectiveDuration) {
        phaseMs -= effectiveDuration;
        // Vary next beat slightly for realism
        irregularOffset = riskScore > 60
          ? (Math.random() - 0.5) * beatDurationMs * 0.3
          : (Math.random() - 0.5) * beatDurationMs * 0.05;
      }

      const t = phaseMs / effectiveDuration;
      const newY = pqrstWave(t, amplitude);

      // Shift buffer left and push new sample
      dataBuffer.copyWithin(0, 1);
      dataBuffer[bufferLen - 1] = newY;

      // Clear
      ctx.clearRect(0, 0, W, H);

      // Draw grid lines (subtle)
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Draw glow (wide, soft)
      ctx.beginPath();
      ctx.moveTo(0, midY);
      for (let i = 0; i < bufferLen; i++) {
        ctx.lineTo(i, midY - dataBuffer[i]);
      }
      ctx.strokeStyle = glowColor + '30';
      ctx.lineWidth = compact ? 6 : 9;
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Draw main trace
      ctx.beginPath();
      ctx.moveTo(0, midY);
      for (let i = 0; i < bufferLen; i++) {
        ctx.lineTo(i, midY - dataBuffer[i]);
      }
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = compact ? 1.5 : 2;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = compact ? 8 : 14;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Scan line (moving cursor at right edge)
      const scanX = bufferLen - 1;
      const grad = ctx.createLinearGradient(scanX - 60, 0, scanX, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, glowColor + '35');
      ctx.fillStyle = grad;
      ctx.fillRect(scanX - 60, 0, 60, H);

      // Bright dot at current position
      const curY = midY - dataBuffer[bufferLen - 1];
      ctx.beginPath();
      ctx.arc(scanX, curY, compact ? 2 : 3, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    lastTime = performance.now();
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [riskScore, compact]);

  const traceColor = riskScore < 25 ? '#4ADE80'
    : riskScore < 50 ? '#FBBF24'
    : riskScore < 75 ? '#FB923C'
    : '#F43F5E';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showStats && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: traceColor }} />
            <span className="text-xs font-mono-num font-bold" style={{ color: traceColor }}>LIVE ECG</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase">Heart Rate</p>
              <p className="font-heading font-extrabold text-lg leading-none" style={{ color: traceColor }}>{bpm} <span className="text-xs font-normal">bpm</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase">Rhythm</p>
              <p className="text-xs font-semibold font-mono-num" style={{ color: traceColor }}>{rhythm}</p>
            </div>
          </div>
        </div>
      )}

      <div className="relative rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${traceColor}20` }}>
        <canvas
          ref={canvasRef}
          width={compact ? 400 : 800}
          height={compact ? 70 : 120}
          className="w-full"
          style={{ display: 'block' }}
        />
        {/* Corner label */}
        <div className="absolute top-1.5 left-2 text-[9px] font-mono-num opacity-40" style={{ color: traceColor }}>
          LEAD II · {(60 / bpm * 1000).toFixed(0)}ms/beat
        </div>
      </div>
    </div>
  );
};
