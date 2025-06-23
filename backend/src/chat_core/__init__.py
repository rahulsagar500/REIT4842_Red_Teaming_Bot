"""App initialisation logic"""
from flask import Flask
from chat_core.routes import chatbot_api


def create_app():
    """
    Factory function to create and configure the Flask application instance.

    Registers all application blueprints and initializes extensions as needed.

    Returns
    -------
    Flask
        A configured Flask app instance.
    """
    app = Flask(__name__)
    # init_db()
    app.register_blueprint(chatbot_api, url_prefix="/api")
    return app
