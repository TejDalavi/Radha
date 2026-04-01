from domain.interfaces.llm_provider import ILLMProvider
import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class OpenRouterProvider(ILLMProvider):
    """LLM Provider using OpenRouter API (OpenAI-compatible)."""

    BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

    def __init__(self, api_key: str, model_name: str = "google/gemini-2.0-flash-001", temperature: float = 0.7):
        self.api_key = api_key
        self.model_name = model_name
        self.temperature = temperature

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Startup-in-a-Box AI",
            }

            payload = {
                "model": self.model_name,
                "messages": messages,
                "temperature": self.temperature,
            }

            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(self.BASE_URL, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()

            return data["choices"][0]["message"]["content"]

        except httpx.HTTPStatusError as e:
            logger.error(f"OpenRouter API HTTP Error {e.response.status_code}: {e.response.text}")
            raise Exception(f"OpenRouter API Error ({e.response.status_code}): {e.response.text}")
        except Exception as e:
            logger.error(f"OpenRouter API Error: {e}")
            raise Exception(f"Failed to generate text from OpenRouter: {e}")


# Keep backward-compatible alias
GeminiProvider = OpenRouterProvider
