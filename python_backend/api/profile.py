from flask import Blueprint, request, jsonify, session
from datetime import datetime
from python_backend.models.db import db
from python_backend.models.models import User, Profile
from python_backend.utils.auth import login_required

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('', methods=['GET'])
@login_required
def get_profile():
    """Get user's profile"""
    user_id = session.get('user_id')
    
    # Get the user profile
    profile = Profile.query.filter_by(user_id=user_id).first()
    
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    
    # Get the user to combine data
    user = User.query.get(user_id)
    
    # Combine user and profile data
    user_data = user.to_dict()
    profile_data = profile.to_dict()
    
    # Update last active time
    profile.last_active = datetime.utcnow()
    db.session.commit()
    
    return jsonify({**user_data, **profile_data}), 200

@profile_bp.route('', methods=['PUT', 'PATCH'])
@login_required
def update_profile():
    """Update user's profile"""
    user_id = session.get('user_id')
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Get the profile
    profile = Profile.query.filter_by(user_id=user_id).first()
    
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    
    # Get the user for updating user-specific fields
    user = User.query.get(user_id)
    
    # Fields that can be updated on the user model
    user_updatable_fields = [
        'first_name', 'last_name', 'phone_number', 'gender', 'interested_in'
    ]
    
    # Fields that can be updated on the profile model
    profile_updatable_fields = [
        'bio', 'country', 'state', 'city', 'vicinity', 'coordinates', 
        'profession', 'interests', 'photos'
    ]
    
    # Update user fields
    for field in user_updatable_fields:
        if field in data:
            setattr(user, field, data[field])
    
    # Update profile fields
    for field in profile_updatable_fields:
        if field in data:
            setattr(profile, field, data[field])
    
    # Update last active time
    profile.last_active = datetime.utcnow()
    
    try:
        db.session.commit()
        
        # Get updated data
        user_data = user.to_dict()
        profile_data = profile.to_dict()
        
        return jsonify({**user_data, **profile_data}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update profile", "details": str(e)}), 500