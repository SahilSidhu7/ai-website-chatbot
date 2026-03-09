from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

from fastapi.staticfiles import StaticFiles

from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings

load_dotenv("../.env")

OLLAMA_URL = os.getenv("ollama_url")
MODEL = os.getenv("model")

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str


# load embeddings
embeddings = OllamaEmbeddings(model=MODEL, base_url=OLLAMA_URL)

# load vector database
db = FAISS.load_local("vectorstore", embeddings, allow_dangerous_deserialization=True)


@app.post("/chat")
def chat(req: ChatRequest):

    question = req.question

    docs = db.similarity_search(question, k=3)

    context = "\n".join(d.page_content for d in docs)

    prompt = f"""
Context:
{context}

Question:
{question}

Answer using the context.
"""

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False
    }

    r = requests.post(f"{OLLAMA_URL}/api/generate", json=payload)

    return {"answer": r.json()["response"]}