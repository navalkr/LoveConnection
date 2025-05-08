# Heartlink Dating Website - Python Backend

This is the Python backend implementation of the Heartlink dating website. 

## Features

- User authentication with secure password hashing
- Profile management including photo uploads
- Location-based matching
- Face verification through email tokens
- Messaging between matches
- Email notifications using SendGrid

## Tech Stack

- **Backend**: Python, Flask
- **Frontend**: React (separate repository)
- **Database**: SQLAlchemy (SQLite by default, configurable for PostgreSQL)
- **Authentication**: Session-based with JWT tokens for verification
- **Email**: SendGrid

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd python_backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables by editing the `.env` file:
   ```
   # App settings
   FLASK_APP=app.py
   FLASK_ENV=development
   APP_URL=http://localhost:5000
   SECRET_KEY=your-secret-key

   # Database settings
   DATABASE_URL=sqlite:///heartlink.db

   # SendGrid email settings
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

## Running the Application

1. Initialize the database:
   ```
   python run.py
   ```

2. Start the development server:
   ```
   python run.py
   ```

The server will start on http://localhost:5000.

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/forgot-username` - Recover username
- `POST /api/auth/verify-face` - Verify user's face
- `GET /api/auth/verification/:token` - Get verification token info

### Profile Endpoints

- `GET /api/profile` - Get current user's profile
- `PUT /api/profile` - Update user's profile

### Discovery Endpoints

- `GET /api/discover` - Get profiles for discovery

### Like Endpoints

- `POST /api/likes` - Like a user

### Match Endpoints

- `GET /api/matches` - Get all matches for current user
- `GET /api/matches/:matchId/messages` - Get messages for a match
- `POST /api/matches/:matchId/messages` - Send a message in a match