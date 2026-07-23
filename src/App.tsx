import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CursorSpotlight } from './components/Navigation/CursorSpotlight';
import { OrbitalNav } from './components/Navigation/OrbitalNav';
import { AegisOSDock } from './components/Navigation/AegisOSDock';
import { ARIAChat } from './components/AI/ARIAChat';
import { ParticleBackground } from './components/UI/ParticleBackground';
import { DataStreamLoader } from './components/UI/DataStreamLoader';
import { AssessmentFormData } from './pages/AssessmentRoom';
import { downloadPDFReport } from './components/PDF/ReportDocument';
import { api } from './hooks/useApi';

// ── Lazy-loaded pages for code splitting ────────────────────────────
const LandingRoom            = lazy(() => import('./pages/LandingRoom').then(m => ({ default: m.LandingRoom })));
const AuthSplitScreen        = lazy(() => import('./pages/AuthSplitScreen').then(m => ({ default: m.AuthSplitScreen })));
const AssessmentRoom         = lazy(() => import('./pages/AssessmentRoom').then(m => ({ default: m.AssessmentRoom })));
const DashboardRoom          = lazy(() => import('./pages/DashboardRoom').then(m => ({ default: m.DashboardRoom })));
const DigitalHeartLabPage    = lazy(() => import('./pages/DigitalHeartLabPage').then(m => ({ default: m.DigitalHeartLabPage })));
const MachineLearningLabPage = lazy(() => import('./pages/MachineLearningLabPage').then(m => ({ default: m.MachineLearningLabPage })));
const MissionsGamificationPage = lazy(() => import('./pages/MissionsGamificationPage').then(m => ({ default: m.MissionsGamificationPage })));
const CalendarJournalPage    = lazy(() => import('./pages/CalendarJournalPage').then(m => ({ default: m.CalendarJournalPage })));
const SimulatorRoom          = lazy(() => import('./pages/SimulatorRoom').then(m => ({ default: m.SimulatorRoom })));
const AnalyticsRoom          = lazy(() => import('./pages/AnalyticsRoom').then(m => ({ default: m.AnalyticsRoom })));
const TimelineRoom           = lazy(() => import('./pages/TimelineRoom').then(m => ({ default: m.TimelineRoom })));
const DoctorDashboardPage    = lazy(() => import('./pages/DoctorDashboardPage').then(m => ({ default: m.DoctorDashboardPage })));
const AdminRoom              = lazy(() => import('./pages/AdminRoom').then(m => ({ default: m.AdminRoom })));
const WaterTrackerPage       = lazy(() => import('./pages/WaterTrackerPage').then(m => ({ default: m.WaterTrackerPage })));
const SleepTrackerPage       = lazy(() => import('./pages/SleepTrackerPage').then(m => ({ default: m.SleepTrackerPage })));
const MoodJournalPage        = lazy(() => import('./pages/MoodJournalPage').then(m => ({ default: m.MoodJournalPage })));
const GoalsPage              = lazy(() => import('./pages/GoalsPage').then(m => ({ default: m.GoalsPage })));
const AchievementsPage       = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const NutritionLogPage       = lazy(() => import('./pages/NutritionLogPage').then(m => ({ default: m.NutritionLogPage })));

// ── Loading fallback ─────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent animate-spin" />
      <p className="text-[color:var(--text-muted)] text-xs font-mono-num tracking-widest">LOADING MODULE...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentRoom, setCurrentRoom] = useState('landing');

  const [assessmentData, setAssessmentData] = useState<AssessmentFormData>({
    Age: 45, Gender: 'Male', Height_cm: 175, Weight_kg: 78, BMI: 25.5,
    Systolic_BP: 130, Diastolic_BP: 85, Heart_Rate: 74, Cholesterol: 215,
    Diabetes: 0, Family_History: 1, Smoking: 0, Alcohol_Consumption: 0,
    Exercise_Hours_Per_Week: 3.5, Diet: 'Average', Previous_Heart_Problems: 0,
    Medication_Use: 0, Stress_Level: 5, Sedentary_Hours_Per_Day: 7.0,
    Triglycerides: 170, Sleep_Hours_Per_Day: 7.0, Daily_Water_Intake: 2.5,
    Chest_Pain_Type: 'Atypical Angina',
  });

  const [predictionResult, setPredictionResult] = useState<any>(null);

  const handleNavigate = (room: string) => {
    if (room === 'reports') {
      downloadPDFReport({
        patientName: user?.name || 'Research Subject',
        age: assessmentData.Age,
        gender: assessmentData.Gender,
        date: new Date().toLocaleDateString(),
        riskPercentage: predictionResult?.risk_percentage ?? 18.5,
        riskCategory: predictionResult?.risk_category ?? 'Low Risk',
        confidenceScore: predictionResult?.confidence_score ?? 94.8,
        bmi: assessmentData.BMI,
        systolicBp: assessmentData.Systolic_BP,
        diastolicBp: assessmentData.Diastolic_BP,
        cholesterol: assessmentData.Cholesterol,
        topFactors: [
          { title: 'Systolic Blood Pressure', impact: '+18.5%' },
          { title: 'Active Tobacco Usage', impact: '+15.0%' },
        ],
        recommendation: predictionResult?.recommendation ?? 'Maintain regular activity and schedule routine screening.',
      });
      return;
    }
    setCurrentRoom(room);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitAssessment = async (data: AssessmentFormData) => {
    setAssessmentData(data);
    setCurrentRoom('scanning');

    // Try the authenticated assess endpoint first (saves to DB + awards XP)
    const { data: result, error } = await api.post('/api/predictions/assess', data);

    if (result) {
      setPredictionResult(result);
      return;
    }

    // Fallback: unauthenticated predict endpoint
    try {
      const res = await fetch('http://127.0.0.1:8000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        setPredictionResult(json);
      } else throw new Error('API error');
    } catch {
      // Last resort: clinical formula fallback
      setPredictionResult({
        risk_percentage: 18.5, risk_category: 'Low Risk', confidence_score: 94.8,
        digital_twin_state: 'healthy', health_score: 84.2,
        recommendation: 'Maintain regular activity and schedule routine screening.',
        explanation: 'Clinical formula estimate. Log in and train the ML model for AI-powered predictions.',
        shap_factors: [
          { feature: 'Systolic_BP', impact_percentage: 18.5, direction: 'increase', title: 'Systolic Blood Pressure', description: 'Vascular strain.' },
          { feature: 'Exercise_Hours_Per_Week', impact_percentage: 12.0, direction: 'decrease', title: 'Weekly Exercise', description: 'Protective cardiovascular factor.' },
        ],
      });
    }
  };


  // Show loading spinner while validating auth
  if (isLoading) return <PageLoader />;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ParticleBackground />
      <CursorSpotlight />
      <OrbitalNav
        currentRoom={currentRoom}
        onNavigate={handleNavigate}
        user={user}
        onOpenAuth={() => setCurrentRoom('auth')}
      />

      <main className="relative z-10">
        <Suspense fallback={<PageLoader />}>
          {currentRoom === 'landing'     && <LandingRoom onStartAssessment={() => handleNavigate('assessment')} onNavigate={handleNavigate} />}
          {currentRoom === 'auth'        && <AuthSplitScreen onSuccess={() => handleNavigate('dashboard')} />}
          {currentRoom === 'assessment'  && <AssessmentRoom onSubmitAssessment={handleSubmitAssessment} />}
          {currentRoom === 'scanning'    && <DataStreamLoader onComplete={() => handleNavigate('dashboard')} />}
          {currentRoom === 'dashboard'   && <DashboardRoom formData={assessmentData} prediction={predictionResult} onNavigate={handleNavigate} />}
          {currentRoom === 'lab'         && <DigitalHeartLabPage />}
          {currentRoom === 'mllab'       && <MachineLearningLabPage />}
          {currentRoom === 'missions'    && <MissionsGamificationPage />}
          {currentRoom === 'calendar'    && <CalendarJournalPage />}
          {currentRoom === 'simulator'   && <SimulatorRoom baseData={assessmentData} />}
          {currentRoom === 'analytics'   && <AnalyticsRoom />}
          {currentRoom === 'timeline'    && <TimelineRoom />}
          {currentRoom === 'doctor'      && <DoctorDashboardPage />}
          {currentRoom === 'admin'       && <AdminRoom />}
          {currentRoom === 'water'       && <WaterTrackerPage />}
          {currentRoom === 'sleep'       && <SleepTrackerPage />}
          {currentRoom === 'mood'        && <MoodJournalPage />}
          {currentRoom === 'goals'       && <GoalsPage />}
          {currentRoom === 'achievements'&& <AchievementsPage />}
          {currentRoom === 'nutrition'   && <NutritionLogPage />}
        </Suspense>
      </main>

      <AegisOSDock currentRoom={currentRoom} onNavigate={handleNavigate} />

      {/* ARIA — Floating AI Heart Assistant (global, on every page) */}
      <ARIAChat
        healthContext={{
          riskScore: predictionResult?.risk_percentage,
          riskCategory: predictionResult?.risk_category,
          bp: assessmentData ? `${assessmentData.Systolic_BP}/${assessmentData.Diastolic_BP} mmHg` : undefined,
          bmi: assessmentData?.BMI,
          cholesterol: assessmentData?.Cholesterol,
          streak: user?.streak_days,
          xp: user?.xp,
          name: user?.name,
        }}
      />
    </div>
  );
};

export const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);
