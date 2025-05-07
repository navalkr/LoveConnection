// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
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
};
