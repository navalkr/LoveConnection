from flask import Flask
from python_backend.api.auth import auth_bp
from python_backend.api.profile import profile_bp
from python_backend.api.discover import discover_bp
from python_backend.api.likes import likes_bp
from python_backend.api.matches import matches_bp
from python_backend.api.behavior import behavior_bp

def register_routes(app: Flask):
    """Register all API routes"""
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(discover_bp)
    app.register_blueprint(likes_bp)
    app.register_blueprint(matches_bp)
    app.register_blueprint(behavior_bp)
    
    return app