from abc import ABC, abstractmethod
from domain.interfaces.llm_provider import ILLMProvider
from typing import Dict, Any
import json
import re

class BaseAgent(ABC):
    def __init__(self, llm_provider: ILLMProvider):
        self.llm = llm_provider

    @property
    @abstractmethod
    def agent_type(self) -> str:
        """Name of the agent (e.g., 'market_research')"""
        pass

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """System instruction for the LLM."""
        pass

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the agent logic.
        """
        user_prompt = self.build_prompt(context)
        raw_response = await self.llm.generate_text(
            prompt=user_prompt,
            system_prompt=self.system_prompt
        )
        return self.parse_output(raw_response)

    @abstractmethod
    def build_prompt(self, context: Dict[str, Any]) -> str:
        """Build the specific user prompt from upstream context."""
        pass

    def parse_output(self, response: str) -> Dict[str, Any]:
        """Extracts JSON from markdown fences."""
        try:
            match = re.search(r'```(?:json)?\s*(.*?)\s*```', response, re.DOTALL | re.IGNORECASE)
            if match:
                json_str = match.group(1)
            else:
                json_str = response
            return json.loads(json_str.strip())
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse Agent output as JSON: {e}\nResponse: {response}")
