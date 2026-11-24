import urllib.request
import json
import time

time.sleep(1)

test_queries = [
    "Tell me about Mumbai air quality",
    "Give me DIY indoor hacks for apartment",
    "What is the morning commute routine for Delhi?",
    "Calculate carbon savings for metro transit",
    "My child has asthma what precautions should I take?"
]

for q in test_queries:
    url = "http://127.0.0.1:8000/api/v1/assistant/chat"
    req = urllib.request.Request(
        url,
        data=json.dumps({"message": q}).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer open-access-token"
        }
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        first_line = data["response"].splitlines()[0]
        tools = data.get("tools_used", [])
        print(f"QUERY: {q}")
        print(f"  -> TITLE: {first_line}")
        print(f"  -> TOOLS: {tools}\n")
