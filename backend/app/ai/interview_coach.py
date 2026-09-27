import re
from typing import List, Dict, Any

class AIInterviewCoach:
    QUESTION_BANK = {
        "AI Engineer": [
            {
                "text": "Explain the architectural differences between supervised, unsupervised, and reinforcement learning, with a concrete real-world example of each.",
                "category": "Core Machine Learning",
                "hint": "Mention feedback signal types: ground truth labels, patterns/clustering, and reward signals in an environment.",
                "topics": ["Supervised", "Unsupervised", "Reinforcement Learning", "Loss Functions", "Reward Signal"]
            },
            {
                "text": "How does the Self-Attention mechanism in Transformer architectures work, and why does it overcome the vanishing gradient and sequential bottlenecks of RNNs?",
                "category": "Deep Learning & Transformers",
                "hint": "Detail Queries, Keys, Values (Q, K, V), scaled dot-product formula, and parallel token processing across sequences.",
                "topics": ["Self-Attention", "Query Key Value", "O(N^2) complexity", "RNN limitations", "Positional Encoding"]
            },
            {
                "text": "What is Retrieval-Augmented Generation (RAG)? Walk me through the end-to-end data pipeline from document ingestion to final LLM answer generation.",
                "category": "Generative AI Systems",
                "hint": "Cover chunking strategies, embedding generation, vector indexing/ANN search, top-k retrieval, prompt augmentation, and hallucination reduction.",
                "topics": ["Chunking", "Vector Database", "Embeddings", "Cosine Similarity", "Hallucination Mitigation"]
            },
            {
                "text": "When deploying an LLM into production, how would you address latency, GPU memory constraints, and high inference costs?",
                "category": "ML System Design & Inference",
                "hint": "Consider quantization (INT8/FP4), vLLM / PagedAttention, continuous batching, model caching, and speculative decoding.",
                "topics": ["Quantization", "vLLM", "PagedAttention", "Model Pruning", "Speculative Decoding", "Streaming"]
            },
            {
                "text": "Describe a scenario where you trained a model that suffered from severe overfitting on the training set. What diagnostic steps and regularization techniques did you employ?",
                "category": "Practical Debugging",
                "hint": "Discuss training vs validation loss curves, Dropout, weight decay (L2), data augmentation, cross-validation, and early stopping.",
                "topics": ["Overfitting", "Cross-Validation", "Dropout", "Data Augmentation", "Early Stopping"]
            }
        ],
        "ML Engineer": [
            {
                "text": "Explain the bias-variance tradeoff. How do ensemble methods like Random Forests and Gradient Boosted Trees treat bias and variance differently?",
                "category": "Statistical Learning",
                "hint": "Bagging reduces variance by averaging uncorrelated trees; Boosting reduces bias iteratively by training on residual errors.",
                "topics": ["Bias", "Variance", "Bagging", "Boosting", "Random Forest", "XGBoost"]
            },
            {
                "text": "How do you detect and handle data drift and concept drift in a deployed production machine learning model?",
                "category": "MLOps & Monitoring",
                "hint": "Discuss KS-tests, Population Stability Index (PSI), ground truth latency, automated alerting, and scheduled retraining pipelines.",
                "topics": ["Data Drift", "Concept Drift", "PSI", "KS Test", "Model Retraining", "MLflow"]
            },
            {
                "text": "Design a real-time recommendation feature for an e-commerce platform handling 50,000 requests per minute with sub-50ms latency.",
                "category": "ML System Design",
                "hint": "Two-stage pipeline: Candidate generation (retrieval via vector search/matrix factorization) + Heavy ranking model with Redis feature store.",
                "topics": ["Candidate Generation", "Ranking Model", "Feature Store", "Redis", "Sub-50ms Latency"]
            },
            {
                "text": "What loss function would you select for a multi-class classification task with severe class imbalance, and why?",
                "category": "Loss Functions & Optimization",
                "hint": "Mention Weighted Cross-Entropy, Focal Loss, Class-balanced loss, or resampling techniques like SMOTE.",
                "topics": ["Focal Loss", "Weighted Cross Entropy", "Class Imbalance", "Precision-Recall Curve"]
            },
            {
                "text": "Walk me through how you build a reproducible Dockerized pipeline with CI/CD for continuous model retraining and automated testing.",
                "category": "DevOps & Tooling",
                "hint": "Discuss multi-stage Dockerfiles, caching dependency wheels, automated unit tests on data schemas, and artifact versioning with DVC.",
                "topics": ["Docker", "CI/CD", "DVC", "Artifact Registry", "Automated Testing"]
            }
        ],
        "Software Engineer": [
            {
                "text": "Explain the internal differences between process vs thread, and how concurrency is managed with locks, mutexes, and async event loops.",
                "category": "Operating Systems & Concurrency",
                "hint": "Memory address space sharing, context switching overhead, race conditions, deadlocks, and cooperative multitasking.",
                "topics": ["Process vs Thread", "Mutex", "Deadlock", "Event Loop", "Race Condition"]
            },
            {
                "text": "Design a scalable URL shortening service (like Bitly) supporting 100 million new URLs per day and 1 billion reads per day.",
                "category": "System Design",
                "hint": "Hash generation (Base62 vs auto-increment counter with ZooKeeper), database choice (NoSQL vs SQL), caching hot URLs (Redis LRU), and CDN.",
                "topics": ["Base62", "Caching", "Redis LRU", "Database Sharding", "High Availability"]
            },
            {
                "text": "Explain the trade-offs between REST and GraphQL. In what architectural scenarios would you strictly choose one over the other?",
                "category": "API Architecture",
                "hint": "Over-fetching and under-fetching, HTTP caching simplicity, N+1 query problem, schema definition, and payload overhead.",
                "topics": ["REST", "GraphQL", "Over-fetching", "HTTP Caching", "N+1 Problem"]
            },
            {
                "text": "What is database indexing? How does a B-Tree index accelerate search, and what are the trade-offs on INSERT and UPDATE operations?",
                "category": "Databases",
                "hint": "O(log N) lookup, sequential leaf node traversals, disk I/O reduction, index maintenance overhead on write queries.",
                "topics": ["B-Tree", "Composite Index", "Disk I/O", "Write Overhead", "EXPLAIN ANALYZE"]
            },
            {
                "text": "Tell me about a difficult technical bug or outage you encountered in a project. How did you isolate root cause, mitigate impact, and prevent recurrence?",
                "category": "Behavioral & Engineering Rigor",
                "hint": "Use the STAR method (Situation, Task, Action, Result) with post-mortem documentation and regression unit tests.",
                "topics": ["Root Cause Analysis", "Debugging", "Post-mortem", "Regression Tests", "STAR Method"]
            }
        ],
        "HR / Behavioral": [
            {
                "text": "Tell me about yourself, your educational journey in technology, and why you are specifically pursuing this career path.",
                "category": "Introduction & Career Vision",
                "hint": "Keep it structured: Past background -> Present key achievements/projects -> Future aspirations aligned with the company.",
                "topics": ["Elevator Pitch", "Technical Passions", "Long-term Goals"]
            },
            {
                "text": "Describe a situation where you had a strong technical disagreement with a teammate or peer. How did you resolve it?",
                "category": "Collaboration & Conflict",
                "hint": "Focus on data-driven benchmarking, collaborative compromise, prioritizing project goals, and respectful communication.",
                "topics": ["Empathy", "Objective Evaluation", "Team Success"]
            },
            {
                "text": "Tell me about a time you had to learn an unfamiliar tool, framework, or language under a tight deadline to deliver a project.",
                "category": "Adaptability & Growth Mindset",
                "hint": "Highlight resourcefulness, breaking down complex docs, building minimal prototypes, and delivering on schedule.",
                "topics": ["Learning Curve", "Resourcefulness", "Time Management"]
            },
            {
                "text": "What do you consider your greatest technical strength, and what is an area where you are actively working to improve?",
                "category": "Self-Awareness & Ownership",
                "hint": "Be candid with an authentic improvement area and describe the concrete steps (courses, projects) you are taking to bridge it.",
                "topics": ["Self-Awareness", "Continuous Learning", "Actionable Improvement"]
            },
            {
                "text": "Where do you see yourself professionally in the next 2 to 3 years, and how does this role help you achieve that vision?",
                "category": "Career Alignment",
                "hint": "Connect technical mastery, leadership or architectural growth, and contributing meaningful impact to the team.",
                "topics": ["Vision", "Commitment", "Impact"]
            }
        ]
    }

    @classmethod
    def get_questions_for_interview(cls, role: str, interview_type: str = "Technical", count: int = 5) -> List[Dict[str, Any]]:
        # Select appropriate bank
        if "hr" in interview_type.lower() or "behavioral" in interview_type.lower():
            pool = cls.QUESTION_BANK["HR / Behavioral"]
        elif "ml" in role.lower():
            pool = cls.QUESTION_BANK.get("ML Engineer", cls.QUESTION_BANK["AI Engineer"])
        elif "software" in role.lower() or "full" in role.lower():
            pool = cls.QUESTION_BANK.get("Software Engineer", cls.QUESTION_BANK["AI Engineer"])
        else:
            pool = cls.QUESTION_BANK.get("AI Engineer", cls.QUESTION_BANK["AI Engineer"])

        return pool[:count]

    @classmethod
    def evaluate_answer(cls, question_text: str, user_answer: str, category: str, expected_topics: List[str] = None) -> Dict[str, Any]:
        ans_clean = user_answer.strip()

        # 0. High-Speed AI Evaluation via Groq LPU
        if len(ans_clean) >= 15:
            try:
                from ..services.groq_service import GroqService
                groq_eval = GroqService.evaluate_interview_answer(
                    question_text=question_text,
                    user_answer=user_answer,
                    category=category
                )
                if groq_eval and "score" in groq_eval and isinstance(groq_eval["score"], (int, float)):
                    g_score = int(groq_eval["score"])
                    return {
                        "score": g_score,
                        "technical_score": min(98, max(45, g_score + 2)),
                        "communication_score": min(98, max(45, g_score - 2)),
                        "relevance_score": min(98, max(45, g_score + 1)),
                        "problem_solving_score": min(98, max(45, g_score)),
                        "clarity_score": min(98, max(45, g_score - 1)),
                        "feedback": groq_eval.get("feedback", "Evaluation generated by Groq AI."),
                        "strengths": groq_eval.get("strengths", ["Addressed core technical aspects"]),
                        "improvements": groq_eval.get("improvements", ["Provide more concrete metrics"]),
                        "model_answer_structure": [
                            groq_eval.get("sample_answer", "Define the concept, detail internal mechanics, cite production metrics, and contrast trade-offs.")
                        ],
                        "weak_topic": groq_eval.get("weak_topic")
                    }
            except Exception:
                pass

        word_count = len(ans_clean.split())
        lower_ans = ans_clean.lower()

        if expected_topics is None:
            expected_topics = []

        # 1. Relevance & Topic Coverage
        matched_topics = [t for t in expected_topics if t.lower() in lower_ans]
        topic_ratio = len(matched_topics) / max(1, len(expected_topics)) if expected_topics else 0.8
        relevance_score = min(98, max(50, int(topic_ratio * 40 + (35 if word_count >= 50 else 15) + 20)))

        # 2. Technical Knowledge
        technical_terms = [
            "architecture", "algorithm", "parameter", "latency", "throughput", "scalable",
            "optimization", "loss", "metric", "framework", "gradient", "vector", "database",
            "asynchronous", "tradeoff", "cache", "deploy", "pipeline", "interface"
        ]
        tech_hits = sum(1 for term in technical_terms if term in lower_ans)
        tech_score = min(96, max(52, 50 + tech_hits * 6 + int(topic_ratio * 20)))

        # 3. Communication & Clarity
        # Good structure indicators: numbering, bullet points, transitional phrases ("for example", "furthermore", "in contrast")
        transitions = ["for example", "specifically", "in contrast", "furthermore", "as a result", "secondly", "additionally"]
        trans_hits = sum(1 for tr in transitions if tr in lower_ans)
        
        clarity_score = min(95, max(60, 65 + trans_hits * 7 + (15 if 60 <= word_count <= 250 else 5)))
        comm_score = min(96, max(58, int((clarity_score + relevance_score) / 2)))

        # 4. Problem Solving & Completeness
        has_example = "example" in lower_ans or "such as" in lower_ans or "project" in lower_ans or "case" in lower_ans
        has_tradeoff = "tradeoff" in lower_ans or "however" in lower_ans or "drawback" in lower_ans or "alternative" in lower_ans
        problem_score = min(95, max(55, 60 + (18 if has_example else 0) + (14 if has_tradeoff else 0)))

        # Question Score Composite
        score = int(tech_score * 0.35 + relevance_score * 0.25 + comm_score * 0.20 + problem_score * 0.20)
        score = min(98, max(45, score))

        # Strengths
        strengths = []
        if matched_topics:
            strengths.append(f"Accurately addressed key technical concepts: {', '.join(matched_topics[:3])}.")
        if has_example:
            strengths.append("Supported reasoning with concrete illustrative examples.")
        if has_tradeoff:
            strengths.append("Demonstrated senior engineering maturity by acknowledging trade-offs and constraints.")
        if word_count >= 60:
            strengths.append("Provided detailed, substantive explanation rather than superficial one-liners.")
        if not strengths:
            strengths.append("Direct answer that captured the core intent of the question.")

        # Improvements
        improvements = []
        missing_topics = [t for t in expected_topics if t not in matched_topics]
        if missing_topics:
            improvements.append(f"Consider explicitly mentioning {', '.join(missing_topics[:3])} to demonstrate comprehensive depth.")
        if not has_example:
            improvements.append("Strengthen your answer with a concrete project anecdote or industry case study.")
        if not has_tradeoff:
            improvements.append("Highlight the engineering trade-offs (memory vs compute, simplicity vs scalability).")
        if word_count < 50:
            improvements.append("Answer is somewhat brief; elaborate on underlying mechanics and execution details.")
        if not improvements:
            improvements.append("Great answer! Practice keeping delivery crisp under 90 seconds in a live verbal setting.")

        # Structured Model Answer Breakdown
        model_structure = [
            "1. Clear High-Level Definition: Define the core concept in 1-2 authoritative sentences.",
            "2. Internal Mechanics: Explain step-by-step how the architecture / data flows internally.",
            "3. Concrete Production Example: Citing a realistic project or benchmark numbers (e.g. latency, scale).",
            "4. Tradeoffs & Alternatives: Contrast against competing paradigms and explain why you chose this solution."
        ]

        feedback = f"Solid response (Score: {score}/100). You articulated {len(matched_topics)} key points effectively." if score >= 75 else f"Good start (Score: {score}/100). Review the suggested answer structure to provide deeper technical specifics."

        return {
            "score": score,
            "technical_score": tech_score,
            "communication_score": comm_score,
            "relevance_score": relevance_score,
            "problem_solving_score": problem_score,
            "clarity_score": clarity_score,
            "feedback": feedback,
            "strengths": strengths,
            "improvements": improvements,
            "model_answer_structure": model_structure
        }
