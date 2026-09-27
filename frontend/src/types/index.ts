export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduation_year?: number;
  experience_level?: string;
  target_role?: string;
  bio?: string;
  profile_photo?: string;
  is_active: boolean;
  created_at: string;
}

export interface BulletRewrite {
  original: string;
  suggested: string;
  impact_reason: string;
}

export interface ResumeAnalysis {
  id: number;
  resume_id: number;
  overall_score: number;
  ats_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
  formatting_score: number;
  keywords_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  extracted_skills: string[];
  missing_critical_skills: string[];
  bullet_rewrites: BulletRewrite[];
  created_at: string;
}

export interface Resume {
  id: number;
  user_id: number;
  title: string;
  filename: string;
  file_type: string;
  file_size: number;
  is_active: boolean;
  uploaded_at: string;
  raw_text?: string;
  latest_analysis?: ResumeAnalysis;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  work_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  industry: string;
  logo_url?: string;
  source: string;
  created_at: string;
  is_saved?: boolean;
  match_percentage?: number;
  matched_skills?: string[];
  missing_skills?: string[];
}

export interface MatchBreakdown {
  job_id: number;
  job_title: string;
  company: string;
  overall_match: number;
  breakdown: {
    skills_score: number;
    experience_score: number;
    education_score: number;
    project_score: number;
    keyword_score: number;
    weights: Record<string, string>;
  };
  matched_skills: string[];
  missing_skills: string[];
  fit_summary: string;
  recommendation: string;
  active_resume_title: string;
}

export interface SkillGapItem {
  skill: string;
  importance: string;
  category: string;
  difficulty: string;
  why_it_matters: string;
  learning_path: string;
  resources: { title: string; url: string }[];
}

export interface InterviewAnswer {
  id: number;
  question_id: number;
  user_answer: string;
  score: number;
  technical_score?: number;
  communication_score?: number;
  relevance_score?: number;
  problem_solving_score?: number;
  clarity_score?: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  model_answer_structure: string[];
  created_at: string;
}

export interface InterviewQuestion {
  id: number;
  order_index: number;
  question_text: string;
  category: string;
  context_hint?: string;
  expected_topics: string[];
  answer?: InterviewAnswer;
}

export interface Interview {
  id: number;
  role: string;
  interview_type: string;
  difficulty: string;
  status: string;
  overall_score?: number;
  technical_score?: number;
  communication_score?: number;
  problem_solving_score?: number;
  relevance_score?: number;
  clarity_score?: number;
  feedback_summary?: string;
  key_strengths?: string[];
  key_improvements?: string[];
  created_at: string;
  questions?: InterviewQuestion[];
}

export interface InterviewHistoryItem {
  id: number;
  role: string;
  interview_type: string;
  difficulty: string;
  status: string;
  overall_score?: number;
  questions_count: number;
  answered_count: number;
  created_at: string;
}

export interface DashboardData {
  user_name: string;
  target_role: string;
  experience_level: string;
  active_resume_score?: number;
  ats_score?: number;
  job_matches_count: number;
  average_interview_score?: number;
  skills_identified_count: number;
  recent_resume?: {
    id: number;
    title: string;
    uploaded_at: string;
    score: number;
  };
  recommended_jobs: Job[];
  top_skill_gaps: SkillGapItem[];
  recent_interview_score?: number;
  career_insight: string;
}

export interface AnalyticsData {
  score_trends: { date: string; resume_score: number; interview_score: number; readiness: number }[];
  category_radar: { subject: string; score: number; fullMark: number }[];
  interview_performance: Record<string, number>;
  skill_growth: { month: string; skills: number }[];
  job_market_demand: { skill: string; demand: number; candidatePossession: number }[];
  overall_readiness_index: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}
