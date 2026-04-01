from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Float, Integer, JSON
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.types import Uuid as UUID
import uuid
import datetime

Base = declarative_base()

class UserDB(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="user")
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    projects = relationship("StartupProjectDB", back_populates="user")
    llm_configs = relationship("LLMConfigDB", back_populates="user")

class StartupProjectDB(Base):
    __tablename__ = "startup_projects"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    idea_description = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    target_audience = Column(String, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("UserDB", back_populates="projects")
    outputs = relationship("AgentOutputDB", back_populates="project")

class AgentOutputDB(Base):
    __tablename__ = "agent_outputs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("startup_projects.id"))
    agent_type = Column(String, nullable=False)
    output_data = Column(JSON, nullable=True) # JSON cross compatible
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("StartupProjectDB", back_populates="outputs")

class LLMConfigDB(Base):
    __tablename__ = "llm_configs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    provider_name = Column(String, nullable=False) # 'openai', 'gemini'
    model_name = Column(String, nullable=False)
    api_key = Column(String, nullable=False) 
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=2000)
    is_active = Column(Boolean, default=True)
    
    user = relationship("UserDB", back_populates="llm_configs")
