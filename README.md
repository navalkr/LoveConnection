# Heartlink - Modern Dating Platform

Heartlink is a sophisticated dating platform leveraging intelligent matching technologies and a comprehensive user experience design. The application is built with a focus on security, user verification, and intelligent matching based on user preferences and behavior patterns.

## Features

- **Advanced User Matching**: Algorithm based on user preferences, location, and behavior patterns
- **Comprehensive Authentication System**: Secure login, registration with email verification
- **Face Verification**: Additional security layer through facial recognition
- **Real-time Messaging**: Chat with your matches in real-time
- **Detailed User Profiles**: Share your interests, location, and profession
- **Discovery System**: Find potential matches based on your preferences

## Technology Stack

- **Frontend**: React / TypeScript with Tailwind CSS and shadcn/ui components
- **Backend**: Node.js/Express API
- **Database**: PostgreSQL with Drizzle ORM
- **Email Services**: SendGrid for verification and notifications
- **Session Management**: Express sessions with secure cookies
- **Form Management**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn
- PostgreSQL database (optional for production)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/navalkr/LoveConnection.git
   cd LoveConnection
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   SESSION_SECRET=your_secret_key
   SENDGRID_API_KEY=your_sendgrid_api_key
   APP_URL=http://localhost:5000
   ```

4. Start the development server
   ```
   npm run dev
   ```

## Project Structure

- `/client` - React frontend code
  - `/src/components` - Reusable UI components
  - `/src/hooks` - Custom React hooks
  - `/src/pages` - Main application pages
  - `/src/lib` - Utility functions and configuration

- `/server` - Express API backend
  - `/auth.ts` - Authentication logic
  - `/routes.ts` - API routes
  - `/storage.ts` - Data storage interface
  - `/emailService.ts` - Email functionality

- `/shared` - Code shared between frontend and backend
  - `/schema.ts` - Database schema and type definitions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Special thanks to the React and Express communities
- All the open-source libraries that made this project possible