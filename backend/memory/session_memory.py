sessions = {}

def get_session(session_id: str):
    if session_id not in sessions:
        sessions[session_id] = {
            "history": [],
            "last_strategy": None,
            "personality": None
        }
    return sessions[session_id]


def update_session(session_id: str, user_input: str, ai_reply: str):

    session = get_session(session_id)

    session["history"].append({
        "user": user_input,
        "ai": ai_reply
    })

    return session