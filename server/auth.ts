import { Request, Response, NextFunction } from "express";
import { IStorage } from "./storage";
import { User } from "@shared/schema";
import crypto from "crypto";

// For a production application, use a proper password hashing library like bcrypt
// This is a simplified version for the demo
export function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const hashed = hashPassword(password);
  return hashed === hashedPassword;
}

// Session types for Express
declare module "express-session" {
  interface SessionData {
    user: User;
    userId: number;
    isAuthenticated: boolean;
  }
}

// Auth middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Auth controller methods
export function setupAuth(storage: IStorage) {
  return {
    // Register new user
    async register(req: Request, res: Response) {
      try {
        const { username, email, password, ...userData } = req.body;
        
        // Check if username or email already exists
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(400).json({ message: "Username already taken" });
        }
        
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already registered" });
        }
        
        // Create user with hashed password
        const hashedPassword = hashPassword(password);
        const user = await storage.createUser({
          ...userData,
          username,
          email,
          password: hashedPassword,
        });
        
        // Create empty profile
        await storage.createProfile({
          userId: user.id,
          bio: "",
          location: "",
          interests: [],
          photos: [],
        });
        
        // Set up session
        req.session.userId = user.id;
        req.session.user = user;
        req.session.isAuthenticated = true;
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Failed to register user" });
      }
    },
    
    // Login user
    async login(req: Request, res: Response) {
      try {
        const { username, password } = req.body;
        
        // Find user
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        // Verify password
        if (!verifyPassword(password, user.password)) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        // Set up session
        req.session.userId = user.id;
        req.session.user = user;
        req.session.isAuthenticated = true;
        
        // Update last active on profile
        const profile = await storage.getProfile(user.id);
        if (profile) {
          await storage.updateProfile(user.id, {});
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Failed to login" });
      }
    },
    
    // Logout user
    async logout(req: Request, res: Response) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.json({ message: "Logged out successfully" });
      });
    },
    
    // Get current user
    async getCurrentUser(req: Request, res: Response) {
      try {
        if (!req.session.userId) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({ message: "Failed to get current user" });
      }
    }
  };
}
