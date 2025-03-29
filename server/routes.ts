import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import Stripe from "stripe";
import { z } from "zod";
import { 
  insertForumSchema, 
  insertForumPostSchema, 
  insertForumReplySchema,
  insertGroupSchema,
  insertGroupMemberSchema,
  insertZoomCallSchema
} from "@shared/schema";
import { sendVerificationEmail, sendPasswordResetEmail, generateToken } from "./email";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_your_key_here";
const stripePriceId = process.env.STRIPE_PRICE_ID || "price_your_id_here";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app);
  
  // Forums API
  app.get("/api/forums", async (req, res) => {
    try {
      const isPremium = req.query.premium === "true";
      
      // If requesting premium forums, check if user is premium
      if (isPremium && (!req.isAuthenticated() || !req.user.isPremium)) {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      const forums = await storage.getForums(isPremium);
      res.json(forums);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forums" });
    }
  });
  
  app.get("/api/forums/:id", async (req, res) => {
    try {
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // If this is a premium forum, check if user is premium
      if (forum.isPremium && (!req.isAuthenticated() || !req.user.isPremium)) {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      res.json(forum);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum" });
    }
  });
  
  // Forum posts API
  app.get("/api/forums/:id/posts", async (req, res) => {
    try {
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // If this is a premium forum, check if user is premium
      if (forum.isPremium && (!req.isAuthenticated() || !req.user.isPremium)) {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      const posts = await storage.getForumPosts(forumId);
      
      // Get user info for each post
      const postsWithUsers = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          const replies = await storage.getForumReplies(post.id);
          return {
            ...post,
            user: user ? { 
              id: user.id, 
              username: user.username,
              fullName: user.fullName,
              profileImage: user.profileImage
            } : undefined,
            replyCount: replies.length
          };
        })
      );
      
      res.json(postsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });
  
  app.post("/api/forums/:id/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // If this is a premium forum, check if user is premium
      if (forum.isPremium && !req.user.isPremium) {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      const postData = insertForumPostSchema.parse({
        ...req.body,
        forumId,
        userId: req.user.id
      });
      
      const post = await storage.createForumPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });
  
  // Forum replies API
  app.get("/api/posts/:id/replies", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getForumPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const forum = await storage.getForum(post.forumId);
      
      // If this is a premium forum, check if user is premium
      if (forum?.isPremium && (!req.isAuthenticated() || !req.user.isPremium)) {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      const replies = await storage.getForumReplies(postId);
      
      // Get user info for each reply
      const repliesWithUsers = await Promise.all(
        replies.map(async (reply) => {
          const user = await storage.getUser(reply.userId);
          return {
            ...reply,
            user: user ? { 
              id: user.id, 
              username: user.username,
              fullName: user.fullName,
              profileImage: user.profileImage
            } : undefined
          };
        })
      );
      
      res.json(repliesWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post replies" });
    }
  });
  
  app.post("/api/posts/:id/replies", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getForumPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const forum = await storage.getForum(post.forumId);
      
      // If this is a premium forum, check if user is premium
      if (forum?.isPremium && !req.user.isPremium) {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      const replyData = insertForumReplySchema.parse({
        ...req.body,
        postId,
        userId: req.user.id
      });
      
      const reply = await storage.createForumReply(replyData);
      res.status(201).json(reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reply data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reply" });
    }
  });
  
  // Groups API
  app.get("/api/groups", async (req, res) => {
    try {
      const isPremium = req.query.premium === "true";
      
      // If requesting premium groups, check if user is premium
      if (isPremium && (!req.isAuthenticated() || !req.user.isPremium)) {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      const groups = await storage.getGroups(isPremium);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });
  
  app.get("/api/groups/:id", async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // If this is a premium group, check if user is premium
      if (group.isPremium && (!req.isAuthenticated() || !req.user.isPremium)) {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      // Get group members
      const members = await storage.getGroupMembers(groupId);
      
      res.json({ ...group, members });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });
  
  app.get("/api/user/groups", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const groups = await storage.getUserGroups(req.user.id);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user groups" });
    }
  });
  
  app.get("/api/user/suggested-groups", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const groups = await storage.getSuggestedGroups(req.user.id, limit);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suggested groups" });
    }
  });
  
  app.post("/api/groups/:id/join", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // If this is a premium group, check if user is premium
      if (group.isPremium && !req.user.isPremium) {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      // Check if user is already a member
      const isAlreadyMember = await storage.isUserInGroup(req.user.id, groupId);
      if (isAlreadyMember) {
        return res.status(400).json({ message: "Already a member of this group" });
      }
      
      const memberData = insertGroupMemberSchema.parse({
        userId: req.user.id,
        groupId
      });
      
      await storage.addUserToGroup(memberData);
      res.status(200).json({ message: "Successfully joined group" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to join group" });
    }
  });
  
  app.post("/api/groups/:id/leave", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Check if user is a member
      const isMember = await storage.isUserInGroup(req.user.id, groupId);
      if (!isMember) {
        return res.status(400).json({ message: "Not a member of this group" });
      }
      
      await storage.removeUserFromGroup(req.user.id, groupId);
      res.status(200).json({ message: "Successfully left group" });
    } catch (error) {
      res.status(500).json({ message: "Failed to leave group" });
    }
  });
  
  // Zoom Calls API
  app.get("/api/user/zoom-calls", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const calls = await storage.getUpcomingZoomCalls(req.user.id);
      
      // Get group info for each call
      const callsWithGroups = await Promise.all(
        calls.map(async (call) => {
          const group = await storage.getGroup(call.groupId);
          const participants = await storage.getCallParticipants(call.id);
          return {
            ...call,
            group,
            participantCount: participants.length
          };
        })
      );
      
      res.json(callsWithGroups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch zoom calls" });
    }
  });
  
  app.get("/api/groups/:id/zoom-calls", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // If this is a premium group, check if user is premium
      if (group.isPremium && !req.user.isPremium) {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      // Check if user is a member
      const isMember = await storage.isUserInGroup(req.user.id, groupId);
      if (!isMember) {
        return res.status(403).json({ message: "You must be a member of this group" });
      }
      
      const calls = await storage.getZoomCalls(groupId);
      res.json(calls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group zoom calls" });
    }
  });
  
  app.post("/api/groups/:id/zoom-calls", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // If this is a premium group, check if user is premium
      if (group.isPremium && !req.user.isPremium) {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      // Check if user is a member
      const isMember = await storage.isUserInGroup(req.user.id, groupId);
      if (!isMember) {
        return res.status(403).json({ message: "You must be a member of this group" });
      }
      
      const callData = insertZoomCallSchema.parse({
        ...req.body,
        groupId
      });
      
      const call = await storage.createZoomCall(callData);
      res.status(201).json(call);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid call data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create zoom call" });
    }
  });
  
  app.post("/api/zoom-calls/:id/join", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const callId = parseInt(req.params.id);
      const call = await storage.getZoomCall(callId);
      
      if (!call) {
        return res.status(404).json({ message: "Zoom call not found" });
      }
      
      const group = await storage.getGroup(call.groupId);
      
      // Check if user is a member of the group
      const isMember = await storage.isUserInGroup(req.user.id, call.groupId);
      if (!isMember) {
        return res.status(403).json({ message: "You must be a member of the group to join this call" });
      }
      
      // If this is a premium group, check if user is premium
      if (group?.isPremium && !req.user.isPremium) {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      await storage.addParticipantToCall({ userId: req.user.id, callId });
      res.status(200).json({ zoomLink: call.zoomLink });
    } catch (error) {
      res.status(500).json({ message: "Failed to join zoom call" });
    }
  });
  
  // Subscription API
  app.post("/api/get-or-create-subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = req.user;
    
    // If user already has an active subscription
    if (user.isPremium && user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        res.json({
          subscriptionId: subscription.id,
          clientSecret: undefined // No client secret needed for existing subscription
        });
        
        return;
      } catch (error) {
        // If there's an error retrieving the subscription, continue to create a new one
        console.error("Error retrieving subscription:", error);
      }
    }
    
    try {
      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName || user.username,
        });
        
        customerId = customer.id;
      }
      
      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: stripePriceId,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Update user with Stripe info
      await storage.updateUserStripeInfo(user.id, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
      });
      
      const latestInvoice = subscription.latest_invoice as any;
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: latestInvoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Stripe subscription error:", error);
      return res.status(400).json({ message: error.message });
    }
  });
  
  // Admin API - Forum management
  app.post("/api/admin/forums", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const forumData = insertForumSchema.parse(req.body);
      const forum = await storage.createForum(forumData);
      res.status(201).json(forum);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid forum data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create forum" });
    }
  });
  
  app.put("/api/admin/forums/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      const updatedForum = await storage.updateForum(forumId, req.body);
      res.json(updatedForum);
    } catch (error) {
      res.status(500).json({ message: "Failed to update forum" });
    }
  });
  
  app.delete("/api/admin/forums/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const forumId = parseInt(req.params.id);
      const success = await storage.deleteForum(forumId);
      
      if (!success) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete forum" });
    }
  });
  
  // Admin API - Group management
  app.post("/api/admin/groups", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(groupData);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid group data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create group" });
    }
  });
  
  app.put("/api/admin/groups/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      const updatedGroup = await storage.updateGroup(groupId, req.body);
      res.json(updatedGroup);
    } catch (error) {
      res.status(500).json({ message: "Failed to update group" });
    }
  });
  
  app.delete("/api/admin/groups/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const groupId = parseInt(req.params.id);
      const success = await storage.deleteGroup(groupId);
      
      if (!success) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete group" });
    }
  });
  
  // Admin API - User management
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const users = Array.from(storage.users.values()).map(user => {
        // Don't send passwords in the response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.put("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't allow changing passwords through this endpoint
      const { password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Don't send the password in the response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Email verification and password reset routes
  app.get("/api/verify-email", async (req, res) => {
    try {
      const token = req.query.token as string;
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }
      
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(404).json({ message: "Invalid or expired verification token" });
      }
      
      // Mark user as verified and clear the verification token
      await storage.updateUser(user.id, { 
        isVerified: true, 
        verificationToken: null 
      });
      
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });
  
  app.post("/api/resend-verification", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const user = req.user;
      
      // Check if user is already verified
      if (user.isVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
      
      // Generate a new verification token
      const verificationToken = generateToken();
      
      // Update user with new verification token
      await storage.updateUser(user.id, { verificationToken });
      
      // Send verification email
      await sendVerificationEmail(user.email, verificationToken);
      
      res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });
  
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      // For security reasons, don't reveal if a user exists or not
      // Always return success, even if no user was found
      if (user) {
        // Generate password reset token
        const resetToken = generateToken();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        
        // Update user with reset token
        await storage.updateUser(user.id, {
          passwordResetToken: resetToken,
          passwordResetExpiry: resetTokenExpiry
        });
        
        // Send password reset email
        await sendPasswordResetEmail(email, resetToken);
      }
      
      res.status(200).json({ message: "If an account exists, a password reset email has been sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      
      // Find user by reset token
      const user = await storage.getUserByPasswordResetToken(token);
      
      if (!user) {
        return res.status(404).json({ message: "Invalid or expired reset token" });
      }
      
      // Check if token is expired
      if (user.passwordResetExpiry && new Date() > new Date(user.passwordResetExpiry)) {
        return res.status(400).json({ message: "Reset token has expired" });
      }
      
      // Hash the new password
      const { hashPassword } = require('./auth');
      const hashedPassword = await hashPassword(password);
      
      // Update user with new password and clear reset token
      await storage.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null
      });
      
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
