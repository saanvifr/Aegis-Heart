<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/FastAPI-0.103-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Machine%20Learning-CatBoost-FF9900?style=for-the-badge" alt="Machine Learning" />
</div>

<br />

<div align="center">
  <h1>🫀 Aegis Heart</h1>
  <p><strong>A Next-Generation, Machine Learning-Powered Health Operating System.</strong></p>
</div>

---

## 🌟 Overview

**Aegis Heart** is a premium, futuristic health-tech platform designed with holographic glassmorphism aesthetics (inspired by Apple Vision Pro, Tesla UI, and Iron Man's JARVIS). 

It combines a visually stunning React frontend with a high-performance Python FastAPI backend to deliver real-time cardiovascular risk predictions, comprehensive health tracking, and actionable insights driven by explainable AI (SHAP).

## 🚀 Features

*   **🧬 Digital Twin & Heart Lab:** Real-time cardiovascular risk assessment using a trained `CatBoostClassifier`.
*   **🧠 Explainable AI (XAI):** Integrated SHAP (SHapley Additive exPlanations) values to explain exactly *why* the AI made its prediction.
*   **📊 Holistic Health Tracking:** Comprehensive dashboards for sleep, hydration, mood, nutrition, and vital signs.
*   **🎮 Gamified Wellness:** XP, levels, and unlockable achievement badges to keep users motivated.
*   **🔐 Bulletproof Security:** Stateless JWT authentication with BCrypt password hashing.
*   **☁️ Cloud-Native:** Architected for serverless deployments (Vercel Frontend, Railway/Render Backend, Neon Serverless Postgres).

---

## 🛠️ Technology Stack

### Frontend (Client-Side)
*   **Framework:** React 19 + TypeScript + Vite
*   **Styling:** Tailwind CSS v4 + Pure CSS Variables (Glassmorphism & Neon Effects)
*   **Animations:** Framer Motion
*   **Data Visualization:** Recharts
*   **Icons:** Lucide React

### Backend (Server-Side API)
*   **Framework:** FastAPI (Python 3.12)
*   **Database:** PostgreSQL (via asyncpg) + SQLAlchemy 2.0 ORM
*   **Machine Learning:** CatBoost, scikit-learn, SHAP
*   **Server:** Gunicorn + Uvicorn Workers

---

## ☁️ Production Deployment

Aegis Heart is fully configured for zero-downtime CI/CD deployments.

*   **Frontend**: Deployed via **Vercel** (`vercel.json` included for SPA routing).
*   **Backend**: Deployed via **Railway** (`nixpacks.toml` configured for strict Python virtual environment execution).
*   **Database**: Uses **Neon Serverless PostgreSQL**.

### Environment Variables

To run the application, the following environment variables must be configured:

**Backend (`.env`)**
```env
DATABASE_URL=postgresql+asyncpg://user:password@endpoint.neon.tech/dbname
JWT_SECRET_KEY=your_super_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

**Frontend (`.env` or Vercel Settings)**
```env
VITE_API_URL=https://your-railway-backend-url.app
```

---

## 💻 Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Aegis-Heart.git
cd Aegis-Heart
```

### 2. Start the Backend (API)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # (On Windows use: venv\Scripts\activate)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the Frontend (UI)
Open a new terminal in the root directory:
```bash
npm install
npm run dev
```

The application will be running at `http://localhost:3000`.

---
<div align="center">
  <p>Built with 🩵 for the future of digital health.</p>
</div>
