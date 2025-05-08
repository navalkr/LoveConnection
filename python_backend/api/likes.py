from flask import Blueprint, jsonify, session, request
from datetime import datetime
from python_backend.models.db import db
from python_backend.models.models import User, Like, Match
from python_backend.utils.auth import login_required

likes_bp = Blueprint('likes', __name__, url_prefix='/api/likes')

@likes_bp.route('', methods=['POST'])
@login_required
def create_like():
    """Create a new like"""
    user_id = session.get('user_id')
    data = request.get_json()
    
    if not data or 'liked_id' not in data:
        return jsonify({"error": "Liked user ID is required"}), 400
    
    liked_id = data['liked_id']
    
    # Ensure the liked user exists
    liked_user = User.query.get(liked_id)
    if not liked_user:
        return jsonify({"error": "Liked user not found"}), 404
    
    # Check if this like already exists
    existing_like = Like.query.filter_by(
        liker_id=user_id,
        liked_id=liked_id
    ).first()
    
    if existing_like:
        return jsonify({"error": "Already liked this user"}), 400
    
    # Create the like
    like = Like(
        liker_id=user_id,
        liked_id=liked_id,
        created_at=datetime.utcnow()
    )
    
    db.session.add(like)
    
    # Check if there's a mutual like (the other person already liked the current user)
    mutual_like = Like.query.filter_by(
        liker_id=liked_id,
        liked_id=user_id
    ).first()
    
    # If mutual like exists, create a match
    match = None
    if mutual_like:
        # Check if match already exists
        existing_match = Match.query.filter(
            ((Match.user1_id == user_id) & (Match.user2_id == liked_id)) |
            ((Match.user1_id == liked_id) & (Match.user2_id == user_id))
        ).first()
        
        if not existing_match:
            match = Match(
                user1_id=user_id,
                user2_id=liked_id,
                matched_at=datetime.utcnow()
            )
            db.session.add(match)
    
    try:
        db.session.commit()
        
        response = {"liked": True, "user_id": liked_id}
        
        if match:
            response["matched"] = True
            response["match_id"] = match.id
        else:
            response["matched"] = False
        
        return jsonify(response), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create like", "details": str(e)}), 500