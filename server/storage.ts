import { 
  users, 
  profiles, 
  matches, 
  likes, 
  messages, 
  type User,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Match,
  type InsertMatch,
  type Like,
  type InsertLike,
  type Message,
  type InsertMessage
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Profile methods
  getProfile(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: number, data: Partial<InsertProfile>): Promise<Profile | undefined>;
  
  // Match methods
  getMatch(id: number): Promise<Match | undefined>;
  getMatchByUsers(user1Id: number, user2Id: number): Promise<Match | undefined>;
  getMatchesByUser(userId: number): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  
  // Like methods
  getLike(id: number): Promise<Like | undefined>;
  getLikeByUsers(likerId: number, likedId: number): Promise<Like | undefined>;
  getLikesByUser(userId: number): Promise<Like[]>;
  getLikesToUser(userId: number): Promise<Like[]>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(id: number): Promise<boolean>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByMatch(matchId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(matchId: number, userId: number): Promise<boolean>;
  
  // Discovery methods
  getDiscoverProfiles(userId: number, limit?: number): Promise<(User & { profile?: Profile })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profiles: Map<number, Profile>;
  private matches: Map<number, Match>;
  private likes: Map<number, Like>;
  private messages: Map<number, Message>;
  
  private userIdCounter: number;
  private profileIdCounter: number;
  private matchIdCounter: number;
  private likeIdCounter: number;
  private messageIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.matches = new Map();
    this.likes = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.profileIdCounter = 1;
    this.matchIdCounter = 1;
    this.likeIdCounter = 1;
    this.messageIdCounter = 1;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id, 
      createdAt: now,
      lastName: userData.lastName || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Profile methods
  async getProfile(userId: number): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }
  
  async createProfile(profileData: InsertProfile): Promise<Profile> {
    const id = this.profileIdCounter++;
    const now = new Date();
    const profile: Profile = { 
      ...profileData, 
      id, 
      lastActive: now,
      bio: profileData.bio || null,
      // Setting all location fields with null defaults
      country: profileData.country || null,
      state: profileData.state || null,
      city: profileData.city || null,
      vicinity: profileData.vicinity || null,
      coordinates: profileData.coordinates || null,
      // Setting profession with empty string default
      profession: profileData.profession || '',
      interests: profileData.interests || null,
      photos: profileData.photos || null
    };
    this.profiles.set(id, profile);
    return profile;
  }
  
  async updateProfile(userId: number, data: Partial<InsertProfile>): Promise<Profile | undefined> {
    const profile = await this.getProfile(userId);
    if (!profile) return undefined;
    
    const now = new Date();
    const updatedProfile: Profile = { 
      ...profile, 
      ...data, 
      lastActive: now 
    };
    this.profiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }
  
  // Match methods
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }
  
  async getMatchByUsers(user1Id: number, user2Id: number): Promise<Match | undefined> {
    return Array.from(this.matches.values()).find(
      (match) => (
        (match.user1Id === user1Id && match.user2Id === user2Id) ||
        (match.user1Id === user2Id && match.user2Id === user1Id)
      )
    );
  }
  
  async getMatchesByUser(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.user1Id === userId || match.user2Id === userId
    );
  }
  
  async createMatch(matchData: InsertMatch): Promise<Match> {
    const id = this.matchIdCounter++;
    const now = new Date();
    const match: Match = { 
      ...matchData, 
      id, 
      matchedAt: now 
    };
    this.matches.set(id, match);
    return match;
  }
  
  // Like methods
  async getLike(id: number): Promise<Like | undefined> {
    return this.likes.get(id);
  }
  
  async getLikeByUsers(likerId: number, likedId: number): Promise<Like | undefined> {
    return Array.from(this.likes.values()).find(
      (like) => like.likerId === likerId && like.likedId === likedId
    );
  }
  
  async getLikesByUser(userId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(
      (like) => like.likerId === userId
    );
  }
  
  async getLikesToUser(userId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(
      (like) => like.likedId === userId
    );
  }
  
  async createLike(likeData: InsertLike): Promise<Like> {
    const id = this.likeIdCounter++;
    const now = new Date();
    const like: Like = { 
      ...likeData, 
      id, 
      createdAt: now 
    };
    this.likes.set(id, like);
    return like;
  }
  
  async deleteLike(id: number): Promise<boolean> {
    return this.likes.delete(id);
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByMatch(matchId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.matchId === matchId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
  
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = { 
      ...messageData, 
      id, 
      sentAt: now,
      isRead: false 
    };
    this.messages.set(id, message);
    return message;
  }
  
  async markMessagesAsRead(matchId: number, userId: number): Promise<boolean> {
    const matchMessages = await this.getMessagesByMatch(matchId);
    matchMessages
      .filter(msg => msg.receiverId === userId && !msg.isRead)
      .forEach(msg => {
        const updatedMsg = { ...msg, isRead: true };
        this.messages.set(msg.id, updatedMsg);
      });
    return true;
  }
  
  // Discovery methods - get profiles that the user hasn't liked or matched with
  async getDiscoverProfiles(userId: number, limit = 10): Promise<(User & { profile?: Profile })[]> {
    // Get all users except current user
    const allUsers = Array.from(this.users.values()).filter(user => user.id !== userId);
    
    // Get user's likes and matches
    const userLikes = await this.getLikesByUser(userId);
    const userMatches = await this.getMatchesByUser(userId);
    
    // Filter out users that the current user has already liked or matched with
    const likedUserIds = userLikes.map(like => like.likedId);
    const matchedUserIds = userMatches.flatMap(match => [match.user1Id, match.user2Id])
      .filter(id => id !== userId);
    
    // Combine and deduplicate IDs to exclude
    const excludeIds = new Set([...likedUserIds, ...matchedUserIds]);
    
    // Filter users and get their profiles
    const discoverProfiles = allUsers
      .filter(user => !excludeIds.has(user.id))
      .slice(0, limit);
    
    // Add profile data to each user
    const usersWithProfiles = await Promise.all(
      discoverProfiles.map(async (user) => {
        const profile = await this.getProfile(user.id);
        return { ...user, profile };
      })
    );
    
    return usersWithProfiles;
  }
}

export const storage = new MemStorage();
