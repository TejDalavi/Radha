from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from domain.entities import StartupCommand
from infrastructure.database.session import get_db
from infrastructure.database.models import StartupProjectDB, AgentOutputDB
from infrastructure.llm.gemini_provider import OpenRouterProvider
from application.orchestrator.pipeline import StartupWorkflowOrchestrator
from pydantic import BaseModel
import os
from typing import List, Dict, Any
from uuid import UUID
from fastapi.responses import FileResponse
from application.services.document_service import generate_startup_document

router = APIRouter(prefix="/startup", tags=["Startup"])

class ProjectResponse(BaseModel):
    id: UUID
    status: str

from presentation.api.dependencies import get_current_user
from infrastructure.database.models import UserDB, LLMConfigDB

@router.post("/create", response_model=ProjectResponse)
async def create_startup(
    command: StartupCommand, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    new_project = StartupProjectDB(
        user_id=current_user.id,
        idea_description=command.idea_description,
        industry=command.industry,
        target_audience=command.target_audience,
        status="processing"
    )
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    
    # Fetch global config first
    result = await db.execute(select(LLMConfigDB).where(LLMConfigDB.user_id == None))
    config = result.scalars().first()
    
    api_key = config.api_key if config and config.api_key else os.getenv("OPENROUTER_API_KEY")
    model_name = config.model_name if config and config.model_name else "google/gemini-2.0-flash-001"
    
    if not api_key:
         raise HTTPException(status_code=500, detail="LLM API Key missing. Please configure it in the Admin Dashboard.")
         
    temperature = config.temperature if config else 0.7
    llm_provider = OpenRouterProvider(api_key=api_key, model_name=model_name, temperature=temperature)
    orchestrator = StartupWorkflowOrchestrator(llm_provider=llm_provider)
    
    context = command.model_dump()
    context['project_id'] = str(new_project.id)
    
    background_tasks.add_task(orchestrator.run_pipeline, project_id=str(new_project.id), initial_context=context)
    
    return ProjectResponse(id=new_project.id, status="processing")

@router.get("/{project_id}/status")
async def get_startup_status(project_id: UUID, db: AsyncSession = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    project = await db.get(StartupProjectDB, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this project")
        
    result = await db.execute(
        select(AgentOutputDB).where(AgentOutputDB.project_id == project_id)
    )
    agent_results = result.scalars().all()
    
    return {
        "id": project.id,
        "status": project.status,
        "completed_agents": [r.agent_type for r in agent_results],
        "results": {r.agent_type: r.output_data for r in agent_results}
    }

@router.get("/{project_id}/download")
async def download_startup_document(project_id: UUID, db: AsyncSession = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    project = await db.get(StartupProjectDB, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to download this project")
        
    result = await db.execute(
        select(AgentOutputDB).where(AgentOutputDB.project_id == project_id)
    )
    agent_results = result.scalars().all()
    
    if project.status != "completed":
        raise HTTPException(status_code=400, detail="Cannot download document before project is completed")
        
    try:
        file_path = generate_startup_document(project, agent_results)
        return FileResponse(
            path=file_path,
            filename=f"StartupBox_{project.idea_description[:15].replace(' ', '_')}.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate document: {str(e)}")
