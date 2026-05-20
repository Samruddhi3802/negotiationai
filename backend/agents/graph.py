from langgraph.graph import StateGraph, END
from negotiationai.backend.agents.analyzer_agent import analyze
from negotiationai.backend.agents.personality_agent import detect_personality
from negotiationai.backend.agents.strategy_agent import decide_strategy
from negotiationai.backend.agents.generator_agent import generate_reply
from negotiationai.backend.agents.research_agent import research_vendors
from typing import TypedDict

class AgentState(TypedDict):
    input: str
    mode: str
    persona: str 
    analysis: str
    personality: str
    strategy: str
    reply: str
    scorecard: dict
    vendor_list: list
    draft_emails: list

def route_after_strategy(state):
    if state.get("mode") == "procurement":
        return "research"
    return "generate_reply"

def build_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("analyze", analyze)
    workflow.add_node("detect_personality", detect_personality)
    workflow.add_node("decide_strategy", decide_strategy)
    workflow.add_node("research", research_vendors)
    workflow.add_node("generate_reply", generate_reply)

    workflow.set_entry_point("analyze")

    workflow.add_edge("analyze", "detect_personality")
    workflow.add_edge("detect_personality", "decide_strategy")

    # ✅ CONDITIONAL FLOW HERE
    workflow.add_conditional_edges(
        "decide_strategy",
        route_after_strategy,
        {
            "research": "research",
            "generate_reply": "generate_reply"
        }
    )

    workflow.add_edge("research", "generate_reply")
    workflow.add_edge("generate_reply", END)

    return workflow.compile()