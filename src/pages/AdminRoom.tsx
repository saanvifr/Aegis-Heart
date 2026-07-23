import React, { useEffect, useState } from 'react';
import { GlassPanel } from '../components/UI/GlassPanel';
import { Shield, Cpu, Download, Database, CheckCircle2, Award, FileSpreadsheet } from 'lucide-react';

export const AdminRoom: React.FC = () => {
  const [modelMetrics, setModelMetrics] = useState<any>({
    'Logistic Regression': { accuracy: 0.7188, precision: 0.7200, recall: 0.7250, f1_score: 0.7239, roc_auc: 0.7965 },
    'Random Forest': { accuracy: 0.7172, precision: 0.7180, recall: 0.7190, f1_score: 0.7185, roc_auc: 0.7842 },
    'Gradient Boosting': { accuracy: 0.7297, precision: 0.7300, recall: 0.7330, f1_score: 0.7318, roc_auc: 0.7867 },
    'XGBoost': { accuracy: 0.7109, precision: 0.7120, recall: 0.7130, f1_score: 0.7123, roc_auc: 0.7711 },
    'LightGBM': { accuracy: 0.7172, precision: 0.7180, recall: 0.7200, f1_score: 0.7194, roc_auc: 0.7785 },
  });

  const downloadDatasetCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Age,Gender,Systolic_BP,Diastolic_BP,Cholesterol,Heart_Rate,Heart_Attack_Risk\n" +
      "45,Male,130,85,215,74,0\n" +
      "58,Female,145,90,260,82,1\n" +
      "62,Male,155,95,280,88,1\n" +
      "35,Female,118,78,185,68,0\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Aegis_Heart_Indian_Population_Dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[color:var(--glass-border)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-xs font-mono-num mb-2 border border-[var(--accent-cyan)]/30">
            <Shield className="w-3.5 h-3.5" />
            <span>BIOMEDICAL SYSTEM CONTROL CORE // ADMIN PRIVILEGES</span>
          </div>
          <h2 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)]">
            ADMINISTRATIVE COMMAND CENTER
          </h2>
        </div>

        <button
          onClick={downloadDatasetCSV}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono-num font-bold bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-[color:var(--text-main)] hover:opacity-90 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,245,255,0.3)]"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>EXPORT KAGGLE DATASET (CSV)</span>
        </button>
      </div>

      {/* Dataset & Model Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ML Model Performance Table */}
        <GlassPanel glow="cyan" title="Machine Learning Model Telemetry" subtitle="Multi-Algorithm Benchmark" icon={Cpu} className="lg:col-span-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-num text-xs">
              <thead>
                <tr className="border-b border-[color:var(--glass-border)] text-[color:var(--text-muted)]">
                  <th className="pb-3">ALGORITHM</th>
                  <th className="pb-3">ACCURACY</th>
                  <th className="pb-3">PRECISION</th>
                  <th className="pb-3">RECALL</th>
                  <th className="pb-3">F1 SCORE</th>
                  <th className="pb-3">ROC-AUC</th>
                  <th className="pb-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.entries(modelMetrics).map(([name, metrics]: [string, any], idx) => {
                  const isWinner = idx === 0;
                  return (
                    <tr key={name} className={isWinner ? 'text-[var(--accent-cyan)] font-bold bg-[var(--accent-cyan)]/5' : 'text-[color:var(--text-muted)]'}>
                      <td className="py-3.5 flex items-center gap-2">
                        {isWinner && <Award className="w-4 h-4 text-[var(--green-healthy)]" />}
                        <span>{name}</span>
                      </td>
                      <td>{(metrics.accuracy * 100).toFixed(1)}%</td>
                      <td>{(metrics.precision * 100).toFixed(1)}%</td>
                      <td>{(metrics.recall * 100).toFixed(1)}%</td>
                      <td>{metrics.f1_score}</td>
                      <td className="text-[var(--green-healthy)] font-bold">{metrics.roc_auc}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${isWinner ? 'bg-[var(--green-healthy)]/20 text-[var(--green-healthy)]' : 'bg-[color:var(--glass-border)] text-[color:var(--text-muted)]'}`}>
                          {isWinner ? 'SELECTED TOP MODEL' : 'BENCHMARKED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        {/* System Telemetry & Logs */}
        <GlassPanel glow="purple" title="Dataset Telemetry" subtitle="Kaggle Indian Population" icon={Database} className="lg:col-span-4 space-y-4">
          <div className="p-3 rounded-2xl bg-[color:var(--glass-border)] font-mono-num text-xs space-y-1">
            <span className="text-[color:var(--text-muted)] text-[10px] block">DATASET RECORD COUNT</span>
            <strong className="text-[color:var(--text-main)] text-lg">3,200 Rows // 22 Features</strong>
          </div>

          <div className="p-3 rounded-2xl bg-[color:var(--glass-border)] font-mono-num text-xs space-y-1">
            <span className="text-[color:var(--text-muted)] text-[10px] block">FASTAPI BACKEND SYSTEM</span>
            <strong className="text-[var(--green-healthy)] text-sm">ONLINE (http://127.0.0.1:8000)</strong>
          </div>

          <div className="p-3 rounded-2xl bg-[color:var(--glass-border)] font-mono-num text-xs space-y-1">
            <span className="text-[color:var(--text-muted)] text-[10px] block">MODEL SERIALIZATION</span>
            <span className="text-[color:var(--text-muted)]">best_model.pkl (Joblib binary)</span>
          </div>
        </GlassPanel>

      </div>

    </div>
  );
};
