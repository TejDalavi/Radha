from agents.base_agent import BaseAgent
from typing import Dict, Any

class PositioningAgent(BaseAgent):
    @property
    def agent_type(self) -> str:
        return "positioning"

    @property
    def system_prompt(self) -> str:
        return (
            "You are an expert Brand Strategist. "
            "Output strictly valid JSON with keys: "
            "['unique_value_proposition', 'brand_voice', 'mission_statement', 'elevator_pitch']."
        )

    def build_prompt(self, context: Dict[str, Any]) -> str:
        idea = context.get('idea_description', '')
        market_research = context.get('market_research', {})
        competitors = context.get('competitor_analysis', {})
        
        return (
            f"Create a brand positioning strategy for the startup.\n"
            f"Idea: {idea}\n"
            f"Market Pain Points: {market_research.get('pain_points', 'Unknown')}\n"
            f"Competitors Context: {competitors}\n"
            f"Craft a compelling UVP, mission statement, voice, and elevator pitch based on addressing the gaps."
        )
