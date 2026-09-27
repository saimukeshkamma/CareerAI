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
