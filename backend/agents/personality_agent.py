from negotiationai.backend.services.groq_service import call_llm

def detect_personality(state):
    prompt = f"Detect the personality type of the user based on this input (e.g., Aggressive, Empathetic, Logical):\n\n{state['input']}"
    user_personality = call_llm(prompt)
    
    # We keep the AI's persona separate from the user's detected personality
    return {**state, "personality": user_personality}
