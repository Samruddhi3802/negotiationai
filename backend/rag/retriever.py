from negotiationai.backend.rag.chroma_client import collection

def add_documents(texts):

    for i, text in enumerate(texts):
        collection.add(
            documents=[text],
            ids=[str(i)]
        )


def query_documents(query):

    results = collection.query(
        query_texts=[query],
        n_results=3
    )

    return results["documents"][0]