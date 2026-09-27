# CareerAI — REST API Documentation

Base URL: `http://localhost:8000/api`
Authentication: Bearer Token in `Authorization: Bearer <token>` header

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new candidate account and returns a JWT access token.
- **Request Body**:
  ```json
  {
    "name": "Alex Rivera",
    "email": "alex@careerai.dev",
    "password": "password123",
    "target_role": "AI Engineer",
    "experience_level": "Student / Intern",
    "college": "Stanford University",
    "degree": "B.S. Computer Science"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": { ... }
  }
  ```

### `POST /api/auth/login`
Authenticates existing credentials.
- **Request Body**:
  ```json
  {
    "email": "alex@careerai.dev",
    "password": "password123"
  }
  ```

### `POST /api/auth/demo-login/{user_id}`
Instant 1-click demo login for demonstration without credentials.
- **Path Parameters**: `user_id` (1 = Alex Rivera, 2 = Priya Sharma, 3 = David Chen)

---

## 2. Resumes & ATS Analysis

### `POST /api/resumes/upload`
Uploads a `.pdf`, `.docx`, or `.txt` resume file, extracts text, and executes immediate ATS scoring.
- **Form Data**:
  - `file`: Binary file
  - `title`: Optional custom title string

### `GET /api/resumes`
Lists all uploaded resumes for the current authenticated user.

### `POST /api/resumes/{id}/activate`
Sets the specified resume as the active profile for job matching.

### `POST /api/resumes/{id}/analyze`
Triggers fresh ATS re-analysis against the user's updated target role.

### `DELETE /api/resumes/{id}`
Permanently deletes the resume and analysis records.

---

## 3. Job Matching Engine

### `GET /api/jobs`
Retrieves AI-ranked tech opportunities scored against the user's active resume.
- **Query Parameters**:
  - `q`: Search query string
  - `work_type`: `Remote`, `Hybrid`, `On-site`
  - `experience_level`: `Internship`, `Entry-level`, `Mid-level`, `Senior`
- **Response**: Array of job objects with `match_percentage`, `matched_skills`, and `missing_skills`.

### `GET /api/jobs/{id}/match`
Returns the explainable 6-factor weighting calculation, matched/missing skill lists, and tailored recruiter advice.

### `POST /api/jobs/{id}/save`
Toggles bookmark state for the specified job.

### `GET /api/jobs/saved/all`
Returns all bookmarked opportunities for the current candidate.

---

## 4. Skill Gap Analyzer

### `GET /api/skills/gaps`
Compares user's resume skills against role curriculum requirements.
- **Query Parameters**: `role` (e.g. `AI Engineer`)
- **Response**:
  ```json
  {
    "target_role": "AI Engineer",
    "user_skills_identified": ["Python", "PyTorch", "SQL", "FastAPI"],
    "missing_skills_count": 3,
    "gaps": [
      {
        "skill": "Docker",
        "importance": "Critical",
        "category": "DevOps / MLOps",
        "difficulty": "Intermediate",
        "why_it_matters": "Containers guarantee consistent ML runtime environments...",
        "learning_path": "Dockerfiles -> Compose -> GPU runtime...",
        "resources": [ ... ]
      }
    ]
  }
  ```

---

## 5. AI Mock Interview Practice

### `POST /api/interviews`
Generates a new 5-question interview session tailored to position, format, and difficulty.
- **Request Body**:
  ```json
  {
    "role": "AI Engineer",
    "interview_type": "Technical",
    "difficulty": "Intermediate"
  }
  ```

### `POST /api/interviews/{id}/questions/{q_id}/answer`
Submits candidate answer (text or voice transcribed) and receives instant rubric evaluation.
- **Request Body**:
  ```json
  {
    "user_answer": "Supervised learning uses labeled targets...",
    "is_audio": true,
    "audio_duration": 42.5
  }
  ```
- **Response**:
  ```json
  {
    "score": 88,
    "technical_score": 88,
    "communication_score": 81,
    "feedback": "Superb conceptual breakdown...",
    "strengths": [ ... ],
    "improvements": [ ... ],
    "model_answer_structure": [ ... ]
  }
  ```

### `POST /api/interviews/{id}/complete`
Finalizes interview session, computes composite scores, and sends a notification.

---

## 6. Dashboard & Analytics

### `GET /api/dashboard`
Aggregates summary statistics, top recommended jobs, ATS score, and AI insight banner.

### `GET /api/analytics`
Provides multi-dimensional dataset for interactive Recharts visualizations (score trajectories, competency radar, market skill demand).

---

## 7. AI Career Assistant

### `POST /api/assistant/chat`
Converses with floating assistant using active candidate resume and skill gap context.
