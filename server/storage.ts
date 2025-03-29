import { 
  users, type User, type InsertUser,
  groups, type Group, type InsertGroup,
  groupMembers, type GroupMember, type InsertGroupMember,
  forums, type Forum, type InsertForum,
  forumPosts, type ForumPost, type InsertForumPost,
  forumReplies, type ForumReply, type InsertForumReply,
  zoomCalls, type ZoomCall, type InsertZoomCall,
  zoomCallParticipants, type ZoomCallParticipant, type InsertZoomCallParticipant
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

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
  sessionStore: session.SessionStore;
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
  
  sessionStore: session.SessionStore;

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

export const storage = new MemStorage();
