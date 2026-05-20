from negotiationai.backend.services.groq_service import call_llm

def decide_strategy(state):
    mode = state.get("mode", "dojo")
    
    if mode == "dojo":
        context = "The user is PRACTICING sales negotiation. Suggest a tactic they should use to handle the AI (who is acting as a tough buyer)."
    else:
        context = "The user is in AUTO-PROCUREMENT mode. Suggest a strategy to get the best price/terms from the vendor AI."

    prompt = f"{context}\nAnalysis: {state['analysis']}\nUser Personality: {state['personality']}\nSuggest one specific negotiation strategy."
    strategy = call_llm(prompt)
    return {**state, "strategy": strategy}
