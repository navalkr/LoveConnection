from flask import Blueprint, jsonify, session, request
from sqlalchemy import func, and_, or_
from python_backend.models.db import db
from python_backend.models.models import User, Profile, Like
from python_backend.utils.auth import login_required
from python_backend.utils.helpers import calculate_age, calculate_distance
from python_backend.utils.matching_algorithm import get_user_recommendations

discover_bp = Blueprint('discover', __name__, url_prefix='/api/discover')

@discover_bp.route('', methods=['GET'])
@login_required
def get_discover_profiles():
    """Get profiles for discovery"""
    user_id = session.get('user_id')
    
    # Get the current user to determine preferences
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Get user's profile to determine location for distance-based matching
    user_profile = Profile.query.filter_by(user_id=user_id).first()
    if not user_profile:
        return jsonify({"error": "User profile not found"}), 404
    
    # Get query parameters for filtering
    min_age = request.args.get('minAge', 18, type=int)
    max_age = request.args.get('maxAge', 100, type=int)
    max_distance = request.args.get('maxDistance', 100, type=int)
    profession = request.args.get('profession')
    limit = request.args.get('limit', 20, type=int)
    
    # Build the base query
    # Join User and Profile
    query = db.session.query(User, Profile).join(Profile, User.id == Profile.user_id)
    
    # Filter by gender preference
    if user.interested_in != 'Both':
        query = query.filter(User.gender == user.interested_in)
    
    # Filter out users that the current user has already liked
    liked_users = db.session.query(Like.liked_id).filter(Like.liker_id == user_id).subquery()
    query = query.filter(~User.id.in_(liked_users))
    
    # Filter out the current user
    query = query.filter(User.id != user_id)
    
    # Filter by verified accounts only
    query = query.filter(User.is_verified == True)
    
    # Filter by profession if specified
    if profession:
        query = query.filter(Profile.profession.ilike(f'%{profession}%'))
    
    # Get the results
    results = query.limit(limit).all()
    
    # Process and filter results
    profiles = []
    
    for user_obj, profile in results:
        user_dict = user_obj.to_dict()
        profile_dict = profile.to_dict()
        
        # Calculate age from date of birth
        age = calculate_age(user_dict['date_of_birth'])
        
        # Skip if age doesn't match filter criteria
        if age < min_age or age > max_age:
            continue
        
        # Calculate distance if coordinates are available
        distance = None
        if user_profile.coordinates and profile.coordinates:
            try:
                user_coords = user_profile.coordinates.split(',')
                profile_coords = profile.coordinates.split(',')
                if len(user_coords) == 2 and len(profile_coords) == 2:
                    user_lat, user_lon = user_coords
                    profile_lat, profile_lon = profile_coords
                    distance = calculate_distance(user_lat, user_lon, profile_lat, profile_lon)
                    
                    # Skip if distance is greater than max_distance
                    if distance > max_distance:
                        continue
            except Exception:
                pass
        
        # Combine user and profile data
        combined_data = {**user_dict, **profile_dict, 'age': age}
        if distance is not None:
            combined_data['distance'] = distance
        
        profiles.append(combined_data)
    
    return jsonify(profiles), 200

@discover_bp.route('/recommendations', methods=['GET'])
@login_required
def get_recommendations():
    """Get personalized recommendations using advanced matching algorithm"""
    user_id = session.get('user_id')
    
    # Get query parameters
    min_score = request.args.get('minScore', 50, type=int)
    limit = request.args.get('limit', 20, type=int)
    
    # Use the advanced matching algorithm
    recommendations = get_user_recommendations(
        user_id=user_id,
        db_session=db.session,
        limit=limit,
        min_score=min_score
    )
    
    # Process recommendations
    result = []
    for rec in recommendations:
        user_data = rec['user']
        profile_data = rec['profile']
        
        # Add age
        age = calculate_age(user_data['date_of_birth'])
        
        # Create combined data object
        combined_data = {
            **user_data, 
            **profile_data,
            'age': age,
            'compatibility_score': rec['compatibility_score']
        }
        
        # Calculate distance if coordinates are available
        user_profile = Profile.query.filter_by(user_id=user_id).first()
        if user_profile and user_profile.coordinates and profile_data.get('coordinates'):
            try:
                user_coords = user_profile.coordinates.split(',')
                profile_coords = profile_data['coordinates'].split(',')
                
                if len(user_coords) == 2 and len(profile_coords) == 2:
                    user_lat, user_lon = user_coords
                    profile_lat, profile_lon = profile_coords
                    
                    distance = calculate_distance(user_lat, user_lon, profile_lat, profile_lon)
                    combined_data['distance'] = distance
            except Exception:
                pass
        
        result.append(combined_data)
    
    return jsonify(result), 200