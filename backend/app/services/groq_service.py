import os
import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from ..config import settings

logger = logging.getLogger(__name__)

class GroqService:
    """
    Client for Groq's high-speed LPU AI inference API.
    Uses OpenAI-compatible endpoint with ultra-low latency.
    """

    BASE_URL = "https://api.groq.com/openai/v1"
    DEFAULT_MODEL = "qwen/qwen3.8-27b"
    FALLBACK_MODEL = "openai/gpt-oss-120b"

    @classmethod
    def get_api_key(cls) -> str:
        return settings.GROQ_API_KEY or settings.AI_API_KEY or os.getenv("GROQ_API_KEY", "")

    @classmethod
    def chat_completion(
        cls,
        messages: List[Dict[str, str]],
        max_tokens: int = 800,
        temperature: float = 0.7,
        model: Optional[str] = None
    ) -> Optional[str]:
        """
        Executes a chat completion call on Groq's API.
        """
        api_key = cls.get_api_key()
        if not api_key:
            logger.warning("Groq API key not configured.")
            return None

        target_model = model or settings.AI_MODEL or cls.DEFAULT_MODEL
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": target_model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        try:
            with httpx.Client(timeout=12.0) as client:
                response = client.post(
                    f"{cls.BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload
                )

                if response.status_code == 200:
                    data = response.json()
                    choices = data.get("choices", [])
                    if choices:
                        content = choices[0].get("message", {}).get("content", "")
                        if content:
                            return content.strip()

                logger.warning(f"Groq API returned status {response.status_code}: {response.text}")

                # Try fallback model if first model wasn't available
                if response.status_code == 404 and target_model != cls.DEFAULT_MODEL:
                    payload["model"] = cls.DEFAULT_MODEL
                    fallback_resp = client.post(
                        f"{cls.BASE_URL}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    if fallback_resp.status_code == 200:
                        fb_choices = fallback_resp.json().get("choices", [])
                        if fb_choices:
                            return fb_choices[0].get("message", {}).get("content", "").strip()

        except Exception as e:
            logger.error(f"Error calling Groq API: {e}")

        return None

    @classmethod
    def evaluate_interview_answer(
        cls,
        question_text: str,
        user_answer: str,
        category: str = "Technical",
        target_role: str = "AI Engineer"
    ) -> Optional[Dict[str, Any]]:
        """
        Uses Groq AI to evaluate candidate answer with score and actionable feedback.
        """
        system_prompt = (
            "You are an elite Silicon Valley technical interview evaluator for CareerAI. "
            "Evaluate the candidate's answer strictly and constructively. "
            "Return ONLY a valid JSON object matching this schema:\n"
            "{\n"
            '  "score": <number 0-100>,\n'
            '  "rating": "<Needs Improvement | Fair | Good | Excellent>",\n'
            '  "feedback": "<2-3 sentence executive evaluation>",\n'
            '  "strengths": ["<strength 1>", "<strength 2>"],\n'
            '  "improvements": ["<improvement 1>", "<improvement 2>"],\n'
            '  "sample_answer": "<concise optimal answer illustrating high-signal communication>",\n'
            '  "weak_topic": "<specific technical topic/concept if score < 75, else null>"\n'
            "}"
        )

        user_content = (
            f"Target Role: {target_role}\n"
            f"Interview Category: {category}\n"
            f"Question: {question_text}\n\n"
            f"Candidate Answer:\n{user_answer}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]

        text = cls.chat_completion(messages, max_tokens=700, temperature=0.3)
        if not text:
            return None

        try:
            # Clean possible markdown fence blocks
            clean = text
            if "```json" in clean:
                clean = clean.split("```json")[1].split("```")[0]
            elif "```" in clean:
                clean = clean.split("```")[1].split("```")[0]
            clean = clean.strip()
            return json.loads(clean)
        except Exception:
            return None
