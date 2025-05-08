from flask import Blueprint, request, jsonify, session
from models.db import db
from models.models import User, Profile
from utils.auth import hash_password, verify_password, generate_token, login_required
from utils.email_service import send_verification_email
from datetime import datetime, timedelta
import json

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check for required fields
        required_fields = ['username', 'email', 'password', 'firstName', 'dateOfBirth', 'gender', 'interestedIn']
        for field in required_fields:
            if field not in data:
                return jsonify({"message": f"{field} is required"}), 400
        
        # Check if username already exists
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            return jsonify({"message": "Username already taken"}), 400
            
        # Check if email already exists
        existing_email = User.query.filter_by(email=data['email']).first()
        if existing_email:
            return jsonify({"message": "Email already registered"}), 400
            
        # Create user
        hashed_password = hash_password(data['password'])
        
        # Extract user fields from request data
        new_user = User(
            username=data['username'],
            password=hashed_password,
            email=data['email'],
            phone_number=data.get('phoneNumber'),
            first_name=data['firstName'],
            last_name=data.get('lastName'),
            date_of_birth=data['dateOfBirth'],
            gender=data['gender'],
            interested_in=data['interestedIn'],
            is_verified=False
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Create empty profile
        new_profile = Profile(
            user_id=new_user.id,
            bio="",
            country="",
            state="",
            city="",
            vicinity="",
            coordinates="",
            profession="",
            interests=[],
            photos=[]
        )
        
        db.session.add(new_profile)
        db.session.commit()
        
        # Generate verification token
        verification_token = generate_token()
        token_expiry = datetime.utcnow() + timedelta(hours=24)
        
        # Store verification token
        new_user.verification_token = verification_token
        new_user.verification_token_expiry = token_expiry
        db.session.commit()
        
        # Send verification email
        email_sent = send_verification_email(new_user.email, new_user.first_name, verification_token)
        
        # Set up session
        session['user_id'] = new_user.id
        session['is_authenticated'] = True
        
        # Return user without password
        user_dict = new_user.to_dict(rules=('-password',))
        user_dict['verificationEmailSent'] = email_sent
        
        return jsonify(user_dict), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        return jsonify({"message": "Failed to register user"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"message": "Username and password are required"}), 400
            
        # Find user
        user = User.query.filter_by(username=data['username']).first()
        if not user:
            return jsonify({"message": "Invalid username or password"}), 401
            
        # Verify password
        if not verify_password(data['password'], user.password):
            return jsonify({"message": "Invalid username or password"}), 401
            
        # Check if user is verified
        if not user.is_verified:
            # If not verified, resend verification email
            verification_token = generate_token()
            token_expiry = datetime.utcnow() + timedelta(hours=24)
            
            # Store verification token
            user.verification_token = verification_token
            user.verification_token_expiry = token_expiry
            db.session.commit()
            
            # Send verification email
            send_verification_email(user.email, user.first_name, verification_token)
            
            return jsonify({
                "message": "Account not verified",
                "verified": False,
                "email": user.email
            }), 403
            
        # Set up session
        session['user_id'] = user.id
        session['is_authenticated'] = True
        
        # Update last active on profile
        profile = Profile.query.filter_by(user_id=user.id).first()
        if profile:
            profile.last_active = datetime.utcnow()
            db.session.commit()
            
        # Return user without password
        return jsonify(user.to_dict(rules=('-password',))), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"message": "Failed to login"}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"message": "Not authenticated"}), 401
            
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
            
        # Return user without password
        return jsonify(user.to_dict(rules=('-password',))), 200
        
    except Exception as e:
        print(f"Get current user error: {str(e)}")
        return jsonify({"message": "Failed to get current user"}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        
        if not data or ('email' not in data and 'phoneNumber' not in data):
            return jsonify({"message": "Email or phone number is required"}), 400
            
        # Generate reset token with 1 hour expiry
        token = generate_token()
        expiry = datetime.utcnow() + timedelta(hours=1)
        
        if 'email' in data:
            # Check if user exists with this email
            user = User.query.filter_by(email=data['email']).first()
            if not user:
                # For security reasons, don't reveal if the email exists or not
                return jsonify({
                    "message": "If the email is registered, a password reset link will be sent"
                }), 200
                
            # Store token for email
            user.reset_token = token
            user.reset_token_expiry = expiry
            db.session.commit()
            
            # In a real application, send an email with the reset token link
            print(f"Reset token for {data['email']}: {token}")
            
            return jsonify({
                "message": "If the email is registered, a password reset link will be sent",
                # For demo purposes, return the token (in production, this would be sent via email)
                "token": token
            }), 200
            
        elif 'phoneNumber' in data:
            # Similar logic for phone number
            user = User.query.filter_by(phone_number=data['phoneNumber']).first()
            if not user:
                return jsonify({
                    "message": "If the phone number is registered, a password reset code will be sent via SMS"
                }), 200
                
            # Store token for phone number
            user.reset_token = token
            user.reset_token_expiry = expiry
            db.session.commit()
            
            # In a real application, send an SMS with the reset token
            print(f"Reset token for {data['phoneNumber']}: {token}")
            
            return jsonify({
                "message": "If the phone number is registered, a password reset code will be sent via SMS",
                # For demo purposes, return the token
                "token": token
            }), 200
            
    except Exception as e:
        print(f"Forgot password error: {str(e)}")
        return jsonify({"message": "Failed to process request"}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        
        if not data or 'token' not in data or 'newPassword' not in data:
            return jsonify({"message": "Token and new password are required"}), 400
            
        # Find user by reset token
        user = User.query.filter_by(reset_token=data['token']).first()
        if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
            return jsonify({"message": "Invalid or expired token"}), 400
            
        # Update password
        user.password = hash_password(data['newPassword'])
        user.reset_token = None
        user.reset_token_expiry = None
        db.session.commit()
        
        return jsonify({"message": "Password has been reset successfully"}), 200
        
    except Exception as e:
        print(f"Reset password error: {str(e)}")
        return jsonify({"message": "Failed to reset password"}), 500

@auth_bp.route('/forgot-username', methods=['POST'])
def forgot_username():
    try:
        data = request.get_json()
        
        if not data or ('email' not in data and 'phoneNumber' not in data):
            return jsonify({"message": "Email or phone number is required"}), 400
            
        if 'email' in data:
            user = User.query.filter_by(email=data['email']).first()
            if not user:
                # For security reasons, don't reveal if the email exists or not
                return jsonify({
                    "message": "If the email is registered, the username will be sent"
                }), 200
                
            # In a real application, send an email with the username
            print(f"Username for {data['email']}: {user.username}")
            
            return jsonify({
                "message": "If the email is registered, the username will be sent to your email",
                # For demo purposes, return the username
                "username": user.username
            }), 200
            
        elif 'phoneNumber' in data:
            user = User.query.filter_by(phone_number=data['phoneNumber']).first()
            if not user:
                return jsonify({
                    "message": "If the phone number is registered, the username will be sent via SMS"
                }), 200
                
            # In a real application, send an SMS with the username
            print(f"Username for {data['phoneNumber']}: {user.username}")
            
            return jsonify({
                "message": "If the phone number is registered, the username will be sent via SMS",
                # For demo purposes, return the username
                "username": user.username
            }), 200
            
    except Exception as e:
        print(f"Forgot username error: {str(e)}")
        return jsonify({"message": "Failed to process request"}), 500

@auth_bp.route('/verify-face', methods=['POST'])
def verify_face():
    try:
        data = request.get_json()
        
        if not data or 'token' not in data:
            return jsonify({"message": "Verification token is required"}), 400
            
        # Find user by verification token
        user = User.query.filter_by(verification_token=data['token']).first()
        if not user or not user.verification_token_expiry or user.verification_token_expiry < datetime.utcnow():
            return jsonify({"message": "Invalid or expired verification token"}), 400
            
        # Set user as verified
        user.is_verified = True
        user.verification_token = None
        user.verification_token_expiry = None
        db.session.commit()
        
        # Log the user in automatically
        session['user_id'] = user.id
        session['is_authenticated'] = True
        
        # Return verified user (without password)
        return jsonify({
            "message": "Face verification successful",
            "user": user.to_dict(rules=('-password',))
        }), 200
        
    except Exception as e:
        print(f"Face verification error: {str(e)}")
        return jsonify({"message": "Failed to process verification"}), 500

@auth_bp.route('/verification/<token>', methods=['GET'])
def get_verification_token(token):
    try:
        # Find user by verification token
        user = User.query.filter_by(verification_token=token).first()
        
        if not user or not user.verification_token_expiry or user.verification_token_expiry < datetime.utcnow():
            return jsonify({
                "valid": False,
                "message": "Invalid or expired verification token"
            }), 400
            
        return jsonify({
            "valid": True,
            "userId": user.id,
            "firstName": user.first_name,
            "isVerified": user.is_verified
        }), 200
        
    except Exception as e:
        print(f"Verification token check error: {str(e)}")
        return jsonify({
            "valid": False,
            "message": "Failed to check verification token"
        }), 500