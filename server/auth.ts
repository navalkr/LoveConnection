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

// Generate a reset token for password reset
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
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
          country: "",
          state: "",
          city: "",
          vicinity: "",
          coordinates: "",
          profession: "",
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
    },

    // Request password reset
    async forgotPassword(req: Request, res: Response) {
      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }
        
        // Check if user exists
        const user = await storage.getUserByEmail(email);
        if (!user) {
          // For security reasons, don't reveal if the email exists or not
          return res.status(200).json({ 
            message: "If the email is registered, a password reset link will be sent" 
          });
        }
        
        // Generate reset token with 1 hour expiry
        const token = generateResetToken();
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        
        // Store token
        await storage.storeResetToken(email, token, expiry);
        
        // In a real application, send an email with the reset token link
        console.log(`Reset token for ${email}: ${token}`);
        
        res.status(200).json({ 
          message: "If the email is registered, a password reset link will be sent",
          // For demo purposes, return the token (in production, this would be sent via email)
          token 
        });
      } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Failed to process request" });
      }
    },

    // Reset password with token
    async resetPassword(req: Request, res: Response) {
      try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
          return res.status(400).json({ message: "Token and new password are required" });
        }
        
        // Verify token
        const user = await storage.getUserByResetToken(token);
        if (!user) {
          return res.status(400).json({ message: "Invalid or expired token" });
        }
        
        // Hash the new password
        const hashedPassword = hashPassword(newPassword);
        
        // Update user password
        await storage.updateUserPassword(user.id, hashedPassword);
        
        res.status(200).json({ message: "Password has been reset successfully" });
      } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Failed to reset password" });
      }
    },

    // Request username recovery
    async forgotUsername(req: Request, res: Response) {
      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }
        
        // Check if user exists
        const user = await storage.getUserByEmail(email);
        if (!user) {
          // For security reasons, don't reveal if the email exists or not
          return res.status(200).json({ 
            message: "If the email is registered, the username will be sent" 
          });
        }
        
        // In a real application, send an email with the username
        console.log(`Username for ${email}: ${user.username}`);
        
        res.status(200).json({ 
          message: "If the email is registered, the username will be sent to your email",
          // For demo purposes, return the username (in production, this would be sent via email)
          username: user.username 
        });
      } catch (error) {
        console.error("Forgot username error:", error);
        res.status(500).json({ message: "Failed to process request" });
      }
    }
  };
}
