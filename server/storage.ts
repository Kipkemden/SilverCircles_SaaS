import * as schema from "@shared/schema";
import type { 
  User, InsertUser,
  Group, InsertGroup,
  GroupMember, InsertGroupMember,
  Forum, InsertForum,
  ForumPost, InsertForumPost,
  ForumReply, InsertForumReply,
  ZoomCall, InsertZoomCall,
  ZoomCallParticipant, InsertZoomCallParticipant
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { pool, db } from './db';
import { eq, and, or, not, SQL, gt, desc, asc } from 'drizzle-orm';
import connectPg from 'connect-pg-simple';

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateUserPremiumStatus(id: number, isPremium: boolean, premiumUntil?: Date): Promise<User>;
  updateUserStripeInfo(id: number, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User>;
  
  // Group operations
  getGroup(id: number): Promise<Group | undefined>;
  getGroups(isPremium?: boolean): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, data: Partial<Group>): Promise<Group>;
  deleteGroup(id: number): Promise<boolean>;
  getUserGroups(userId: number): Promise<Group[]>;
  getSuggestedGroups(userId: number, limit?: number): Promise<Group[]>;
  
  // Group member operations
  addUserToGroup(data: InsertGroupMember): Promise<GroupMember>;
  removeUserFromGroup(userId: number, groupId: number): Promise<boolean>;
  getGroupMembers(groupId: number): Promise<User[]>;
  isUserInGroup(userId: number, groupId: number): Promise<boolean>;
  
  // Forum operations
  getForum(id: number): Promise<Forum | undefined>;
  getForums(isPremium?: boolean): Promise<Forum[]>;
  createForum(forum: InsertForum): Promise<Forum>;
  updateForum(id: number, data: Partial<Forum>): Promise<Forum>;
  deleteForum(id: number): Promise<boolean>;
  
  // Forum post operations
  getForumPost(id: number): Promise<ForumPost | undefined>;
  getForumPosts(forumId: number): Promise<ForumPost[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  updateForumPost(id: number, data: Partial<ForumPost>): Promise<ForumPost>;
  deleteForumPost(id: number): Promise<boolean>;
  
  // Forum reply operations
  getForumReply(id: number): Promise<ForumReply | undefined>;
  getForumReplies(postId: number): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  updateForumReply(id: number, data: Partial<ForumReply>): Promise<ForumReply>;
  deleteForumReply(id: number): Promise<boolean>;
  
  // Zoom call operations
  getZoomCall(id: number): Promise<ZoomCall | undefined>;
  getZoomCalls(groupId?: number): Promise<ZoomCall[]>;
  getUpcomingZoomCalls(userId: number): Promise<ZoomCall[]>;
  createZoomCall(call: InsertZoomCall): Promise<ZoomCall>;
  updateZoomCall(id: number, data: Partial<ZoomCall>): Promise<ZoomCall>;
  deleteZoomCall(id: number): Promise<boolean>;
  
  // Zoom call participant operations
  addParticipantToCall(data: InsertZoomCallParticipant): Promise<ZoomCallParticipant>;
  removeParticipantFromCall(userId: number, callId: number): Promise<boolean>;
  getCallParticipants(callId: number): Promise<User[]>;
  
  // Session store for authentication
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private groups: Map<number, Group>;
  private groupMembers: Map<number, GroupMember>;
  private forums: Map<number, Forum>;
  private forumPosts: Map<number, ForumPost>;
  private forumReplies: Map<number, ForumReply>;
  private zoomCalls: Map<number, ZoomCall>;
  private zoomCallParticipants: Map<number, ZoomCallParticipant>;
  
  // Current IDs for auto-increment
  private userCurrentId: number;
  private groupCurrentId: number;
  private groupMemberCurrentId: number;
  private forumCurrentId: number;
  private forumPostCurrentId: number;
  private forumReplyCurrentId: number;
  private zoomCallCurrentId: number;
  private zoomCallParticipantCurrentId: number;
  
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.groups = new Map();
    this.groupMembers = new Map();
    this.forums = new Map();
    this.forumPosts = new Map();
    this.forumReplies = new Map();
    this.zoomCalls = new Map();
    this.zoomCallParticipants = new Map();
    
    this.userCurrentId = 1;
    this.groupCurrentId = 1;
    this.groupMemberCurrentId = 1;
    this.forumCurrentId = 1;
    this.forumPostCurrentId = 1;
    this.forumReplyCurrentId = 1;
    this.zoomCallCurrentId = 1;
    this.zoomCallParticipantCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
    
    // Initialize with some sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Create sample forums
    const healthForum = this.createForum({
      title: "Healthy Aging Habits",
      description: "Discuss tips, routines, and advice for healthy aging.",
      isPremium: false
    });
    
    const investmentForum = this.createForum({
      title: "Investment Strategies for Ages 50+",
      description: "Share and learn about investment strategies suitable for retirement planning.",
      isPremium: true
    });
    
    const datingForum = this.createForum({
      title: "Dating After Divorce",
      description: "Support and advice for those getting back into the dating scene after separation or divorce.",
      isPremium: true
    });
    
    // Create sample groups
    const retirementGroup = this.createGroup({
      name: "Retirement Planning",
      description: "Plan your retirement with like-minded individuals.",
      isPremium: true
    });
    
    const datingGroup = this.createGroup({
      name: "New Beginnings: Dating Support",
      description: "Support group for those starting to date again after 50.",
      isPremium: true
    });
    
    const travelGroup = this.createGroup({
      name: "Travel After 50",
      description: "Share travel experiences and plan trips together.",
      isPremium: true
    });
    
    const cookingGroup = this.createGroup({
      name: "Healthy Cooking After 50",
      description: "Share recipes and cooking tips for maintaining health and enjoyment in your golden years.",
      isPremium: true
    });
    
    const techGroup = this.createGroup({
      name: "Tech for Seniors",
      description: "Learn how to use modern technology to stay connected with family and simplify daily life.",
      isPremium: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isPremium: false,
      isAdmin: false,
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserPremiumStatus(id: number, isPremium: boolean, premiumUntil?: Date): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, isPremium, premiumUntil };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeInfo(id: number, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      isPremium: true,
      premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Group methods
  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }
  
  async getGroups(isPremium?: boolean): Promise<Group[]> {
    const allGroups = Array.from(this.groups.values());
    if (isPremium === undefined) {
      return allGroups;
    }
    return allGroups.filter(group => group.isPremium === isPremium);
  }
  
  async createGroup(group: InsertGroup): Promise<Group> {
    const id = this.groupCurrentId++;
    const now = new Date();
    const newGroup: Group = { ...group, id, createdAt: now };
    this.groups.set(id, newGroup);
    return newGroup;
  }
  
  async updateGroup(id: number, data: Partial<Group>): Promise<Group> {
    const group = await this.getGroup(id);
    if (!group) {
      throw new Error(`Group with id ${id} not found`);
    }
    
    const updatedGroup = { ...group, ...data };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }
  
  async deleteGroup(id: number): Promise<boolean> {
    return this.groups.delete(id);
  }
  
  async getUserGroups(userId: number): Promise<Group[]> {
    const membershipEntries = Array.from(this.groupMembers.values())
      .filter(member => member.userId === userId);
    
    return membershipEntries.map(member => 
      this.groups.get(member.groupId)
    ).filter((group): group is Group => group !== undefined);
  }
  
  async getSuggestedGroups(userId: number, limit: number = 5): Promise<Group[]> {
    const userGroups = await this.getUserGroups(userId);
    const userGroupIds = new Set(userGroups.map(group => group.id));
    
    // Get groups the user is not a member of
    const suggestedGroups = Array.from(this.groups.values())
      .filter(group => !userGroupIds.has(group.id))
      .slice(0, limit);
    
    return suggestedGroups;
  }
  
  // Group member methods
  async addUserToGroup(data: InsertGroupMember): Promise<GroupMember> {
    const id = this.groupMemberCurrentId++;
    const now = new Date();
    const membership: GroupMember = { ...data, id, joinedAt: now };
    this.groupMembers.set(id, membership);
    return membership;
  }
  
  async removeUserFromGroup(userId: number, groupId: number): Promise<boolean> {
    const membershipEntry = Array.from(this.groupMembers.values())
      .find(member => member.userId === userId && member.groupId === groupId);
    
    if (membershipEntry) {
      return this.groupMembers.delete(membershipEntry.id);
    }
    
    return false;
  }
  
  async getGroupMembers(groupId: number): Promise<User[]> {
    const memberIds = Array.from(this.groupMembers.values())
      .filter(member => member.groupId === groupId)
      .map(member => member.userId);
    
    return memberIds.map(id => 
      this.users.get(id)
    ).filter((user): user is User => user !== undefined);
  }
  
  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    return Array.from(this.groupMembers.values())
      .some(member => member.userId === userId && member.groupId === groupId);
  }
  
  // Forum methods
  async getForum(id: number): Promise<Forum | undefined> {
    return this.forums.get(id);
  }
  
  async getForums(isPremium?: boolean): Promise<Forum[]> {
    const allForums = Array.from(this.forums.values());
    if (isPremium === undefined) {
      return allForums;
    }
    return allForums.filter(forum => forum.isPremium === isPremium);
  }
  
  async createForum(forum: InsertForum): Promise<Forum> {
    const id = this.forumCurrentId++;
    const now = new Date();
    const newForum: Forum = { ...forum, id, createdAt: now };
    this.forums.set(id, newForum);
    return newForum;
  }
  
  async updateForum(id: number, data: Partial<Forum>): Promise<Forum> {
    const forum = await this.getForum(id);
    if (!forum) {
      throw new Error(`Forum with id ${id} not found`);
    }
    
    const updatedForum = { ...forum, ...data };
    this.forums.set(id, updatedForum);
    return updatedForum;
  }
  
  async deleteForum(id: number): Promise<boolean> {
    return this.forums.delete(id);
  }
  
  // Forum post methods
  async getForumPost(id: number): Promise<ForumPost | undefined> {
    return this.forumPosts.get(id);
  }
  
  async getForumPosts(forumId: number): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values())
      .filter(post => post.forumId === forumId);
  }
  
  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const id = this.forumPostCurrentId++;
    const now = new Date();
    const newPost: ForumPost = { ...post, id, createdAt: now };
    this.forumPosts.set(id, newPost);
    return newPost;
  }
  
  async updateForumPost(id: number, data: Partial<ForumPost>): Promise<ForumPost> {
    const post = await this.getForumPost(id);
    if (!post) {
      throw new Error(`Forum post with id ${id} not found`);
    }
    
    const updatedPost = { ...post, ...data };
    this.forumPosts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deleteForumPost(id: number): Promise<boolean> {
    return this.forumPosts.delete(id);
  }
  
  // Forum reply methods
  async getForumReply(id: number): Promise<ForumReply | undefined> {
    return this.forumReplies.get(id);
  }
  
  async getForumReplies(postId: number): Promise<ForumReply[]> {
    return Array.from(this.forumReplies.values())
      .filter(reply => reply.postId === postId);
  }
  
  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const id = this.forumReplyCurrentId++;
    const now = new Date();
    const newReply: ForumReply = { ...reply, id, createdAt: now };
    this.forumReplies.set(id, newReply);
    return newReply;
  }
  
  async updateForumReply(id: number, data: Partial<ForumReply>): Promise<ForumReply> {
    const reply = await this.getForumReply(id);
    if (!reply) {
      throw new Error(`Forum reply with id ${id} not found`);
    }
    
    const updatedReply = { ...reply, ...data };
    this.forumReplies.set(id, updatedReply);
    return updatedReply;
  }
  
  async deleteForumReply(id: number): Promise<boolean> {
    return this.forumReplies.delete(id);
  }
  
  // Zoom call methods
  async getZoomCall(id: number): Promise<ZoomCall | undefined> {
    return this.zoomCalls.get(id);
  }
  
  async getZoomCalls(groupId?: number): Promise<ZoomCall[]> {
    const allCalls = Array.from(this.zoomCalls.values());
    if (groupId === undefined) {
      return allCalls;
    }
    return allCalls.filter(call => call.groupId === groupId);
  }
  
  async getUpcomingZoomCalls(userId: number): Promise<ZoomCall[]> {
    // Get groups the user is a member of
    const userGroups = await this.getUserGroups(userId);
    const userGroupIds = new Set(userGroups.map(group => group.id));
    
    const now = new Date();
    
    // Get upcoming calls for those groups
    const upcomingCalls = Array.from(this.zoomCalls.values())
      .filter(call => 
        userGroupIds.has(call.groupId) && 
        new Date(call.startTime) > now
      )
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return upcomingCalls;
  }
  
  async createZoomCall(call: InsertZoomCall): Promise<ZoomCall> {
    const id = this.zoomCallCurrentId++;
    const now = new Date();
    const newCall: ZoomCall = { ...call, id, createdAt: now };
    this.zoomCalls.set(id, newCall);
    return newCall;
  }
  
  async updateZoomCall(id: number, data: Partial<ZoomCall>): Promise<ZoomCall> {
    const call = await this.getZoomCall(id);
    if (!call) {
      throw new Error(`Zoom call with id ${id} not found`);
    }
    
    const updatedCall = { ...call, ...data };
    this.zoomCalls.set(id, updatedCall);
    return updatedCall;
  }
  
  async deleteZoomCall(id: number): Promise<boolean> {
    return this.zoomCalls.delete(id);
  }
  
  // Zoom call participant methods
  async addParticipantToCall(data: InsertZoomCallParticipant): Promise<ZoomCallParticipant> {
    const id = this.zoomCallParticipantCurrentId++;
    const now = new Date();
    const participation: ZoomCallParticipant = { ...data, id, joinedAt: now };
    this.zoomCallParticipants.set(id, participation);
    return participation;
  }
  
  async removeParticipantFromCall(userId: number, callId: number): Promise<boolean> {
    const participationEntry = Array.from(this.zoomCallParticipants.values())
      .find(participant => participant.userId === userId && participant.callId === callId);
    
    if (participationEntry) {
      return this.zoomCallParticipants.delete(participationEntry.id);
    }
    
    return false;
  }
  
  async getCallParticipants(callId: number): Promise<User[]> {
    const participantIds = Array.from(this.zoomCallParticipants.values())
      .filter(participant => participant.callId === callId)
      .map(participant => participant.userId);
    
    return participantIds.map(id => 
      this.users.get(id)
    ).filter((user): user is User => user !== undefined);
  }
}

// PostgreSQL implementation
export class PostgresStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Set up session store using the imported pool
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const users = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      return users[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const users = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
      return users[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const users = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      return users[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Set default values for nullable fields that are not in InsertUser
      const userWithDefaults = {
        ...user,
        premiumUntil: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        isPremium: false,
        isAdmin: false,
        aboutMe: user.aboutMe || null,
        profileImage: user.profileImage || null
      };
      
      const result = await db.insert(schema.users).values(userWithDefaults).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    try {
      const result = await db.update(schema.users)
        .set(data)
        .where(eq(schema.users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async updateUserPremiumStatus(id: number, isPremium: boolean, premiumUntil?: Date | null): Promise<User> {
    try {
      const result = await db.update(schema.users)
        .set({ isPremium, premiumUntil: premiumUntil || null })
        .where(eq(schema.users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating user premium status:', error);
      throw error;
    }
  }

  async updateUserStripeInfo(id: number, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    try {
      const result = await db.update(schema.users)
        .set(data)
        .where(eq(schema.users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating user stripe info:', error);
      throw error;
    }
  }

  // Group operations
  async getGroup(id: number): Promise<Group | undefined> {
    try {
      const groups = await db.select().from(schema.groups).where(eq(schema.groups.id, id)).limit(1);
      return groups[0];
    } catch (error) {
      console.error('Error getting group:', error);
      return undefined;
    }
  }

  async getGroups(isPremium?: boolean): Promise<Group[]> {
    try {
      if (isPremium !== undefined) {
        return await db.select().from(schema.groups).where(eq(schema.groups.isPremium, isPremium));
      }
      return await db.select().from(schema.groups);
    } catch (error) {
      console.error('Error getting groups:', error);
      return [];
    }
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    try {
      const result = await db.insert(schema.groups).values(group).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async updateGroup(id: number, data: Partial<Group>): Promise<Group> {
    try {
      const result = await db.update(schema.groups)
        .set(data)
        .where(eq(schema.groups.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  async deleteGroup(id: number): Promise<boolean> {
    try {
      await db.delete(schema.groups).where(eq(schema.groups.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      return false;
    }
  }

  async getUserGroups(userId: number): Promise<Group[]> {
    try {
      // Join groups with group_members to get groups for a specific user
      const result = await db
        .select({
          id: schema.groups.id,
          name: schema.groups.name,
          description: schema.groups.description,
          isPremium: schema.groups.isPremium,
          createdAt: schema.groups.createdAt
        })
        .from(schema.groups)
        .innerJoin(
          schema.groupMembers,
          eq(schema.groups.id, schema.groupMembers.groupId)
        )
        .where(eq(schema.groupMembers.userId, userId));
      
      return result;
    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  }

  async getSuggestedGroups(userId: number, limit: number = 5): Promise<Group[]> {
    try {
      // This is a simplified implementation - in a real app, you might want to
      // implement more sophisticated recommendation logic
      const userGroups = await this.getUserGroups(userId);
      const userGroupIds = userGroups.map(group => group.id);
      
      // Get groups the user is not a member of
      let query = db
        .select()
        .from(schema.groups);
      
      // Add filtering conditions
      const conditions = [];
      
      // Get user premium status first
      const userResult = await db.select({ isPremium: schema.users.isPremium })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);
        
      const userIsPremium = userResult.length > 0 ? userResult[0].isPremium : false;
      
      // User premium status condition - non-premium users can only see free groups
      if (!userIsPremium) {
        conditions.push(not(schema.groups.isPremium));
      }
      
      // Not in user's groups condition (only add if user is in some groups)
      if (userGroupIds.length > 0) {
        for (const id of userGroupIds) {
          conditions.push(not(eq(schema.groups.id, id)));
        }
      }
      
      // Apply all conditions
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Apply limit and execute
      const groups = await query.limit(limit);
      
      return groups;
    } catch (error) {
      console.error('Error getting suggested groups:', error);
      return [];
    }
  }

  // Group member operations
  async addUserToGroup(data: InsertGroupMember): Promise<GroupMember> {
    try {
      const result = await db.insert(schema.groupMembers).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error adding user to group:', error);
      throw error;
    }
  }

  async removeUserFromGroup(userId: number, groupId: number): Promise<boolean> {
    try {
      await db.delete(schema.groupMembers)
        .where(
          and(
            eq(schema.groupMembers.userId, userId),
            eq(schema.groupMembers.groupId, groupId)
          )
        );
      return true;
    } catch (error) {
      console.error('Error removing user from group:', error);
      return false;
    }
  }

  async getGroupMembers(groupId: number): Promise<User[]> {
    try {
      const result = await db
        .select({
          id: schema.users.id,
          username: schema.users.username,
          fullName: schema.users.fullName,
          email: schema.users.email,
          profileImage: schema.users.profileImage,
          isPremium: schema.users.isPremium,
          isAdmin: schema.users.isAdmin
          // Add other user fields as needed, but exclude sensitive data like password
        })
        .from(schema.users)
        .innerJoin(
          schema.groupMembers,
          eq(schema.users.id, schema.groupMembers.userId)
        )
        .where(eq(schema.groupMembers.groupId, groupId));
      
      return result;
    } catch (error) {
      console.error('Error getting group members:', error);
      return [];
    }
  }

  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(schema.groupMembers)
        .where(
          and(
            eq(schema.groupMembers.userId, userId),
            eq(schema.groupMembers.groupId, groupId)
          )
        )
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      console.error('Error checking if user is in group:', error);
      return false;
    }
  }

  // Forum operations
  async getForum(id: number): Promise<Forum | undefined> {
    try {
      const forums = await db.select().from(schema.forums).where(eq(schema.forums.id, id)).limit(1);
      return forums[0];
    } catch (error) {
      console.error('Error getting forum:', error);
      return undefined;
    }
  }

  async getForums(isPremium?: boolean): Promise<Forum[]> {
    try {
      if (isPremium !== undefined) {
        return await db.select().from(schema.forums).where(eq(schema.forums.isPremium, isPremium));
      }
      return await db.select().from(schema.forums);
    } catch (error) {
      console.error('Error getting forums:', error);
      return [];
    }
  }

  async createForum(forum: InsertForum): Promise<Forum> {
    try {
      const result = await db.insert(schema.forums).values(forum).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating forum:', error);
      throw error;
    }
  }

  async updateForum(id: number, data: Partial<Forum>): Promise<Forum> {
    try {
      const result = await db.update(schema.forums)
        .set(data)
        .where(eq(schema.forums.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating forum:', error);
      throw error;
    }
  }

  async deleteForum(id: number): Promise<boolean> {
    try {
      await db.delete(schema.forums).where(eq(schema.forums.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting forum:', error);
      return false;
    }
  }

  // Forum post operations
  async getForumPost(id: number): Promise<ForumPost | undefined> {
    try {
      const posts = await db.select().from(schema.forumPosts).where(eq(schema.forumPosts.id, id)).limit(1);
      return posts[0];
    } catch (error) {
      console.error('Error getting forum post:', error);
      return undefined;
    }
  }

  async getForumPosts(forumId: number): Promise<ForumPost[]> {
    try {
      return await db
        .select()
        .from(schema.forumPosts)
        .where(eq(schema.forumPosts.forumId, forumId))
        .orderBy(desc(schema.forumPosts.createdAt));
    } catch (error) {
      console.error('Error getting forum posts:', error);
      return [];
    }
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    try {
      const result = await db.insert(schema.forumPosts).values(post).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating forum post:', error);
      throw error;
    }
  }

  async updateForumPost(id: number, data: Partial<ForumPost>): Promise<ForumPost> {
    try {
      const result = await db.update(schema.forumPosts)
        .set(data)
        .where(eq(schema.forumPosts.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating forum post:', error);
      throw error;
    }
  }

  async deleteForumPost(id: number): Promise<boolean> {
    try {
      await db.delete(schema.forumPosts).where(eq(schema.forumPosts.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting forum post:', error);
      return false;
    }
  }

  // Forum reply operations
  async getForumReply(id: number): Promise<ForumReply | undefined> {
    try {
      const replies = await db.select().from(schema.forumReplies).where(eq(schema.forumReplies.id, id)).limit(1);
      return replies[0];
    } catch (error) {
      console.error('Error getting forum reply:', error);
      return undefined;
    }
  }

  async getForumReplies(postId: number): Promise<ForumReply[]> {
    try {
      return await db
        .select()
        .from(schema.forumReplies)
        .where(eq(schema.forumReplies.postId, postId))
        .orderBy(schema.forumReplies.createdAt);
    } catch (error) {
      console.error('Error getting forum replies:', error);
      return [];
    }
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    try {
      const result = await db.insert(schema.forumReplies).values(reply).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating forum reply:', error);
      throw error;
    }
  }

  async updateForumReply(id: number, data: Partial<ForumReply>): Promise<ForumReply> {
    try {
      const result = await db.update(schema.forumReplies)
        .set(data)
        .where(eq(schema.forumReplies.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating forum reply:', error);
      throw error;
    }
  }

  async deleteForumReply(id: number): Promise<boolean> {
    try {
      await db.delete(schema.forumReplies).where(eq(schema.forumReplies.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting forum reply:', error);
      return false;
    }
  }

  // Zoom call operations
  async getZoomCall(id: number): Promise<ZoomCall | undefined> {
    try {
      const calls = await db.select().from(schema.zoomCalls).where(eq(schema.zoomCalls.id, id)).limit(1);
      return calls[0];
    } catch (error) {
      console.error('Error getting zoom call:', error);
      return undefined;
    }
  }

  async getZoomCalls(groupId?: number): Promise<ZoomCall[]> {
    try {
      if (groupId) {
        return await db
          .select()
          .from(schema.zoomCalls)
          .where(eq(schema.zoomCalls.groupId, groupId))
          .orderBy(schema.zoomCalls.startTime);
      }
      return await db
        .select()
        .from(schema.zoomCalls)
        .orderBy(schema.zoomCalls.startTime);
    } catch (error) {
      console.error('Error getting zoom calls:', error);
      return [];
    }
  }

  async getUpcomingZoomCalls(userId: number): Promise<ZoomCall[]> {
    try {
      const now = new Date();
      
      // Get calls from groups the user is a member of
      return await db
        .select({
          id: schema.zoomCalls.id,
          title: schema.zoomCalls.title,
          description: schema.zoomCalls.description,
          startTime: schema.zoomCalls.startTime,
          endTime: schema.zoomCalls.endTime,
          zoomLink: schema.zoomCalls.zoomLink,
          groupId: schema.zoomCalls.groupId,
          createdAt: schema.zoomCalls.createdAt
        })
        .from(schema.zoomCalls)
        .innerJoin(
          schema.groupMembers,
          eq(schema.zoomCalls.groupId, schema.groupMembers.groupId)
        )
        .where(
          and(
            eq(schema.groupMembers.userId, userId),
            gt(schema.zoomCalls.endTime, now)
          )
        )
        .orderBy(schema.zoomCalls.startTime);
    } catch (error) {
      console.error('Error getting upcoming zoom calls:', error);
      return [];
    }
  }

  async createZoomCall(call: InsertZoomCall): Promise<ZoomCall> {
    try {
      const result = await db.insert(schema.zoomCalls).values(call).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating zoom call:', error);
      throw error;
    }
  }

  async updateZoomCall(id: number, data: Partial<ZoomCall>): Promise<ZoomCall> {
    try {
      const result = await db.update(schema.zoomCalls)
        .set(data)
        .where(eq(schema.zoomCalls.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating zoom call:', error);
      throw error;
    }
  }

  async deleteZoomCall(id: number): Promise<boolean> {
    try {
      await db.delete(schema.zoomCalls).where(eq(schema.zoomCalls.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting zoom call:', error);
      return false;
    }
  }

  // Zoom call participant operations
  async addParticipantToCall(data: InsertZoomCallParticipant): Promise<ZoomCallParticipant> {
    try {
      const result = await db.insert(schema.zoomCallParticipants).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error adding participant to call:', error);
      throw error;
    }
  }

  async removeParticipantFromCall(userId: number, callId: number): Promise<boolean> {
    try {
      await db.delete(schema.zoomCallParticipants)
        .where(
          and(
            eq(schema.zoomCallParticipants.userId, userId),
            eq(schema.zoomCallParticipants.callId, callId)
          )
        );
      return true;
    } catch (error) {
      console.error('Error removing participant from call:', error);
      return false;
    }
  }

  async getCallParticipants(callId: number): Promise<User[]> {
    try {
      const result = await db
        .select({
          id: schema.users.id,
          username: schema.users.username,
          fullName: schema.users.fullName,
          email: schema.users.email,
          profileImage: schema.users.profileImage,
          isPremium: schema.users.isPremium,
          isAdmin: schema.users.isAdmin
        })
        .from(schema.users)
        .innerJoin(
          schema.zoomCallParticipants,
          eq(schema.users.id, schema.zoomCallParticipants.userId)
        )
        .where(eq(schema.zoomCallParticipants.callId, callId));
      
      return result;
    } catch (error) {
      console.error('Error getting call participants:', error);
      return [];
    }
  }
}

// Use the Drizzle ORM operators imported above

// Export the PostgreSQL storage instance
export const storage = new PostgresStorage();
