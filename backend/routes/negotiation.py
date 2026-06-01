from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from negotiationai.backend.models.schemas import ChatRequest, ConcludeRequest
from negotiationai.backend.agents.graph import build_graph
from negotiationai.backend.services.groq_service import call_llm
from negotiationai.backend.routes.auth import get_current_user
from negotiationai.backend.database import get_db
from negotiationai.backend.models import models
import json

router = APIRouter()

graph = build_graph()

@router.post("/chat")
def chat(req: ChatRequest, current_user=Depends(get_current_user)):
    # Unique Feature: Emotional Intelligence (EQ) Tone Analysis
    tone_prompt = f"""
    Analyze the emotional tone of this negotiation message: "{req.input}"
    Return ONLY one word from this list: [Collaborative, Aggressive, Logical, Emotional, Hesitant, Confident].
    """
    tone = call_llm(tone_prompt).strip().replace(".", "")
    
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
        "tone": tone, # New EQ Meter feature
        "scorecard": result.get("scorecard", {}),
        "vendor_list": result.get("vendor_list", []),
        "draft_emails": result.get("draft_emails", []),
        "extracted_user_price": result.get("extracted_user_price", None),
        "extracted_ai_price": result.get("extracted_ai_price", None)
    }

@router.post("/conclude")
def conclude(req: ConcludeRequest, current_user=Depends(get_current_user), db: Session = Depends(get_db), mode: str = "dojo", persona: str = "skeptical"):
    # 1. Format chat history for prompt
    history_str = ""
    for turn in req.chat_history:
        user_msg = turn.get("user", "")
        ai_msg = turn.get("ai", "")
        if user_msg:
            history_str += f"User: {user_msg}\n"
        if ai_msg:
            history_str += f"AI: {ai_msg}\n"

    # 2. Build prompt
    prompt = f"""
    You are an expert Negotiation Analyst. Analyze the following negotiation session.
    The user is acting as the SELLER (trying to sell a marketing package at a high price).
    The AI is acting as the BUYER (trying to buy the package at a lower price).

    Prep Data:
    - Target Price (User/Seller target): {req.prep_data.target_price}
    - Walk-away Price (User/Seller absolute minimum): {req.prep_data.walk_away_price}
    - Buyer Estimated Range: {req.prep_data.buyer_min} to {req.prep_data.buyer_max}

    Negotiation Chat History:
    {history_str}

    TASK:
    Analyze the session and return a valid JSON object.

    JSON FORMAT:
    {{
      "agreement_reached": true/false,
      "final_price": 23000, // float or null if walked away or no agreement
      "tactics_spotted": [
        {{
          "tactic": "Anchoring", // e.g. Anchoring, Labeling, Concession Size, Empathy, Mirroring, Silence
          "quote": "...", // quote from the user's messages
          "turn": 1, // turn number
          "impact": "Good initial high offer sets baseline."
        }}
      ],
      "concession_pattern": "User concessions decreased in size, which was good.",
      "feedback": "Coaching feedback here."
    }}

    ONLY return JSON. No markdown.
    """

    response = call_llm(prompt)

    try:
        clean = response.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean)
    except Exception as e:
        print(f"Conclude parsing error: {e}")
        data = {
            "agreement_reached": False,
            "final_price": None,
            "tactics_spotted": [],
            "concession_pattern": "Could not analyze concessions.",
            "feedback": "Could not parse review."
        }

    # Compute value claimed percentage for Seller
    # If final price >= Walk Away: Value Claimed = (Final Price - Walk Away) / (Buyer Max - Walk Away)
    value_claimed_pct = 0.0
    if data.get("agreement_reached") and data.get("final_price") is not None:
        try:
            final_price = float(data.get("final_price"))
            walk_away = float(req.prep_data.walk_away_price)
            buyer_max = float(req.prep_data.buyer_max)
            if buyer_max > walk_away:
                value_claimed_pct = ((final_price - walk_away) / (buyer_max - walk_away)) * 100.0
            else:
                value_claimed_pct = 50.0
        except Exception as e:
            print(f"Value claimed calculation error: {e}")
            value_claimed_pct = 0.0

        # Cap between 0 and 100
        value_claimed_pct = max(0.0, min(100.0, value_claimed_pct))

    data["value_claimed_pct"] = round(value_claimed_pct, 1)

    # 4. Save to database
    try:
        new_history = models.NegotiationHistory(
            user_id=current_user.id,
            mode=mode,
            persona=persona,
            final_price=data.get("final_price"),
            agreement_reached=str(data.get("agreement_reached", False)).lower(),
            value_claimed_pct=data["value_claimed_pct"],
            feedback=data.get("feedback", "")
        )
        db.add(new_history)
        db.commit()
    except Exception as e:
        print(f"Error saving history: {e}")
        db.rollback()

    return data