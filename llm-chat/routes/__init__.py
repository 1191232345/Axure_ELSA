from flask import Flask
from routes.config import config_bp
from routes.chat import chat_bp

def register_routes(app):
    app.register_blueprint(config_bp)
    app.register_blueprint(chat_bp)