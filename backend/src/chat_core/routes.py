"""Routes for Chatbot API"""
import uuid
import pandas as pd
from datetime import datetime
from flask import request, jsonify, Blueprint
from urllib.parse import urljoin

from chat_core.database import Storage
from chat_core.database.models import Chatbots, StatusEnum
from chat_core.database.fetch import get_full_dataset_by_meta_id
from core.commons.log_config import get_logger

logger = get_logger(__name__.rsplit('.', maxsplit=1)[-1])

chatbot_api = Blueprint("chatbot_api", __name__)
chatbot_storage = Storage()

@chatbot_api.route('/chatbots/create', methods=['POST'])
def create_chatbot():
    data = request.get_json()
    meta_id = data.get("meta_id")
    name = data.get("name", "Untitled Chatbot")

    # Validate meta_id exists
    # Insert into Chatbots table
    chatbot = Chatbots(
        name=name,
        description="Generated from testset",
        deployment_url="",
        status=StatusEnum.INACTIVE
    )
    chatbot_storage.insert([chatbot], orm_class=Chatbots)
    return jsonify({"chatbot_id": str(chatbot.id)})

@chatbot_api.route('/chatbots', methods=['GET'])
def list_chatbots():
    chatbots = chatbot_storage.fetch(orm_class=Chatbots, as_orm=True)
    logger.info(f"Fetched {len(chatbots)} chatbots.")
    return jsonify([cb.to_dict() for cb in chatbots])

@chatbot_api.route('/chatbots/<uuid:chatbot_id>/train', methods=['POST'])
def train_chatbot(chatbot_id):
    try:
        meta_id = uuid.UUID(request.json.get("meta_id"))
    except Exception:
        logger.warning("Invalid or missing meta_id in request.")
        return jsonify({"error": "Invalid or missing meta_id"}), 400
    
    results = chatbot_storage.fetch(orm_class=Chatbots, filters={"id": chatbot_id},as_orm=True)
    if not results:
        logger.warning(f"Chatbot {chatbot_id} not found.")
        return(jsonify({"error": "Chatbot not Found"})), 400
    chatbot = results[0]

    if chatbot.status != StatusEnum.INACTIVE:
        logger.warning(f"Chatbot {chatbot.id} is already {chatbot.status}.")
        return(jsonify({"error": "Chatbot is already trained or active"})), 400
    
    df = get_full_dataset_by_meta_id(meta_id)
    if df.empty:
        logger.warning(f"No dataset found for meta_id: {meta_id}")
        return jsonify({"error": "No dataset found for this meta id"}), 404
    
    logger.info(f"Training chatbot '{chatbot.name}' on {len(df)} rows...")
    chatbot.last_trained_at = datetime.now(datetime.timezone.utc)
    chatbot.status = StatusEnum.TRAINED
    chatbot_storage.update(pd.DataFrame([chatbot.to_dict()]), name="chatbot", key_column="id")

    logger.info(f"Chatbot '{chatbot.name}' marked as TRAINED.")
    return jsonify({"message", "Trained Successfully"}), 200

@chatbot_api.route('/chatbots/<uuid:chatbot_id>/deply', methods=['POST'])
def deploy_chatbot(chatbot_id):
    results = chatbot_storage.fetch(orm_class=Chatbots, filters={"id", chatbot_id}, as_orm=True)
    if not results:
        logger.warning(f"Chatbot {chatbot_id} not found for deployment.")
        return jsonify({"error": "Chatbot not found"}), 404
    chatbot = results[0]

    if chatbot.status != StatusEnum.TRAINED:
        logger.warning(f"Chatbot {chatbot.id} is not trained. Current status: {chatbot.status}")
        return jsonify({"error": "Chatbot must be trained before deployment"}), 400
    
    base_url = request.host_url.rstrip('/')
    chatbot.deployment_url = urljoin(base_url, f"chat/{chatbot.id}")
    chatbot.status = StatusEnum.ACTIVE
    chatbot_storage.update(pd.DataFrame([chatbot.to_dict()]), name="chatbots", key_column="id")

    logger.info(f"Chatbot '{chatbot.name}' deployed at {chatbot.deployment_url}")
    return jsonify({
        "message": "Deployment Successful",
        "deployment_url": chatbot.deployment_url
    })