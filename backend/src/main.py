"""API driver code"""
import os
from dotenv import load_dotenv
from flask import Flask
from flask_wtf.csrf import CSRFProtect, generate_csrf
from chat_core.routes import chatbot_api 

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.register_blueprint(chatbot_api, url_prefix="/api")
    return app

app = create_app()
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
csrf = CSRFProtect()
csrf.init_app(app)

if __name__ == "__main__":
    app.run(debug=True)