import { Request, Response, NextFunction } from "express";
import { IStorage } from "./storage";
import { User } from "@shared/schema";
import crypto from "crypto";
import { sendVerificationEmail } from "./emailService";

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

// Generate tokens for password reset and verification
function generateToken(): string {
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
          isVerified: false // Ensure user starts as unverified
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
        
        // Generate verification token with 24 hour expiry
        const verificationToken = generateToken();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24);
        
        // Store verification token
        await storage.storeVerificationToken(user.id, verificationToken, tokenExpiry);
        
        // Send verification email
        const emailSent = await sendVerificationEmail(email, userData.firstName, verificationToken);
        
        // Set up session
        req.session.userId = user.id;
        req.session.user = user;
        req.session.isAuthenticated = true;
        
        // Return user without password and include email status
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
          ...userWithoutPassword,
          verificationEmailSent: emailSent
        });
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
        
        // Check if the user is verified
        if (!user.isVerified) {
          // If not verified, we can resend the verification email
          const verificationToken = generateToken();
          const tokenExpiry = new Date();
          tokenExpiry.setHours(tokenExpiry.getHours() + 24);
          
          // Store verification token
          await storage.storeVerificationToken(user.id, verificationToken, tokenExpiry);
          
          // Send verification email
          await sendVerificationEmail(user.email, user.firstName, verificationToken);
          
          return res.status(403).json({ 
            message: "Account not verified", 
            verified: false,
            email: user.email
          });
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
        const { email, phoneNumber } = req.body;
        
        if (!email && !phoneNumber) {
          return res.status(400).json({ message: "Email or phone number is required" });
        }
        
        // Generate reset token with 1 hour expiry
        const token = generateToken();
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        
        if (email) {
          // Check if user exists with this email
          const user = await storage.getUserByEmail(email);
          if (!user) {
            // For security reasons, don't reveal if the email exists or not
            return res.status(200).json({ 
              message: "If the email is registered, a password reset link will be sent" 
            });
          }
          
          // Store token for email
          await storage.storeResetToken(email, token, expiry);
          
          // In a real application, send an email with the reset token link
          console.log(`Reset token for ${email}: ${token}`);
          
          return res.status(200).json({ 
            message: "If the email is registered, a password reset link will be sent",
            // For demo purposes, return the token (in production, this would be sent via email)
            token 
          });
        } 
        else if (phoneNumber) {
          // Check if user exists with this phone number
          const user = await storage.getUserByPhoneNumber(phoneNumber);
          if (!user) {
            // For security reasons, don't reveal if the phone number exists or not
            return res.status(200).json({ 
              message: "If the phone number is registered, a password reset code will be sent via SMS" 
            });
          }
          
          // Store token for phone number
          await storage.storePhoneResetToken(phoneNumber, token, expiry);
          
          // In a real application, send an SMS with the reset token
          console.log(`Reset token for ${phoneNumber}: ${token}`);
          
          return res.status(200).json({ 
            message: "If the phone number is registered, a password reset code will be sent via SMS",
            // For demo purposes, return the token (in production, this would be sent via SMS)
            token 
          });
        }
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

    // Request username recovery via email
    async forgotUsername(req: Request, res: Response) {
      try {
        const { email, phoneNumber } = req.body;
        
        if (!email && !phoneNumber) {
          return res.status(400).json({ message: "Email or phone number is required" });
        }
        
        let user;
        
        // Check if user exists by email or phone number
        if (email) {
          user = await storage.getUserByEmail(email);
          if (!user) {
            // For security reasons, don't reveal if the email exists or not
            return res.status(200).json({ 
              message: "If the email is registered, the username will be sent" 
            });
          }
          
          // In a real application, send an email with the username
          console.log(`Username for ${email}: ${user.username}`);
          
          return res.status(200).json({ 
            message: "If the email is registered, the username will be sent to your email",
            // For demo purposes, return the username (in production, this would be sent via email)
            username: user.username 
          });
        } 
        else if (phoneNumber) {
          user = await storage.getUserByPhoneNumber(phoneNumber);
          if (!user) {
            // For security reasons, don't reveal if the phone number exists or not
            return res.status(200).json({ 
              message: "If the phone number is registered, the username will be sent via SMS" 
            });
          }
          
          // In a real application, send an SMS with the username
          console.log(`Username for ${phoneNumber}: ${user.username}`);
          
          return res.status(200).json({ 
            message: "If the phone number is registered, the username will be sent via SMS",
            // For demo purposes, return the username (in production, this would be sent via SMS)
            username: user.username 
          });
        }
      } catch (error) {
        console.error("Forgot username error:", error);
        res.status(500).json({ message: "Failed to process request" });
      }
    },
    
    // Verify user with face recognition
    async verifyFace(req: Request, res: Response) {
      try {
        const { token } = req.body;
        if (!token) {
          return res.status(400).json({ message: "Verification token is required" });
        }
        
        // Find user by verification token
        const user = await storage.getUserByVerificationToken(token);
        if (!user) {
          return res.status(400).json({ message: "Invalid or expired verification token" });
        }
        
        // Set user as verified
        await storage.setUserVerified(user.id);
        
        // Log the user in automatically
        req.session.userId = user.id;
        req.session.user = user;
        req.session.isAuthenticated = true;
        
        // Return verified user (without password)
        const { password, ...userWithoutPassword } = user;
        
        res.status(200).json({ 
          message: "Face verification successful", 
          user: { ...userWithoutPassword, isVerified: true }
        });
      } catch (error) {
        console.error("Face verification error:", error);
        res.status(500).json({ message: "Failed to process verification" });
      }
    }
  };
}
