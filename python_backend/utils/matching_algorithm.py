import math
from datetime import datetime, timedelta
from python_backend.utils.helpers import calculate_age, calculate_distance
from python_backend.models.models import User, Profile, Like

class MatchScore:
    """Class to calculate compatibility scores between users"""
    
    # Weights for different matching factors (adjust these as needed)
    WEIGHTS = {
        'age_compatibility': 0.15,
        'location_proximity': 0.25,
        'interests_overlap': 0.30,
        'activity_level': 0.10,
        'profession_compatibility': 0.10,
        'behavioral_patterns': 0.10
    }
    
    def __init__(self, user, user_profile, target_user, target_profile):
        """Initialize with two users to compare"""
        self.user = user
        self.user_profile = user_profile
        self.target_user = target_user
        self.target_profile = target_profile
        
        # Calculate the user ages
        self.user_age = calculate_age(user.date_of_birth)
        self.target_age = calculate_age(target_user.date_of_birth)
    
    def calculate_total_score(self):
        """Calculate total compatibility score (0-100)"""
        score = 0
        
        # Age compatibility (how well their ages match)
        age_score = self.calculate_age_compatibility()
        
        # Location proximity (closer is better)
        location_score = self.calculate_location_proximity()
        
        # Interests overlap (shared interests)
        interests_score = self.calculate_interests_overlap()
        
        # Activity level (recent activity)
        activity_score = self.calculate_activity_level()
        
        # Profession compatibility
        profession_score = self.calculate_profession_compatibility()
        
        # Behavioral patterns and preferences
        behavioral_score = self.calculate_behavioral_patterns()
        
        # Calculate weighted score
        score += self.WEIGHTS['age_compatibility'] * age_score
        score += self.WEIGHTS['location_proximity'] * location_score
        score += self.WEIGHTS['interests_overlap'] * interests_score
        score += self.WEIGHTS['activity_level'] * activity_score
        score += self.WEIGHTS['profession_compatibility'] * profession_score
        score += self.WEIGHTS['behavioral_patterns'] * behavioral_score
        
        # Return as a percentage
        return min(round(score * 100), 100)
    
    def calculate_age_compatibility(self):
        """Calculate age compatibility score (0-1)"""
        # If ages are exactly the same, that's a 100% match
        if self.user_age == self.target_age:
            return 1.0
            
        # Calculate age difference percent (up to 20 years difference)
        age_diff = abs(self.user_age - self.target_age)
        
        # Age difference penalty (more difference = lower score)
        # Using an exponential decay function for a smoother curve
        return math.exp(-0.15 * age_diff)
    
    def calculate_location_proximity(self):
        """Calculate location proximity score (0-1)"""
        # If either user doesn't have coordinates, return a neutral score
        if not self.user_profile.coordinates or not self.target_profile.coordinates:
            # If they're in the same city, still give a good score
            if (self.user_profile.city and self.target_profile.city and 
                self.user_profile.city.lower() == self.target_profile.city.lower()):
                return 0.80
            # If same state/province, give a decent score
            elif (self.user_profile.state and self.target_profile.state and 
                  self.user_profile.state.lower() == self.target_profile.state.lower()):
                return 0.60
            # If same country, give a moderate score
            elif (self.user_profile.country and self.target_profile.country and 
                  self.user_profile.country.lower() == self.target_profile.country.lower()):
                return 0.40
            else:
                return 0.20
        
        # Calculate distance
        try:
            user_coords = self.user_profile.coordinates.split(',')
            target_coords = self.target_profile.coordinates.split(',')
            
            if len(user_coords) == 2 and len(target_coords) == 2:
                user_lat, user_lon = user_coords
                target_lat, target_lon = target_coords
                
                distance = calculate_distance(user_lat, user_lon, target_lat, target_lon)
                
                # Convert distance to a score (closer = higher score)
                # Score decreases linearly up to 100 km, then more slowly
                if distance <= 5:  # Very close (same neighborhood)
                    return 1.0
                elif distance <= 20:  # Same city
                    return 0.8 - 0.03 * (distance - 5)
                elif distance <= 100:  # Nearby cities
                    return 0.5 - 0.003 * (distance - 20)
                else:  # Far away
                    return max(0.2, 0.3 - 0.001 * (distance - 100))
        except Exception:
            return 0.5  # Default to neutral if calculation fails
            
        return 0.5  # Default
    
    def calculate_interests_overlap(self):
        """Calculate shared interests score (0-1)"""
        user_interests = set(self.user_profile.interests or [])
        target_interests = set(self.target_profile.interests or [])
        
        # If both users have no interests listed, give a neutral score
        if not user_interests and not target_interests:
            return 0.5
        
        # If one user has interests and the other doesn't, give a low score
        if not user_interests or not target_interests:
            return 0.3
        
        # Calculate Jaccard similarity (intersection over union)
        intersection = len(user_interests.intersection(target_interests))
        union = len(user_interests.union(target_interests))
        
        # Weighted to give higher scores for having some shared interests
        if intersection == 0:
            return 0.2  # No shared interests
        elif intersection >= 3:
            return min(0.7 + (intersection / union) * 0.3, 1.0)  # At least 3 shared interests
        else:
            return 0.5 + (intersection / union) * 0.3  # 1-2 shared interests
    
    def calculate_activity_level(self):
        """Calculate activity level score (0-1)"""
        # If no last_active timestamp, return a neutral score
        if not self.target_profile.last_active:
            return 0.5
        
        # Calculate how recently the user was active
        now = datetime.utcnow()
        elapsed = now - self.target_profile.last_active
        
        # Score based on recency of activity
        if elapsed < timedelta(hours=1):  # Very recent
            return 1.0
        elif elapsed < timedelta(hours=24):  # Within a day
            return 0.9
        elif elapsed < timedelta(days=7):  # Within a week
            return 0.7
        elif elapsed < timedelta(days=30):  # Within a month
            return 0.5
        else:
            return 0.3  # Not active for a long time
    
    def calculate_profession_compatibility(self):
        """Calculate profession compatibility score (0-1)"""
        # If either doesn't have a profession listed, give a neutral score
        if not self.user_profile.profession or not self.target_profile.profession:
            return 0.5
        
        # Same profession is a high match
        if self.user_profile.profession.lower() == self.target_profile.profession.lower():
            return 1.0
        
        # This could be enhanced with profession categories/relationships
        # For now, we'll do simple text similarity
        user_words = set(self.user_profile.profession.lower().split())
        target_words = set(self.target_profile.profession.lower().split())
        
        # If there's at least one common word in the professions
        if user_words.intersection(target_words):
            return 0.8
            
        # Default score if professions seem unrelated
        return 0.5
    
    def calculate_behavioral_patterns(self):
        """Calculate behavioral pattern score (0-1) based on user interactions"""
        # Get behavioral data
        profile_views = self._get_profile_view_data()
        messaging_patterns = self._get_messaging_patterns()
        activity_overlap = self._get_activity_time_overlap()
        
        # Calculate the score based on the behavioral data
        # This is a simple weighted average for now
        behavioral_score = (
            profile_views * 0.4 +
            messaging_patterns * 0.4 +
            activity_overlap * 0.2
        )
        
        return behavioral_score
    
    def _get_profile_view_data(self):
        """Calculate score based on profile viewing patterns"""
        from python_backend.models.models import ProfileView
        
        # Check if user has viewed this profile before
        profile_view = ProfileView.query.filter_by(
            viewer_id=self.user.id,
            viewed_id=self.target_user.id
        ).first()
        
        if profile_view:
            # Higher view count = higher score (cap at 5 views)
            view_count = min(profile_view.view_count, 5)
            return 0.5 + (view_count / 10)  # Score between 0.5 and 1.0
        
        # Check if target has viewed user's profile (reciprocal interest)
        target_viewed_user = ProfileView.query.filter_by(
            viewer_id=self.target_user.id,
            viewed_id=self.user.id
        ).first()
        
        if target_viewed_user:
            # Target has shown interest by viewing user's profile
            view_count = min(target_viewed_user.view_count, 5)
            return 0.4 + (view_count / 20)  # Score between 0.4 and 0.65
        
        return 0.3  # No view interaction
    
    def _get_messaging_patterns(self):
        """Calculate score based on messaging patterns"""
        from python_backend.models.models import UserBehavior
        
        # Get messaging behavior for the user
        user_behaviors = UserBehavior.query.filter_by(
            user_id=self.user.id,
            action_type='send_message'
        ).all()
        
        if not user_behaviors:
            return 0.5  # No messaging data
        
        # Calculate preferences based on who the user messages
        message_targets = {}
        for behavior in user_behaviors:
            if behavior.target_id:
                message_targets[behavior.target_id] = message_targets.get(behavior.target_id, 0) + 1
        
        # If user has messaged this target before, higher score
        if self.target_user.id in message_targets:
            return 0.9  # Strong signal of interest
        
        # Check if target has similar attributes to people the user messages
        # This requires additional analysis of target profiles, simplified here
        return 0.5  # Neutral score as fallback
    
    def _get_activity_time_overlap(self):
        """Calculate score based on when users are active"""
        from python_backend.models.models import UserBehavior
        from datetime import datetime, timedelta
        
        # Get recent activities (last 7 days)
        since_date = datetime.utcnow() - timedelta(days=7)
        
        user_activities = UserBehavior.query.filter(
            UserBehavior.user_id == self.user.id,
            UserBehavior.created_at >= since_date
        ).all()
        
        target_activities = UserBehavior.query.filter(
            UserBehavior.user_id == self.target_user.id,
            UserBehavior.created_at >= since_date
        ).all()
        
        if not user_activities or not target_activities:
            return 0.5  # No activity data for comparison
        
        # Calculate activity hour distribution (when are they active)
        user_hours = {}
        target_hours = {}
        
        for behavior in user_activities:
            hour = behavior.created_at.hour
            user_hours[hour] = user_hours.get(hour, 0) + 1
            
        for behavior in target_activities:
            hour = behavior.created_at.hour
            target_hours[hour] = target_hours.get(hour, 0) + 1
        
        # Normalize distributions
        total_user = sum(user_hours.values())
        total_target = sum(target_hours.values())
        
        for hour in user_hours:
            user_hours[hour] /= total_user
            
        for hour in target_hours:
            target_hours[hour] /= total_target
        
        # Calculate overlap in activity patterns
        overlap = 0
        for hour in range(24):
            user_val = user_hours.get(hour, 0)
            target_val = target_hours.get(hour, 0)
            overlap += min(user_val, target_val)
        
        # Scale overlap to 0-1 (higher overlap = higher score)
        return min(overlap * 2, 1.0)


def get_user_recommendations(user_id, db_session, limit=20, min_score=50):
    """
    Get recommended users based on compatibility scores
    
    Args:
        user_id: The ID of the user to get recommendations for
        db_session: SQLAlchemy database session
        limit: Maximum number of recommendations to return
        min_score: Minimum compatibility score (0-100)
        
    Returns:
        List of user recommendations with compatibility scores
    """
    # Get the user and their profile
    user = db_session.query(User).get(user_id)
    if not user:
        return []
        
    user_profile = db_session.query(Profile).filter_by(user_id=user_id).first()
    if not user_profile:
        return []
    
    # Get users that match basic criteria (gender preference, verified, etc.)
    base_query = db_session.query(User, Profile).join(Profile, User.id == Profile.user_id)
    
    # Filter by gender preference
    if user.interested_in != 'Both':
        base_query = base_query.filter(User.gender == user.interested_in)
    
    # Filter out the current user
    base_query = base_query.filter(User.id != user_id)
    
    # Filter by verified accounts only
    base_query = base_query.filter(User.is_verified == True)
    
    # Filter out users that the current user has already liked
    liked_users = db_session.query(Like.liked_id).filter(Like.liker_id == user_id).subquery()
    base_query = base_query.filter(~User.id.in_(liked_users))
    
    # Get potential matches
    potential_matches = base_query.all()
    
    # Calculate compatibility scores
    recommendations = []
    for target_user, target_profile in potential_matches:
        matcher = MatchScore(user, user_profile, target_user, target_profile)
        score = matcher.calculate_total_score()
        
        # Only include recommendations above the minimum score
        if score >= min_score:
            recommendations.append({
                'user': target_user.to_dict(),
                'profile': target_profile.to_dict(),
                'compatibility_score': score
            })
    
    # Sort by compatibility score (highest first)
    recommendations.sort(key=lambda x: x['compatibility_score'], reverse=True)
    
    # Limit the number of recommendations
    return recommendations[:limit]