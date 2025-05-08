from flask import Blueprint, request, jsonify, session
from models.db import db
from models.models import User, Like, Match
from utils.auth import login_required
from datetime import datetime

likes_bp = Blueprint('likes', __name__, url_prefix='/api/likes')

@likes_bp.route('', methods=['POST'])
@login_required
def create_like():
    try:
        user_id = session.get('user_id')
        data = request.get_json()
        
        if not data or 'likedId' not in data:
            return jsonify({"message": "Liked user ID is required"}), 400
            
        liker_id = user_id
        liked_id = data['likedId']
        
        # Check if like already exists
        existing_like = Like.query.filter_by(liker_id=liker_id, liked_id=liked_id).first()
        if existing_like:
            return jsonify({"message": "Already liked this user"}), 400
            
        # Create the like
        new_like = Like(liker_id=liker_id, liked_id=liked_id)
        db.session.add(new_like)
        db.session.commit()
        
        # Check if the other user has already liked this user (mutual like = match)
        reverse_like = Like.query.filter_by(liker_id=liked_id, liked_id=liker_id).first()
        
        if reverse_like:
            # Create a match
            new_match = Match(user1_id=liker_id, user2_id=liked_id)
            db.session.add(new_match)
            db.session.commit()
            
            return jsonify({
                "like": new_like.to_dict(),
                "match": new_match.to_dict(),
                "isMatch": True
            }), 201
            
        return jsonify({
            "like": new_like.to_dict(),
            "isMatch": False
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Create like error: {str(e)}")
        return jsonify({"message": "Failed to create like"}), 500