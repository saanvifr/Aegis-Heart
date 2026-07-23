import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, ArrowRight, ArrowLeft, User, 
  Heart, Flame, Stethoscope 
} from 'lucide-react';
import { GlassPanel } from '../components/UI/GlassPanel';
import { HolographicChamber } from '../components/3D/HolographicChamber';

export interface AssessmentFormData {
  Age: number;
  Gender: string;
  Height_cm: number;
  Weight_kg: number;
  BMI: number;
  Systolic_BP: number;
  Diastolic_BP: number;
  Heart_Rate: number;
  Cholesterol: number;
  Diabetes: number;
  Family_History: number;
  Smoking: number;
  Alcohol_Consumption: number;
  Exercise_Hours_Per_Week: number;
  Diet: string;
  Previous_Heart_Problems: number;
  Medication_Use: number;
  Stress_Level: number;
  Sedentary_Hours_Per_Day: number;
  Triglycerides: number;
  Sleep_Hours_Per_Day: number;
  Daily_Water_Intake: number;
  Chest_Pain_Type: string;
}

interface AssessmentRoomProps {
  onSubmitAssessment: (data: AssessmentFormData) => void;
}

export const AssessmentRoom: React.FC<AssessmentRoomProps> = ({ onSubmitAssessment }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<AssessmentFormData>(() => {
    const saved = localStorage.getItem('aegis_assessment_draft');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      Age: 45,
      Gender: 'Male',
      Height_cm: 175,
      Weight_kg: 78,
      BMI: 25.5,
      Systolic_BP: 130,
      Diastolic_BP: 85,
      Heart_Rate: 74,
      Cholesterol: 215,
      Diabetes: 0,
      Family_History: 1,
      Smoking: 0,
      Alcohol_Consumption: 0,
      Exercise_Hours_Per_Week: 3.5,
      Diet: 'Average',
      Previous_Heart_Problems: 0,
      Medication_Use: 0,
      Stress_Level: 5,
      Sedentary_Hours_Per_Day: 7.0,
      Triglycerides: 170,
      Sleep_Hours_Per_Day: 7.0,
      Daily_Water_Intake: 2.5,
      Chest_Pain_Type: 'Atypical Angina',
    };
  });

  // Calculate live BMI whenever Weight or Height changes
  useEffect(() => {
    if (formData.Height_cm > 0 && formData.Weight_kg > 0) {
      const heightMeters = formData.Height_cm / 100;
      const bmiCalc = parseFloat((formData.Weight_kg / (heightMeters * heightMeters)).toFixed(1));
      setFormData((prev) => ({ ...prev, BMI: bmiCalc }));
    }
  }, [formData.Height_cm, formData.Weight_kg]);

  // Draft Autosave
  useEffect(() => {
    localStorage.setItem('aegis_assessment_draft', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (field: keyof AssessmentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    else onSubmitAssessment(formData);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Real-time Hologram Risk State Calculation
  const liveRiskState = useMemo(() => {
    let warningCount = 0;
    let criticalCount = 0;

    if (formData.Systolic_BP > 140) warningCount++;
    if (formData.Systolic_BP > 180) criticalCount++;
    if (formData.Diastolic_BP > 90) warningCount++;
    if (formData.Diastolic_BP > 120) criticalCount++;
    
    if (formData.Cholesterol > 240) warningCount++;
    if (formData.Cholesterol > 300) criticalCount++;

    if (formData.Smoking === 1) warningCount++;
    if (formData.Diabetes === 1) warningCount++;
    if (formData.BMI > 30) warningCount++;
    if (formData.Previous_Heart_Problems === 1) criticalCount++;

    if (criticalCount > 0) return 'critical';
    if (warningCount >= 2) return 'warning';
    return 'healthy';
  }, [formData]);

  // UI Components
  const RangeSlider = ({ label, field, min, max, step = 1, unit = '', warningThreshold = 9999 }: any) => {
    const value = formData[field as keyof AssessmentFormData] as number;
    const isWarning = value >= warningThreshold;
    return (
      <div className="mb-6 bg-[color:var(--glass-border)] p-4 rounded-2xl border border-[color:var(--glass-border)]">
        <div className="flex justify-between items-end mb-4">
          <label className="text-[11px] font-bold font-mono-num text-[color:var(--text-muted)] uppercase tracking-widest">{label}</label>
          <span className={`text-xl font-bold font-mono-num ${isWarning ? 'text-[var(--danger-rose)] drop-shadow-[0_0_8px_rgba(255,59,48,0.5)]' : 'text-[var(--accent-cyan)]'}`}>
            {value} <span className="text-[10px] text-[color:var(--text-muted)]">{unit}</span>
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleChange(field as keyof AssessmentFormData, parseFloat(e.target.value))}
          className="w-full accent-[var(--accent-cyan)] h-1.5 bg-[color:var(--glass-border)] rounded-full appearance-none cursor-grab active:cursor-grabbing"
        />
      </div>
    );
  };

  const ToggleCapsules = ({ label, field, options }: any) => {
    const value = formData[field as keyof AssessmentFormData];
    return (
      <div className="mb-6 bg-[color:var(--glass-border)] p-4 rounded-2xl border border-[color:var(--glass-border)]">
        <label className="text-[11px] font-bold font-mono-num text-[color:var(--text-muted)] uppercase tracking-widest block mb-4">{label}</label>
        <div className="flex gap-2 flex-wrap">
          {options.map((opt: any) => (
            <button
              key={opt.value}
              onClick={() => handleChange(field as keyof AssessmentFormData, opt.value)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all border ${
                value === opt.value
                  ? 'bg-[var(--accent-cyan)]/20 border-[var(--accent-cyan)] text-[var(--accent-cyan)] shadow-[0_0_15px_rgba(255,90,0,0.3)]'
                  : 'bg-[color:var(--glass-border)] border-[color:var(--glass-border)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:border-white/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto flex items-stretch gap-8">
      
      {/* LEFT SIDE: Holographic Telemetry */}
      <div className="hidden lg:flex w-5/12 flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-[10px] font-bold font-mono-num mb-3 border border-[var(--accent-cyan)]/30 tracking-widest uppercase">
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry Uplink Active</span>
          </div>
          <h2 className="font-heading text-4xl font-extrabold text-[color:var(--text-main)] leading-tight">
            CARDIO RISK<br />SIMULATOR
          </h2>
          <p className="text-xs text-[color:var(--text-muted)] font-mono-num mt-4 max-w-sm leading-relaxed">
            Adjust clinical parameters on the right to visualize real-time hemodynamic impact on the digital twin.
          </p>
        </div>

        <div className="flex-1 relative mt-8 rounded-3xl border border-[color:var(--glass-border)] overflow-hidden bg-[color:var(--glass-border)] shadow-2xl">
          <HolographicChamber riskState={liveRiskState} interactive={true} />
          
          {/* Decorative scanner lines */}
          <div className="absolute inset-0 pointer-events-none border-[1px] border-[var(--accent-cyan)]/20 rounded-3xl mix-blend-overlay"></div>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Sliders Panel */}
      <div className="w-full lg:w-7/12 flex flex-col">
        {/* Progress Bar & Wizard Step Indicator */}
        <div className="w-full mb-8">
          <div className="flex items-center justify-between text-[10px] font-bold font-mono-num text-[color:var(--text-muted)] mb-3 tracking-widest uppercase">
            <span>STEP {currentStep} OF 4</span>
            <span className="text-[var(--accent-cyan)]">
              {currentStep === 1 && '1. BIOMETRICS'}
              {currentStep === 2 && '2. CLINICAL INDICATORS'}
              {currentStep === 3 && '3. LIFESTYLE'}
              {currentStep === 4 && '4. SYMPTOMS & HISTORY'}
            </span>
          </div>
          <div className="w-full bg-[color:var(--glass-border)] h-1.5 rounded-full overflow-hidden border border-[color:var(--glass-border)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] transition-all duration-500 shadow-[0_0_15px_rgba(255,90,0,0.6)]"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* FORM WIZARD CONTAINER */}
        <GlassPanel glow="cyan" className="w-full flex-1 p-6 sm:p-10 flex flex-col">
          <div className="flex-1">
            {/* STEP 1: PERSONAL BIOMETRICS */}
            {currentStep === 1 && (
              <div className="space-y-2 animate-fadeIn">
                <h3 className="font-heading text-2xl font-bold text-[color:var(--text-main)] flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)]/30">
                    <User className="w-5 h-5 text-[var(--accent-cyan)]" />
                  </div>
                  Personal Profile
                </h3>

                <ToggleCapsules
                  label="Biological Gender"
                  field="Gender"
                  options={[
                    { label: 'MALE', value: 'Male' },
                    { label: 'FEMALE', value: 'Female' },
                  ]}
                />

                <RangeSlider label="Age" field="Age" min={18} max={100} unit="YRS" warningThreshold={65} />
                <RangeSlider label="Height" field="Height_cm" min={120} max={220} unit="CM" />
                <RangeSlider label="Weight" field="Weight_kg" min={40} max={200} unit="KG" />

                {/* Calculated BMI Capsule */}
                <div className="p-4 mt-6 rounded-2xl bg-[color:var(--glass-border)] border border-[color:var(--glass-border)] flex items-center justify-between font-mono-num">
                  <span className="text-[11px] font-bold text-[color:var(--text-muted)] tracking-widest">LIVE BMI RATING</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-bold ${formData.BMI > 30 ? 'text-[var(--danger-rose)]' : formData.BMI > 25 ? 'text-[var(--warning-amber)]' : 'text-[var(--green-healthy)]'}`}>
                      {formData.BMI}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[color:var(--glass-border)] border border-[color:var(--glass-border)] text-[color:var(--text-main)] text-[10px] tracking-wider uppercase">
                      {formData.BMI < 18.5 ? 'Underweight' : formData.BMI < 25 ? 'Optimal' : formData.BMI < 30 ? 'Elevated' : 'Obese'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CLINICAL INDICATORS */}
            {currentStep === 2 && (
              <div className="space-y-2 animate-fadeIn">
                <h3 className="font-heading text-2xl font-bold text-[color:var(--text-main)] flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-[var(--danger-rose)]/20 border border-[var(--danger-rose)]/30">
                    <Heart className="w-5 h-5 text-[var(--danger-rose)]" />
                  </div>
                  Clinical Telemetry
                </h3>

                <RangeSlider label="Systolic BP" field="Systolic_BP" min={90} max={200} unit="mmHg" warningThreshold={140} />
                <RangeSlider label="Diastolic BP" field="Diastolic_BP" min={60} max={130} unit="mmHg" warningThreshold={90} />
                <RangeSlider label="Total Cholesterol" field="Cholesterol" min={100} max={400} unit="mg/dL" warningThreshold={240} />
                <RangeSlider label="Resting Heart Rate" field="Heart_Rate" min={40} max={140} unit="BPM" warningThreshold={100} />
                <RangeSlider label="Triglycerides" field="Triglycerides" min={50} max={500} unit="mg/dL" warningThreshold={200} />

                <ToggleCapsules
                  label="Diabetic Status"
                  field="Diabetes"
                  options={[
                    { label: 'NEGATIVE', value: 0 },
                    { label: 'POSITIVE (TYPE 1/2)', value: 1 },
                  ]}
                />
              </div>
            )}

            {/* STEP 3: LIFESTYLE & HABITS */}
            {currentStep === 3 && (
              <div className="space-y-2 animate-fadeIn">
                <h3 className="font-heading text-2xl font-bold text-[color:var(--text-main)] flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-[var(--warning-amber)]/20 border border-[var(--warning-amber)]/30">
                    <Flame className="w-5 h-5 text-[var(--warning-amber)]" />
                  </div>
                  Lifestyle Factors
                </h3>

                <ToggleCapsules
                  label="Smoking Status"
                  field="Smoking"
                  options={[
                    { label: 'NON-SMOKER', value: 0 },
                    { label: 'ACTIVE SMOKER', value: 1 },
                  ]}
                />

                <ToggleCapsules
                  label="Alcohol Intake"
                  field="Alcohol_Consumption"
                  options={[
                    { label: 'NONE/RARE', value: 0 },
                    { label: 'REGULAR', value: 1 },
                  ]}
                />

                <RangeSlider label="Exercise Frequency" field="Exercise_Hours_Per_Week" min={0} max={20} step={0.5} unit="HRS/WK" />
                <RangeSlider label="Average Sleep" field="Sleep_Hours_Per_Day" min={2} max={12} step={0.5} unit="HRS/DAY" />
                <RangeSlider label="Systemic Stress Level" field="Stress_Level" min={1} max={10} step={1} unit="/ 10" warningThreshold={8} />
              </div>
            )}

            {/* STEP 4: SYMPTOMS & MEDICAL HISTORY */}
            {currentStep === 4 && (
              <div className="space-y-2 animate-fadeIn">
                <h3 className="font-heading text-2xl font-bold text-[color:var(--text-main)] flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-[var(--purple-glow)]/20 border border-[var(--purple-glow)]/30">
                    <Stethoscope className="w-5 h-5 text-[var(--purple-glow)]" />
                  </div>
                  Medical History
                </h3>

                <ToggleCapsules
                  label="Family History of Cardiac Illness"
                  field="Family_History"
                  options={[
                    { label: 'NO KNOWN HISTORY', value: 0 },
                    { label: 'YES (PARENTS/SIBLINGS)', value: 1 },
                  ]}
                />

                <ToggleCapsules
                  label="Previous Heart Problems"
                  field="Previous_Heart_Problems"
                  options={[
                    { label: 'NONE REPORTED', value: 0 },
                    { label: 'PREVIOUS EVENT', value: 1 },
                  ]}
                />

                <ToggleCapsules
                  label="Active Medication Usage"
                  field="Medication_Use"
                  options={[
                    { label: 'NO REGULAR MEDS', value: 0 },
                    { label: 'STATINS / ANTIHYPERTENSIVES', value: 1 },
                  ]}
                />

                <ToggleCapsules
                  label="Chest Pain Type"
                  field="Chest_Pain_Type"
                  options={[
                    { label: 'TYPICAL ANGINA', value: 'Typical Angina' },
                    { label: 'ATYPICAL ANGINA', value: 'Atypical Angina' },
                    { label: 'NON-ANGINAL', value: 'Non-anginal' },
                    { label: 'ASYMPTOMATIC', value: 'Asymptomatic' },
                  ]}
                />
              </div>
            )}
          </div>

          {/* Wizard Controls */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-[color:var(--glass-border)]">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold font-mono-num border border-[color:var(--glass-border)] transition-all ${
                currentStep === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:border-[var(--accent-cyan)] text-[color:var(--text-main)] cursor-pointer bg-[color:var(--glass-border)]'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-3 px-8 py-3 rounded-full text-[13px] tracking-wider font-bold font-mono-num bg-[var(--accent-cyan)] text-black hover:bg-[var(--danger-rose)] transition-all shadow-[0_0_20px_rgba(255,90,0,0.4)] cursor-pointer"
            >
              <span>{currentStep === 4 ? 'INITIALIZE DIAGNOSIS' : 'CONTINUE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </GlassPanel>
      </div>

    </div>
  );
};
