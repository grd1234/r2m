"""
Data models for CVS Analysis
"""

from typing import TypedDict, List, Dict, Any, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr


class UserQueryInput(BaseModel):
    """Input from user to start CVS analysis"""
    query: str = Field(..., min_length=10, description="Research query or technology description")
    user_email: EmailStr = Field(..., description="User's email address")
    domain: Optional[str] = Field(None, description="Technology domain (e.g., 'AI', 'Biotech')")

    class Config:
        json_schema_extra = {
            "example": {
                "query": "AI-powered defect detection for manufacturing",
                "user_email": "grdes111@gmail.com",
                "domain": "Computer Vision"
            }
        }


class ValidationResult(BaseModel):
    """Result of input validation"""
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    sanitized_query: Optional[str] = None


class Paper(BaseModel):
    """Research paper data model"""
    paper_id: str
    title: str
    authors: List[str] = Field(default_factory=list)
    abstract: Optional[str] = None
    year: Optional[int] = None
    citations: int = 0
    url: Optional[str] = None
    doi: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)


class TechnicalAnalysisOutput(BaseModel):
    """Output from Technical Analysis Agent"""
    papers: List[Paper]
    selected_paper_id: str
    trl_level: int = Field(ge=1, le=9, description="Technology Readiness Level (1-9)")
    feasibility_score: int = Field(ge=0, le=10, description="Feasibility score (0-10)")
    technical_risks: List[str] = Field(default_factory=list)
    technical_strengths: List[str] = Field(default_factory=list)


class MarketAnalysisOutput(BaseModel):
    """Output from Market Analysis Agent"""
    tam_billions: float = Field(ge=0, description="Total Addressable Market in billions")
    sam_billions: Optional[float] = Field(None, description="Serviceable Addressable Market")
    target_industry: str
    market_readiness_score: int = Field(ge=0, le=10)
    executive_summary: str
    cagr_percent: Optional[float] = None


class CompetitiveAnalysisOutput(BaseModel):
    """Output from Competitive Analysis Agent"""
    competitive_risk_score: int = Field(ge=0, le=10)
    barriers_to_entry: str
    competitive_advantages: List[str] = Field(default_factory=list)
    competitive_threats: List[str] = Field(default_factory=list)


class IPAnalysisOutput(BaseModel):
    """Output from IP Analysis Agent"""
    ip_opportunity_score: int = Field(ge=0, le=10)
    ip_risk_score: int = Field(ge=0, le=10)
    patent_landscape: Optional[str] = None


class CVSResult(BaseModel):
    """Final CVS Analysis Result"""
    opportunity_id: str
    cvs_score: int = Field(ge=0, le=100, description="Commercial Viability Score (0-100)")
    cvs_tier: str = Field(description="Tier: Excellent/Good/Moderate/Low")

    # Agent scores
    technical_score: int
    market_score: int
    competitive_score: int
    ip_score: int

    # Database IDs
    paper_id: Optional[UUID] = None
    analysis_id: Optional[UUID] = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    recommendation: str


class CVSState(TypedDict):
    """State passed through the LangGraph workflow"""
    # Input
    query: str
    user_email: str
    domain: Optional[str]

    # Validation
    validation_result: Optional[ValidationResult]

    # Agent outputs
    technical_analysis: Optional[TechnicalAnalysisOutput]
    market_analysis: Optional[MarketAnalysisOutput]
    competitive_analysis: Optional[CompetitiveAnalysisOutput]
    ip_analysis: Optional[IPAnalysisOutput]

    # Final result
    cvs_result: Optional[CVSResult]

    # Database IDs
    user_id: Optional[UUID]
    paper_id: Optional[UUID]
    analysis_id: Optional[UUID]

    # Status tracking
    current_step: str
    completed_steps: List[str]
    errors: List[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
