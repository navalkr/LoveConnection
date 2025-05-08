from datetime import datetime
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy import TypeDecorator, String
import json
from models.db import db

# Custom JSON List type for SQLite compatibility
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
    
    serialize_rules = ('-password',)
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=True)
    date_of_birth = db.Column(db.String(10), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    interested_in = db.Column(db.String(20), nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    verification_token = db.Column(db.String(100), nullable=True)
    verification_token_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    profiles = db.relationship('Profile', backref='user', lazy=True)
    sent_likes = db.relationship('Like', foreign_keys='Like.liker_id', backref='liker', lazy=True)
    received_likes = db.relationship('Like', foreign_keys='Like.liked_id', backref='liked', lazy=True)
    
    def __repr__(self):
        return f'<User {self.username}>'

# Profile model
class Profile(db.Model, SerializerMixin):
    __tablename__ = 'profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    country = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    vicinity = db.Column(db.String(100), nullable=True)
    coordinates = db.Column(db.String(100), nullable=True)
    profession = db.Column(db.String(100), default='', nullable=False)
    last_active = db.Column(db.DateTime, nullable=True)
    interests = db.Column(JsonList, default=[], nullable=True)
    photos = db.Column(JsonList, default=[], nullable=True)
    
    def __repr__(self):
        return f'<Profile {self.id} for User {self.user_id}>'

# Match model
class Match(db.Model, SerializerMixin):
    __tablename__ = 'matches'
    
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    matched_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user1 = db.relationship('User', foreign_keys=[user1_id])
    user2 = db.relationship('User', foreign_keys=[user2_id])
    messages = db.relationship('Message', backref='match', lazy=True)
    
    def __repr__(self):
        return f'<Match {self.id} between User {self.user1_id} and User {self.user2_id}>'

# Like model
class Like(db.Model, SerializerMixin):
    __tablename__ = 'likes'
    
    id = db.Column(db.Integer, primary_key=True)
    liker_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    liked_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Like from User {self.liker_id} to User {self.liked_id}>'

# Message model
class Message(db.Model, SerializerMixin):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('matches.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    
    sender = db.relationship('User', foreign_keys=[sender_id])
    receiver = db.relationship('User', foreign_keys=[receiver_id])
    
    def __repr__(self):
        return f'<Message {self.id} from User {self.sender_id} to User {self.receiver_id}>'