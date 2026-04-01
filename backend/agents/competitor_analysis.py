from agents.base_agent import BaseAgent
from typing import Dict, Any

class CompetitorAnalysisAgent(BaseAgent):
    @property
    def agent_type(self) -> str:
        return "competitor_analysis"

    @property
    def system_prompt(self) -> str:
        return (
            "You are an expert Strategic Competitor Analyst. "
            "Output strictly valid JSON with key 'competitors', which is a list of objects. "
            "Each object must have keys: ['name', 'description', 'strengths', 'weaknesses', 'differentiation_opportunity']. "
            "Suggest 3-4 likely competitors (real or archetypal)."
        )

    def build_prompt(self, context: Dict[str, Any]) -> str:
        idea = context.get('idea_description', '')
        industry = context.get('industry', '')
        
        return (
            f"Analyze the competitors for the following startup idea in the {industry} industry.\n"
            f"Idea: {idea}\n"
            f"Identify the top competitors and provide their strengths, weaknesses, and where we can differentiate."
        )
