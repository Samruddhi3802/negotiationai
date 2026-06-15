# MongoDB Collection Structures Documentation
# Collections are created dynamically by PyMongo when data is inserted.

"""
1. "users" Collection Document Structure:
{
    "_id": ObjectId,         # Generated automatically
    "email": "string",
    "username": "string",
    "hashed_password": "string"
}

2. "negotiation_history" Collection Document Structure:
{
    "_id": ObjectId,
    "user_id": "string",     # References string conversion of user "_id"
    "mode": "string",
    "persona": "string",
    "final_price": float or null,
    "agreement_reached": "string", # "true" or "false"
    "value_claimed_pct": float,
    "timestamp": datetime,
    "feedback": "string"
}
"""
