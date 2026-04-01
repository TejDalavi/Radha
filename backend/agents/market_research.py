from agents.base_agent import BaseAgent
from typing import Dict, Any

class MarketResearchAgent(BaseAgent):
    @property
    def agent_type(self) -> str:
        return "market_research"

    @property
    def system_prompt(self) -> str:
        return (
            "You are an expert Market Research Analyst. "
            "Output strictly valid JSON with the following keys: "
            "['market_size', 'target_demographics', 'trends', 'pain_points']. "
            "Do not output anything besides the JSON block."
        )

    def build_prompt(self, context: Dict[str, Any]) -> str:
        idea = context.get('idea_description', '')
        industry = context.get('industry', '')
        audience = context.get('target_audience', '')
        
        return (
            f"Please analyze the market for the following startup idea.\n"
            f"Idea: {idea}\n"
            f"Industry: {industry}\n"
            f"Target Audience: {audience}\n"
            f"Provide estimations, demographics, key current trends, and customer pain points."
        )
