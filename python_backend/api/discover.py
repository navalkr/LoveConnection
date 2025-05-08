from flask import Blueprint, request, jsonify, session
from models.db import db
from models.models import User, Profile, Like
from utils.auth import login_required
from sqlalchemy import and_

discover_bp = Blueprint('discover', __name__, url_prefix='/api/discover')

@discover_bp.route('', methods=['GET'])
@login_required
def get_discover_profiles():
    try:
        user_id = session.get('user_id')
        limit = request.args.get('limit', default=10, type=int)
        
        # Get current user
        current_user = User.query.get(user_id)
        if not current_user:
            return jsonify({"message": "User not found"}), 404
            
        # Get user's profile
        user_profile = Profile.query.filter_by(user_id=user_id).first()
        
        # Get users that the current user has not liked
        liked_user_ids = [like.liked_id for like in Like.query.filter_by(liker_id=user_id).all()]
        liked_user_ids.append(user_id)  # Exclude self
        
        # Query based on gender preference
        if current_user.interested_in == 'everyone':
            profiles_query = db.session.query(User, Profile).join(Profile, User.id == Profile.user_id).filter(
                and_(
                    ~User.id.in_(liked_user_ids),
                    User.is_verified == True
                )
            ).limit(limit)
        else:
            profiles_query = db.session.query(User, Profile).join(Profile, User.id == Profile.user_id).filter(
                and_(
                    ~User.id.in_(liked_user_ids),
                    User.gender == current_user.interested_in,
                    User.is_verified == True
                )
            ).limit(limit)
        
        # Format the response
        profiles = []
        for user, profile in profiles_query:
            user_dict = user.to_dict(rules=('-password', '-verification_token', '-verification_token_expiry'))
            user_dict['profile'] = profile.to_dict() if profile else None
            profiles.append(user_dict)
            
        return jsonify(profiles), 200
        
    except Exception as e:
        print(f"Discover profiles error: {str(e)}")
        return jsonify({"message": "Failed to get discovery profiles"}), 500