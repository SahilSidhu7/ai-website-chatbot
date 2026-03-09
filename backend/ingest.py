import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

import os
from dotenv import load_dotenv

from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings

load_dotenv("../.env")

OLLAMA_URL = os.getenv("ollama_url")
MODEL = os.getenv("model")

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}


def scrape_website(base_url, max_pages=10):

    visited = set()
    queue = [base_url]
    texts = []

    while queue and len(visited) < max_pages:

        url = queue.pop(0)
        print("Scraping:", url)

        if url in visited:
            continue

        visited.add(url)

        try:
            r = requests.get(url,headers=HEADERS,verify=False)
            soup = BeautifulSoup(r.text, "html.parser")

            paragraphs = soup.find_all("p")

            text = "\n".join(p.get_text() for p in paragraphs)
            texts.append(text)

            for link in soup.find_all("a", href=True):
                full = urljoin(base_url, link["href"])

                if base_url in full and full not in visited:
                    queue.append(full)

        except:
            pass

    return "\n".join(texts)

def web_html(text):

    texts = []

    soup = BeautifulSoup(text, "html.parser")

    paragraphs = soup.find_all("p")

    text = "\n".join(p.get_text() for p in paragraphs)
    texts.append(text)
    return "\n".join(texts)

def chunk_text(text, size=500):

    chunks = []

    for i in range(0, len(text), size):
        chunks.append(text[i:i+size])

    return chunks


def create_vector_store(chunks):

    if not chunks:
        print("No content found. Cannot create vector store.")
        return
    
    batch_size = 50
    db = None

    embeddings = OllamaEmbeddings(model=MODEL, base_url=OLLAMA_URL)

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]

        print(f"Embedding batch {i//batch_size + 1}")

        if db is None:
            db = FAISS.from_texts(batch, embeddings)
        else:
            db.add_texts(batch)

    db.save_local("vectorstore")


if __name__ == "__main__":

    url = "https://example.com"

    text = scrape_website(url)

    print("Text length:", len(text))
    
    chunks = chunk_text(text)

    print("Chunks:", len(chunks))

    create_vector_store(chunks)

    print("Index created")