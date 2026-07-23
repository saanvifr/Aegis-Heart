import React, { useEffect, useState } from 'react';
import { GlassPanel } from '../components/UI/GlassPanel';
import { BookOpen, User, ShieldAlert, CheckCircle, Search, Filter, Download, Activity } from 'lucide-react';
import { downloadPDFReport } from '../components/PDF/ReportDocument';

export const DoctorDashboardPage: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/doctor/patients')
      .then((res) => res.json())
      .then((data) => {
        setPatients(data);
        setSelectedPatient(data[0]);
      })
      .catch(() => {
        const dummy = [
          { id: "P-1001", name: "Rajesh Kumar", age: 54, gender: "Male", risk_percentage: 64.2, category: "High Risk", bp: "148/92", last_scan: "2026-07-21", status: "Needs Review" },
          { id: "P-1002", name: "Priya Sharma", age: 42, gender: "Female", risk_percentage: 18.5, category: "Low Risk", bp: "122/80", last_scan: "2026-07-20", status: "Stable" },
          { id: "P-1003", name: "Amitabh Patel", age: 61, gender: "Male", risk_percentage: 52.0, category: "Medium Risk", bp: "136/88", last_scan: "2026-07-19", status: "In Progress" },
          { id: "P-1004", name: "Sunita Verma", age: 38, gender: "Female", risk_percentage: 12.0, category: "Low Risk", bp: "115/75", last_scan: "2026-07-18", status: "Stable" },
          { id: "P-1005", name: "Vikram Singh", age: 49, gender: "Male", risk_percentage: 78.4, category: "High Risk", bp: "162/98", last_scan: "2026-07-22", status: "Critical Review" }
        ];
        setPatients(dummy);
        setSelectedPatient(dummy[0]);
      });
  }, []);

  const filteredPatients = patients.filter((p) => {
    if (filterCategory === 'ALL') return true;
    return p.category.toUpperCase().includes(filterCategory);
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[color:var(--glass-border)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-xs font-mono-num mb-2 border border-[var(--accent-cyan)]/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>CLINICAL CARDIOLOGIST COMMAND CORE</span>
          </div>
          <h2 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)]">
            DOCTOR PATIENT DASHBOARD
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 font-mono-num text-xs">
          {['ALL', 'HIGH RISK', 'MEDIUM RISK', 'LOW RISK'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                filterCategory === cat ? 'bg-[var(--accent-cyan)]/20 border-[var(--accent-cyan)] text-[var(--accent-cyan)]' : 'bg-[color:var(--glass-border)] border-[color:var(--glass-border)] text-[color:var(--text-muted)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Patient Cohort Table */}
        <GlassPanel glow="cyan" title="Patient Cohort" subtitle="Live Bio-Telemetry Monitoring" icon={User} className="lg:col-span-7">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-num text-xs">
              <thead>
                <tr className="border-b border-[color:var(--glass-border)] text-[color:var(--text-muted)]">
                  <th className="pb-3">PATIENT</th>
                  <th className="pb-3">AGE/GENDER</th>
                  <th className="pb-3">RISK SCORE</th>
                  <th className="pb-3">BP</th>
                  <th className="pb-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPatients.map((p) => {
                  const isSelected = selectedPatient?.id === p.id;
                  const isHigh = p.risk_percentage > 60;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] font-bold' : 'text-[color:var(--text-muted)] hover:bg-[color:var(--glass-border)]'
                      }`}
                    >
                      <td className="py-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--accent-cyan)]" />
                        <div>
                          <span>{p.name}</span>
                          <span className="text-[10px] text-[color:var(--text-muted)] block">{p.id}</span>
                        </div>
                      </td>
                      <td>{p.age} y / {p.gender}</td>
                      <td>
                        <span className={`font-bold ${isHigh ? 'text-[var(--danger-rose)]' : 'text-[var(--green-healthy)]'}`}>
                          {p.risk_percentage}%
                        </span>
                      </td>
                      <td>{p.bp}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${isHigh ? 'bg-[var(--danger-rose)]/20 text-[var(--danger-rose)]' : 'bg-[var(--green-healthy)]/20 text-[var(--green-healthy)]'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        {/* Right: Selected Patient Telemetry Detail Card */}
        {selectedPatient && (
          <GlassPanel glow="purple" title={`Patient Profile: ${selectedPatient.name}`} subtitle={`ID: ${selectedPatient.id}`} icon={Activity} className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-[color:var(--glass-border)] font-mono-num text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[color:var(--text-muted)]">Age / Gender:</span>
                <span className="text-[color:var(--text-main)] font-bold">{selectedPatient.age} Yrs / {selectedPatient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--text-muted)]">Cardio Risk Score:</span>
                <span className="text-[var(--danger-rose)] font-bold text-base">{selectedPatient.risk_percentage}% ({selectedPatient.category})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--text-muted)]">Blood Pressure:</span>
                <span className="text-[var(--accent-cyan)] font-bold">{selectedPatient.bp} mmHg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--text-muted)]">Last Assessment Scan:</span>
                <span className="text-[color:var(--text-muted)]">{selectedPatient.last_scan}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono-num text-[color:var(--text-muted)] block mb-1">DOCTOR CLINICAL NOTES</label>
              <textarea
                rows={3}
                defaultValue="Patient presents with elevated systolic BP. Recommended daily 150mg Statin therapy and 30-min daily aerobic exercise."
                className="w-full p-3 rounded-xl bg-[color:var(--glass-border)] border border-[color:var(--glass-border)] text-[color:var(--text-main)] outline-none font-mono-num text-xs resize-none"
              />
            </div>

            <button
              onClick={() =>
                downloadPDFReport({
                  patientName: selectedPatient.name,
                  age: selectedPatient.age,
                  gender: selectedPatient.gender,
                  date: selectedPatient.last_scan,
                  riskPercentage: selectedPatient.risk_percentage,
                  riskCategory: selectedPatient.category,
                  confidenceScore: 94.8,
                  bmi: 26.4,
                  systolicBp: parseInt(selectedPatient.bp.split('/')[0]) || 140,
                  diastolicBp: parseInt(selectedPatient.bp.split('/')[1]) || 90,
                  cholesterol: 220,
                  topFactors: [
                    { title: 'Systolic Blood Pressure', impact: '+18.5%' },
                    { title: 'Patient Age Factor', impact: '+14.2%' },
                  ],
                  recommendation: 'Clinical intervention recommended. Optimize medication therapy and schedule follow-up scan in 30 days.',
                })
              }
              className="w-full py-3 rounded-xl font-mono-num text-xs font-bold bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-[color:var(--text-main)] hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,245,255,0.3)]"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT PATIENT PDF REPORT</span>
            </button>
          </GlassPanel>
        )}

      </div>

    </div>
  );
};
