from abc import ABC, abstractmethod
from typing import Optional

class ILLMProvider(ABC):
    @abstractmethod
    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generates text from an LLM."""
        pass
