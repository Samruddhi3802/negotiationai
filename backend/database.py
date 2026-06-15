import os
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "negotiation_app")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def get_db():
    # Helper to return the pymongo DB client
    # FastAPI route dependency compatible
    return db
