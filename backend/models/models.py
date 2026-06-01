from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from negotiationai.backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    negotiations = relationship("NegotiationHistory", back_populates="owner")

class NegotiationHistory(Base):
    __tablename__ = "negotiation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mode = Column(String)
    persona = Column(String)
    final_price = Column(Float, nullable=True)
    agreement_reached = Column(String) # "true" or "false"
    value_claimed_pct = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    feedback = Column(String)
    
    owner = relationship("User", back_populates="negotiations")
