from flask import Blueprint, jsonify, session, request
from sqlalchemy import or_, and_
from datetime import datetime
from python_backend.models.db import db
from python_backend.models.models import User, Profile, Match, Message
from python_backend.utils.auth import login_required

matches_bp = Blueprint('matches', __name__, url_prefix='/api/matches')

@matches_bp.route('', methods=['GET'])
@login_required
def get_matches():
    """Get all matches for the current user"""
    user_id = session.get('user_id')
    
    # Find all matches where the current user is involved
    matches = Match.query.filter(
        or_(
            Match.user1_id == user_id,
            Match.user2_id == user_id
        )
    ).order_by(Match.matched_at.desc()).all()
    
    match_list = []
    
    for match in matches:
        # Determine the other user in the match
        other_user_id = match.user2_id if match.user1_id == user_id else match.user1_id
        
        # Get the other user's information
        other_user = User.query.get(other_user_id)
        profile = Profile.query.filter_by(user_id=other_user_id).first()
        
        if not other_user or not profile:
            continue
        
        # Get the last message in this match
        last_message = Message.query.filter_by(match_id=match.id).order_by(Message.sent_at.desc()).first()
        
        # Count unread messages
        unread_count = Message.query.filter_by(
            match_id=match.id,
            receiver_id=user_id,
            is_read=False
        ).count()
        
        # Create match data
        match_data = {
            'id': match.id,
            'matched_at': match.matched_at.isoformat(),
            'user': {
                'id': other_user.id,
                'username': other_user.username,
                'first_name': other_user.first_name,
                'last_name': other_user.last_name,
                'photos': profile.photos,
                'profession': profile.profession,
                'last_active': profile.last_active.isoformat() if profile.last_active else None
            },
            'last_message': None,
            'unread_count': unread_count
        }
        
        # Add last message if exists
        if last_message:
            match_data['last_message'] = {
                'id': last_message.id,
                'content': last_message.content,
                'sent_at': last_message.sent_at.isoformat(),
                'is_read': last_message.is_read,
                'sender_id': last_message.sender_id
            }
        
        match_list.append(match_data)
    
    return jsonify(match_list), 200

@matches_bp.route('/<int:match_id>/messages', methods=['GET'])
@login_required
def get_messages(match_id):
    """Get messages for a match"""
    user_id = session.get('user_id')
    
    # Ensure the match exists and the user is part of it
    match = Match.query.filter(
        and_(
            Match.id == match_id,
            or_(
                Match.user1_id == user_id,
                Match.user2_id == user_id
            )
        )
    ).first()
    
    if not match:
        return jsonify({"error": "Match not found"}), 404
    
    # Get query parameters
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    
    # Calculate offset
    offset = (page - 1) * limit
    
    # Get messages
    messages = Message.query.filter_by(match_id=match_id).order_by(Message.sent_at.desc()).offset(offset).limit(limit).all()
    
    # Mark all unread messages as read
    unread_messages = Message.query.filter_by(
        match_id=match_id,
        receiver_id=user_id,
        is_read=False
    ).all()
    
    for msg in unread_messages:
        msg.is_read = True
    
    db.session.commit()
    
    # Format messages
    message_list = []
    for message in messages:
        message_list.append({
            'id': message.id,
            'match_id': message.match_id,
            'sender_id': message.sender_id,
            'receiver_id': message.receiver_id,
            'content': message.content,
            'sent_at': message.sent_at.isoformat(),
            'is_read': message.is_read
        })
    
    return jsonify(message_list), 200

@matches_bp.route('/<int:match_id>/messages', methods=['POST'])
@login_required
def create_message(match_id):
    """Create a new message in a match"""
    user_id = session.get('user_id')
    data = request.get_json()
    
    if not data or 'content' not in data:
        return jsonify({"error": "Message content is required"}), 400
    
    # Ensure the match exists and the user is part of it
    match = Match.query.filter(
        and_(
            Match.id == match_id,
            or_(
                Match.user1_id == user_id,
                Match.user2_id == user_id
            )
        )
    ).first()
    
    if not match:
        return jsonify({"error": "Match not found"}), 404
    
    # Determine the receiver
    receiver_id = match.user2_id if match.user1_id == user_id else match.user1_id
    
    # Create the message
    message = Message(
        match_id=match_id,
        sender_id=user_id,
        receiver_id=receiver_id,
        content=data['content'],
        sent_at=datetime.utcnow(),
        is_read=False
    )
    
    db.session.add(message)
    
    try:
        db.session.commit()
        
        return jsonify({
            'id': message.id,
            'match_id': message.match_id,
            'sender_id': message.sender_id,
            'receiver_id': message.receiver_id,
            'content': message.content,
            'sent_at': message.sent_at.isoformat(),
            'is_read': message.is_read
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to send message", "details": str(e)}), 500