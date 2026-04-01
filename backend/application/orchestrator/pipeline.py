import logging
from typing import Dict, Any, List
from agents.market_research import MarketResearchAgent
from agents.competitor_analysis import CompetitorAnalysisAgent
from agents.positioning import PositioningAgent
from agents.landing_page import LandingPageAgent
from agents.ad_copy import AdCopyAgent
from agents.email_marketing import EmailMarketingAgent
from domain.interfaces.llm_provider import ILLMProvider
from infrastructure.database.session import AsyncSessionLocal
from infrastructure.database.models import AgentOutputDB, StartupProjectDB
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

logger = logging.getLogger(__name__)

class StartupWorkflowOrchestrator:
    def __init__(self, llm_provider: ILLMProvider):
        # Apply Liskov Substitution and DIP: Orchestrator depends on Interfaces
        self.llm = llm_provider
        self.agents = [
            MarketResearchAgent(self.llm),
            CompetitorAnalysisAgent(self.llm),
            PositioningAgent(self.llm),
            LandingPageAgent(self.llm),
            AdCopyAgent(self.llm),
            EmailMarketingAgent(self.llm)
        ]

    async def run_pipeline(self, project_id: str, initial_context: Dict[str, Any]) -> None:
        """Runs the agents sequentially, passing context and persisting state."""
        context = initial_context.copy()
        
        for agent in self.agents:
            logger.info(f"Running Agent: {agent.agent_type}")
            try:
                # Execute agent
                result = await agent.execute(context)
                context[agent.agent_type] = result
                
                # Persist output
                await self._save_agent_state(project_id, agent.agent_type, result, None)
            except Exception as e:
                logger.error(f"Agent {agent.agent_type} failed: {e}")
                await self._save_agent_state(project_id, agent.agent_type, {}, str(e))
                # Halting on error, could implement retries
                break
                
        # Finalize project status
        await self._mark_project_completed(project_id)

    async def _save_agent_state(self, project_id: str, agent_type: str, data: Dict, error: str):
        async with AsyncSessionLocal() as session:
            try:
                state = AgentOutputDB(
                    project_id=uuid.UUID(project_id),
                    agent_type=agent_type,
                    output_data=data,
                    error_message=error
                )
                session.add(state)
                await session.commit()
            except Exception as e:
                logger.error(f"DB save error: {e}")
                
    async def _mark_project_completed(self, project_id: str):
        async with AsyncSessionLocal() as session:
            try:
                # get project
                project = await session.get(StartupProjectDB, uuid.UUID(project_id))
                if project:
                     project.status = "completed"
                     await session.commit()
            except Exception as e:
                logger.error(f"Failed to mark complete: {e}")
