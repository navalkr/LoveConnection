from flask import Blueprint, jsonify, session, request
from python_backend.utils.auth import login_required
from python_backend.utils.behavior_tracking import (
    track_user_behavior, 
    track_profile_view, 
    get_user_behavior_stats
)

behavior_bp = Blueprint('behavior', __name__, url_prefix='/api/behavior')

@behavior_bp.route('/track', methods=['POST'])
@login_required
def track_behavior():
    """Track user behavior for recommendations"""
    user_id = session.get('user_id')
    data = request.get_json()
    
    if not data or 'action_type' not in data:
        return jsonify({"error": "Action type is required"}), 400
    
    action_type = data.get('action_type')
    target_id = data.get('target_id')
    additional_data = data.get('data')
    
    # Track the behavior
    behavior = track_user_behavior(
        user_id=user_id,
        action_type=action_type,
        target_id=target_id,
        data=additional_data
    )
    
    if not behavior:
        return jsonify({"error": "Failed to track behavior"}), 500
    
    # Special handling for profile views
    if action_type == 'view_profile' and target_id:
        track_profile_view(user_id, target_id)
    
    return jsonify({"success": True, "action": action_type}), 200

@behavior_bp.route('/profile-view/<int:profile_id>', methods=['POST'])
@login_required
def track_view(profile_id):
    """Shortcut for tracking profile views"""
    user_id = session.get('user_id')
    
    # Don't track self-views
    if user_id == profile_id:
        return jsonify({"success": False, "message": "Cannot track self-views"}), 400
    
    # Track the profile view
    profile_view = track_profile_view(user_id, profile_id)
    
    if not profile_view:
        return jsonify({"error": "Failed to track profile view"}), 500
    
    return jsonify({
        "success": True, 
        "view_count": profile_view.view_count
    }), 200

@behavior_bp.route('/stats', methods=['GET'])
@login_required
def get_behavior_stats():
    """Get behavioral statistics for the current user"""
    user_id = session.get('user_id')
    
    # Get query parameters
    action_type = request.args.get('action_type')
    days = request.args.get('days', 30, type=int)
    
    # Get statistics
    stats = get_user_behavior_stats(
        user_id=user_id,
        action_type=action_type,
        days=days
    )
    
    return jsonify(stats), 200