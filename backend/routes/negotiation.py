from fastapi import APIRouter
from negotiationai.backend.models.schemas import ChatRequest
from negotiationai.backend.agents.graph import build_graph

router = APIRouter()

graph = build_graph()

@router.post("/chat")
def chat(req: ChatRequest):
    state = {
        "input": req.input,
        "mode": req.mode,
        "persona": req.persona
    }

    result = graph.invoke(state)

    return {
        "reply": result["reply"],
        "strategy": result["strategy"],
        "personality": result["personality"],
        "scorecard": result.get("scorecard", {}),
        "vendor_list": result.get("vendor_list", []),
        "draft_emails": result.get("draft_emails", [])
    }