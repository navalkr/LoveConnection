from datetime import datetime
import math
from flask import request, jsonify
from werkzeug.exceptions import BadRequest
import json

def validate_request(schema):
    """
    Decorator to validate request body against a schema
    """
    def decorator(f):
        def wrapper(*args, **kwargs):
            try:
                request_data = request.get_json()
                if not request_data:
                    return jsonify({"message": "No data provided"}), 400
                
                # Basic validation since we don't have Zod
                for field in schema:
                    if field in schema.get('required', []) and field not in request_data:
                        return jsonify({"message": f"Field '{field}' is required"}), 400
                
                return f(*args, **kwargs)
            except BadRequest:
                return jsonify({"message": "Invalid JSON"}), 400
            except Exception as e:
                return jsonify({"message": str(e)}), 400
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

def format_date(date):
    """Format a date object to string"""
    return date.strftime("%Y-%m-%d %H:%M:%S")

def calculate_age(date_of_birth):
    """Calculate age from date of birth string (YYYY-MM-DD)"""
    dob = datetime.strptime(date_of_birth, "%Y-%m-%d")
    today = datetime.today()
    
    age = today.year - dob.year
    if (today.month, today.day) < (dob.month, dob.day):
        age -= 1
    
    return age

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers"""
    def deg2rad(deg):
        return deg * (math.pi / 180)
    
    R = 6371  # Radius of the earth in km
    dLat = deg2rad(lat2 - lat1)
    dLon = deg2rad(lon2 - lon1)
    
    a = (
        math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(deg2rad(lat1)) * math.cos(deg2rad(lat2)) *
        math.sin(dLon / 2) * math.sin(dLon / 2)
    )
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    
    return distance