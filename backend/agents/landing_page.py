from agents.base_agent import BaseAgent
from typing import Dict, Any

class LandingPageAgent(BaseAgent):
    @property
    def agent_type(self) -> str:
        return "landing_page"

    @property
    def system_prompt(self) -> str:
        return (
            "You are an Expert Copywriter specializing in high-converting Landing Pages. "
            "Output strictly valid JSON with keys: "
            "['hero_title', 'hero_subtitle', 'call_to_action', 'features', 'social_proof_placeholder']. "
            "'features' should be a list of exactly 3 objects with ['title', 'description']."
        )

    def build_prompt(self, context: Dict[str, Any]) -> str:
        idea = context.get('idea_description', '')
        pos = context.get('positioning', {})
        
        return (
            f"Write persuasive landing page copy for:\n"
            f"Idea: {idea}\n"
            f"UVP: {pos.get('unique_value_proposition', '')}\n"
            f"Brand Voice: {pos.get('brand_voice', '')}\n"
            f"Focus on driving conversions with a strong headline and 3 key features."
        )
