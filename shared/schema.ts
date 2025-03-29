import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  premiumUntil: timestamp("premium_until"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  aboutMe: text("about_me"),
  profileImage: text("profile_image"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  supabaseId: text("supabase_id").unique(), // Supabase user ID to link accounts
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  groupId: integer("group_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});

export const forums = pgTable("forums", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const zoomCalls = pgTable("zoom_calls", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  zoomLink: text("zoom_link").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const zoomCallParticipants = pgTable("zoom_call_participants", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").notNull(),
  userId: integer("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  aboutMe: true,
  profileImage: true,
  isVerified: true,
  verificationToken: true,
  passwordResetToken: true,
  supabaseId: true
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
  isPremium: true
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  userId: true,
  groupId: true
});

export const insertForumSchema = createInsertSchema(forums).pick({
  title: true,
  description: true,
  isPremium: true
});

export const insertForumPostSchema = createInsertSchema(forumPosts).pick({
  forumId: true,
  userId: true,
  title: true,
  content: true
});

export const insertForumReplySchema = createInsertSchema(forumReplies).pick({
  postId: true,
  userId: true,
  content: true
});

export const insertZoomCallSchema = createInsertSchema(zoomCalls).pick({
  groupId: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  zoomLink: true
});

export const insertZoomCallParticipantSchema = createInsertSchema(zoomCallParticipants).pick({
  callId: true,
  userId: true
});

// Types for insert operations
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type InsertForum = z.infer<typeof insertForumSchema>;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type InsertZoomCall = z.infer<typeof insertZoomCallSchema>;
export type InsertZoomCallParticipant = z.infer<typeof insertZoomCallParticipantSchema>;

// Types for select operations
export type User = typeof users.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Forum = typeof forums.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type ForumReply = typeof forumReplies.$inferSelect;
export type ZoomCall = typeof zoomCalls.$inferSelect;
export type ZoomCallParticipant = typeof zoomCallParticipants.$inferSelect;

// Extended types for the frontend
export type UserWithGroups = User & { groups: Group[] };
export type ForumPostWithUser = ForumPost & { user: User };
export type ForumReplyWithUser = ForumReply & { user: User };
export type GroupWithMembers = Group & { members: User[] };
export type ZoomCallWithGroup = ZoomCall & { group: Group };
