import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, setupAuth } from "./auth";
import { validateRequest } from "./utils";
import session from "express-session";
import MemoryStore from "memorystore";
import {
  insertUserSchema,
  insertProfileSchema,
  insertLikeSchema,
  insertMessageSchema,
  loginSchema
} from "@shared/schema";

const createMemoryStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware with improved configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "heartlink-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: false, // Set to false for development
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: 'lax'
      },
      store: new createMemoryStore({
        checkPeriod: 86400000, // 24 hours
      }),
    })
  );

  // Auth routes
  const auth = setupAuth(storage);
  app.post("/api/auth/register", validateRequest(insertUserSchema), auth.register);
  app.post("/api/auth/login", validateRequest(loginSchema), auth.login);
  app.post("/api/auth/logout", auth.logout);
  app.get("/api/auth/me", auth.getCurrentUser);
  app.post("/api/auth/forgot-password", auth.forgotPassword);
  app.post("/api/auth/reset-password", auth.resetPassword);
  app.post("/api/auth/forgot-username", auth.forgotUsername);
  app.post("/api/auth/verify-face", auth.verifyFace);
  
  // Get verification token info (for face verification page)
  app.get("/api/auth/verification/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(400).json({ valid: false, message: "Invalid or expired verification token" });
      }
      
      res.json({ 
        valid: true, 
        userId: user.id,
        firstName: user.firstName,
        isVerified: user.isVerified
      });
    } catch (error) {
      console.error("Verification token check error:", error);
      res.status(500).json({ valid: false, message: "Failed to check verification token" });
    }
  });

  // User profile routes
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const profile = await storage.getProfile(req.session.userId!);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.put("/api/profile", isAuthenticated, validateRequest(insertProfileSchema.partial()), async (req, res) => {
    try {
      const updatedProfile = await storage.updateProfile(req.session.userId!, req.body);
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Discovery routes
  app.get("/api/discover", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const profiles = await storage.getDiscoverProfiles(req.session.userId!, limit);
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to get discovery profiles" });
    }
  });

  // Like routes
  app.post("/api/likes", isAuthenticated, validateRequest(insertLikeSchema), async (req, res) => {
    try {
      const { likedId } = req.body;
      const likerId = req.session.userId!;
      
      // Check if like already exists
      const existingLike = await storage.getLikeByUsers(likerId, likedId);
      if (existingLike) {
        return res.status(400).json({ message: "Already liked this user" });
      }
      
      // Create the like
      const like = await storage.createLike({ likerId, likedId });
      
      // Check if the other user has already liked this user (mutual like = match)
      const reverseLike = await storage.getLikeByUsers(likedId, likerId);
      if (reverseLike) {
        // Create a match
        const match = await storage.createMatch({
          user1Id: likerId,
          user2Id: likedId,
        });
        
        return res.status(201).json({ 
          like,
          match,
          isMatch: true
        });
      }
      
      res.status(201).json({ 
        like,
        isMatch: false
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create like" });
    }
  });

  // Matches routes
  app.get("/api/matches", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const matches = await storage.getMatchesByUser(userId);
      
      // Get users for each match
      const matchesWithUsers = await Promise.all(
        matches.map(async (match) => {
          const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
          const otherUser = await storage.getUser(otherUserId);
          const otherProfile = await storage.getProfile(otherUserId);
          
          // Get last message for match
          const messages = await storage.getMessagesByMatch(match.id);
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
          
          // Count unread messages
          const unreadCount = messages.filter(
            msg => msg.receiverId === userId && !msg.isRead
          ).length;
          
          return {
            ...match,
            otherUser: otherUser ? { 
              id: otherUser.id,
              username: otherUser.username,
              firstName: otherUser.firstName,
              lastName: otherUser.lastName,
            } : null,
            otherProfile,
            lastMessage,
            unreadCount
          };
        })
      );
      
      res.json(matchesWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get matches" });
    }
  });

  // Messages routes
  app.get("/api/matches/:matchId/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const matchId = parseInt(req.params.matchId);
      
      // Verify the match exists and user is part of it
      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ message: "Not authorized to view these messages" });
      }
      
      const messages = await storage.getMessagesByMatch(matchId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(matchId, userId);
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.post("/api/matches/:matchId/messages", isAuthenticated, validateRequest(insertMessageSchema), async (req, res) => {
    try {
      const userId = req.session.userId!;
      const matchId = parseInt(req.params.matchId);
      
      // Verify the match exists and user is part of it
      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ message: "Not authorized to send messages in this match" });
      }
      
      // Determine receiver
      const receiverId = match.user1Id === userId ? match.user2Id : match.user1Id;
      
      // Create message
      const message = await storage.createMessage({
        matchId,
        senderId: userId,
        receiverId,
        content: req.body.content,
      });
      
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
