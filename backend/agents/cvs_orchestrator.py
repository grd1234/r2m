"""
CVS Analysis Orchestrator using LangGraph
Coordinates all analysis agents and saves results to Supabase
"""

from typing import TypedDict, List, Dict, Any, Optional
from datetime import datetime
import json
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
import os
from supabase import create_client, Client
from uuid import UUID


class CVSState(TypedDict):
    """State passed through the orchestrator graph"""
    # Input
    query: str
    user_email: str
    domain: Optional[str]

    # Agent outputs
    technical_analysis: Optional[Dict[str, Any]]
    market_analysis: Optional[Dict[str, Any]]
    competitive_analysis: Optional[Dict[str, Any]]
    ip_analysis: Optional[Dict[str, Any]]

    # Calculated results
    cvs_score: Optional[int]
    cvs_tier: Optional[str]
    opportunity_id: Optional[str]

    # Database IDs
    user_id: Optional[UUID]
    paper_id: Optional[UUID]
    analysis_id: Optional[UUID]

    # Status
    errors: List[str]
    completed_agents: List[str]


class SupabaseManager:
    """Handles all Supabase database operations"""

    def __init__(self):
        supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not supabase_url or not supabase_key:
            raise ValueError("Missing Supabase credentials")

        self.client: Client = create_client(supabase_url, supabase_key)

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user profile by email"""
        try:
            response = self.client.table("profiles").select("*").eq("email", email).limit(1).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None

    def insert_research_paper(self, paper_data: Dict[str, Any]) -> Optional[UUID]:
        """Insert research paper and return ID"""
        try:
            response = self.client.table("research_papers").insert(paper_data).execute()
            return response.data[0]["id"] if response.data else None
        except Exception as e:
            print(f"Error inserting paper: {e}")
            return None

    def insert_cvs_analysis(self, analysis_data: Dict[str, Any]) -> Optional[UUID]:
        """Insert CVS analysis and return ID"""
        try:
            response = self.client.table("cvs_analyses").insert(analysis_data).execute()
            return response.data[0]["id"] if response.data else None
        except Exception as e:
            print(f"Error inserting analysis: {e}")
            return None


class CVSOrchestrator:
    """Main orchestrator for CVS analysis workflow"""

    def __init__(self):
        self.db = SupabaseManager()
        self.llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            api_key=os.getenv("ANTHROPIC_API_KEY")
        )
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(CVSState)

        # Add nodes
        workflow.add_node("initialize", self.initialize_analysis)
        workflow.add_node("get_user", self.get_user_profile)
        workflow.add_node("technical_analysis", self.run_technical_analysis)
        workflow.add_node("market_analysis", self.run_market_analysis)
        workflow.add_node("competitive_analysis", self.run_competitive_analysis)
        workflow.add_node("ip_analysis", self.run_ip_analysis)
        workflow.add_node("calculate_cvs", self.calculate_cvs_score)
        workflow.add_node("save_to_db", self.save_to_database)
        workflow.add_node("complete", self.finalize_analysis)

        # Define flow
        workflow.set_entry_point("initialize")
        workflow.add_edge("initialize", "get_user")
        workflow.add_edge("get_user", "technical_analysis")
        workflow.add_edge("technical_analysis", "market_analysis")
        workflow.add_edge("market_analysis", "competitive_analysis")
        workflow.add_edge("competitive_analysis", "ip_analysis")
        workflow.add_edge("ip_analysis", "calculate_cvs")
        workflow.add_edge("calculate_cvs", "save_to_db")
        workflow.add_edge("save_to_db", "complete")
        workflow.add_edge("complete", END)

        return workflow.compile()

    def initialize_analysis(self, state: CVSState) -> CVSState:
        """Initialize the analysis with opportunity ID and defaults"""
        today = datetime.now()
        date_str = today.strftime("%Y%m%d")
        random_suffix = str(today.timestamp()).split(".")[1][:3]
        opportunity_id = f"R2M-{date_str}-{random_suffix}"

        state["opportunity_id"] = opportunity_id
        state["errors"] = []
        state["completed_agents"] = []

        print(f"✅ Initialized analysis: {opportunity_id}")
        return state

    def get_user_profile(self, state: CVSState) -> CVSState:
        """Get user profile from database"""
        user = self.db.get_user_by_email(state["user_email"])

        if user:
            state["user_id"] = UUID(user["id"])
            print(f"✅ Found user: {user['email']}")
        else:
            state["errors"].append(f"User not found: {state['user_email']}")
            print(f"❌ User not found: {state['user_email']}")

        return state

    def run_technical_analysis(self, state: CVSState) -> CVSState:
        """Run technical analysis agent"""
        print("🔬 Running technical analysis...")

        # TODO: Call your actual technical analysis agent
        # For now, placeholder
        state["technical_analysis"] = {
            "papers_detailed": [],
            "selected_paper": None,
            "trl_level": 5,
            "feasibility_score": 7
        }
        state["completed_agents"].append("technical")

        print("✅ Technical analysis complete")
        return state

    def run_market_analysis(self, state: CVSState) -> CVSState:
        """Run market analysis agent"""
        print("📊 Running market analysis...")

        # TODO: Call your actual market analysis agent
        state["market_analysis"] = {
            "tam_billions": 10.5,
            "target_industry": "Technology",
            "executive_summary": "Promising market opportunity"
        }
        state["completed_agents"].append("market")

        print("✅ Market analysis complete")
        return state

    def run_competitive_analysis(self, state: CVSState) -> CVSState:
        """Run competitive analysis agent"""
        print("⚔️ Running competitive analysis...")

        # TODO: Call your actual competitive analysis agent
        state["competitive_analysis"] = {
            "competitive_risk_score": 6,
            "barriers_to_entry": "Medium"
        }
        state["completed_agents"].append("competitive")

        print("✅ Competitive analysis complete")
        return state

    def run_ip_analysis(self, state: CVSState) -> CVSState:
        """Run IP analysis agent"""
        print("⚖️ Running IP analysis...")

        # TODO: Call your actual IP analysis agent
        state["ip_analysis"] = {
            "ip_opportunity_score": 7,
            "ip_risk_score": 4
        }
        state["completed_agents"].append("ip")

        print("✅ IP analysis complete")
        return state

    def calculate_cvs_score(self, state: CVSState) -> CVSState:
        """Calculate Commercial Viability Score"""
        print("🧮 Calculating CVS score...")

        # Extract scores from analyses
        tech_score = state["technical_analysis"].get("feasibility_score", 0) * 10
        market_score = 0  # Calculate from market analysis
        competitive_score = state["competitive_analysis"].get("competitive_risk_score", 0) * 10

        # Weighted average
        cvs_score = int(
            (tech_score * 0.4) +
            (market_score * 0.45) +
            (competitive_score * 0.15)
        )

        # Determine tier
        if cvs_score >= 80:
            cvs_tier = "Excellent"
        elif cvs_score >= 65:
            cvs_tier = "Good"
        elif cvs_score >= 50:
            cvs_tier = "Moderate"
        else:
            cvs_tier = "Low"

        state["cvs_score"] = cvs_score
        state["cvs_tier"] = cvs_tier

        print(f"✅ CVS Score: {cvs_score} ({cvs_tier})")
        return state

    def save_to_database(self, state: CVSState) -> CVSState:
        """Save research paper and CVS analysis to database"""
        if not state.get("user_id"):
            state["errors"].append("Cannot save: No user ID")
            return state

        print("💾 Saving to database...")

        # Prepare research paper data
        paper_data = {
            "uploaded_by": str(state["user_id"]),
            "title": state.get("query", "Untitled Research"),
            "authors": None,  # Will be populated from technical analysis
            "abstract": "",
            "keywords": None,
            "publication_date": None,
            "citation_count": 0,
            "doi": None,
            "pdf_url": None,
            "external_id": None,
            "source": "semantic_scholar",
            "is_published_to_marketplace": True,
            "marketplace_description": state.get("market_analysis", {}).get("executive_summary", ""),
            "tech_category": state.get("domain", "General"),
            "industry": state.get("market_analysis", {}).get("target_industry", "Technology"),
            "stage": "Concept",
            "funding_goal": None,
            "view_count": 0,
            "metadata": {
                "opportunity_id": state["opportunity_id"],
                "trl_level": state.get("technical_analysis", {}).get("trl_level", 5)
            }
        }

        # Insert research paper
        paper_id = self.db.insert_research_paper(paper_data)

        if not paper_id:
            state["errors"].append("Failed to insert research paper")
            return state

        state["paper_id"] = paper_id
        print(f"✅ Inserted research paper: {paper_id}")

        # Prepare CVS analysis data
        analysis_data = {
            "paper_id": str(paper_id),
            "analyzed_by": str(state["user_id"]),
            "uploaded_by": str(state["user_id"]),
            "title": state.get("query", ""),
            "query": state.get("query", ""),
            "cvs_score": state["cvs_score"],
            "technical_score": 0,  # Calculate from breakdown
            "market_score": 0,
            "commercial_score": 0,
            "competitive_score": 0,
            "ip_score": state.get("ip_analysis", {}).get("ip_opportunity_score", 0),
            "risk_score": state.get("ip_analysis", {}).get("ip_risk_score", 0),
            "tam": state.get("market_analysis", {}).get("tam_billions", 0),
            "trl": state.get("technical_analysis", {}).get("trl_level", 5),
            "target_industry": state.get("market_analysis", {}).get("target_industry"),
            "summary": state.get("market_analysis", {}).get("executive_summary", ""),
            "recommendations": "",
            "key_strengths": None,
            "key_risks": None,
            "go_to_market_strategy": "",
            "status": "completed",
            "is_ai_generated": True,
            "analysis_notes": {
                "opportunity_id": state["opportunity_id"],
                "cvs_score": state["cvs_score"],
                "cvs_tier": state["cvs_tier"]
            }
        }

        # Insert CVS analysis
        analysis_id = self.db.insert_cvs_analysis(analysis_data)

        if not analysis_id:
            state["errors"].append("Failed to insert CVS analysis")
            return state

        state["analysis_id"] = analysis_id
        print(f"✅ Inserted CVS analysis: {analysis_id}")

        return state

    def finalize_analysis(self, state: CVSState) -> CVSState:
        """Finalize and log results"""
        print("\n" + "="*50)
        print("✅ CVS ANALYSIS COMPLETE!")
        print("="*50)
        print(f"Opportunity ID: {state['opportunity_id']}")
        print(f"CVS Score: {state['cvs_score']} ({state['cvs_tier']})")
        print(f"Paper ID: {state.get('paper_id')}")
        print(f"Analysis ID: {state.get('analysis_id')}")
        print(f"Completed Agents: {', '.join(state['completed_agents'])}")

        if state["errors"]:
            print(f"\n⚠️ Errors: {', '.join(state['errors'])}")

        print("="*50 + "\n")

        return state

    def run_analysis(self, query: str, user_email: str, domain: Optional[str] = None) -> CVSState:
        """Run the complete CVS analysis workflow"""
        initial_state: CVSState = {
            "query": query,
            "user_email": user_email,
            "domain": domain,
            "technical_analysis": None,
            "market_analysis": None,
            "competitive_analysis": None,
            "ip_analysis": None,
            "cvs_score": None,
            "cvs_tier": None,
            "opportunity_id": None,
            "user_id": None,
            "paper_id": None,
            "analysis_id": None,
            "errors": [],
            "completed_agents": []
        }

        result = self.graph.invoke(initial_state)
        return result


# Example usage
if __name__ == "__main__":
    orchestrator = CVSOrchestrator()

    result = orchestrator.run_analysis(
        query="AI-powered defect detection for manufacturing",
        user_email="grdes111@gmail.com",
        domain="Computer Vision"
    )

    print(f"\nFinal CVS Score: {result['cvs_score']}")
    print(f"Analysis ID: {result['analysis_id']}")
