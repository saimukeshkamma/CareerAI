from typing import List, Dict, Any

class AISkillAnalyzer:
    ROLE_CURRICULUM = {
        "AI Engineer": [
            {
                "skill": "PyTorch",
                "importance": "Critical",
                "category": "Deep Learning",
                "difficulty": "Intermediate",
                "why_it_matters": "PyTorch is the de-facto industry standard framework for developing modern LLMs, Transformers, and custom neural networks.",
                "learning_path": "Tensors & Autograd -> Building Custom nn.Module -> Transfer Learning -> Fine-tuning Hugging Face Transformers -> Deployment with TorchScript / ONNX.",
                "resources": [
                    {"title": "Deep Learning with PyTorch (Official 60-min Blitz)", "url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html"},
                    {"title": "Hugging Face Deep Learning Course", "url": "https://huggingface.co/learn/nlp-course"}
                ]
            },
            {
                "skill": "Docker",
                "importance": "Critical",
                "category": "DevOps / MLOps",
                "difficulty": "Intermediate",
                "why_it_matters": "Containers guarantee consistent ML runtime environments across development, testing, GPU clusters, and production.",
                "learning_path": "Dockerfiles -> Multi-stage builds -> Docker Compose for microservices -> GPU runtime (NVIDIA Container Toolkit) -> Container registries.",
                "resources": [
                    {"title": "Docker Getting Started Guide", "url": "https://docs.docker.com/get-started/"},
                    {"title": "Docker for Data Science & ML", "url": "https://towardsdatascience.com"}
                ]
            },
            {
                "skill": "FastAPI",
                "importance": "High",
                "category": "Backend & Model Serving",
                "difficulty": "Beginner",
                "why_it_matters": "High-performance asynchronous Python framework used extensively to serve model inference endpoints and AI agents.",
                "learning_path": "Route handlers & Pydantic validation -> Dependency Injection -> Async inference background tasks -> Dockerized deployment.",
                "resources": [
                    {"title": "FastAPI Tutorial - User Guide", "url": "https://fastapi.tiangolo.com/tutorial/"}
                ]
            },
            {
                "skill": "AWS",
                "importance": "High",
                "category": "Cloud Infrastructure",
                "difficulty": "Advanced",
                "why_it_matters": "Modern AI workloads utilize cloud compute (EC2 GPU instances, S3 storage, and SageMaker model hosting pipelines).",
                "learning_path": "S3 & IAM -> EC2 GPU provisioning -> Lambda serverless -> SageMaker endpoint deployment.",
                "resources": [
                    {"title": "AWS Free Tier & Machine Learning", "url": "https://aws.amazon.com/free/"},
                    {"title": "AWS Skill Builder AI Fundamentals", "url": "https://explore.skillbuilder.aws"}
                ]
            },
            {
                "skill": "LangChain & LLM Agents",
                "importance": "Medium",
                "category": "Generative AI",
                "difficulty": "Intermediate",
                "why_it_matters": "Essential for building RAG (Retrieval-Augmented Generation) systems, tool-using agents, and enterprise chatbots.",
                "learning_path": "Prompt templates -> Vector Databases (Chroma/Pinecone) -> RAG architecture -> Multi-agent orchestration.",
                "resources": [
                    {"title": "LangChain Official Documentation", "url": "https://python.langchain.com/docs/get_started/introduction"}
                ]
            }
        ],
        "ML Engineer": [
            {
                "skill": "MLOps & CI/CD",
                "importance": "Critical",
                "category": "Production ML",
                "difficulty": "Advanced",
                "why_it_matters": "Automates the lifecycle from data ingestion to model monitoring, retraining, and drift detection.",
                "learning_path": "Git workflows -> MLflow experiment tracking -> DVC data versioning -> Automated pipeline triggers.",
                "resources": [
                    {"title": "Made With ML MLOps Course", "url": "https://madewithml.com"}
                ]
            },
            {
                "skill": "Docker",
                "importance": "Critical",
                "category": "DevOps",
                "difficulty": "Intermediate",
                "why_it_matters": "Essential for containerizing ML serving images and pipeline stages.",
                "learning_path": "Basics -> Layer optimization -> Multi-stage builds.",
                "resources": [{"title": "Docker Docs", "url": "https://docs.docker.com"}]
            },
            {
                "skill": "Kubernetes",
                "importance": "High",
                "category": "Cloud Orchestration",
                "difficulty": "Advanced",
                "why_it_matters": "Scales inference services and distributed training jobs across clusters.",
                "learning_path": "Pods & Services -> Deployments -> KServe / Kubeflow.",
                "resources": [{"title": "Kubernetes Basics", "url": "https://kubernetes.io/docs/tutorials/"}]
            }
        ],
        "Software Engineer": [
            {
                "skill": "System Design",
                "importance": "Critical",
                "category": "Architecture",
                "difficulty": "Advanced",
                "why_it_matters": "Core requirement for mid/senior interviews: caching, load balancing, databases, CAP theorem, and scalability.",
                "learning_path": "Client-Server -> Caching (Redis) -> Message Queues (Kafka) -> Sharding & Replication -> Designing real systems (URL shortener, chat app).",
                "resources": [
                    {"title": "System Design Primer (GitHub)", "url": "https://github.com/donnemartin/system-design-primer"}
                ]
            },
            {
                "skill": "Docker & Kubernetes",
                "importance": "High",
                "category": "DevOps",
                "difficulty": "Intermediate",
                "why_it_matters": "Industry standard for packaging and deploying microservices.",
                "learning_path": "Containers -> Networking -> Volumes -> Orchestration.",
                "resources": [{"title": "Docker Documentation", "url": "https://docs.docker.com"}]
            },
            {
                "skill": "PostgreSQL & Indexing",
                "importance": "High",
                "category": "Databases",
                "difficulty": "Intermediate",
                "why_it_matters": "Understanding query plans, B-trees, ACID compliance, and concurrency is critical for performant applications.",
                "learning_path": "Schema design -> Foreign keys -> Indexes & EXPLAIN ANALYZE -> Connection pooling.",
                "resources": [{"title": "Use The Index, Luke!", "url": "https://use-the-index-luke.com"}]
            }
        ]
    }

    @classmethod
    def get_skill_gaps(cls, user_skills: List[str], target_role: str = "AI Engineer") -> List[Dict[str, Any]]:
        user_skills_lower = set(s.lower() for s in user_skills)
        curriculum = cls.ROLE_CURRICULUM.get(target_role, cls.ROLE_CURRICULUM["AI Engineer"])

        gaps = []
        for item in curriculum:
            if item["skill"].lower() not in user_skills_lower:
                gaps.append(item)

        # If user already knows all curriculum skills, show advanced elective recommendations
        if not gaps:
            gaps.append({
                "skill": "Kubernetes & Kubeflow",
                "importance": "High",
                "category": "Advanced Orchestration",
                "difficulty": "Advanced",
                "why_it_matters": "Distribute large model training and inference pipelines across cloud GPU clusters.",
                "learning_path": "Kubernetes architecture -> Helm charts -> KServe -> Automated model rollout.",
                "resources": [{"title": "Kubeflow Official Documentation", "url": "https://www.kubeflow.org"}]
            })

        return gaps
