from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.types import TypeDecorator
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
import json

from python_backend.models.db import db

# Custom JSON List type for storing arrays in SQLite
class JsonList(TypeDecorator):
    impl = String
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return '[]'
        return json.dumps(value)
    
    def process_result_value(self, value, dialect):
        if value is None:
            return []
        return json.loads(value)

# User model
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    
    # Don't include password in serialized output
    serialize_rules = ('-password',)
    
    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone_number = Column(String(20), unique=True, nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    date_of_birth = Column(String(10), nullable=False)
    gender = Column(String(20), nullable=False)
    interested_in = Column(String(20), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(100), nullable=True)
    verification_token_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    profiles = relationship('Profile', backref='user', lazy=True)
    sent_likes = relationship('Like', foreign_keys='Like.liker_id', backref='liker', lazy=True)
    received_likes = relationship('Like', foreign_keys='Like.liked_id', backref='liked', lazy=True)
    
    def __repr__(self):
        return f"<User {self.username}>"

# Profile model
class Profile(db.Model, SerializerMixin):
    __tablename__ = 'profiles'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    bio = Column(Text, nullable=True)
    country = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    vicinity = Column(String(100), nullable=True)
    coordinates = Column(String(100), nullable=True)
    profession = Column(String(100), default='', nullable=False)
    last_active = Column(DateTime, nullable=True)
    interests = Column(JsonList, default=[], nullable=True)
    photos = Column(JsonList, default=[], nullable=True)
    
    def __repr__(self):
        return f"<Profile {self.id} for User {self.user_id}>"

# Match model
class Match(db.Model, SerializerMixin):
    __tablename__ = 'matches'
    
    id = Column(Integer, primary_key=True)
    user1_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    user2_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    matched_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user1 = relationship('User', foreign_keys=[user1_id])
    user2 = relationship('User', foreign_keys=[user2_id])
    messages = relationship('Message', backref='match', lazy=True)
    
    def __repr__(self):
        return f"<Match {self.id} between Users {self.user1_id} and {self.user2_id}>"

# Like model
class Like(db.Model, SerializerMixin):
    __tablename__ = 'likes'
    
    id = Column(Integer, primary_key=True)
    liker_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    liked_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Like {self.id} from User {self.liker_id} to User {self.liked_id}>"

# Message model
class Message(db.Model, SerializerMixin):
    __tablename__ = 'messages'
    
    id = Column(Integer, primary_key=True)
    match_id = Column(Integer, ForeignKey('matches.id'), nullable=False)
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    receiver_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
    
    # Relationships
    sender = relationship('User', foreign_keys=[sender_id])
    receiver = relationship('User', foreign_keys=[receiver_id])
    
    def __repr__(self):
        return f"<Message {self.id} in Match {self.match_id}>"

# UserBehavior model to track user interactions for the recommendation engine
class UserBehavior(db.Model, SerializerMixin):
    __tablename__ = 'user_behaviors'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Interaction types
    action_type = Column(String(50), nullable=False)  # view_profile, message_sent, login, etc.
    target_id = Column(Integer, nullable=True)  # User ID for profile views, message targets, etc.
    
    # Additional data
    data = Column(JSON, nullable=True)  # Stores any extra data related to the action
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship('User', backref='behaviors')
    
    def __repr__(self):
        return f"<UserBehavior {self.id} by User {self.user_id}: {self.action_type}>"

# ProfileView model to track profile views for recommendations
class ProfileView(db.Model, SerializerMixin):
    __tablename__ = 'profile_views'
    
    id = Column(Integer, primary_key=True)
    viewer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    viewed_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    view_count = Column(Integer, default=1)
    last_viewed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    viewer = relationship('User', foreign_keys=[viewer_id], backref='viewed_profiles')
    viewed = relationship('User', foreign_keys=[viewed_id], backref='profile_viewers')
    
    def __repr__(self):
        return f"<ProfileView {self.id} by User {self.viewer_id} of User {self.viewed_id}>"