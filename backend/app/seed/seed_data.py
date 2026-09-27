import json
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.job import Job
from ..models.resume import Resume, ResumeAnalysis
from ..models.interview import Interview, InterviewQuestion, InterviewAnswer
from ..models.notification import Notification
from ..utils.security import get_password_hash

DEMO_JOBS = [
    {
        "title": "AI Engineer Intern",
        "company": "Scale AI",
        "location": "San Francisco, CA (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Internship",
        "salary_min": 50,
        "salary_max": 65,
        "salary_currency": "USD/hr",
        "description": "Join our Foundation Model and Data Annotation team building RLHF and fine-tuning pipelines for frontier generative AI models. Work closely with research scientists to curate benchmarks, optimize latency, and evaluate model performance.",
        "required_skills": ["Python", "PyTorch", "Machine Learning", "FastAPI", "SQL", "Git"],
        "preferred_skills": ["Docker", "Transformers", "LangChain", "CUDA", "Linux"],
        "industry": "Generative AI",
        "logo_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Machine Learning Engineer",
        "company": "Databricks",
        "location": "Remote (US)",
        "work_type": "Remote",
        "experience_level": "Entry-level",
        "salary_min": 135000,
        "salary_max": 165000,
        "salary_currency": "USD",
        "description": "Build high-throughput ML pipelines leveraging MLflow and Apache Spark. Develop feature stores, automate model training lifecycles, and deploy scalable real-time inference services for enterprise customers.",
        "required_skills": ["Python", "SQL", "Scikit-learn", "Docker", "Machine Learning", "Git"],
        "preferred_skills": ["PyTorch", "Kubernetes", "AWS", "Spark", "MLflow"],
        "industry": "Cloud & Big Data",
        "logo_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Generative AI Application Developer",
        "company": "Cohere",
        "location": "New York, NY (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Entry-level",
        "salary_min": 120000,
        "salary_max": 150000,
        "salary_currency": "USD",
        "description": "Architect customer-facing generative applications powered by enterprise LLMs. Implement Retrieval-Augmented Generation (RAG) architectures, multi-agent frameworks, and vector search embeddings.",
        "required_skills": ["Python", "TypeScript", "React", "FastAPI", "REST API", "Git"],
        "preferred_skills": ["LangChain", "PyTorch", "Docker", "Vector Databases", "AWS"],
        "industry": "Enterprise AI",
        "logo_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Junior Data Scientist",
        "company": "Spotify",
        "location": "Boston, MA (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Entry-level",
        "salary_min": 110000,
        "salary_max": 135000,
        "salary_currency": "USD",
        "description": "Help shape the future of music and podcast discovery. Analyze listening behavior, design A/B experiments, formulate personalized recommendation hypotheses, and train predictive retention models.",
        "required_skills": ["Python", "SQL", "Pandas", "NumPy", "Machine Learning", "Data Structures"],
        "preferred_skills": ["Scikit-learn", "Tableau", "Statistics", "Docker", "GCP"],
        "industry": "Streaming Media",
        "logo_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Computer Vision Intern",
        "company": "Waymo",
        "location": "Mountain View, CA (On-site)",
        "work_type": "On-site",
        "experience_level": "Internship",
        "salary_min": 55,
        "salary_max": 70,
        "salary_currency": "USD/hr",
        "description": "Develop state-of-the-art 3D object detection, semantic segmentation, and sensor fusion algorithms for fully autonomous driving vehicles. Train large vision models using distributed GPU clusters.",
        "required_skills": ["Python", "C++", "PyTorch", "Computer Vision", "Linux", "Algorithms"],
        "preferred_skills": ["OpenCV", "CUDA", "TensorRT", "Docker", "Git"],
        "industry": "Autonomous Vehicles",
        "logo_url": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Full Stack AI Engineer",
        "company": "Vercel",
        "location": "Remote (Worldwide)",
        "work_type": "Remote",
        "experience_level": "Entry-level",
        "salary_min": 125000,
        "salary_max": 155000,
        "salary_currency": "USD",
        "description": "Empower millions of developers to deploy AI SDKs, serverless edge functions, and streaming chat interfaces. Bridge cutting-edge model APIs with modern frontend web experiences.",
        "required_skills": ["TypeScript", "React", "Next.js", "Node.js", "REST API", "Tailwind"],
        "preferred_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "GraphQL"],
        "industry": "Developer Tools",
        "logo_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Associate MLOps Engineer",
        "company": "DoorDash",
        "location": "San Francisco, CA (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Entry-level",
        "salary_min": 130000,
        "salary_max": 160000,
        "salary_currency": "USD",
        "description": "Maintain reliability and latency for DoorDash dispatch, ETA estimation, and pricing models running millions of inferences per second. Manage automated retraining and Kubernetes deployments.",
        "required_skills": ["Python", "Docker", "Kubernetes", "SQL", "Git", "CI/CD"],
        "preferred_skills": ["AWS", "Terraform", "FastAPI", "Machine Learning", "Prometheus"],
        "industry": "Logistics & Food Tech",
        "logo_url": "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Natural Language Processing (NLP) Engineer",
        "company": "Grammarly",
        "location": "Seattle, WA (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Entry-level",
        "salary_min": 135000,
        "salary_max": 165000,
        "salary_currency": "USD",
        "description": "Research and engineer multilingual text processing models, grammar correction, tone rewriting, and text generation systems serving 30M+ daily active users.",
        "required_skills": ["Python", "PyTorch", "NLP", "Transformers", "Git", "Algorithms"],
        "preferred_skills": ["Hugging Face", "C++", "Docker", "Deep Learning", "FastAPI"],
        "industry": "AI Productivity",
        "logo_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Software Engineer - Backend Platform",
        "company": "Stripe",
        "location": "San Francisco, CA (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Entry-level",
        "salary_min": 140000,
        "salary_max": 175000,
        "salary_currency": "USD",
        "description": "Design mission-critical payment APIs and distributed financial ledger infrastructure. Guarantee 99.999% availability, idempotent transactions, and seamless developer ergonomics.",
        "required_skills": ["Java", "Python", "SQL", "Data Structures", "Algorithms", "System Design"],
        "preferred_skills": ["Docker", "PostgreSQL", "Kafka", "Microservices", "Git"],
        "industry": "FinTech",
        "logo_url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Cloud Solutions & DevOps Intern",
        "company": "Cloudflare",
        "location": "Austin, TX (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Internship",
        "salary_min": 45,
        "salary_max": 60,
        "salary_currency": "USD/hr",
        "description": "Learn and build edge networking infrastructure, DNS routing, and DDoS mitigation tooling. Work on serverless Workers and vector databases deployed across 300+ global cities.",
        "required_skills": ["Linux", "Git", "Python", "Docker", "REST API"],
        "preferred_skills": ["Go", "Kubernetes", "AWS", "CI/CD", "TypeScript"],
        "industry": "Cybersecurity & Edge",
        "logo_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Data Analyst - Product & Growth",
        "company": "Airbnb",
        "location": "San Francisco, CA (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Entry-level",
        "salary_min": 105000,
        "salary_max": 130000,
        "salary_currency": "USD",
        "description": "Partner with product managers and designers to analyze guest booking funnels, search ranking dynamics, and host acquisition initiatives across global markets.",
        "required_skills": ["SQL", "Python", "Pandas", "Statistics", "Data Structures"],
        "preferred_skills": ["Tableau", "A/B Testing", "Machine Learning", "Git"],
        "industry": "Travel & Hospitality",
        "logo_url": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Deep Learning Research Intern",
        "company": "NVIDIA",
        "location": "Santa Clara, CA (On-site)",
        "work_type": "On-site",
        "experience_level": "Internship",
        "salary_min": 60,
        "salary_max": 75,
        "salary_currency": "USD/hr",
        "description": "Collaborate with world-class AI researchers accelerating next-generation generative video, diffusion models, and neural graphics using CUDA and TensorRT on DGX H100 clusters.",
        "required_skills": ["Python", "C++", "PyTorch", "Deep Learning", "Algorithms"],
        "preferred_skills": ["CUDA", "TensorFlow", "Computer Vision", "Linux", "Git"],
        "industry": "Semiconductors & AI",
        "logo_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Frontend Engineer - AI Interfaces",
        "company": "Linear",
        "location": "Remote (US/EU)",
        "work_type": "Remote",
        "experience_level": "Entry-level",
        "salary_min": 120000,
        "salary_max": 150000,
        "salary_currency": "USD",
        "description": "Build high-speed, keyboard-first issue tracking and AI-assisted workflow interfaces. Obsess over micro-interactions, 60fps rendering, offline sync, and delightful animations.",
        "required_skills": ["TypeScript", "React", "HTML", "CSS", "JavaScript", "Git"],
        "preferred_skills": ["Tailwind", "Next.js", "WebSockets", "Node.js", "GraphQL"],
        "industry": "Productivity SaaS",
        "logo_url": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Robotics & Perception Software Engineer",
        "company": "Boston Dynamics",
        "location": "Waltham, MA (On-site)",
        "work_type": "On-site",
        "experience_level": "Entry-level",
        "salary_min": 125000,
        "salary_max": 155000,
        "salary_currency": "USD",
        "description": "Bring dynamic perception and autonomy to mobile manipulation robots like Spot and Stretch. Integrate real-time point clouds, SLAM, obstacle avoidance, and manipulation policies.",
        "required_skills": ["C++", "Python", "Linux", "Algorithms", "Data Structures", "Git"],
        "preferred_skills": ["ROS", "Computer Vision", "PyTorch", "Docker", "System Design"],
        "industry": "Robotics",
        "logo_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "AI Platform Engineer",
        "company": "Snowflake",
        "location": "San Mateo, CA (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Entry-level",
        "salary_min": 135000,
        "salary_max": 165000,
        "salary_currency": "USD",
        "description": "Build Cortex AI features inside the Snowflake Data Cloud. Enable enterprise clients to execute secure SQL-accessible LLM queries, fine-tuning, and semantic document search.",
        "required_skills": ["Python", "SQL", "FastAPI", "Docker", "Git", "REST API"],
        "preferred_skills": ["PyTorch", "Kubernetes", "AWS", "Java", "Deep Learning"],
        "industry": "Cloud Data Warehousing",
        "logo_url": "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Security AI & Threat Detection Analyst",
        "company": "CrowdStrike",
        "location": "Austin, TX (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Entry-level",
        "salary_min": 115000,
        "salary_max": 140000,
        "salary_currency": "USD",
        "description": "Analyze millions of endpoint telemetry events using machine learning models to detect zero-day exploits, ransomware campaigns, and malicious adversary behaviors.",
        "required_skills": ["Python", "SQL", "Machine Learning", "Linux", "Git"],
        "preferred_skills": ["Scikit-learn", "Docker", "Pandas", "Cybersecurity", "REST API"],
        "industry": "Cybersecurity",
        "logo_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "AI Systems Performance Engineer",
        "company": "Anthropic",
        "location": "San Francisco, CA (Hybrid)",
        "work_type": "Mid-level",
        "experience_level": "Mid-level",
        "salary_min": 180000,
        "salary_max": 240000,
        "salary_currency": "USD",
        "description": "Optimize distributed GPU cluster training throughput and multi-node collective communication for Claude frontier models. Profile memory bandwidth, kernel execution, and network fabrics.",
        "required_skills": ["Python", "PyTorch", "CUDA", "Linux", "System Design", "Algorithms"],
        "preferred_skills": ["C++", "Docker", "Kubernetes", "Deep Learning", "Transformers"],
        "industry": "AI Safety & Research",
        "logo_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "Software Engineer - Infrastructure",
        "company": "Figma",
        "location": "San Francisco, CA (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Entry-level",
        "salary_min": 135000,
        "salary_max": 165000,
        "salary_currency": "USD",
        "description": "Scale real-time multiplayer document synchronization, WebAssembly rendering pipelines, and low-latency canvas operations handling millions of concurrent designers.",
        "required_skills": ["TypeScript", "C++", "React", "Data Structures", "Algorithms", "Git"],
        "preferred_skills": ["Rust", "WebAssembly", "Docker", "PostgreSQL", "AWS"],
        "industry": "Design & Collaboration",
        "logo_url": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "AI Product Specialist & Solutions Architect",
        "company": "OpenAI Partner Ecosystem",
        "location": "New York, NY (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Entry-level",
        "salary_min": 120000,
        "salary_max": 150000,
        "salary_currency": "USD",
        "description": "Advise enterprise engineering leaders on integrating fine-tuned models, vision endpoints, and function calling into their commercial workflows.",
        "required_skills": ["Python", "REST API", "FastAPI", "Machine Learning", "Git"],
        "preferred_skills": ["TypeScript", "Docker", "AWS", "System Design", "React"],
        "industry": "AI Consulting & Cloud",
        "logo_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80"
    },
    {
        "title": "ML Platform Engineer - Feature Store",
        "company": "Pinterest",
        "location": "Remote (US)",
        "work_type": "Remote",
        "experience_level": "Entry-level",
        "salary_min": 130000,
        "salary_max": 160000,
        "salary_currency": "USD",
        "description": "Build high-speed feature extraction and embedding caches powering visual search and home feed ranking for 450M+ pinners worldwide.",
        "required_skills": ["Python", "Java", "SQL", "Machine Learning", "Data Structures", "Docker"],
        "preferred_skills": ["PyTorch", "Kubernetes", "AWS", "Kafka", "Redis"],
        "industry": "Social Media & Visual Search",
        "logo_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&auto=format&fit=crop&q=80"
    }
]

SAMPLE_RESUME_TEXT = """
ALEX RIVERA
San Francisco, CA • alex@careerai.dev • (555) 234-5678 • linkedin.com/in/alexrivera-ai • github.com/alexrivera

EDUCATION
Stanford University, Stanford, CA
Bachelor of Science in Computer Science (Concentration in Artificial Intelligence)
Expected June 2026 | GPA: 3.86/4.00
Relevant Coursework: Machine Learning (CS229), Deep Learning for Computer Vision (CS231n), Natural Language Processing with Transformers (CS224n), Data Structures & Algorithms (CS106B), Operating Systems.

TECHNICAL SKILLS
• Programming Languages: Python, C++, Java, JavaScript, TypeScript, SQL
• Machine Learning & AI: PyTorch, TensorFlow, Scikit-learn, Hugging Face, OpenCV, LangChain, NumPy, Pandas
• Backend & Databases: FastAPI, Django, Flask, PostgreSQL, Redis, REST APIs
• Tools & Platforms: Git, GitHub, Linux, Bash, Docker (Basic)

PROJECTS
• Multimodal RAG Assistant for Research Papers | Python, PyTorch, LangChain, FastAPI, ChromaDB
  - Architected an end-to-end Retrieval-Augmented Generation pipeline indexing 5,000+ arXiv PDF papers with hybrid semantic search.
  - Achieved sub-180ms retrieval latency and reduced hallucinations by 42% compared to baseline zero-shot prompts.
  - Deployed model inference backend as a containerized FastAPI microservice with automated GitHub Actions CI/CD.

• Autonomous Vision Navigation Model | Python, PyTorch, OpenCV, CUDA
  - Trained a custom convolutional-transformer model for real-time lane detection and obstacle segmentation on KITTI benchmark.
  - Achieved 91.4% mIOU validation accuracy and optimized inference to 45 FPS on NVIDIA RTX 3080 using TensorRT FP16 quantization.

• Distributed Collaborative Code Editor | TypeScript, React, Node.js, WebSockets, Redis
  - Built a real-time multiplayer code workspace supporting up to 50 concurrent editors using Operational Transformation (OT).
  - Maintained sub-30ms end-to-end synchronization latency across geographic regions using Redis Pub/Sub channels.

EXPERIENCE
Undergraduate Machine Learning Research Assistant | Stanford AI Lab
September 2024 – Present | Stanford, CA
• Investigated parameter-efficient fine-tuning (LoRA, QLoRA) on Llama-3 8B parameter models for biomedical reasoning tasks.
• Curated and cleaned a high-quality dataset of 120,000 question-answer pairs, boosting domain downstream F1-score from 64.2% to 81.8%.
• Authored comprehensive experimentation scripts in PyTorch and submitted research findings to a leading student workshop.

Software Engineering Intern | TechStart Solutions
June 2024 – August 2024 | San Jose, CA
• Engineered 8 RESTful microservice endpoints in FastAPI handling 250,000 daily active customer account requests.
• Optimized slow relational PostgreSQL queries by designing composite indexes, slashing 95th percentile response times by 35%.
• Participated in daily Agile standups, sprint retrospectives, and authored unit tests achieving 94% test coverage.
"""

def seed_database(db: Session):
    # Check if jobs exist
    job_count = db.query(Job).count()
    if job_count == 0:
        print("🌱 Seeding jobs database...")
        for j in DEMO_JOBS:
            job = Job(
                title=j["title"],
                company=j["company"],
                location=j["location"],
                work_type=j["work_type"],
                experience_level=j["experience_level"],
                salary_min=j.get("salary_min"),
                salary_max=j.get("salary_max"),
                salary_currency=j.get("salary_currency", "USD"),
                description=j["description"],
                required_skills=json.dumps(j["required_skills"]),
                preferred_skills=json.dumps(j.get("preferred_skills", [])),
                industry=j.get("industry", "Technology"),
                logo_url=j.get("logo_url")
            )
            db.add(job)
        db.commit()
        print(f"✅ Successfully seeded {len(DEMO_JOBS)} tech jobs.")

    # Check if demo users exist
    user_count = db.query(User).count()
    if user_count == 0:
        print("🌱 Seeding demo users...")
        hashed_pw = get_password_hash("password123")

        # Demo User 1: Alex Rivera (Primary demo account)
        user1 = User(
            name="Alex Rivera",
            email="alex@careerai.dev",
            password_hash=hashed_pw,
            phone="+1 (555) 234-5678",
            location="San Francisco, CA",
            college="Stanford University",
            degree="Bachelor of Science",
            branch="Computer Science (AI Concentration)",
            graduation_year=2026,
            experience_level="Student / Intern",
            target_role="AI Engineer",
            bio="CS Junior at Stanford passionate about generative AI, deep learning systems, and deploying models to production.",
            profile_photo="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
        )
        db.add(user1)
        db.flush()

        # Seed Active Resume for User 1
        resume1 = Resume(
            user_id=user1.id,
            title="Alex_Rivera_AI_Engineer_Resume.pdf",
            filename="Alex_Rivera_Resume.pdf",
            file_path="uploads/demo_alex_rivera_resume.pdf",
            file_type="pdf",
            file_size=142850,
            raw_text=SAMPLE_RESUME_TEXT,
            parsed_data=json.dumps({
                "skills": ["Python", "PyTorch", "TensorFlow", "FastAPI", "SQL", "Git", "React", "Docker", "Machine Learning", "NLP"],
                "education": "Stanford University - BS Computer Science (2026)",
                "experience": "Stanford AI Lab Research Assistant; TechStart SWE Intern"
            }),
            is_active=True
        )
        db.add(resume1)
        db.flush()

        # Seed Resume Analysis for Resume 1
        analysis1 = ResumeAnalysis(
            resume_id=resume1.id,
            overall_score=87,
            ats_score=91,
            skills_score=88,
            experience_score=84,
            education_score=95,
            formatting_score=92,
            keywords_score=86,
            strengths=json.dumps([
                "Strong technical competencies in modern AI frameworks (PyTorch, LangChain, FastAPI).",
                "Exceptional quantifiable metrics throughout project bullets (e.g., '42% hallucination reduction', '45 FPS').",
                "High-caliber academic background and active lab research involvement at Stanford University.",
                "Clean, ATS-friendly section structuring with well-formatted links to GitHub and LinkedIn."
            ]),
            weaknesses=json.dumps([
                "Missing deeper cloud deployment and container orchestration experience (AWS SageMaker, Kubernetes).",
                "Industry work experience is currently limited to one summer internship.",
                "Could elaborate more on automated unit/integration test coverage for ML inference pipelines."
            ]),
            suggestions=json.dumps([
                "Integrate AWS cloud credentials and containerize projects with full multi-stage Dockerfiles.",
                "Add an architectural diagram link in project GitHub repositories for recruiter visibility.",
                "Highlight experience with vector databases and inference optimization tools like vLLM or ONNX."
            ]),
            extracted_skills=json.dumps([
                "Python", "PyTorch", "TensorFlow", "Scikit-Learn", "FastAPI", "Docker", "SQL", "Git",
                "Machine Learning", "Deep Learning", "NLP", "React", "TypeScript", "Linux", "REST API"
            ]),
            missing_critical_skills=json.dumps(["Docker", "AWS", "Kubernetes", "CI/CD"]),
            bullet_rewrites=json.dumps([
                {
                    "original": "Worked on machine learning research at Stanford AI Lab with Llama models.",
                    "suggested": "Conducted fine-tuning experiments (LoRA/QLoRA) on Llama-3 8B parameter models in PyTorch, lifting domain biomedical F1-score from 64.2% to 81.8%.",
                    "impact_reason": "Adds exact framework, method, model family, and measurable F1 metrics."
                }
            ])
        )
        db.add(analysis1)

        # Seed a completed mock interview for User 1
        interview1 = Interview(
            user_id=user1.id,
            resume_id=resume1.id,
            role="AI Engineer",
            interview_type="Technical",
            difficulty="Intermediate",
            status="completed",
            overall_score=84,
            technical_score=88,
            communication_score=81,
            problem_solving_score=86,
            relevance_score=90,
            clarity_score=82,
            feedback_summary="Strong grasp of core deep learning and transformer mechanisms. Provided clear mathematical explanations and practical examples.",
            key_strengths=json.dumps([
                "Accurate technical explanation of the Self-Attention mechanism.",
                "Great intuition on trade-offs between supervised and reinforcement learning.",
                "Structured communication using step-by-step problem decomposition."
            ]),
            key_improvements=json.dumps([
                "Mention concrete latency benchmarking tools when discussing model serving.",
                "Incorporate more real-world failure case examples into behavioral responses."
            ])
        )
        db.add(interview1)
        db.flush()

        q1 = InterviewQuestion(
            interview_id=interview1.id,
            order_index=1,
            question_text="Explain the architectural differences between supervised, unsupervised, and reinforcement learning, with a concrete real-world example of each.",
            category="Core Machine Learning",
            expected_topics=json.dumps(["Supervised", "Unsupervised", "Reinforcement Learning", "Labels", "Reward Signal"])
        )
        db.add(q1)
        db.flush()

        ans1 = InterviewAnswer(
            question_id=q1.id,
            user_answer="Supervised learning uses labeled training pairs (X, Y) to minimize a loss function like cross-entropy, e.g. sentiment classification. Unsupervised learning discovers latent representations from unlabeled data, like K-Means clustering customer segments. Reinforcement learning learns policies through trial and error by maximizing cumulative numerical rewards from an environment, like training robotic navigation.",
            score=88,
            feedback="Superb conceptual breakdown! You clearly distinguished the objective functions and data regimes across all three paradigms.",
            strengths=json.dumps(["Crystal clear definitions", "Practical real-world examples for each paradigm"]),
            improvements=json.dumps(["Could mention reward discount factors (gamma) in the RL segment"])
        )
        db.add(ans1)

        # Seed Notifications
        n1 = Notification(
            user_id=user1.id,
            title="Resume Analysis Complete",
            message="Your resume score increased to 87/100! Check out your new ATS breakdown and bullet suggestions.",
            type="success",
            link="/resumes"
        )
        n2 = Notification(
            user_id=user1.id,
            title="4 New Job Matches Detected",
            message="We matched your profile with Scale AI (92%) and Databricks (88%).",
            type="match",
            link="/jobs"
        )
        db.add(n1)
        db.add(n2)

        # Demo User 2: Priya Sharma (Senior ML Engineer)
        user2 = User(
            name="Priya Sharma",
            email="priya@careerai.dev",
            password_hash=hashed_pw,
            phone="+1 (555) 345-6789",
            location="Seattle, WA",
            college="University of Washington",
            degree="Master of Science",
            branch="Data Science & ML",
            graduation_year=2022,
            experience_level="Mid-level",
            target_role="ML Engineer",
            bio="ML Engineer with 4 years building real-time recommendation engines and MLOps infrastructure.",
            profile_photo="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
        )
        db.add(user2)

        # Demo User 3: David Chen (Full Stack Engineer)
        user3 = User(
            name="David Chen",
            email="david@careerai.dev",
            password_hash=hashed_pw,
            phone="+1 (555) 456-7890",
            location="Austin, TX",
            college="UT Austin",
            degree="Bachelor of Science",
            branch="Computer Engineering",
            graduation_year=2024,
            experience_level="Entry-level",
            target_role="Fullstack Developer",
            bio="Passionate web architect focused on React, TypeScript, and AI-enabled software.",
            profile_photo="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
        )
        db.add(user3)

        db.commit()
        print("✅ Demo users, active resume, analysis, and interview seeded successfully.")
