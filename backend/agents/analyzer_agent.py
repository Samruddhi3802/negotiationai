from negotiationai.backend.services.groq_service import call_llm
import json

def analyze(state):
    mode = state.get("mode", "dojo")

    prompt = f"""
    Analyze the following negotiation input:

    "{state['input']}"

    TASK:
    1. Summarize key points, objectives, and tone (short paragraph)
    """

    # Only include scorecard for dojo mode
    if mode == "dojo":
        prompt += """
        2. Evaluate negotiation skills and return:

        JSON FORMAT:
        {
          "analysis": "text summary",
          "scorecard": {
            "tactics_score": 0-100,
            "resilience_score": 0-100,
            "tone_score": 0-100,
            "deal_value_score": 0-100,
            "emotions": {
              "confidence": 0-100,
              "empathy": 0-100,
              "aggression": 0-100,
              "logic": 0-100
            },
            "feedback": "short advice"
          }
        }

        ONLY return JSON. No markdown.
        """
    else:
        prompt += """
        Return JSON:
        {
          "analysis": "text summary"
        }

        ONLY return JSON.
        """

    response = call_llm(prompt)

    try:
        clean = response.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean)

        analysis = data.get("analysis", "")
        scorecard = data.get("scorecard", {})

        # fallback safety
        if mode == "dojo" and not scorecard:
            scorecard = {
                "tactics_score": 50,
                "resilience_score": 50,
                "tone_score": 50,
                "deal_value_score": 50,
                "emotions": {
                    "confidence": 50,
                    "empathy": 50,
                    "aggression": 50,
                    "logic": 50
                },
                "feedback": "Keep practicing!"
            }

    except Exception as e:
        print(f"Parse error: {e}")
        analysis = "Could not analyze input."
        scorecard = {}

    return {
        **state,
        "analysis": analysis,
        "scorecard": scorecard
    }