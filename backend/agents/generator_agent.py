from negotiationai.backend.services.groq_service import call_llm
from negotiationai.backend.rag.retriever import query_documents
import json

def generate_reply(state):
    mode = state.get("mode", "dojo")
    persona = state.get("persona", "efficient and professional")
    
    # Only pull RAG insights for Dojo mode (Marketing focused)
    insights = ""
    if mode == "dojo":
        insights = query_documents(state["input"])

    if mode == "dojo":
        role_description = f"You are a tough CLIENT/BUYER with a '{persona}' persona. You are being pitched a marketing package."
        instruction = "Stay in character. Challenge the salesperson. Be concise (1-3 sentences normally). Respond in JSON format only containing a 'reply' string and an 'extracted_price' float or null (representing the price you are proposing, counter-offering, or accepting in this reply, e.g. 15000 for 15,000 or 15k)."
    else:
        role_description = "You are an efficient Procurement Assistant. Your job is to help the user find real-world vendors."
        instruction = "Briefly summarize the vendors you found below. Mention them by name. Ask if they want to proceed with any of them. Respond in JSON format only containing a 'reply' string and an 'extracted_price' (always null)."

    prompt = f"""
    SYSTEM ROLE:
    {role_description}

    STRICT INSTRUCTIONS:
    1. {instruction}
    2. NEVER mention internal terms like 'RAG', 'Graph', or 'State'.
    3. Return ONLY a valid JSON object matching this structure:
       {{
         "reply": "...",
         "extracted_price": 15000 // float or null if no price is proposed/agreed in your reply
       }}
       No markdown. No explanation outside the JSON.
    
    {f"MARKETING KNOWLEDGE BASE: {insights}" if insights else ""}

    VENDOR RESEARCH DATA (PRIORITY):
    {state.get('vendor_list', 'No vendors found yet.')}

    USER REQUEST:
    "{state['input']}"

    Now, output the JSON:
    """

    response = call_llm(prompt)
    reply = response
    ai_price = None

    try:
        clean = response.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean)
        reply = data.get("reply", response)
        ai_price = data.get("extracted_price", None)
    except Exception as e:
        print(f"Generator reply parse error: {e}")

    drafts = []
    if mode == "procurement" and state.get("vendor_list"):
        for vendor in state["vendor_list"]:
            draft_prompt = f"Draft a professional RFQ email for: {vendor['name']}. Subject: RFQ for {state['input']}. Request pricing for 10,000 units."
            draft = call_llm(draft_prompt)
            drafts.append({"vendor": vendor['name'], "email": draft})

    return {
        **state,
        "reply": reply,
        "draft_emails": drafts,
        "extracted_ai_price": ai_price
    }