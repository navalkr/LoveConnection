import functools
from flask import request, jsonify
from datetime import datetime, date
import math

def validate_request(schema):
    """
    Decorator to validate request body against a schema
    """
    def decorator(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            # Get request data
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400
            
            # Validate against schema
            try:
                schema.validate(data)
            except Exception as e:
                return jsonify({"error": "Validation error", "details": str(e)}), 400
            
            return f(*args, **kwargs)
        return wrapper
    return decorator

def format_date(date):
    """Format a date object to string"""
    if isinstance(date, datetime):
        return date.strftime('%Y-%m-%d')
    elif isinstance(date, date):
        return date.strftime('%Y-%m-%d')
    return str(date)  # Return as is if it's already a string or other format

def calculate_age(date_of_birth):
    """Calculate age from date of birth string (YYYY-MM-DD)"""
    try:
        dob = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
        today = date.today()
        age = today.year - dob.year
        
        # Check if birthday has occurred this year
        if (today.month, today.day) < (dob.month, dob.day):
            age -= 1
            
        return age
    except Exception:
        return None

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers"""
    def deg2rad(deg):
        return deg * (math.pi / 180)
    
    try:
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
        
        # Radius of the earth in km
        R = 6371
        
        # Haversine formula
        dLat = deg2rad(lat2 - lat1)
        dLon = deg2rad(lon2 - lon1)
        a = math.sin(dLat/2) * math.sin(dLat/2) + \
            math.cos(deg2rad(lat1)) * math.cos(deg2rad(lat2)) * \
            math.sin(dLon/2) * math.sin(dLon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        
        return round(distance, 2)
    except Exception:
        return None