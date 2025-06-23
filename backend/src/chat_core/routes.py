"""
Routes for Chatbot API.

Includes endpoints to:
- Create a chatbot based on a testset (MetaDataset)
- List existing chatbots
- Train a chatbot (mark as trained with a dataset)
- Deploy a chatbot (mark as active with a URL)
"""
import uuid
from datetime import datetime, timezone
from urllib.parse import urljoin

import pandas as pd
from flask import request, jsonify, Blueprint

from chat_core.database import Storage
from chat_core.database.models import Chatbots, StatusEnum
from chat_core.database.fetch import get_full_dataset_by_meta_id
from core.commons.config import PG_CONFIG
from core.commons.log_config import get_logger

logger = get_logger(__name__.rsplit('.', maxsplit=1)[-1])

chatbot_api = Blueprint("chatbot_api", __name__)
chatbot_storage = Storage(PG_CONFIG)

@chatbot_api.route('/chatbots/create', methods=['POST'])
def create_chatbot():
    """
    API endpoint to create a new chatbot entry in the database.

    Expects a JSON payload with:
    - `meta_id`: UUID of the associated testset or dataset.
    - `name` (optional): Human-readable name for the chatbot. Defaults to "Untitled Chatbot".

    Returns
    -------
    JSON response
        {
            "chatbot_id": "<UUID>"
        }

    Notes
    -----
    - This route does not currently validate whether `meta_id` exists or is valid.
    - The new chatbot is inserted with status `INACTIVE` and no deployment URL.
    """

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
    chatbot_storage.insert([chatbot], name="chatbots", orm_class=Chatbots)
    return jsonify({"chatbot_id": str(chatbot.id)})

@chatbot_api.route('/chatbots', methods=['GET'])
def list_chatbots():
    """
    API endpoint to retrieve all chatbots from the database.

    Returns
    -------
    JSON response
        A list of chatbots, where each item includes:
        - id (UUID)
        - name (str)
        - description (str)
        - deployment_url (str)
        - created_at (ISO datetime string)
        - last_trained_at (ISO datetime string or null)
        - status (str): one of "INACTIVE", "TRAINED", or "ACTIVE"
    """
    chatbots = chatbot_storage.fetch(orm_class=Chatbots, as_orm=True)
    logger.info("Fetched %d chatbots.", len(chatbots))
    return jsonify([cb.to_dict() for cb in chatbots])

@chatbot_api.route('/chatbots/<uuid:chatbot_id>/train', methods=['POST'])
def train_chatbot(chatbot_id):
    """
    API endpoint to train a chatbot using its associated dataset.

    This updates the chatbot's status to TRAINED and sets the last_trained_at timestamp,
    provided it is currently in the INACTIVE state and a valid meta_dataset_id is given.

    Request JSON
    ------------
    {
        "meta_id": "<uuid>"
    }

    Parameters
    ----------
    chatbot_id : UUID
        The unique identifier of the chatbot to train.

    Returns
    -------
    JSON response
        Success:
        {
            "message": "Trained Successfully"
        }

        Error:
        {
            "error": "Reason for failure"
        }
        With appropriate HTTP status code.
    """
    # Validate and parse meta_id
    try:
        meta_id = uuid.UUID(request.json.get("meta_id"))
    except Exception:
        logger.warning("Invalid or missing meta_id in request.")
        return jsonify({"error": "Invalid or missing meta_id"}), 400

    # Fetch the chatbot instance
    results = chatbot_storage.fetch(orm_class=Chatbots, filters={"id": chatbot_id}, as_orm=True)
    if not results:
        logger.warning("Chatbot %s not found.", chatbot_id)
        return jsonify({"error": "Chatbot not found"}), 400

    chatbot = results[0]

    if chatbot.status != StatusEnum.INACTIVE:
        logger.warning("Chatbot %s is already %s.", chatbot.id, chatbot.status)
        return jsonify({"error": "Chatbot is already trained or active"}), 400

    # Load dataset for the chatbot
    df = get_full_dataset_by_meta_id(meta_id)
    if df.empty:
        logger.warning("No dataset found for meta_id: %s", meta_id)
        return jsonify({"error": "No dataset found for this meta id"}), 404

    # Simulate training
    logger.info("Training chatbot '%s' on %d rows...", chatbot.name, len(df))
    chatbot.last_trained_at = datetime.now(timezone.utc)
    chatbot.status = StatusEnum.TRAINED

    # Update in DB
    chatbot_storage.update(pd.DataFrame([chatbot.to_dict()]), name="chatbots", key_column="id")

    logger.info("Chatbot '%s' marked as TRAINED.", chatbot.name)
    return jsonify({"message": "Trained Successfully"}), 200

@chatbot_api.route('/chatbots/<uuid:chatbot_id>/deploy', methods=['POST'])
def deploy_chatbot(chatbot_id):
    """
    API endpoint to deploy a trained chatbot.

    Updates the chatbot's status to `ACTIVE` and sets its deployment URL,
    provided it is currently in the `TRAINED` state.

    Parameters
    ----------
    chatbot_id : UUID
        Unique identifier of the chatbot to deploy.

    Returns
    -------
    JSON response
        On success:
        {
            "message": "Deployment Successful",
            "deployment_url": "<url>"
        }

        On error:
        {
            "error": "Reason for failure"
        }
        With appropriate HTTP status code.
    """
    # BUGFIX: filters should be a dict with key-value pairs, not a set
    results = chatbot_storage.fetch(orm_class=Chatbots, filters={"id": chatbot_id}, as_orm=True)
    if not results:
        logger.warning("Chatbot %s not found for deployment.", chatbot_id)
        return jsonify({"error": "Chatbot not found"}), 404

    chatbot = results[0]
    if chatbot.status != StatusEnum.TRAINED:
        logger.warning("Chatbot %s is not trained. Current status: %s", chatbot.id, chatbot.status)
        return jsonify({"error": "Chatbot must be trained before deployment"}), 400

    base_url = request.host_url.rstrip('/')
    chatbot.deployment_url = urljoin(base_url, f"chat/{chatbot.id}")
    chatbot.status = StatusEnum.ACTIVE
    chatbot_storage.update(pd.DataFrame([chatbot.to_dict()]), name="chatbots", key_column="id")

    logger.info("Chatbot '%s' deployed at %s", chatbot.name, chatbot.deployment_url)
    return jsonify({
        "message": "Deployment Successful",
        "deployment_url": chatbot.deployment_url
    })
