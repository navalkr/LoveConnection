from flask import Blueprint, request, jsonify, session
from datetime import datetime, timedelta
from python_backend.models.db import db
from python_backend.models.models import User, Profile
from python_backend.utils.auth import hash_password, verify_password, generate_token, is_valid_email
from python_backend.utils.email_service import send_verification_email
from python_backend.utils.helpers import calculate_age

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'password', 'email', 'first_name', 'date_of_birth', 'gender', 'interested_in']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Validate email
    if not is_valid_email(data['email']):
        return jsonify({"error": "Invalid email format"}), 400
    
    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400
    
    # Check if phone number already exists (if provided)
    if 'phone_number' in data and data['phone_number'] and User.query.filter_by(phone_number=data['phone_number']).first():
        return jsonify({"error": "Phone number already exists"}), 400
    
    # Create verification token (expires in 24 hours)
    verification_token = generate_token()
    verification_token_expiry = datetime.utcnow() + timedelta(hours=24)
    
    # Hash the password
    hashed_password = hash_password(data['password'])
    
    # Create the user
    user = User(
        username=data['username'],
        password=hashed_password,
        email=data['email'],
        phone_number=data.get('phone_number'),
        first_name=data['first_name'],
        last_name=data.get('last_name'),
        date_of_birth=data['date_of_birth'],
        gender=data['gender'],
        interested_in=data['interested_in'],
        is_verified=False,
        verification_token=verification_token,
        verification_token_expiry=verification_token_expiry,
        created_at=datetime.utcnow()
    )
    
    # Create empty profile
    profile = Profile(
        user=user,
        bio=data.get('bio', ''),
        country=data.get('country'),
        state=data.get('state'),
        city=data.get('city'),
        vicinity=data.get('vicinity'),
        coordinates=data.get('coordinates'),
        profession=data.get('profession', ''),
        last_active=datetime.utcnow(),
        interests=data.get('interests', []),
        photos=data.get('photos', [])
    )
    
    # Save to database
    db.session.add(user)
    db.session.add(profile)
    
    try:
        db.session.commit()
        
        # Send verification email
        email_sent = send_verification_email(
            user.email,
            user.first_name,
            verification_token
        )
        
        # Log the user in
        session['user_id'] = user.id
        
        # Return user data with verification email status
        user_data = user.to_dict()
        user_data['verificationEmailSent'] = email_sent
        
        return jsonify(user_data), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Registration failed", "details": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user"""
    data = request.get_json()
    
    # Validate required fields
    if not data.get('username') or not data.get('password'):
        return jsonify({"error": "Username and password are required"}), 400
    
    # Find the user
    user = User.query.filter_by(username=data['username']).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(data['password'], user.password):
        return jsonify({"error": "Invalid username or password"}), 401
    
    # Check if user is verified
    if not user.is_verified:
        return jsonify({
            "error": "Account not verified",
            "message": "Please check your email for verification instructions.",
            "verification_required": True
        }), 401
    
    # Login the user
    session['user_id'] = user.id
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout a user"""
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get currently logged in user"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    user = User.query.get(user_id)
    if not user:
        session.clear()  # Clear invalid session
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    data = request.get_json()
    
    # Validate email
    if not data.get('email') or not is_valid_email(data['email']):
        return jsonify({"error": "Valid email is required"}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        # Don't reveal that the email doesn't exist for security reasons
        return jsonify({
            "message": "If your email is registered, you will receive password reset instructions."
        }), 200
    
    # Generate reset token (expires in 1 hour)
    reset_token = generate_token()
    user.verification_token = reset_token
    user.verification_token_expiry = datetime.utcnow() + timedelta(hours=1)
    
    try:
        db.session.commit()
        
        # TODO: Send password reset email
        # This would be implemented similar to the verification email
        
        return jsonify({
            "message": "Password reset instructions sent to your email"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to process request", "details": str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token"""
    data = request.get_json()
    
    # Validate required fields
    if not data.get('token') or not data.get('password'):
        return jsonify({"error": "Token and new password are required"}), 400
    
    # Find user by reset token
    user = User.query.filter_by(verification_token=data['token']).first()
    
    # Validate token
    if not user or not user.verification_token_expiry or user.verification_token_expiry < datetime.utcnow():
        return jsonify({"error": "Invalid or expired token"}), 400
    
    # Update password
    user.password = hash_password(data['password'])
    user.verification_token = None
    user.verification_token_expiry = None
    
    try:
        db.session.commit()
        return jsonify({"message": "Password reset successful"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to reset password", "details": str(e)}), 500

@auth_bp.route('/forgot-username', methods=['POST'])
def forgot_username():
    """Recover username"""
    data = request.get_json()
    
    # Validate email
    if not data.get('email') or not is_valid_email(data['email']):
        return jsonify({"error": "Valid email is required"}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        # Don't reveal that the email doesn't exist for security reasons
        return jsonify({
            "message": "If your email is registered, you will receive your username."
        }), 200
    
    # TODO: Send username recovery email
    # This would be implemented similar to the verification email
    
    return jsonify({
        "message": "Username sent to your email"
    }), 200

@auth_bp.route('/verify-face', methods=['POST'])
def verify_face():
    """Handle face verification submission"""
    data = request.get_json()
    
    # Validate token
    if not data.get('token'):
        return jsonify({"error": "Verification token is required"}), 400
    
    # Find user by verification token
    user = User.query.filter_by(verification_token=data['token']).first()
    
    # Validate token
    if not user:
        return jsonify({"error": "Invalid verification token"}), 400
    
    if not user.verification_token_expiry or user.verification_token_expiry < datetime.utcnow():
        return jsonify({"error": "Verification token has expired"}), 400
    
    # In a real application, we'd validate the face data here
    # For now, we'll just mark the user as verified
    
    # Update user
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expiry = None
    
    try:
        db.session.commit()
        
        # Log the user in
        session['user_id'] = user.id
        
        return jsonify({
            "message": "Account verified successfully",
            "user": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Verification failed", "details": str(e)}), 500

@auth_bp.route('/verification/<token>', methods=['GET'])
def get_verification_token(token):
    """Get information about a verification token"""
    # Find user by verification token
    user = User.query.filter_by(verification_token=token).first()
    
    # Validate token
    if not user:
        return jsonify({"error": "Invalid verification token"}), 400
    
    if not user.verification_token_expiry or user.verification_token_expiry < datetime.utcnow():
        return jsonify({"error": "Verification token has expired"}), 400
    
    return jsonify({
        "token": token,
        "valid": True,
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "email": user.email
        }
    }), 200