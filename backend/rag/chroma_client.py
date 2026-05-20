import chromadb
from chromadb.api.types import Documents, Embeddings
from huggingface_hub import InferenceClient
from negotiationai.backend.config import HF_API_KEY

client = chromadb.Client()

class HuggingFaceRemoteEmbeddingFunction(chromadb.EmbeddingFunction[Documents]):
    def __init__(self, api_key: str, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.client = InferenceClient(token=api_key)
        self.model_name = model_name

    def __call__(self, input: Documents) -> Embeddings:
        embeddings = []
        for text in input:
            embedding = self.client.feature_extraction(
                text,
                model=self.model_name
            )
            if hasattr(embedding, "tolist"):
                embedding = embedding.tolist()
            embeddings.append(embedding)
        return embeddings

hf_ef = HuggingFaceRemoteEmbeddingFunction(api_key=HF_API_KEY)

collection = client.get_or_create_collection(
    name="marketing_knowledge",
    embedding_function=hf_ef
)