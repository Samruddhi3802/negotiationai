from groq import Groq
from negotiationai.backend.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def call_llm(prompt: str):
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
    )
    return response.choices[0].message.content
