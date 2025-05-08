import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_session import Session
from dotenv import load_dotenv
from models.db import db
from utils.config import SessionConfig
from api.routes import register_routes

# Load environment variables
load_dotenv()

def create_app():
    # Initialize Flask application
    app = Flask(__name__, 
                static_folder='../client/dist',
                template_folder='../client/dist')
    
    # Configure application
    app.config.from_object(SessionConfig)
    
    # Setup CORS
    CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])
    
    # Initialize database
    db.init_app(app)
    
    # Initialize session
    Session(app)
    
    # Register routes
    register_routes(app)
    
    # Serve React app for any other routes
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(app.static_folder + '/' + path):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')
    
    # Error handler for 404
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"message": "Route not found"}), 404
    
    # Error handler for 500
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"message": "Internal server error"}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)