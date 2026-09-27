# CareerAI — Quick Setup & Installation Guide

This guide walks through setting up and running CareerAI locally or containerized with Docker.

---

## Option 1: Local Development (Quickest)

### Prerequisites
- **Python 3.10+**
- **Node.js v18+** & **npm**

### Step 1: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database tests to verify integrity
pytest -v

# Start FastAPI backend server (auto-seeds demo users and 20 tech jobs)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now active at: `http://127.0.0.1:8000`  
Swagger API interactive docs: `http://127.0.0.1:8000/docs`

### Step 2: Frontend Setup
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install packages
npm install

# Start Vite development server with API proxy
npm run dev
```
The frontend application is now active at: `http://localhost:5173`

---

## Option 2: Docker Compose (Full Stack + PostgreSQL)

```bash
# From repository root
docker compose up --build
```
This initializes:
- PostgreSQL on `localhost:5432`
- FastAPI backend on `http://localhost:8000`
- Nginx-served React frontend on `http://localhost:5173`

---

## Demo Accounts
For instant evaluation without creating a new profile, use our 1-click demo accounts on the login page:
1. **Alex Rivera** (`alex@careerai.dev` / `password123`): Stanford CS Junior, AI Intern, 87% ATS score resume, sample interview.
2. **Priya Sharma** (`priya@careerai.dev` / `password123`): Mid-Level ML Engineer (4 years experience).
3. **David Chen** (`david@careerai.dev` / `password123`): Full Stack Developer.
