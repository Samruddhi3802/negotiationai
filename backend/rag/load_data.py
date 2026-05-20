from negotiationai.backend.rag.retriever import add_documents
from negotiationai.backend.rag.chroma_client import collection

def load_market_data():
    # Check if already loaded
    if collection.count() > 0:
        print("Data already loaded. Skipping embedding.")
        return

    import os
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    file_path = os.path.join(base_dir, "data", "marketing_insights.txt")

    with open(file_path, "r") as f:
        data = f.readlines()

    add_documents(data)
    print("Market data loaded into vector DB.")