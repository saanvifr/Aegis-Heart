import React from 'react';
import { GlassPanel } from '../components/UI/GlassPanel';
import { HealthEnergyOrb } from '../components/UI/HealthEnergyOrb';
import { RiskTrendChart } from '../components/Charts/CustomGlassCharts';
import { BarChart3, TrendingUp, Cpu, Activity, ShieldCheck } from 'lucide-react';

export const AnalyticsRoom: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-xs font-mono-num mb-3 border border-[var(--accent-cyan)]/30">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>SPACE-GRADE HEALTH TELEMETRY & POPULATION ANALYTICS</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[color:var(--text-main)]">
          CARDIO ANALYTICS CORE
        </h2>
        <p className="text-xs text-[color:var(--text-muted)] font-mono-num mt-1">
          Historical Risk Trajectory & Population Benchmark Metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Health Orb & Quick Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <GlassPanel glow="cyan" className="flex flex-col items-center">
            <HealthEnergyOrb score={82} label="OVERALL CARDIAC HEALTH SCORE" />
            <div className="w-full mt-4 pt-4 border-t border-[color:var(--glass-border)] text-center font-mono-num text-xs text-[color:var(--text-muted)]">
              <p>STATUS: OPTIMAL RECOVERY</p>
              <p className="text-[10px] text-[var(--green-healthy)]">VASCULAR ELASTICITY HIGH</p>
            </div>
          </GlassPanel>

          <GlassPanel glow="purple" title="Population Benchmarks" subtitle="Kaggle Indian Population">
            <div className="space-y-3 font-mono-num text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-[color:var(--glass-border)]">
                <span className="text-[color:var(--text-muted)]">Total Logged Cohort:</span>
                <span className="text-[var(--accent-cyan)] font-bold">14,280 Records</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[color:var(--glass-border)]">
                <span className="text-[color:var(--text-muted)]">Avg Population Risk:</span>
                <span className="text-[var(--warning-amber)] font-bold">28.4%</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[color:var(--glass-border)]">
                <span className="text-[color:var(--text-muted)]">Low Risk Prevalence:</span>
                <span className="text-[var(--green-healthy)] font-bold">54.2%</span>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Right: Risk Trajectory Trend Chart */}
        <GlassPanel glow="cyan" title="6-Month Risk Score Trajectory" subtitle="Predictive Trend Line" icon={TrendingUp} className="lg:col-span-8">
          <RiskTrendChart />
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[color:var(--glass-border)] font-mono-num text-xs text-center">
            <div>
              <span className="text-[color:var(--text-muted)] block text-[10px]">PEAK RISK</span>
              <strong className="text-[var(--danger-rose)]">45.0%</strong>
            </div>
            <div>
              <span className="text-[color:var(--text-muted)] block text-[10px]">CURRENT RISK</span>
              <strong className="text-[var(--accent-cyan)]">18.5%</strong>
            </div>
            <div>
              <span className="text-[color:var(--text-muted)] block text-[10px]">REDUCTION DELTA</span>
              <strong className="text-[var(--green-healthy)]">-26.5%</strong>
            </div>
          </div>
        </GlassPanel>

      </div>

    </div>
  );
};
