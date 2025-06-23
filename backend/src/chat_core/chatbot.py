"""
Chatbot Deployment Logic

This module defines the ChatbotEngine class, responsible for training
and serving responses using a simple retrieval-based approach. It leverages
FAISS for similarity search over embedded user inputs and LangChain's schema.

Classes
-------
ChatbotEngine
    Loads a dataset, builds a vector store, and responds to user queries
    by retrieving the most relevant example from the dataset.
"""
from typing import List

from langchain.vectorstores import FAISS
from langchain.schema import Document

from core.utils.clients import ModelClient
from core.commons.storage.database.loader import load_dataset


class ChatbotEngine:
    """
    Engine for training and responding to user queries using FAISS vector search.
    """
    def __init__(self):
        self.client = ModelClient.load()
        self.embedding_model = self.client.get_embeddings()
        self.vectorstore = None
        self.dataset = []

    def train(self, meta_id: str) -> int:
        """
        Loads dataset, converts user_inputs into vector store.
        """
        self.dataset = load_dataset(meta_id)  # List[(user_input, reference)]
        documents: List[Document] = []

        for user_input, reference in self.dataset:
            documents.append(Document(
                page_content=user_input,
                metadata={"answer": reference}
            ))

        self.vectorstore = FAISS.from_documents(documents, self.embedding_model)
        return len(documents)

    def respond(self, query: str, k: int = 1) -> str:
        """
        Searches vector DB for most similar question and returns its answer.
        """
        if not self.vectorstore:
            return "Chatbot not trained yet."

        matches = self.vectorstore.similarity_search(query, k=k)
        if not matches:
            return "Sorry, I couldn't find a relevant answer in the dataset."

        return matches[0].metadata.get("answer", "No answer found.")
