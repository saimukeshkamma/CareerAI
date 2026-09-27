import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.resume import Resume
from ..models.interview import Interview, InterviewQuestion, InterviewAnswer
from ..models.notification import Notification
from ..models.learning import InterviewWeakTopic, LearningTopic
from ..schemas.interview import InterviewCreate, InterviewAnswerSubmit
from ..ai.interview_coach import AIInterviewCoach
from ..services.learning_recommendation import LearningRecommendationService
from ..utils.security import get_current_user

router = APIRouter(prefix="/interviews", tags=["Interviews"])

def safe_parse_json(val, default):
    if not val:
        return default
    try:
        return json.loads(val)
    except Exception:
        return default

@router.post("")
def create_interview(
    data: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve active resume
    active_resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active == True).first()

    interview = Interview(
        user_id=current_user.id,
        resume_id=active_resume.id if active_resume else None,
        role=data.role,
        interview_type=data.interview_type,
        difficulty=data.difficulty,
        status="in_progress"
    )
    db.add(interview)
    db.flush()

    # Generate 5 questions dynamically
    generated_questions = AIInterviewCoach.get_questions_for_interview(
        role=data.role,
        interview_type=data.interview_type,
        count=5
    )

    for idx, q_info in enumerate(generated_questions, start=1):
        q = InterviewQuestion(
            interview_id=interview.id,
            order_index=idx,
            question_text=q_info["text"],
            category=q_info["category"],
            context_hint=q_info.get("hint"),
            expected_topics=json.dumps(q_info.get("topics", []))
        )
        db.add(q)

    db.commit()
    db.refresh(interview)

    return get_interview_detail(interview.id, db, current_user)

@router.get("")
def list_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).order_by(Interview.created_at.desc()).all()
    results = []
    for it in interviews:
        total_q = len(it.questions)
        answered_q = sum(1 for q in it.questions if q.answer is not None)
        results.append({
            "id": it.id,
            "role": it.role,
            "interview_type": it.interview_type,
            "difficulty": it.difficulty,
            "status": it.status,
            "overall_score": it.overall_score,
            "questions_count": total_q,
            "answered_count": answered_q,
            "created_at": it.created_at
        })
    return results

@router.get("/{interview_id}")
def get_interview_detail(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")

    formatted_questions = []
    for q in sorted(interview.questions, key=lambda x: x.order_index):
        ans_data = None
        if q.answer:
            ans_data = {
                "id": q.answer.id,
                "question_id": q.answer.question_id,
                "score": q.answer.score,
                "feedback": q.answer.feedback,
                "strengths": safe_parse_json(q.answer.strengths, []),
                "improvements": safe_parse_json(q.answer.improvements, []),
                "model_answer_structure": safe_parse_json(q.answer.model_answer_structure, []),
                "created_at": q.answer.created_at
            }
        formatted_questions.append({
            "id": q.id,
            "order_index": q.order_index,
            "question_text": q.question_text,
            "category": q.category,
            "context_hint": q.context_hint,
            "expected_topics": safe_parse_json(q.expected_topics, []),
            "answer": ans_data
        })

    weak_topics_data = []
    strong_topics_data = []
    if interview.status == "completed":
        extracted = LearningRecommendationService.extract_weak_topics_from_interview(interview, db)
        weak_topics_data = extracted.get("weak_topics", [])
        strong_topics_data = extracted.get("strong_topics", [])

    return {
        "id": interview.id,
        "role": interview.role,
        "interview_type": interview.interview_type,
        "difficulty": interview.difficulty,
        "status": interview.status,
        "overall_score": interview.overall_score,
        "technical_score": interview.technical_score,
        "communication_score": interview.communication_score,
        "problem_solving_score": interview.problem_solving_score,
        "relevance_score": interview.relevance_score,
        "clarity_score": interview.clarity_score,
        "feedback_summary": interview.feedback_summary,
        "key_strengths": safe_parse_json(interview.key_strengths, []),
        "key_improvements": safe_parse_json(interview.key_improvements, []),
        "created_at": interview.created_at,
        "questions": formatted_questions,
        "weak_topics": weak_topics_data,
        "strong_topics": strong_topics_data
    }

@router.post("/{interview_id}/questions/{question_id}/answer")
def submit_answer(
    interview_id: int,
    question_id: int,
    submission: InterviewAnswerSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id, InterviewQuestion.interview_id == interview_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    # Evaluate answer using AI engine
    topics = safe_parse_json(question.expected_topics, [])
    evaluation = AIInterviewCoach.evaluate_answer(
        question_text=question.question_text,
        user_answer=submission.user_answer,
        category=question.category,
        expected_topics=topics
    )

    # Check if existing answer
    existing_answer = db.query(InterviewAnswer).filter(InterviewAnswer.question_id == question.id).first()
    if existing_answer:
        existing_answer.user_answer = submission.user_answer
        existing_answer.is_audio = submission.is_audio
        existing_answer.audio_duration = submission.audio_duration
        existing_answer.score = evaluation["score"]
        existing_answer.feedback = evaluation["feedback"]
        existing_answer.strengths = json.dumps(evaluation["strengths"])
        existing_answer.improvements = json.dumps(evaluation["improvements"])
        existing_answer.model_answer_structure = json.dumps(evaluation["model_answer_structure"])
        ans_record = existing_answer
    else:
        ans_record = InterviewAnswer(
            question_id=question.id,
            user_answer=submission.user_answer,
            is_audio=submission.is_audio,
            audio_duration=submission.audio_duration,
            score=evaluation["score"],
            feedback=evaluation["feedback"],
            strengths=json.dumps(evaluation["strengths"]),
            improvements=json.dumps(evaluation["improvements"]),
            model_answer_structure=json.dumps(evaluation["model_answer_structure"])
        )
        db.add(ans_record)

    db.commit()
    db.refresh(ans_record)

    return {
        "id": ans_record.id,
        "question_id": question.id,
        "score": evaluation["score"],
        "technical_score": evaluation["technical_score"],
        "communication_score": evaluation["communication_score"],
        "relevance_score": evaluation["relevance_score"],
        "problem_solving_score": evaluation["problem_solving_score"],
        "clarity_score": evaluation["clarity_score"],
        "feedback": evaluation["feedback"],
        "strengths": evaluation["strengths"],
        "improvements": evaluation["improvements"],
        "model_answer_structure": evaluation["model_answer_structure"],
        "created_at": ans_record.created_at
    }

@router.post("/{interview_id}/complete")
def complete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")

    answers = [q.answer for q in interview.questions if q.answer is not None]
    if not answers:
        raise HTTPException(status_code=400, detail="Cannot complete an interview with no submitted answers.")

    # Calculate average scores
    avg_score = int(sum(a.score for a in answers) / len(answers))
    tech_avg = min(98, max(50, avg_score + 3))
    comm_avg = min(98, max(50, avg_score - 2))
    prob_avg = min(98, max(50, avg_score + 1))
    rel_avg = min(98, max(50, avg_score + 4))
    clar_avg = min(98, max(50, avg_score - 1))

    all_strengths = []
    all_improvements = []
    for a in answers:
        all_strengths.extend(safe_parse_json(a.strengths, []))
        all_improvements.extend(safe_parse_json(a.improvements, []))

    interview.status = "completed"
    interview.overall_score = avg_score
    interview.technical_score = tech_avg
    interview.communication_score = comm_avg
    interview.problem_solving_score = prob_avg
    interview.relevance_score = rel_avg
    interview.clarity_score = clar_avg
    interview.feedback_summary = (
        f"Completed {len(answers)} interview questions for {interview.role} ({interview.difficulty}). "
        f"Demonstrated solid conceptual depth and structured communication with an overall score of {avg_score}/100."
    )
    interview.key_strengths = json.dumps(list(set(all_strengths))[:4])
    interview.key_improvements = json.dumps(list(set(all_improvements))[:3])

    # Send Notification
    notif = Notification(
        user_id=current_user.id,
        title="Mock Interview Evaluation Ready",
        message=f"You scored {avg_score}/100 in your {interview.role} ({interview.interview_type}) practice session.",
        type="success",
        link=f"/interviews/{interview.id}"
    )
    db.add(notif)

    db.commit()
    db.refresh(interview)

    return get_interview_detail(interview.id, db, current_user)
