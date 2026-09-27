# CareerAI — System Architecture Document

## 1. High-Level Architecture Overview

CareerAI is structured as a decoupled, modular full-stack web application designed for high performance, explainable algorithmic decision-making, and seamless candidate experiences.

```
                              ┌──────────────────────────────────────────────┐
                              │            React 19 + TypeScript             │
                              │     Tailwind CSS v4 + Recharts + Lucide      │
                              │             Web Speech API Client            │
                              └──────────────────────┬───────────────────────┘
                                                     │
                                             REST API (JSON)
                                                     │
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │           FastAPI Application Core           │
                              │   Pydantic V2 + SQLAlchemy 2.0 + PyJWT       │
                              │      Bcrypt Password Hash + PyPDF/Docx       │
                              └──────────────┬────────────────┬──────────────┘
                                             │                │
                                             ▼                ▼
                              ┌────────────────────┐   ┌─────────────────────┐
                              │ Relational Database│   │  Modular AI Engine  │
                              │  SQLite (Local)    │   │  • ATS Analyzer     │
                              │  PostgreSQL (Prod) │   │  • 6-Factor Matcher │
                              └────────────────────┘   │  • Skill Gap Engine │
                                                       │  • Interview Coach  │
                                                       │  • Career Assistant │
                                                       └─────────────────────┘
```

---

## 2. Core Subsystems

### 2.1 Authentication & User Session Management
- **Password Hashing**: Uses `bcrypt` with random salt generation (`gensalt()`).
- **Token Format**: Standard JSON Web Tokens (JWT) signed using HMAC-SHA256 (`HS256`).
- **Dependency Injection**: Route-level protected endpoints utilize FastAPI's `Depends(get_current_user)` to guarantee zero unauthorized access.
- **1-Click Demo Engine**: Pre-seeded accounts (Student, Mid-level ML Engineer, Fullstack Engineer) enable instantaneous local evaluation without registration friction.

### 2.2 Resume Ingestion & Parsing Pipeline
1. **File Upload & Validation**: Validates file size (max 10MB) and allowed extensions (`.pdf`, `.docx`, `.txt`).
2. **Binary Extraction**:
   - PDF: Streamed through `pypdf.PdfReader` with multi-page text aggregation.
   - DOCX: Paragraphs and table cell extraction via `python-docx`.
3. **Structured Segmentation**: Regular-expression powered parser extracts email, phone, public portfolio URLs (GitHub/LinkedIn), and demarcates key sections (Education, Experience, Projects, Skills, Certifications).
4. **Competency Detection**: Evaluates text against a 50+ technology keyword catalog.

### 2.3 Explainable ATS Scoring & Job Match Engine
Rather than relying on opaque black-box scores, CareerAI employs transparent, explainable rubric algorithms:
- **ATS Compatibility Scoring**:
  - Section Completeness (25%)
  - Metric & Impact Quantifiability (20%)
  - Target Role Keyword Alignment (30%)
  - Action Verbs & Conciseness (15%)
  - Formatting Quality (10%)
- **Job Compatibility Matching**:
  - Skills Overlap (40% Weight)
  - Experience Alignment (20% Weight)
  - Project Depth (15% Weight)
  - Education Fit (10% Weight)
  - Keyword Coverage (10% Weight)
  - Location / Work Mode (5% Weight)

### 2.4 Interactive Mock Interview Coach
- **Question Generator**: Role-tailored question banks spanning Core Machine Learning, Deep Learning & Transformers, Generative AI Systems, System Design, and Behavioral STAR scenarios.
- **Speech-to-Text Input**: Browser-native Web Speech API (`webkitSpeechRecognition`) transcribes candidate audio in real time.
- **Multi-Rubric Evaluation**:
  - Technical Knowledge (0–100)
  - Communication & Articulation (0–100)
  - Problem Solving & Trade-offs (0–100)
  - Relevance & Completeness (0–100)
  - Delivery Clarity (0–100)
- **Model Answer Blueprint**: Provides structured 4-step answer frameworks (Definition -> Mechanics -> Production Example -> Trade-offs).

---

## 3. Security Considerations
- **No Plaintext Passwords**: Passwords hashed before database persistence.
- **Sensitive Data Isolation**: Resumes and candidate answers are private to the authenticated user ID.
- **CORS Protection**: Explicit origins whitelist prevents cross-origin attack vectors.
- **Exception Sanitization**: Global exception handlers prevent internal stack traces from leaking to client responses.
