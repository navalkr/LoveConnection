# Heartlink Dating App

A modern, feature-rich dating platform that leverages advanced matching algorithms and user-centric design to create meaningful connections.

## Features

- **User Authentication**
  - Email registration/login
  - Phone number recovery
  - Face recognition verification
  - Email verification flow

- **Advanced Matching Algorithm**
  - Interest-based matching
  - Location-aware recommendations
  - Profession compatibility
  - User behavior tracking for better matches

- **Comprehensive User Profiles**
  - Photo upload
  - Detailed bio information
  - Interest tagging
  - Location services

- **Real-Time Communication**
  - Instant messaging
  - Typing indicators
  - Real-time notifications

- **Security Features**
  - Face verification for identity confirmation
  - Email verification process
  - Secure data handling

## Tech Stack

### Frontend
- React
- TypeScript
- TailwindCSS
- Shadcn/UI Components
- React Query for data fetching
- Vite for development

### Backend
- Python/Flask
- PostgreSQL
- SQLAlchemy ORM
- SendGrid for emails
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- Python 3.10+
- PostgreSQL (optional, can use in-memory storage for development)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/heartlink.git
cd heartlink
```

2. Install backend dependencies
```
cd python_backend
pip install -r requirements.txt
```

3. Install frontend dependencies
```
cd ../client
npm install
```

4. Configure environment variables
```
# Create .env file with the following variables
SENDGRID_API_KEY=your_sendgrid_api_key
APP_URL=http://localhost:5000
```

5. Start the application
```
npm run dev
```

## Project Structure

- `/client` - Frontend React application
- `/server` - Node.js Express server (deprecated)
- `/python_backend` - Flask Python backend
- `/shared` - Shared type definitions and schemas

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Login to existing account
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/forgot-username` - Recover username
- `POST /api/auth/verify-face` - Verify user's identity with face recognition
- `POST /api/auth/resend-verification` - Resend verification email

### Profiles
- `GET /api/profile` - Get current user's profile
- `PUT /api/profile` - Update user's profile

### Matching
- `GET /api/discover` - Get profiles for discovery
- `GET /api/matches` - Get user's matches
- `GET /api/matches/:matchId/messages` - Get messages for a match
- `POST /api/matches/:matchId/messages` - Send a message in a match

### Behavior Tracking
- `POST /api/behavior` - Track user behavior for recommendations
- `GET /api/behavior/stats` - Get behavioral statistics

## License
MIT