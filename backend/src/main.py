"""API driver code"""
from flask import Flask
from chat_core.routes import chatbot_api 

def create_app():
    app = Flask(__name__)
    app.register_blueprint(chatbot_api, url_prefix="/api")
    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)