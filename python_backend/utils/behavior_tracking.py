from datetime import datetime, timedelta
from python_backend.models.db import db
from python_backend.models.models import UserBehavior, ProfileView

def track_user_behavior(user_id, action_type, target_id=None, data=None):
    """
    Track user behavior for the recommendation engine
    
    Args:
        user_id: ID of the user performing the action
        action_type: Type of action (view_profile, send_message, login, etc.)
        target_id: Optional target user ID (for profile views, messages, etc.)
        data: Optional additional data for the action
    
    Returns:
        The created UserBehavior object
    """
    # Create behavior record
    behavior = UserBehavior(
        user_id=user_id,
        action_type=action_type,
        target_id=target_id,
        data=data,
        created_at=datetime.utcnow()
    )
    
    db.session.add(behavior)
    
    try:
        db.session.commit()
        return behavior
    except Exception as e:
        db.session.rollback()
        print(f"Error tracking user behavior: {e}")
        return None

def track_profile_view(viewer_id, viewed_id):
    """
    Track a profile view and update ProfileView record
    
    Args:
        viewer_id: ID of the user viewing the profile
        viewed_id: ID of the user whose profile is being viewed
    
    Returns:
        The updated ProfileView object
    """
    # Don't track self-views
    if viewer_id == viewed_id:
        return None
    
    # Find existing profile view or create new one
    profile_view = ProfileView.query.filter_by(
        viewer_id=viewer_id,
        viewed_id=viewed_id
    ).first()
    
    if profile_view:
        # Update existing record
        profile_view.view_count += 1
        profile_view.last_viewed_at = datetime.utcnow()
    else:
        # Create new record
        profile_view = ProfileView(
            viewer_id=viewer_id,
            viewed_id=viewed_id,
            view_count=1,
            last_viewed_at=datetime.utcnow()
        )
        db.session.add(profile_view)
    
    # Also log this as a general behavior
    track_user_behavior(
        user_id=viewer_id,
        action_type='view_profile',
        target_id=viewed_id,
        data={'count': profile_view.view_count if profile_view else 1}
    )
    
    try:
        db.session.commit()
        return profile_view
    except Exception as e:
        db.session.rollback()
        print(f"Error tracking profile view: {e}")
        return None

def get_frequent_profile_views(user_id, limit=10):
    """
    Get profiles that the user views frequently
    
    Args:
        user_id: The user to get frequent views for
        limit: Maximum number of results
    
    Returns:
        List of ProfileView objects
    """
    return ProfileView.query.filter_by(viewer_id=user_id).order_by(
        ProfileView.view_count.desc(),
        ProfileView.last_viewed_at.desc()
    ).limit(limit).all()

def get_profile_viewers(user_id, limit=10):
    """
    Get users who frequently view this user's profile
    
    Args:
        user_id: The user whose profile is being viewed
        limit: Maximum number of results
    
    Returns:
        List of ProfileView objects
    """
    return ProfileView.query.filter_by(viewed_id=user_id).order_by(
        ProfileView.view_count.desc(),
        ProfileView.last_viewed_at.desc()
    ).limit(limit).all()

def get_user_behavior_stats(user_id, action_type=None, days=30):
    """
    Get statistics about a user's behavior
    
    Args:
        user_id: The user to get stats for
        action_type: Optional filter by action type
        days: Number of days to look back
    
    Returns:
        Dictionary of behavior statistics
    """
    since_date = datetime.utcnow() - timedelta(days=days)
    
    # Base query
    query = UserBehavior.query.filter(
        UserBehavior.user_id == user_id,
        UserBehavior.created_at >= since_date
    )
    
    # Filter by action type if specified
    if action_type:
        query = query.filter(UserBehavior.action_type == action_type)
    
    # Get all matching behaviors
    behaviors = query.all()
    
    # Calculate statistics
    stats = {
        'total_actions': len(behaviors),
        'action_counts': {},
        'target_counts': {},
        'recent_actions': []
    }
    
    for behavior in behaviors:
        # Count by action type
        action = behavior.action_type
        stats['action_counts'][action] = stats['action_counts'].get(action, 0) + 1
        
        # Count by target (if applicable)
        if behavior.target_id:
            target = behavior.target_id
            if target not in stats['target_counts']:
                stats['target_counts'][target] = {
                    'count': 0,
                    'actions': {}
                }
            stats['target_counts'][target]['count'] += 1
            
            # Count by action for each target
            action_key = behavior.action_type
            stats['target_counts'][target]['actions'][action_key] = stats['target_counts'][target]['actions'].get(action_key, 0) + 1
        
        # Add to recent actions (limit to 10)
        if len(stats['recent_actions']) < 10:
            stats['recent_actions'].append({
                'action': behavior.action_type,
                'target_id': behavior.target_id,
                'data': behavior.data,
                'timestamp': behavior.created_at.isoformat()
            })
    
    return stats