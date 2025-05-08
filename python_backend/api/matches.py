from flask import Blueprint, request, jsonify, session
from models.db import db
from models.models import User, Match, Message, Profile
from utils.auth import login_required
from sqlalchemy import or_, and_

matches_bp = Blueprint('matches', __name__, url_prefix='/api/matches')

@matches_bp.route('', methods=['GET'])
@login_required
def get_matches():
    try:
        user_id = session.get('user_id')
        
        # Get matches where the user is involved
        matches = Match.query.filter(
            or_(
                Match.user1_id == user_id,
                Match.user2_id == user_id
            )
        ).all()
        
        # Format the response with additional data
        results = []
        for match in matches:
            # Determine the other user in the match
            other_user_id = match.user2_id if match.user1_id == user_id else match.user1_id
            other_user = User.query.get(other_user_id)
            other_profile = Profile.query.filter_by(user_id=other_user_id).first()
            
            # Get last message for match
            messages = Message.query.filter_by(match_id=match.id).order_by(Message.sent_at.desc()).all()
            last_message = messages[0].to_dict() if messages else None
            
            # Count unread messages
            unread_count = Message.query.filter_by(
                match_id=match.id,
                receiver_id=user_id,
                is_read=False
            ).count()
            
            # Create the response object
            match_data = match.to_dict()
            match_data['otherUser'] = {
                'id': other_user.id,
                'username': other_user.username,
                'firstName': other_user.first_name,
                'lastName': other_user.last_name
            } if other_user else None
            
            match_data['otherProfile'] = other_profile.to_dict() if other_profile else None
            match_data['lastMessage'] = last_message
            match_data['unreadCount'] = unread_count
            
            results.append(match_data)
            
        return jsonify(results), 200
        
    except Exception as e:
        print(f"Get matches error: {str(e)}")
        return jsonify({"message": "Failed to get matches"}), 500

@matches_bp.route('/<int:match_id>/messages', methods=['GET'])
@login_required
def get_messages(match_id):
    try:
        user_id = session.get('user_id')
        
        # Verify the match exists and user is part of it
        match = Match.query.get(match_id)
        if not match:
            return jsonify({"message": "Match not found"}), 404
            
        if match.user1_id != user_id and match.user2_id != user_id:
            return jsonify({"message": "Not authorized to view these messages"}), 403
            
        # Get messages for this match
        messages = Message.query.filter_by(match_id=match_id).order_by(Message.sent_at).all()
        
        # Mark messages as read
        unread_messages = Message.query.filter_by(
            match_id=match_id,
            receiver_id=user_id,
            is_read=False
        ).all()
        
        for message in unread_messages:
            message.is_read = True
            
        db.session.commit()
        
        return jsonify([message.to_dict() for message in messages]), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Get messages error: {str(e)}")
        return jsonify({"message": "Failed to get messages"}), 500

@matches_bp.route('/<int:match_id>/messages', methods=['POST'])
@login_required
def create_message(match_id):
    try:
        user_id = session.get('user_id')
        data = request.get_json()
        
        if not data or 'content' not in data:
            return jsonify({"message": "Message content is required"}), 400
            
        # Verify the match exists and user is part of it
        match = Match.query.get(match_id)
        if not match:
            return jsonify({"message": "Match not found"}), 404
            
        if match.user1_id != user_id and match.user2_id != user_id:
            return jsonify({"message": "Not authorized to send messages in this match"}), 403
            
        # Determine receiver
        receiver_id = match.user2_id if match.user1_id == user_id else match.user1_id
        
        # Create message
        new_message = Message(
            match_id=match_id,
            sender_id=user_id,
            receiver_id=receiver_id,
            content=data['content']
        )
        
        db.session.add(new_message)
        db.session.commit()
        
        return jsonify(new_message.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Create message error: {str(e)}")
        return jsonify({"message": "Failed to send message"}), 500