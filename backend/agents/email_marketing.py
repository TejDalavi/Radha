from agents.base_agent import BaseAgent
from typing import Dict, Any

class EmailMarketingAgent(BaseAgent):
    @property
    def agent_type(self) -> str:
        return "email_marketing"

    @property
    def system_prompt(self) -> str:
        return (
            "You are an Email Marketing Specialist. "
            "Output strictly valid JSON with key 'email_sequence', which is a list of exactly 3 objects. "
            "Each object represents an email in a drip campaign and must have ['day_number', 'subject_line', 'body_content']. "
            "Keep the body concise and persuasive."
        )

    def build_prompt(self, context: Dict[str, Any]) -> str:
        pos = context.get('positioning', {})
        lp = context.get('landing_page', {})
        
        return (
            f"Write a 3-part email drip campaign for new leads.\n"
            f"UVP: {pos.get('unique_value_proposition', '')}\n"
            f"Features Highlight: {lp.get('features', 'General features')}\n"
            f"Goal: Guide leads to a conversion."
        )
