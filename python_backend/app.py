import os
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from flask_session import Session
from dotenv import load_dotenv
from python_backend.models.db import db
from python_backend.api.routes import register_routes
from python_backend.utils.config import SessionConfig

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__, static_folder=None)
    
    # Configure app
    app.config.from_object(SessionConfig)
    
    # Enable CORS
    CORS(app, supports_credentials=True, origins=["http://localhost:5000", os.getenv("APP_URL")])
    
    # Initialize extensions
    db.init_app(app)
    Session(app)
    
    # Register routes
    register_routes(app)
    
    # Serve static files from the client build directory
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(os.path.join('../client/dist', path)):
            return send_from_directory('../client/dist', path)
        else:
            return send_from_directory('../client/dist', 'index.html')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        if request.path.startswith('/api/'):
            return jsonify({"error": "Resource not found"}), 404
        return send_from_directory('../client/dist', 'index.html')
    
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
    
    return app