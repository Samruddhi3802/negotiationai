from duckduckgo_search import DDGS

def search_vendors_online(query, max_results=5):
    try:
        with DDGS() as ddgs:
            results = ddgs.text(f"{query} suppliers pricing", max_results=max_results)
            return results
    except Exception as e:
        print(f"Search error: {e}")
        return []
