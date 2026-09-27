import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base, SessionLocal
from app.seed.seed_data import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "CareerAI" in data["service"]

def test_demo_login(client):
    # Login as Alex Rivera (user 1)
    response = client.post("/api/auth/demo-login/1")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alex@careerai.dev"

def test_get_jobs_with_auth(client):
    auth_resp = client.post("/api/auth/demo-login/1")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/jobs", headers=headers)
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) >= 15
    first_job = jobs[0]
    assert "match_percentage" in first_job
    assert "required_skills" in first_job

def test_dashboard_summary(client):
    auth_resp = client.post("/api/auth/demo-login/1")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "active_resume_score" in data
    assert "job_matches_count" in data
    assert len(data["recommended_jobs"]) > 0

def test_skill_gaps(client):
    auth_resp = client.post("/api/auth/demo-login/1")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/skills/gaps", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "gaps" in data
    assert len(data["gaps"]) > 0

def test_interview_creation_and_question(client):
    auth_resp = client.post("/api/auth/demo-login/1")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create interview
    create_resp = client.post("/api/interviews", json={
        "role": "AI Engineer",
        "interview_type": "Technical",
        "difficulty": "Intermediate"
    }, headers=headers)
    assert create_resp.status_code == 200
    interview = create_resp.json()
    assert len(interview["questions"]) == 5

    # Answer first question
    q = interview["questions"][0]
    ans_resp = client.post(
        f"/api/interviews/{interview['id']}/questions/{q['id']}/answer",
        json={
            "user_answer": "Supervised learning trains with labeled targets to minimize loss. Unsupervised discovers clusters in unlabeled data. Reinforcement learning optimizes actions via environmental rewards."
        },
        headers=headers
    )
    assert ans_resp.status_code == 200
    ans_data = ans_resp.json()
    assert ans_data["score"] >= 60
    assert "feedback" in ans_data
    assert len(ans_data["strengths"]) > 0

def test_assistant_chat(client):
    auth_resp = client.post("/api/auth/demo-login/1")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/assistant/chat", json={
        "message": "What skills should I learn for an AI Engineer role?"
    }, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["suggestions"]) > 0

def test_google_auth_signup_and_login(client):
    # 1. Sign up new user directly with Google
    new_google_email = "direct.chrome.user@gmail.com"
    resp = client.post("/api/auth/google", json={
        "email": new_google_email,
        "name": "Chrome Google Tester",
        "picture": "https://lh3.googleusercontent.com/a/default-user"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == new_google_email
    assert data["user"]["name"] == "Chrome Google Tester"

    # 2. Existing user signs in with Google
    resp2 = client.post("/api/auth/google", json={
        "email": "alex@careerai.dev",
        "name": "Alex Rivera"
    })
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert "access_token" in data2
    assert data2["user"]["email"] == "alex@careerai.dev"

def test_google_auth_invalid(client):
    resp = client.post("/api/auth/google", json={})
    assert resp.status_code == 400

def test_learning_categories(client):
    auth_resp = client.post("/api/auth/demo-login/1")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/learning/categories", headers=headers)
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) >= 6
    cat_names = [c["category"] for c in categories]
    assert "Programming" in cat_names
    assert "Machine Learning" in cat_names
    assert "Deep Learning" in cat_names

def test_learning_topics_search_and_multiple_creators(client):
    auth_resp = client.post("/api/auth/demo-login/1")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Search for backpropagation
    response = client.get("/api/learning/topics?q=backpropagation", headers=headers)
    assert response.status_code == 200
    topics = response.json()
    assert len(topics) >= 1
    topic = topics[0]
    assert topic["slug"] == "backpropagation"
    assert len(topic["creators"]) >= 2

    # Get topic detail
    detail_resp = client.get(f"/api/learning/topics/{topic['slug']}", headers=headers)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert len(detail["videos"]) >= 3
    channel_names = [v["channel_name"] for v in detail["videos"]]
    # Verify multiple creators exist
    assert len(set(channel_names)) >= 3
    assert any("3Blue1Brown" in c or "StatQuest" in c for c in channel_names)

def test_learning_for_you_recommendations(client):
    auth_resp = client.post("/api/auth/demo-login/1")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/learning/recommendations/for-you", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "weak_topics" in data
    assert len(data["weak_topics"]) >= 1
    weak = data["weak_topics"][0]
    assert "topic_name" in weak
    assert "reason" in weak
    assert len(weak["recommended_videos"]) >= 2

def test_learning_progress_tracking(client):
    auth_resp = client.post("/api/auth/demo-login/1")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update progress
    update_resp = client.post("/api/learning/progress", json={
        "topic_id": 1,
        "status": "IN_PROGRESS",
        "progress": 65,
        "is_saved": True
    }, headers=headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["progress"] == 65

    # Check my-learning endpoint
    my_resp = client.get("/api/learning/my-learning", headers=headers)
    assert my_resp.status_code == 200
    my_data = my_resp.json()
    assert "in_progress" in my_data
    assert "saved" in my_data
    assert any(item["topic_id"] == 1 for item in my_data["in_progress"])

def test_candidate_profile_upgrade_and_stats(client):
    auth_resp = client.post("/api/auth/demo-login/1")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch current profile
    me_resp = client.get("/api/users/me", headers=headers)
    assert me_resp.status_code == 200
    user_data = me_resp.json()
    assert user_data["email"] == "alex@careerai.dev"

    # Update candidate profile with new fields
    update_payload = {
        "headline": "Lead AI Systems Engineer & Researcher",
        "github_url": "https://github.com/alexrivera-ai",
        "linkedin_url": "https://linkedin.com/in/alex-rivera-cs",
        "portfolio_url": "https://alexrivera.dev",
        "skills": "Python, PyTorch, Docker, Kubernetes, LangChain, React, FastAPI",
        "preferred_work_type": "Remote",
        "preferred_job_type": "Full-time",
        "salary_expectation": "$150k - $180k",
        "availability": "Immediate"
    }
    update_resp = client.put("/api/users/profile", json=update_payload, headers=headers)
    assert update_resp.status_code == 200
    updated_user = update_resp.json()
    assert updated_user["headline"] == "Lead AI Systems Engineer & Researcher"
    assert updated_user["github_url"] == "https://github.com/alexrivera-ai"
    assert updated_user["skills"] == update_payload["skills"]

    # Verify profile stats and completion score
    stats_resp = client.get("/api/users/stats", headers=headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert "profile_strength" in stats
    assert stats["profile_strength"] >= 70
    assert "strength_label" in stats
    assert len(stats["completion_items"]) >= 8
    assert "learning_summary" in stats
