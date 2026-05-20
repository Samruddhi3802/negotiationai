from pydantic import BaseModel

class ChatRequest(BaseModel):
    input: str
    mode: str = "dojo"
    persona: str = "professional"
