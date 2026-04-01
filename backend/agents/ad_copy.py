from agents.base_agent import BaseAgent
from typing import Dict, Any

class AdCopyAgent(BaseAgent):
    @property
    def agent_type(self) -> str:
        return "ad_copy"

    @property
    def system_prompt(self) -> str:
        return (
            "You are a Senior Performance Marketer. "
            "Output strictly valid JSON with key 'ads', which is a list of exactly 3 ad variations objects. "
            "Each object must have ['platform', 'headline', 'primary_text', 'target_audience_notes']. "
            "Assume platforms like Facebook, LinkedIn, or Google Search."
        )

    def build_prompt(self, context: Dict[str, Any]) -> str:
        pos = context.get('positioning', {})
        audience = context.get('target_audience', '')
        
        return (
            f"Write 3 different performance marketing ad variations to acquire the initial users.\n"
            f"Elevator Pitch: {pos.get('elevator_pitch', '')}\n"
            f"Target Audience: {audience}\n"
            f"Use the brand voice."
        )
