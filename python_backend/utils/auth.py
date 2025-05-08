import hashlib
import secrets
import re
from functools import wraps
from flask import session, redirect, jsonify, request
import jwt
import os
from datetime import datetime, timedelta

def hash_password(password):
    """Hash a password using SHA-256"""
    salt = secrets.token_hex(16)
    pw_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{pw_hash}:{salt}"

def verify_password(password, hashed_password):
    """Verify a password against its hash"""
    pw_hash, salt = hashed_password.split(':')
    return pw_hash == hashlib.sha256((password + salt).encode()).hexdigest()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({"error": "Not authenticated"}), 401
        return f(*args, **kwargs)
    return decorated_function

def generate_token():
    """Generate a secure random token for verification or password reset"""
    return secrets.token_urlsafe(32)

def generate_jwt_token(user_id, expiry_days=1):
    """Generate a JWT token for authorization"""
    expiry = datetime.utcnow() + timedelta(days=expiry_days)
    payload = {
        'user_id': user_id,
        'exp': expiry
    }
    token = jwt.encode(
        payload,
        os.environ.get('SECRET_KEY', 'heartlink-secret-key'),
        algorithm='HS256'
    )
    return token

def decode_jwt_token(token):
    """Decode a JWT token"""
    try:
        payload = jwt.decode(
            token,
            os.environ.get('SECRET_KEY', 'heartlink-secret-key'),
            algorithms=['HS256']
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def is_valid_email(email):
    """Check if an email is valid"""
    # Basic email validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None

def is_valid_phone(phone):
    """Check if a phone number is valid"""
    # Basic phone validation (numbers and some common separators)
    phone_pattern = r'^[\d\+\-\(\) ]{5,20}$'
    return re.match(phone_pattern, phone) is not None