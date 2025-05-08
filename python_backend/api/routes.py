from flask import Flask
from api.auth import auth_bp
from api.profile import profile_bp
from api.discover import discover_bp
from api.likes import likes_bp
from api.matches import matches_bp

def register_routes(app: Flask):
    """Register all API routes"""
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(discover_bp)
    app.register_blueprint(likes_bp)
    app.register_blueprint(matches_bp)
    
    return app