import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication & basic info
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  interestedIn: text("interested_in").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Profiles table for additional profile information
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  // Replacing single location field with detailed location fields
  country: text("country"),
  state: text("state"),
  city: text("city"),
  vicinity: text("vicinity"),
  coordinates: text("coordinates"), // For storing latitude,longitude
  // Adding profession field
  profession: text("profession").notNull().default(''), // Making it required
  lastActive: timestamp("last_active"),
  interests: text("interests").array(),
  photos: text("photos").array(),
});

// Matches table to track users who matched with each other
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull().references(() => users.id),
  user2Id: integer("user2_id").notNull().references(() => users.id),
  matchedAt: timestamp("matched_at").defaultNow().notNull(),
});

// Table to track likes (one-sided interest)
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  likerId: integer("liker_id").notNull().references(() => users.id),
  likedId: integer("liked_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Messages table to store conversation messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
});

// Create schemas for insertions
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  lastActive: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  matchedAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true, 
  sentAt: true,
  isRead: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

// Create types for use in the application
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Login = z.infer<typeof loginSchema>;
