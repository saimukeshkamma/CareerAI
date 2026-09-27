# 🧠 CareerAI — "From Resume to Interview — Your AI Career Coach"

[![Python](https://img.shields.io/badge/Python-3.10-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

> A complete, production-quality full-stack AI career acceleration platform that helps students and engineers go from **Resume → ATS Analysis → Job Matching → Skill Gap Detection → AI Mock Interviews → Continuous Improvement**.

---

## ✨ Core Features

- 📄 **ATS Resume Analyzer & Audit**: Drag-and-drop PDF/DOCX parsing, instantaneous 0–100 ATS compatibility score, section checklists, quantifiable metric analysis, and before/after bullet point rewrites.
- 💼 **Smart Job Matcher**: 20+ curated opportunities across AI, Machine Learning, Data Science, and Full Stack, scored through an explainable 6-factor weighting algorithm.
- 🎯 **Skill Gap Detection & Roadmaps**: Compares candidate capabilities against target roles, flagging critical missing competencies with estimated difficulty and direct learning resources.
- 🎤 **AI Mock Interview Coach**: Role-specific dynamic questions with browser Web Speech API voice recording or typing, live multi-rubric feedback (Technical, Communication, Relevance, Clarity), and ideal answer blueprints.
- 📊 **Career Progress & Analytics**: Interactive Recharts displaying score trajectories over time, competency radar, market hiring demand, and interview rubrics.
- 🤖 **Context-Aware Floating Assistant**: Persistent AI chatbot aware of the user's active resume, skill gaps, and interview scores for instant personalized guidance.
- 🔐 **Secure Production Architecture**: Bcrypt password hashing, JWT authorization, protected route guards, and 1-click demo accounts.

---

## 🏛️ System Architecture

```
CareerAI/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point, CORS, routers
│   │   ├── config.py                # Pydantic settings & env management
│   │   ├── database.py              # SQLAlchemy engine & session maker
│   │   ├── models/                  # Users, Resumes, Analyses, Jobs, Interviews
│   │   ├── schemas/                 # Pydantic request/response DTOs
│   │   ├── routes/                  # REST API endpoints (/api/*)
│   │   ├── services/                # Resume parsing (PyPDF/Docx) & storage
│   │   ├── ai/                      # Pluggable AI: ATS, Job Matcher, Interview Coach
│   │   └── seed/                    # 20+ tech jobs, 3 demo profiles
│   ├── tests/                       # Pytest automated test suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/              # Navbar, Sidebar, ScoreRing, StatCard, Modals
│   │   ├── contexts/                # AuthContext, ThemeContext, NotificationContext
│   │   ├── pages/                   # Landing, Login, Signup, Dashboard, Resumes,
│   │   │                            # Jobs, SkillGap, Interview, Analytics, Profile
│   │   ├── services/                # Axios API client
│   │   └── types/                   # TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docs/                            # Architecture, API, Schema, and Setup documentation
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start (Local)

### 1. Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows (or source venv/bin/activate on Mac/Linux)
pip install -r requirements.txt
pytest -v                      # Verify test suite
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API is running at: `http://127.0.0.1:8000`
- Interactive Swagger docs: `http://127.0.0.1:8000/docs`

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web Application is running at: `http://localhost:5173`

---

## 🧪 1-Click Demo Profiles

For instant testing without registration, click **"Explore Live Demo"** or select a demo account:
- **Alex Rivera** (`alex@careerai.dev` / `password123`): Stanford CS Junior, AI Intern, 87% ATS score active resume, sample completed interview session.
- **Priya Sharma** (`priya@careerai.dev` / `password123`): Senior ML Engineer (4 years experience).
- **David Chen** (`david@careerai.dev` / `password123`): Full Stack / Cloud Developer.

---

## 📚 Complete Documentation

- [Architecture & Design Details](docs/ARCHITECTURE.md)
- [Full REST API Documentation](docs/API_DOCUMENTATION.md)
- [Database Schema & ER Diagram](docs/DATABASE_SCHEMA.md)
- [Step-by-Step Setup Guide](docs/SETUP_GUIDE.md)

---

## 📄 License
MIT License © 2026 CareerAI Inc.
