from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class StartupCommand(BaseModel):
    idea_description: str
    industry: str
    target_audience: str
    llm_provider_name: str = "gemini"

class StartupProjectBase(BaseModel):
    idea_description: str
    industry: str
    target_audience: str
    status: str = "pending"

class StartupProject(StartupProjectBase):
    id: UUID
    user_id: Optional[UUID] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AgentOutput(BaseModel):
    id: UUID
    project_id: UUID
    agent_type: str
    output_data: Dict[str, Any]
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LLMConfigBase(BaseModel):
    provider_name: str
    model_name: str
    api_key: str
    temperature: float = 0.7
    max_tokens: int = 2000
    is_active: bool = True

class LLMConfig(LLMConfigBase):
    id: UUID
    user_id: Optional[UUID] = None
    
    class Config:
        from_attributes = True
