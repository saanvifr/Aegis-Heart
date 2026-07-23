import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { AlertCircle, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';

// 1. Risk Trend Area Chart Data & Component
interface RiskTrendProps {
  data?: Array<{ date: string; risk: number; target: number }>;
}

export const RiskTrendChart: React.FC<RiskTrendProps> = ({
  data = [
    { date: 'Jan', risk: 42, target: 20 },
    { date: 'Feb', risk: 38, target: 20 },
    { date: 'Mar', risk: 45, target: 20 },
    { date: 'Apr', risk: 31, target: 20 },
    { date: 'May', risk: 26, target: 20 },
    { date: 'Jun', risk: 18.5, target: 20 },
  ],
}) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 11 }} axisLine={false} />
          <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} axisLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(8, 14, 28, 0.9)',
              borderColor: 'rgba(0, 245, 255, 0.4)',
              borderRadius: '16px',
              color: 'var(--text-main)',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono',
            }}
          />
          <Area
            type="monotone"
            dataKey="risk"
            stroke="var(--accent-cyan)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#riskGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. SHAP Factor Breakdown Horizontal Bar Chart
export interface ShapFactor {
  feature: string;
  impact_percentage: number;
  direction: 'increase' | 'decrease';
  title: string;
  description: string;
}

export const ShapFactorChart: React.FC<{ factors: ShapFactor[] }> = ({ factors }) => {
  return (
    <div className="space-y-4">
      {factors.map((f, idx) => {
        const isRiskPlus = f.direction === 'increase';
        return (
          <div key={idx} className="space-y-1.5 font-mono-num">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {isRiskPlus ? (
                  <AlertCircle className="w-4 h-4 text-[var(--danger-rose)]" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-[var(--green-healthy)]" />
                )}
                <span className="font-semibold text-[color:var(--text-main)]">{f.title}</span>
              </div>
              <span
                className={`font-bold ${isRiskPlus ? 'text-[var(--danger-rose)]' : 'text-[var(--green-healthy)]'}`}
              >
                {isRiskPlus ? '+' : '-'}{f.impact_percentage}%
              </span>
            </div>

            {/* Custom Bar track */}
            <div className="w-full h-2.5 bg-[color:var(--glass-border)] rounded-full overflow-hidden p-0.5 border border-[color:var(--glass-border)]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isRiskPlus
                    ? 'bg-gradient-to-r from-[var(--danger-rose)] to-[#FF3D71] shadow-[0_0_10px_rgba(255,23,68,0.5)]'
                    : 'bg-gradient-to-r from-[var(--green-healthy)] to-[var(--accent-cyan)] shadow-[0_0_10px_rgba(0,255,149,0.5)]'
                }`}
                style={{ width: `${Math.min(f.impact_percentage * 3.5, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[color:var(--text-muted)]">{f.description}</p>
          </div>
        );
      })}
    </div>
  );
};
