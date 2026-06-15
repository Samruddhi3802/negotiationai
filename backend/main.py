import os
import sys

# Add the grandparent directory (which contains 'negotiationai') to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
grandparent_dir = os.path.dirname(os.path.dirname(backend_dir))
if grandparent_dir not in sys.path:
    sys.path.insert(0, grandparent_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from negotiationai.backend.routes import negotiation, auth
from negotiationai.backend.rag.load_data import load_market_data

app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    load_market_data()

app.include_router(auth.router)
app.include_router(negotiation.router)

@app.get("/")
def home():
    return {"message": "DealCraft AI & Procurement Server Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("negotiationai.backend.main:app", host="0.0.0.0", port=8000, reload=True)