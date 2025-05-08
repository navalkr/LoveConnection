from flask import Blueprint, request, jsonify, session
from models.db import db
from models.models import User, Profile
from utils.auth import login_required

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('', methods=['GET'])
@login_required
def get_profile():
    try:
        user_id = session.get('user_id')
        profile = Profile.query.filter_by(user_id=user_id).first()
        
        if not profile:
            return jsonify({"message": "Profile not found"}), 404
            
        return jsonify(profile.to_dict()), 200
        
    except Exception as e:
        print(f"Get profile error: {str(e)}")
        return jsonify({"message": "Failed to get profile"}), 500

@profile_bp.route('', methods=['PUT'])
@login_required
def update_profile():
    try:
        user_id = session.get('user_id')
        data = request.get_json()
        
        # Find profile
        profile = Profile.query.filter_by(user_id=user_id).first()
        if not profile:
            return jsonify({"message": "Profile not found"}), 404
            
        # Update fields if provided
        if 'bio' in data:
            profile.bio = data['bio']
        if 'country' in data:
            profile.country = data['country']
        if 'state' in data:
            profile.state = data['state']
        if 'city' in data:
            profile.city = data['city']
        if 'vicinity' in data:
            profile.vicinity = data['vicinity']
        if 'coordinates' in data:
            profile.coordinates = data['coordinates']
        if 'profession' in data:
            profile.profession = data['profession']
        if 'interests' in data:
            profile.interests = data['interests']
        if 'photos' in data:
            profile.photos = data['photos']
            
        db.session.commit()
        
        return jsonify(profile.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Update profile error: {str(e)}")
        return jsonify({"message": "Failed to update profile"}), 500