# CareerAI — Database Schema & Entity Relationships

The database architecture is designed with clean relational normalization, foreign key constraints, cascade rules, and indexing on frequent lookup fields.

---

## Entity Relationship Diagram (Conceptual)

```
       ┌──────────────┐
       │    users     │
       └──────┬───────┘
              │ 1:N
   ┌──────────┼───────────┬─────────────┬─────────────┐
   ▼          ▼           ▼             ▼             ▼
┌───────┐ ┌────────┐ ┌─────────┐ ┌─────────────┐ ┌───────────────┐
│resumes│ │saved_  │ │ job_    │ │ interviews  │ │ notifications │
└───┬───┘ │ jobs   │ │ matches │ └──────┬──────┘ └───────────────┘
    │ 1:N └────────┘ └─────────┘        │ 1:N
┌───▼───────────┐                 ┌─────▼───────────────┐
│resume_analyses│                 │interview_questions  │
└───────────────┘                 └─────┬───────────────┘
                                        │ 1:1
                                  ┌─────▼───────────────┐
                                  │ interview_answers   │
                                  └─────────────────────┘
```

---

## Table Specifications

### 1. `users`
- `id` (INTEGER, Primary Key, Auto Increment)
- `name` (VARCHAR 120, NOT NULL)
- `email` (VARCHAR 255, UNIQUE, NOT NULL, INDEX)
- `password_hash` (VARCHAR 255, NOT NULL)
- `phone` (VARCHAR 50, NULL)
- `location` (VARCHAR 120, NULL)
- `college` (VARCHAR 200, NULL)
- `degree` (VARCHAR 120, NULL)
- `branch` (VARCHAR 120, NULL)
- `graduation_year` (INTEGER, NULL)
- `experience_level` (VARCHAR 50, Default: "Entry-level")
- `target_role` (VARCHAR 120, Default: "AI Engineer")
- `bio` (TEXT, NULL)
- `profile_photo` (VARCHAR 255, NULL)
- `is_active` (BOOLEAN, Default: TRUE)
- `created_at` (DATETIME, Default: CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, Default: CURRENT_TIMESTAMP)

### 2. `resumes`
- `id` (INTEGER, Primary Key, Auto Increment)
- `user_id` (INTEGER, Foreign Key `users.id` ON DELETE CASCADE, INDEX)
- `title` (VARCHAR 200, NOT NULL)
- `filename` (VARCHAR 255, NOT NULL)
- `file_path` (VARCHAR 500, NOT NULL)
- `file_type` (VARCHAR 50, NOT NULL)
- `file_size` (INTEGER, Default: 0)
- `raw_text` (TEXT, NULL)
- `parsed_data` (TEXT, JSON-serialized extracted sections)
- `is_active` (BOOLEAN, Default: TRUE)
- `uploaded_at` (DATETIME, Default: CURRENT_TIMESTAMP)

### 3. `resume_analyses`
- `id` (INTEGER, Primary Key, Auto Increment)
- `resume_id` (INTEGER, Foreign Key `resumes.id` ON DELETE CASCADE, INDEX)
- `overall_score` (INTEGER, 0-100)
- `ats_score` (INTEGER, 0-100)
- `skills_score` (INTEGER, 0-100)
- `experience_score` (INTEGER, 0-100)
- `education_score` (INTEGER, 0-100)
- `formatting_score` (INTEGER, 0-100)
- `keywords_score` (INTEGER, 0-100)
- `strengths` (TEXT, JSON array of strings)
- `weaknesses` (TEXT, JSON array of strings)
- `suggestions` (TEXT, JSON array of strings)
- `extracted_skills` (TEXT, JSON array of skills)
- `missing_critical_skills` (TEXT, JSON array of strings)
- `bullet_rewrites` (TEXT, JSON array of before/after objects)
- `created_at` (DATETIME, Default: CURRENT_TIMESTAMP)

### 4. `jobs`
- `id` (INTEGER, Primary Key, Auto Increment)
- `title` (VARCHAR 200, NOT NULL, INDEX)
- `company` (VARCHAR 150, NOT NULL, INDEX)
- `location` (VARCHAR 150, NOT NULL)
- `work_type` (VARCHAR 50, Default: "Hybrid")
- `experience_level` (VARCHAR 50, Default: "Entry-level")
- `salary_min` (INTEGER, NULL)
- `salary_max` (INTEGER, NULL)
- `salary_currency` (VARCHAR 10, Default: "USD")
- `description` (TEXT, NOT NULL)
- `required_skills` (TEXT, JSON array)
- `preferred_skills` (TEXT, JSON array)
- `industry` (VARCHAR 100, Default: "Technology")
- `logo_url` (VARCHAR 300, NULL)
- `source` (VARCHAR 100, Default: "CareerAI Direct")
- `created_at` (DATETIME, Default: CURRENT_TIMESTAMP)

### 5. `saved_jobs`
- `id` (INTEGER, Primary Key, Auto Increment)
- `user_id` (INTEGER, Foreign Key `users.id` ON DELETE CASCADE, INDEX)
- `job_id` (INTEGER, Foreign Key `jobs.id` ON DELETE CASCADE, INDEX)
- `saved_at` (DATETIME, Default: CURRENT_TIMESTAMP)

### 6. `interviews`
- `id` (INTEGER, Primary Key, Auto Increment)
- `user_id` (INTEGER, Foreign Key `users.id` ON DELETE CASCADE, INDEX)
- `resume_id` (INTEGER, Foreign Key `resumes.id` ON DELETE SET NULL, NULL)
- `role` (VARCHAR 120, NOT NULL)
- `interview_type` (VARCHAR 50, Default: "Technical")
- `difficulty` (VARCHAR 50, Default: "Intermediate")
- `status` (VARCHAR 50, Default: "in_progress")
- `overall_score` (INTEGER, NULL)
- `technical_score` (INTEGER, NULL)
- `communication_score` (INTEGER, NULL)
- `problem_solving_score` (INTEGER, NULL)
- `relevance_score` (INTEGER, NULL)
- `clarity_score` (INTEGER, NULL)
- `feedback_summary` (TEXT, NULL)
- `key_strengths` (TEXT, JSON array)
- `key_improvements` (TEXT, JSON array)
- `created_at` (DATETIME, Default: CURRENT_TIMESTAMP)

### 7. `interview_questions`
- `id` (INTEGER, Primary Key, Auto Increment)
- `interview_id` (INTEGER, Foreign Key `interviews.id` ON DELETE CASCADE, INDEX)
- `order_index` (INTEGER, Default: 1)
- `question_text` (TEXT, NOT NULL)
- `category` (VARCHAR 100, NOT NULL)
- `context_hint` (TEXT, NULL)
- `expected_topics` (TEXT, JSON array)

### 8. `interview_answers`
- `id` (INTEGER, Primary Key, Auto Increment)
- `question_id` (INTEGER, Foreign Key `interview_questions.id` ON DELETE CASCADE, INDEX, UNIQUE)
- `user_answer` (TEXT, NOT NULL)
- `is_audio` (BOOLEAN, Default: FALSE)
- `audio_duration` (FLOAT, Default: 0.0)
- `score` (INTEGER, Default: 75)
- `feedback` (TEXT, NULL)
- `strengths` (TEXT, JSON array)
- `improvements` (TEXT, JSON array)
- `model_answer_structure` (TEXT, JSON array)
- `created_at` (DATETIME, Default: CURRENT_TIMESTAMP)

### 9. `notifications`
- `id` (INTEGER, Primary Key, Auto Increment)
- `user_id` (INTEGER, Foreign Key `users.id` ON DELETE CASCADE, INDEX)
- `title` (VARCHAR 200, NOT NULL)
- `message` (TEXT, NOT NULL)
- `type` (VARCHAR 50, Default: "info")
- `link` (VARCHAR 255, NULL)
- `is_read` (BOOLEAN, Default: FALSE)
- `created_at` (DATETIME, Default: CURRENT_TIMESTAMP)
