import React, { useState } from 'react';
import { DigitalHeartLab3D, LabMode } from '../components/3D/DigitalHeartLab3D';
import { GlassPanel } from '../components/UI/GlassPanel';
import { Sparkles, Eye, Flame, ShieldAlert, Activity, Layers, RotateCcw } from 'lucide-react';

export const DigitalHeartLabPage: React.FC = () => {
  const [labMode, setLabMode] = useState<LabMode>('normal');
  const [showArteries, setShowArteries] = useState(true);
  const [bpm, setBpm] = useState(72);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-xs font-mono-num mb-3 border border-[var(--accent-cyan)]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>3D ANATOMICAL DIGITAL TWIN INSPECTION LABORATORY</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[color:var(--text-main)]">
          DIGITAL HEART LAB
        </h2>
        <p className="text-xs text-[color:var(--text-muted)] font-mono-num mt-1">
          Inspect 3D procedural myocardial geometry, thermal strain, and plaque density
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Laboratory Controls */}
        <GlassPanel glow="cyan" title="Lab Render Modes" subtitle="Select Visualization Mode" icon={Layers} className="lg:col-span-4 space-y-4">
          
          <button
            onClick={() => setLabMode('normal')}
            className={`w-full p-3 rounded-2xl border text-xs font-mono-num flex items-center justify-between cursor-pointer transition-all ${
              labMode === 'normal' ? 'bg-[var(--accent-cyan)]/20 border-[var(--accent-cyan)] text-[var(--accent-cyan)]' : 'bg-[color:var(--glass-border)] border-[color:var(--glass-border)] text-[color:var(--text-muted)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" /> Normal Render
            </span>
            <span>STANDARD</span>
          </button>

          <button
            onClick={() => setLabMode('wireframe')}
            className={`w-full p-3 rounded-2xl border text-xs font-mono-num flex items-center justify-between cursor-pointer transition-all ${
              labMode === 'wireframe' ? 'bg-[var(--purple-glow)]/20 border-[var(--purple-glow)] text-[var(--purple-glow)]' : 'bg-[color:var(--glass-border)] border-[color:var(--glass-border)] text-[color:var(--text-muted)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Wireframe Shell
            </span>
            <span>HOLOGRAPHIC</span>
          </button>

          <button
            onClick={() => setLabMode('thermal')}
            className={`w-full p-3 rounded-2xl border text-xs font-mono-num flex items-center justify-between cursor-pointer transition-all ${
              labMode === 'thermal' ? 'bg-[var(--danger-rose)]/20 border-[var(--danger-rose)] text-[var(--danger-rose)]' : 'bg-[color:var(--glass-border)] border-[color:var(--glass-border)] text-[color:var(--text-muted)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4" /> Thermal Infrared
            </span>
            <span>STRESS</span>
          </button>

          <button
            onClick={() => setLabMode('plaque')}
            className={`w-full p-3 rounded-2xl border text-xs font-mono-num flex items-center justify-between cursor-pointer transition-all ${
              labMode === 'plaque' ? 'bg-[var(--warning-amber)]/20 border-[var(--warning-amber)] text-[var(--warning-amber)]' : 'bg-[color:var(--glass-border)] border-[color:var(--glass-border)] text-[color:var(--text-muted)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Artery Plaque Highlight
            </span>
            <span>BLOCKAGE</span>
          </button>

          <button
            onClick={() => setLabMode('pulseWave')}
            className={`w-full p-3 rounded-2xl border text-xs font-mono-num flex items-center justify-between cursor-pointer transition-all ${
              labMode === 'pulseWave' ? 'bg-[var(--green-healthy)]/20 border-[var(--green-healthy)] text-[var(--green-healthy)]' : 'bg-[color:var(--glass-border)] border-[color:var(--glass-border)] text-[color:var(--text-muted)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4" /> Pulse Wave Shockwaves
            </span>
            <span>RHYTHM</span>
          </button>

          {/* Artery Toggle & BPM Slider */}
          <div className="pt-4 border-t border-[color:var(--glass-border)] space-y-4 font-mono-num text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[color:var(--text-muted)]">CORONARY ARTERIES:</span>
              <button
                onClick={() => setShowArteries(!showArteries)}
                className={`px-3 py-1 rounded-full border ${showArteries ? 'bg-[var(--green-healthy)]/20 border-[var(--green-healthy)] text-[var(--green-healthy)]' : 'bg-[color:var(--glass-border)] border-[color:var(--glass-border)] text-[color:var(--text-muted)]'}`}
              >
                {showArteries ? 'VISIBLE' : 'HIDDEN'}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-[color:var(--text-muted)] mb-1">
                <span>SIMULATED HEART RATE:</span>
                <span className="text-[var(--accent-cyan)] font-bold">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="50"
                max="140"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                className="w-full accent-[var(--accent-cyan)] cursor-pointer"
              />
            </div>
          </div>

        </GlassPanel>

        {/* Right 3D Inspector Chamber */}
        <GlassPanel glow="cyan" className="lg:col-span-8 h-[520px] flex flex-col justify-between">
          <DigitalHeartLab3D mode={labMode} showArteries={showArteries} bpm={bpm} />
        </GlassPanel>

      </div>

    </div>
  );
};
