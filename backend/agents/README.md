# CVS Analysis Orchestrator - Python LangGraph Implementation

Clean, object-oriented Python implementation replacing the n8n workflow.

## Features

✅ **LangGraph state machine** - Clean workflow with clear states
✅ **Object-oriented design** - Separate concerns (DB, LLM, Orchestrator)
✅ **Proper error handling** - Errors tracked in state, no silent failures
✅ **Type safety** - TypedDict for state management
✅ **Easy debugging** - Print statements at every step
✅ **Direct Supabase integration** - No parameter conversion issues

## Setup

1. **Install dependencies:**

```bash
cd backend/agents
pip install -r requirements.txt
```

2. **Set environment variables:**

Create `.env` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vqgwzzzjlswyagncyhih.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# OpenAI (if needed)
OPENAI_API_KEY=your_openai_key
```

3. **Run the orchestrator:**

```bash
python cvs_orchestrator.py
```

## Usage

### Basic Usage

```python
from cvs_orchestrator import CVSOrchestrator

orchestrator = CVSOrchestrator()

result = orchestrator.run_analysis(
    query="AI-powered defect detection for manufacturing",
    user_email="grdes111@gmail.com",
    domain="Computer Vision"
)

print(f"CVS Score: {result['cvs_score']}")
print(f"Analysis ID: {result['analysis_id']}")
```

### As API Endpoint

```python
from fastapi import FastAPI
from cvs_orchestrator import CVSOrchestrator

app = FastAPI()
orchestrator = CVSOrchestrator()

@app.post("/api/cvs-analysis")
async def run_cvs_analysis(
    query: str,
    user_email: str,
    domain: str = None
):
    result = orchestrator.run_analysis(query, user_email, domain)

    return {
        "opportunity_id": result["opportunity_id"],
        "cvs_score": result["cvs_score"],
        "cvs_tier": result["cvs_tier"],
        "paper_id": str(result["paper_id"]),
        "analysis_id": str(result["analysis_id"]),
        "errors": result["errors"]
    }
```

## Architecture

### State Flow

```
initialize
    ↓
get_user (lookup user by email)
    ↓
technical_analysis (TRL, feasibility)
    ↓
market_analysis (TAM, industry)
    ↓
competitive_analysis (competitive risk)
    ↓
ip_analysis (IP risk/opportunity)
    ↓
calculate_cvs (weighted score)
    ↓
save_to_db (research_papers + cvs_analyses)
    ↓
complete (log results)
```

### Classes

**`CVSState`** - TypedDict defining workflow state
- Input: query, user_email, domain
- Agent outputs: technical_analysis, market_analysis, etc.
- Results: cvs_score, cvs_tier
- Database IDs: user_id, paper_id, analysis_id
- Status: errors, completed_agents

**`SupabaseManager`** - Database operations
- `get_user_by_email()` - Lookup user
- `insert_research_paper()` - Insert paper, return ID
- `insert_cvs_analysis()` - Insert analysis, return ID

**`CVSOrchestrator`** - Main workflow coordinator
- Builds LangGraph workflow
- Executes analysis agents
- Calculates CVS score
- Saves to database

## Next Steps

### 1. Connect Real Agents

Replace placeholder logic in these methods with actual agent calls:

- `run_technical_analysis()` - Call your technical analysis agent
- `run_market_analysis()` - Call your market sizing agent
- `run_competitive_analysis()` - Call your competitive analysis agent
- `run_ip_analysis()` - Call your IP analysis agent

### 2. Improve CVS Calculation

Update `calculate_cvs_score()` with the actual formula from your agents.

### 3. Add Array Handling

Update database save methods to properly handle authors, keywords, key_strengths, key_risks arrays.

### 4. Add API Endpoint

Create FastAPI endpoint to expose this as an API.

### 5. Add Async Support

Convert to async for better performance:

```python
async def run_technical_analysis(self, state: CVSState) -> CVSState:
    # Async agent call
    result = await self.technical_agent.run(state["query"])
    ...
```

## Benefits Over n8n

✅ **No array conversion issues** - Direct Python → PostgreSQL
✅ **Proper error handling** - Errors collected in state
✅ **Easy debugging** - Print statements, breakpoints
✅ **Type safety** - TypedDict catches errors early
✅ **Version control** - Code in Git, not JSON
✅ **Testing** - Unit tests for each method
✅ **Reusable** - Import as module, use in API

## Troubleshooting

**Missing user:**
```python
# Check if user exists
user = orchestrator.db.get_user_by_email("test@example.com")
print(user)
```

**Database errors:**
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Agent failures:**
```python
# Check state after each agent
result = orchestrator.run_analysis(...)
print(result["errors"])
print(result["completed_agents"])
```

---

**Time to implement:** 30 minutes to connect real agents
**Maintenance:** Much easier than n8n JSON
**Debuggability:** 10x better with Python
