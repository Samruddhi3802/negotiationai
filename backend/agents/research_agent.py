from negotiationai.backend.services.groq_service import call_llm
from negotiationai.backend.services.search_service import search_vendors_online
import json

def research_vendors(state):
    if state.get("mode") != "procurement":
        return state

    # 1. Refine the search query to focus on MANUFACTURERS/SUPPLIERS
    refined_query = f"manufacturers of {state['input']}"
    
    try:
        search_results = search_vendors_online(refined_query)
    except Exception as e:
        print(f"Search failed: {e}")
        search_results = "No live results found."
    
    # 2. Use LLM to extract and VALIDATE real info
    prompt = f"""
    Search Results for "{state['input']}":
    {search_results}
    
    CRITICAL: IDENTIFY 3 REAL PACKAGING COMPANIES FROM ABOVE.
    
    RETURN ONLY A VALID JSON LIST. NO TEXT BEFORE OR AFTER.
    FORMAT:
    [
      {{"name": "Company Name", "price_estimate": "$0.00", "pros": "Benefit", "cons": "Risk"}}
    ]
    """
    
    res = call_llm(prompt)
    
    vendors = []
    try:
        # Robust JSON extraction: look for [ and ]
        start_idx = res.find("[")
        end_idx = res.rfind("]") + 1
        if start_idx != -1 and end_idx != -1:
            json_str = res[start_idx:end_idx]
            vendors = json.loads(json_str)
        else:
            # Fallback if no brackets found
            print("No JSON brackets found in LLM response")
            vendors = []
    except Exception as e:
        print(f"JSON Parse Error: {e}")
        vendors = []
        
    return {**state, "vendor_list": vendors}
