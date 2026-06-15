from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class ChatRequest(BaseModel):
    input: str
    mode: str = "dojo"
    persona: str = "professional"

class AlternativeItem(BaseModel):
    name: str
    cost: float
    probability: float
    switching_cost: float

class PrepData(BaseModel):
    target_price: float
    walk_away_price: float
    buyer_min: float
    buyer_max: float
    alternatives: List[AlternativeItem] = []

class ConcludeRequest(BaseModel):
    chat_history: List[Dict]
    prep_data: PrepData

class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class NegotiationHistorySchema(BaseModel):
    id: str
    mode: str
    persona: str
    final_price: Optional[float]
    agreement_reached: str
    value_claimed_pct: float
    timestamp: datetime
    feedback: str

    class Config:
        from_attributes = True
        populate_by_name = True

class UserProfileSchema(BaseModel):
    id: str
    username: str
    email: str
    negotiation_count: int
    avg_value_claimed: float
    recent_history: List[NegotiationHistorySchema]

    class Config:
        from_attributes = True
        populate_by_name = True
