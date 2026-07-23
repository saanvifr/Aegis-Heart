import React, { useState } from 'react';
import { Sliders, RefreshCw, Activity, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { GlassPanel } from '../components/UI/GlassPanel';
import { HolographicChamber } from '../components/3D/HolographicChamber';
import { RiskRing } from '../components/UI/RiskRing';
import { AssessmentFormData } from './AssessmentRoom';

interface SimulatorRoomProps {
  baseData: AssessmentFormData;
}

export const SimulatorRoom: React.FC<SimulatorRoomProps> = ({ baseData }) => {
  const [weightDelta, setWeightDelta] = useState(0);
  const [exerciseDelta, setExerciseDelta] = useState(0);
  const [sleepDelta, setSleepDelta] = useState(0);
  const [stressDelta, setStressDelta] = useState(0);
  const [bpDelta, setBpDelta] = useState(0);
  const [smokingState, setSmokingState] = useState(baseData.Smoking);

  // Compute live simulated risk score heuristic
  const baseRisk = 28.5;
  const calculatedRisk = Math.max(
    5.0,
    Math.min(
      95.0,
      baseRisk +
        weightDelta * 0.45 -
        exerciseDelta * 2.2 -
        sleepDelta * 1.8 +
        stressDelta * 1.5 +
        bpDelta * 0.3 +
        (smokingState - baseData.Smoking) * 14.0
    )
  );

  const riskDelta = (calculatedRisk - baseRisk).toFixed(1);
  const isReduced = parseFloat(riskDelta) <= 0;

  const twinState = calculatedRisk < 25 ? 'healthy' : calculatedRisk < 60 ? 'warning' : 'critical';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Header Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-xs font-mono-num mb-3 border border-[var(--accent-cyan)]/30">
          <Sliders className="w-3.5 h-3.5" />
          <span>INTERACTIVE LIFESTYLE MODULATION SANDBOX</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[color:var(--text-main)]">
          REAL-TIME CARDIO SIMULATOR
        </h2>
        <p className="text-xs text-[color:var(--text-muted)] font-mono-num mt-1">
          Adjust lifestyle sliders to project real-time risk reduction & 3D heart twin response
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Controls Sliders */}
        <GlassPanel glow="purple" title="Modulation Parameters" subtitle="Adjust Sliders" icon={Sliders} className="lg:col-span-6 space-y-6">
          
          {/* Weight Delta */}
          <div>
            <div className="flex justify-between text-xs font-mono-num text-[color:var(--text-muted)] mb-2">
              <span>WEIGHT MODIFICATION:</span>
              <span className="text-[var(--accent-cyan)] font-bold">
                {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="15"
              value={weightDelta}
              onChange={(e) => setWeightDelta(parseFloat(e.target.value))}
              className="w-full accent-[var(--accent-cyan)] cursor-pointer"
            />
          </div>

          {/* Exercise Hours Delta */}
          <div>
            <div className="flex justify-between text-xs font-mono-num text-[color:var(--text-muted)] mb-2">
              <span>WEEKLY EXERCISE CHANGE:</span>
              <span className="text-[var(--green-healthy)] font-bold">
                {exerciseDelta > 0 ? `+${exerciseDelta}` : exerciseDelta} hrs/wk
              </span>
            </div>
            <input
              type="range"
              min="-5"
              max="8"
              step="0.5"
              value={exerciseDelta}
              onChange={(e) => setExerciseDelta(parseFloat(e.target.value))}
              className="w-full accent-[var(--green-healthy)] cursor-pointer"
            />
          </div>

          {/* Sleep Hours Delta */}
          <div>
            <div className="flex justify-between text-xs font-mono-num text-[color:var(--text-muted)] mb-2">
              <span>DAILY SLEEP DURATION:</span>
              <span className="text-[var(--purple-glow)] font-bold">
                {sleepDelta > 0 ? `+${sleepDelta}` : sleepDelta} hrs/day
              </span>
            </div>
            <input
              type="range"
              min="-3"
              max="4"
              step="0.5"
              value={sleepDelta}
              onChange={(e) => setSleepDelta(parseFloat(e.target.value))}
              className="w-full accent-[var(--purple-glow)] cursor-pointer"
            />
          </div>

          {/* Systolic BP Change */}
          <div>
            <div className="flex justify-between text-xs font-mono-num text-[color:var(--text-muted)] mb-2">
              <span>BLOOD PRESSURE DELTA:</span>
              <span className="text-[var(--warning-amber)] font-bold">
                {bpDelta > 0 ? `+${bpDelta}` : bpDelta} mmHg
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              value={bpDelta}
              onChange={(e) => setBpDelta(parseFloat(e.target.value))}
              className="w-full accent-[var(--warning-amber)] cursor-pointer"
            />
          </div>

          {/* Smoking Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-[color:var(--glass-border)] text-xs font-mono-num">
            <span className="text-[color:var(--text-muted)]">TOBACCO CONSUMPTION:</span>
            <button
              onClick={() => setSmokingState(smokingState === 1 ? 0 : 1)}
              className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                smokingState === 1
                  ? 'bg-[var(--danger-rose)]/20 border-[var(--danger-rose)] text-[var(--danger-rose)]'
                  : 'bg-[var(--green-healthy)]/20 border-[var(--green-healthy)] text-[var(--green-healthy)]'
              }`}
            >
              {smokingState === 1 ? 'ACTIVE SMOKER' : 'NON-SMOKER'}
            </button>
          </div>

        </GlassPanel>

        {/* Right 3D Heart Reaction & Simulated Risk Gauge */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          <GlassPanel glow="cyan" className="h-[340px] relative">
            <div className="flex justify-between items-center z-10 relative">
              <span className="text-xs font-mono-num text-[var(--accent-cyan)]">SIMULATED TWIN REACTION</span>
              <span className="text-xs font-mono-num text-[color:var(--text-muted)]">
                DELTA SCORE: <strong className={isReduced ? 'text-[var(--green-healthy)]' : 'text-[var(--danger-rose)]'}>{isReduced ? '' : '+'}{riskDelta}%</strong>
              </span>
            </div>
            <HolographicChamber riskState={twinState} riskScore={calculatedRisk} />
          </GlassPanel>

          <GlassPanel glow="green" className="flex items-center justify-around">
            <RiskRing percentage={calculatedRisk} category={twinState === 'healthy' ? 'Low Risk' : twinState === 'warning' ? 'Moderate Risk' : 'High Risk'} />
          </GlassPanel>

        </div>

      </div>

    </div>
  );
};
