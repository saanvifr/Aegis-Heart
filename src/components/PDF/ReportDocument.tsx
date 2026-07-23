import React from 'react';
import jsPDF from 'jspdf';
import { FileText, Download } from 'lucide-react';

interface ReportData {
  patientName: string;
  age: number;
  gender: string;
  date: string;
  riskPercentage: number;
  riskCategory: string;
  confidenceScore: number;
  bmi: number;
  systolicBp: number;
  diastolicBp: number;
  cholesterol: number;
  topFactors: Array<{ title: string; impact: string }>;
  recommendation: string;
}

export const downloadPDFReport = (data: ReportData) => {
  const doc = new jsPDF();

  // Page background & header
  doc.setFillColor(4, 7, 18);
  doc.rect(0, 0, 210, 297, 'F');

  // Title Banner
  doc.setTextColor(0, 245, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text("AEGIS HEART — CARDIOVASCULAR REPORT", 15, 22);

  doc.setFontSize(9);
  doc.setTextColor(150, 160, 180);
  doc.text("NEURAL CORE v4.5 // CONFIDENTIAL PREVENTIVE REPORT", 15, 28);
  doc.text(`DATE GENERATED: ${data.date}`, 150, 28);

  doc.setDrawColor(0, 245, 255);
  doc.setLineWidth(0.5);
  doc.line(15, 32, 195, 32);

  // Patient Info Box
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(15, 38, 180, 30, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`PATIENT NAME: ${data.patientName}`, 20, 48);
  doc.text(`AGE: ${data.age} YRS  |  GENDER: ${data.gender}`, 20, 56);
  doc.text(`BMI: ${data.bmi}  |  BP: ${data.systolicBp}/${data.diastolicBp} mmHg`, 110, 48);
  doc.text(`CHOLESTEROL: ${data.cholesterol} mg/dL`, 110, 56);

  // Risk Summary Box
  doc.setFillColor(20, 30, 55);
  doc.roundedRect(15, 74, 180, 45, 4, 4, 'F');

  const isHigh = data.riskPercentage > 60;
  const isMed = data.riskPercentage >= 25 && data.riskPercentage <= 60;
  const riskColor = isHigh ? [255, 23, 68] : isMed ? [255, 193, 7] : [0, 255, 149];

  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.setFontSize(26);
  doc.text(`${data.riskPercentage.toFixed(1)}%`, 25, 94);

  doc.setFontSize(14);
  doc.text(`CATEGORY: ${data.riskCategory.toUpperCase()}`, 75, 90);
  doc.setTextColor(200, 210, 225);
  doc.setFontSize(10);
  doc.text(`CONFIDENCE INDEX: ${data.confidenceScore}%`, 75, 98);
  doc.text("PREDICTIVE ENSEMBLE: XGBOOST + RANDOM FOREST + SCALED LOGISTIC REGRESSION", 25, 110);

  // SHAP Factors
  doc.setTextColor(0, 245, 255);
  doc.setFontSize(12);
  doc.text("SHAP FEATURE IMPACT ATTRIBUTION", 15, 130);

  let yPos = 140;
  data.topFactors.forEach((factor, idx) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(15, yPos, 180, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`${idx + 1}. ${factor.title}`, 20, yPos + 7);
    doc.setTextColor(255, 193, 7);
    doc.text(factor.impact, 160, yPos + 7);
    yPos += 14;
  });

  // Clinical Guidance
  yPos += 10;
  doc.setTextColor(0, 245, 255);
  doc.setFontSize(12);
  doc.text("CLINICAL ACTION PLAN & RECOMMENDATIONS", 15, yPos);

  yPos += 10;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(15, yPos, 180, 28, 3, 3, 'F');
  doc.setTextColor(220, 225, 235);
  doc.setFontSize(9.5);
  const lines = doc.splitTextToSize(data.recommendation, 170);
  doc.text(lines, 20, yPos + 10);

  // Mandatory Medical Disclaimer Stamp
  yPos += 45;
  doc.setDrawColor(255, 23, 68);
  doc.setLineWidth(0.8);
  doc.rect(15, yPos, 180, 32);

  doc.setTextColor(255, 23, 68);
  doc.setFontSize(10);
  doc.text("MANDATORY MEDICAL DISCLAIMER", 20, yPos + 8);

  doc.setTextColor(180, 190, 205);
  doc.setFontSize(8);
  const disclaimerText = "Aegis Heart provides preventive cardiovascular risk assessments powered by machine learning for educational and informational purposes only. It is not a medical device and must not be used as a substitute for diagnosis, treatment, or advice from a qualified healthcare professional.";
  const discLines = doc.splitTextToSize(disclaimerText, 170);
  doc.text(discLines, 20, yPos + 15);

  doc.save(`Aegis_Heart_Report_${data.patientName.replace(/\s+/g, '_')}.pdf`);
};

export const PdfReportGenerator: React.FC<{ data: ReportData }> = ({ data }) => {
  return (
    <button
      onClick={() => downloadPDFReport(data)}
      className="flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-mono-num font-bold bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--purple-glow)] to-[var(--danger-rose)] text-[color:var(--text-main)] hover:opacity-95 transition-all shadow-[0_0_25px_rgba(0,245,255,0.3)] cursor-pointer"
    >
      <Download className="w-4 h-4" />
      <span>DOWNLOAD CLINICAL PDF REPORT</span>
    </button>
  );
};
