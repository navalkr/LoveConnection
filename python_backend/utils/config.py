import os
from datetime import timedelta

class SessionConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'heartlink-secret-key')
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = timedelta(days=1)
    SESSION_USE_SIGNER = True
    SESSION_COOKIE_SECURE = os.environ.get('FLASK_ENV') == 'production'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///heartlink.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False