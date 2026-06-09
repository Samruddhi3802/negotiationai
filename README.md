# 🤝 DealCraft AI & Procurement Server (NegotiationAI)

A powerful, AI-driven negotiation training platform that helps users master their negotiation skills against AI-driven personas. The application uses LLMs to simulate challenging buyers/sellers, provide real-time Emotional Intelligence (EQ) analysis, and generate actionable feedback based on user engagement.

## 🌟 Overview

The **DealCraft AI** project (NegotiationAI) features a dual-stack architecture (FastAPI backend + React/Vite frontend). It acts as a comprehensive "Negotiation Dojo", pitting users against highly configured AI personas.

### Live Link:
"https://frontend-service-ia9r.onrender.com"

### Core Features:
- **Interactive AI Negotiation:** Engages users in dynamic dialog using state-of-the-art agent workflows constructed via `Langgraph`.
- **Real-Time EQ Meter:** Analyzes user inputs on the fly to detect emotional tones such as Collaborative, Aggressive, Logical, or Hesitant.
- **Detailed Performance Analytics:** Calculates a "Value Claimed" percentage at the conclusion, providing deep insights on concessions compared to walk-away points.
- **Role-playing Personas:** Encounter different AI temperaments (e.g., Skeptical, Aggressive, Collaborative).
- **Secure Authentication:** JWT-based secure user authentication and historical performance tracking.

---

## 🏗 System Architecture & Flow

1. **User Authentication:** The client signs up or logs in securely. JWT tokens are passed with all protected requests.
2. **Session Setup:** The user selects a negotiation persona and sets their prep data (Target Price, Walk-away Price).
3. **Dialogue (RAG & Graph):** 
   - User sends a message via the Front End.
   - The backend runs a `Langgraph`-powered workflow, determining the AI's internal strategy, evaluating the user's EQ tone via Groq, and computing the optimal reply.
   - Context is injected via ChromaDB if relevant market data is requested.
4. **Session Conclusion:** Once the negotiation ends, the backend analyzes the entire history, identifies specific negotiation tactics used by the user (e.g., "Anchoring", "Mirroring"), and returns a comprehensive scorecard.

---

## 🛠 Tech Stack

### Backend
- **Framework:** `FastAPI` (Python)
- **AI/LLM orchestration:** `Langgraph`, `Groq` API, `ElevenLabs`
- **Vector Database (RAG):** `ChromaDB` (alongside DuckDuckGo search)
- **Database / ORM:** `SQLAlchemy` (SQLite base: `negotiation_app.db`)
- **Security:** `bcrypt`, `python-jose` (JWT)

### Frontend
- **Framework:** `React 19` powered by `Vite`
- **Networking:** `Axios`
- **Routing:** `React Router DOM`
- **UI & Data Visualization:** `Recharts`, `Lucide React`

---

## 🔌 API Endpoints

### Authentication (`/auth`)
- `POST /auth/signup` - Register a new user.
- `POST /auth/login` - Authenticate and retrieve a JWT bearer token.
- `GET /auth/profile` - Fetch user details, including past negotiation count, recent history, and average value claimed.

### Negotiation (`/`)
- `POST /chat` 
  - **Payload:** User message, mode, persona.
  - **Returns:** AI reply, underlying AI strategy, tone analysis (EQ metric), and active scorecard.
- `POST /conclude`
  - **Payload:** Full chat history, prep data (target price, walk-away limits, buyer minimum/maximum).
  - **Returns:** In-depth JSON analytics (agreement status, final price, extracted tactics by turn, concession patterns, specific feedback, value claimed %).

---

## 🚀 Setup & Installation

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```
**Environment Variables (`backend/.env`):**
Create a `.env` file under the backend folder with the required API keys (Groq, ElevenLabs, etc.) and JWT Secret keys.

**Run the Backend:**
```bash
python main.py
# OR
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*(Server will start on http://localhost:8000)*

### 2. Frontend Setup
```bash
cd frontend
npm install
```
**Run the Frontend:**
```bash
npm run dev
```
*(Frontend will usually run on http://localhost:5173)*

### 3. Database
The system uses SQLite by default (`negotiation_app.db`). Tables are auto-generated via SQLAlchemy on the first backend startup.

---

## 📝 Next Steps
- Implement broader testing coverage for frontend components.
- Configure production Docker containers for unified service deployment.
