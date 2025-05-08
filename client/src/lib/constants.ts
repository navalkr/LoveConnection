// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    FORGOT_USERNAME: '/api/auth/forgot-username',
    FACE_VERIFICATION: '/api/auth/verify-face',
  },
  PROFILE: {
    GET: '/api/profile',
    UPDATE: '/api/profile',
  },
  DISCOVER: {
    GET: '/api/discover',
  },
  LIKES: {
    CREATE: '/api/likes',
  },
  MATCHES: {
    GET: '/api/matches',
    MESSAGES: (matchId: number) => `/api/matches/${matchId}/messages`,
  },
};

// Interests categories
export const INTERESTS = [
  "Travel",
  "Photography",
  "Hiking",
  "Coffee",
  "Reading",
  "Cooking",
  "Music",
  "Movies",
  "Sports",
  "Fitness",
  "Art",
  "Dancing",
  "Technology",
  "Gaming",
  "Writing",
  "Fashion",
  "Yoga",
  "Pets",
  "Wine",
  "Foodie",
  "Volunteering",
  "Theater",
  "Concerts",
  "Meditation",
  "Camping",
  "Cycling",
  "Running",
  "Swimming",
  "Beach",
  "Mountains"
];

// Gender options
export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "other", label: "Other" },
];

// Interested in options
export const INTERESTED_IN = [
  { value: "male", label: "Men" },
  { value: "female", label: "Women" },
  { value: "everyone", label: "Everyone" },
];

// Popular professions for dropdown
export const PROFESSIONS = [
  { value: "software_engineer", label: "Software Engineer" },
  { value: "doctor", label: "Doctor/Medical Professional" },
  { value: "teacher", label: "Teacher/Educator" },
  { value: "artist", label: "Artist/Creative Professional" },
  { value: "business", label: "Business/Entrepreneur" },
  { value: "finance", label: "Finance/Banking" },
  { value: "marketing", label: "Marketing/Advertising" },
  { value: "legal", label: "Legal Professional" },
  { value: "engineer", label: "Engineer" },
  { value: "healthcare", label: "Healthcare Worker" },
  { value: "retail", label: "Retail/Sales" },
  { value: "hospitality", label: "Hospitality" },
  { value: "student", label: "Student" },
  { value: "scientist", label: "Scientist/Researcher" },
  { value: "writer", label: "Writer/Journalist" },
  { value: "architect", label: "Architect/Designer" },
  { value: "trade", label: "Skilled Trade" },
  { value: "government", label: "Government/Public Service" },
  { value: "entertainment", label: "Entertainment Industry" },
  { value: "other", label: "Other" },
];

// List of countries for dropdown
export const COUNTRIES = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan" },
  { value: "cn", label: "China" },
  { value: "in", label: "India" },
  { value: "br", label: "Brazil" },
  { value: "mx", label: "Mexico" },
  { value: "za", label: "South Africa" },
  { value: "sg", label: "Singapore" },
  { value: "other", label: "Other" },
];

// Stats for display purposes only
export const STATS = {
  ACTIVE_USERS: "2M+",
  MATCHES_DAILY: "150K",
  SUCCESS_RATE: "85%",
  SUCCESS_STORIES: "15K+",
};

// App routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DISCOVER: "/discover",
  MATCHES: "/matches",
  MESSAGES: "/messages",
  CONVERSATION: "/conversation/:matchId",
  PROFILE: "/profile",
  FORGOT_PASSWORD: "/forgot-password",
  FORGOT_USERNAME: "/forgot-username",
  FACE_VERIFICATION: "/face-verification",
};
