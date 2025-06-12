"""App initialisation logic"""
from flask import Flask
from app.routes import router


def create_app():
    app = Flask(__name__)
    # init_db()
    app.register_blueprint(router, url_prefix="/api")
    return app