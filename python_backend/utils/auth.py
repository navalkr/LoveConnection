from functools import wraps
from flask import session, jsonify, request
import hashlib
import os
import secrets
from datetime import datetime, timedelta

# Password hashing function
def hash_password(password):
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

# Password verification function
def verify_password(password, hashed_password):
    """Verify a password against its hash"""
    return hash_password(password) == hashed_password

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

# Token generation
def generate_token():
    """Generate a secure random token for verification or password reset"""
    return secrets.token_hex(32)

# Function to check if email has a valid format
def is_valid_email(email):
    import re
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None