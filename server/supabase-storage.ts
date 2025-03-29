import { supabase } from './supabase';
import type {
  User, Group, GroupMember, Forum, ForumPost, ForumReply, ZoomCall, ZoomCallParticipant,
  InsertUser, InsertGroup, InsertGroupMember, InsertForum, InsertForumPost, InsertForumReply, InsertZoomCall, InsertZoomCallParticipant
} from '@shared/schema';
import session from "express-session";
import connectPg from "connect-pg-simple";
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@shared/schema';
import { db } from './db';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  getUserBySupabaseId(supabaseId: string): Promise<User | undefined>;
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

// Using the supabase client for database operations
export class SupabaseStorage implements IStorage {
  private db: PostgresJsDatabase<typeof schema>;
  sessionStore: session.Store;

  constructor() {
    this.db = db;
    const PostgresStore = connectPg(session);
    
    // Extract the connection string for session store
    const projectRef = process.env.SUPABASE_URL?.match(/https:\/\/(.*?)\.supabase\.co/)?.[1];
    const dbUrl = `postgresql://postgres:${process.env.SUPABASE_SERVICE_KEY}@db.${projectRef}.supabase.co:5432/postgres`;
    
    this.sessionStore = new PostgresStore({
      conString: dbUrl,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapUserFromSupabase(data);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapUserFromSupabase(data);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapUserFromSupabase(data);
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapUserFromSupabase(data);
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('password_reset_token', token)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapUserFromSupabase(data);
  }

  async getUserBySupabaseId(supabaseId: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('supabase_id', supabaseId)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapUserFromSupabase(data);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: insertUser.username,
        password: insertUser.password,
        email: insertUser.email,
        full_name: insertUser.fullName,
        about_me: insertUser.aboutMe || null,
        profile_image: insertUser.profileImage || null,
        is_verified: insertUser.isVerified || false,
        verification_token: insertUser.verificationToken || null,
        password_reset_token: insertUser.passwordResetToken || null,
        supabase_id: insertUser.supabaseId || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create user');
    
    return this.mapUserFromSupabase(data);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    // Convert from camelCase to snake_case for Supabase
    const updateData: Record<string, any> = {};
    
    if (userData.username !== undefined) updateData.username = userData.username;
    if (userData.password !== undefined) updateData.password = userData.password;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.fullName !== undefined) updateData.full_name = userData.fullName;
    if (userData.isPremium !== undefined) updateData.is_premium = userData.isPremium;
    if (userData.premiumUntil !== undefined) updateData.premium_until = userData.premiumUntil;
    if (userData.stripeCustomerId !== undefined) updateData.stripe_customer_id = userData.stripeCustomerId;
    if (userData.stripeSubscriptionId !== undefined) updateData.stripe_subscription_id = userData.stripeSubscriptionId;
    if (userData.aboutMe !== undefined) updateData.about_me = userData.aboutMe;
    if (userData.profileImage !== undefined) updateData.profile_image = userData.profileImage;
    if (userData.isAdmin !== undefined) updateData.is_admin = userData.isAdmin;
    if (userData.isVerified !== undefined) updateData.is_verified = userData.isVerified;
    if (userData.verificationToken !== undefined) updateData.verification_token = userData.verificationToken;
    if (userData.verificationTokenExpiry !== undefined) updateData.verification_token_expiry = userData.verificationTokenExpiry;
    if (userData.passwordResetToken !== undefined) updateData.password_reset_token = userData.passwordResetToken;
    if (userData.passwordResetExpiry !== undefined) updateData.password_reset_expiry = userData.passwordResetExpiry;
    if (userData.supabaseId !== undefined) updateData.supabase_id = userData.supabaseId;
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error(`User with ID ${id} not found`);
    
    return this.mapUserFromSupabase(data);
  }

  async updateUserPremiumStatus(id: number, isPremium: boolean, premiumUntil?: Date): Promise<User> {
    const updateData: Record<string, any> = {
      is_premium: isPremium,
      premium_until: premiumUntil || null
    };
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error(`User with ID ${id} not found`);
    
    return this.mapUserFromSupabase(data);
  }

  async updateUserStripeInfo(id: number, stripeData: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        stripe_customer_id: stripeData.stripeCustomerId,
        stripe_subscription_id: stripeData.stripeSubscriptionId
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error(`User with ID ${id} not found`);
    
    return this.mapUserFromSupabase(data);
  }

  async getGroup(id: number): Promise<Group | undefined> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapGroupFromSupabase(data);
  }

  async getGroups(isPremium?: boolean): Promise<Group[]> {
    let query = supabase.from('groups').select('*');
    
    if (isPremium !== undefined) {
      query = query.eq('is_premium', isPremium);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(this.mapGroupFromSupabase);
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: group.name,
        description: group.description,
        is_premium: group.isPremium || false
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create group');
    
    return this.mapGroupFromSupabase(data);
  }

  async updateGroup(id: number, groupData: Partial<Group>): Promise<Group> {
    const updateData: Record<string, any> = {};
    
    if (groupData.name !== undefined) updateData.name = groupData.name;
    if (groupData.description !== undefined) updateData.description = groupData.description;
    if (groupData.isPremium !== undefined) updateData.is_premium = groupData.isPremium;
    
    const { data, error } = await supabase
      .from('groups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error(`Group with ID ${id} not found`);
    
    return this.mapGroupFromSupabase(data);
  }

  async deleteGroup(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  }

  async getUserGroups(userId: number): Promise<Group[]> {
    const { data, error } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    const groupIds = data.map(member => member.group_id);
    
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds);
    
    if (groupsError) throw groupsError;
    
    return (groups || []).map(this.mapGroupFromSupabase);
  }

  async getSuggestedGroups(userId: number, limit: number = 5): Promise<Group[]> {
    // Get user's current groups
    const userGroups = await this.getUserGroups(userId);
    const userGroupIds = userGroups.map(group => group.id);
    
    // Fetch groups the user is not a part of
    let query = supabase.from('groups').select('*');
    
    if (userGroupIds.length > 0) {
      query = query.not('id', 'in', `(${userGroupIds.join(',')})`);
    }
    
    const { data, error } = await query.limit(limit);
    
    if (error) throw error;
    
    return (data || []).map(this.mapGroupFromSupabase);
  }

  async addUserToGroup(data: InsertGroupMember): Promise<GroupMember> {
    const { data: newMember, error } = await supabase
      .from('group_members')
      .insert({
        user_id: data.userId,
        group_id: data.groupId
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!newMember) throw new Error('Failed to add user to group');
    
    return this.mapGroupMemberFromSupabase(newMember);
  }

  async removeUserFromGroup(userId: number, groupId: number): Promise<boolean> {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('user_id', userId)
      .eq('group_id', groupId);
    
    if (error) throw error;
    
    return true;
  }

  async getGroupMembers(groupId: number): Promise<User[]> {
    const { data, error } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    const userIds = data.map(member => member.user_id);
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, full_name, email, profile_image, is_premium, is_admin')
      .in('id', userIds);
    
    if (usersError) throw usersError;
    
    return (users || []).map(userData => ({
      id: userData.id,
      username: userData.username,
      fullName: userData.full_name,
      email: userData.email,
      profileImage: userData.profile_image,
      isPremium: userData.is_premium,
      isAdmin: userData.is_admin,
      // Other fields will be provided by PostgresStorage type guarantee, but not needed by this method
      password: '',
      premiumUntil: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      aboutMe: null,
      isVerified: false,
      verificationToken: null,
      verificationTokenExpiry: null,
      passwordResetToken: null,
      passwordResetExpiry: null,
      supabaseId: null,
      createdAt: new Date()
    }));
  }

  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('group_members')
      .select('id')
      .eq('user_id', userId)
      .eq('group_id', groupId)
      .limit(1);
    
    if (error) throw error;
    
    return data !== null && data.length > 0;
  }

  async getForum(id: number): Promise<Forum | undefined> {
    const { data, error } = await supabase
      .from('forums')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapForumFromSupabase(data);
  }

  async getForums(isPremium?: boolean): Promise<Forum[]> {
    let query = supabase.from('forums').select('*');
    
    if (isPremium !== undefined) {
      query = query.eq('is_premium', isPremium);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(this.mapForumFromSupabase);
  }

  async createForum(forum: InsertForum): Promise<Forum> {
    const { data, error } = await supabase
      .from('forums')
      .insert({
        title: forum.title,
        description: forum.description,
        is_premium: forum.isPremium || false
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create forum');
    
    return this.mapForumFromSupabase(data);
  }

  async updateForum(id: number, forumData: Partial<Forum>): Promise<Forum> {
    const updateData: Record<string, any> = {};
    
    if (forumData.title !== undefined) updateData.title = forumData.title;
    if (forumData.description !== undefined) updateData.description = forumData.description;
    if (forumData.isPremium !== undefined) updateData.is_premium = forumData.isPremium;
    
    const { data, error } = await supabase
      .from('forums')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error(`Forum with ID ${id} not found`);
    
    return this.mapForumFromSupabase(data);
  }

  async deleteForum(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('forums')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  }

  async getForumPost(id: number): Promise<ForumPost | undefined> {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapForumPostFromSupabase(data);
  }

  async getForumPosts(forumId: number): Promise<ForumPost[]> {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('forum_id', forumId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(this.mapForumPostFromSupabase);
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        forum_id: post.forumId,
        user_id: post.userId,
        title: post.title,
        content: post.content
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create forum post');
    
    return this.mapForumPostFromSupabase(data);
  }

  async updateForumPost(id: number, postData: Partial<ForumPost>): Promise<ForumPost> {
    const updateData: Record<string, any> = {};
    
    if (postData.title !== undefined) updateData.title = postData.title;
    if (postData.content !== undefined) updateData.content = postData.content;
    
    const { data, error } = await supabase
      .from('forum_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error(`Forum post with ID ${id} not found`);
    
    return this.mapForumPostFromSupabase(data);
  }

  async deleteForumPost(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  }

  async getForumReply(id: number): Promise<ForumReply | undefined> {
    const { data, error } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapForumReplyFromSupabase(data);
  }

  async getForumReplies(postId: number): Promise<ForumReply[]> {
    const { data, error } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(this.mapForumReplyFromSupabase);
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const { data, error } = await supabase
      .from('forum_replies')
      .insert({
        post_id: reply.postId,
        user_id: reply.userId,
        content: reply.content
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create forum reply');
    
    return this.mapForumReplyFromSupabase(data);
  }

  async updateForumReply(id: number, replyData: Partial<ForumReply>): Promise<ForumReply> {
    const updateData: Record<string, any> = {};
    
    if (replyData.content !== undefined) updateData.content = replyData.content;
    
    const { data, error } = await supabase
      .from('forum_replies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error(`Forum reply with ID ${id} not found`);
    
    return this.mapForumReplyFromSupabase(data);
  }

  async deleteForumReply(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('forum_replies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  }

  async getZoomCall(id: number): Promise<ZoomCall | undefined> {
    const { data, error } = await supabase
      .from('zoom_calls')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    return this.mapZoomCallFromSupabase(data);
  }

  async getZoomCalls(groupId?: number): Promise<ZoomCall[]> {
    let query = supabase.from('zoom_calls').select('*');
    
    if (groupId !== undefined) {
      query = query.eq('group_id', groupId);
    }
    
    const { data, error } = await query.order('start_time', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(this.mapZoomCallFromSupabase);
  }

  async getUpcomingZoomCalls(userId: number): Promise<ZoomCall[]> {
    // First get the groups the user is a member of
    const userGroups = await this.getUserGroups(userId);
    
    if (userGroups.length === 0) {
      return [];
    }
    
    const groupIds = userGroups.map(group => group.id);
    
    // Get upcoming calls for those groups
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('zoom_calls')
      .select('*')
      .in('group_id', groupIds)
      .gte('start_time', now)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(this.mapZoomCallFromSupabase);
  }

  async createZoomCall(call: InsertZoomCall): Promise<ZoomCall> {
    const { data, error } = await supabase
      .from('zoom_calls')
      .insert({
        group_id: call.groupId,
        title: call.title,
        description: call.description || null,
        start_time: call.startTime.toISOString(),
        end_time: call.endTime.toISOString(),
        zoom_link: call.zoomLink
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create Zoom call');
    
    return this.mapZoomCallFromSupabase(data);
  }

  async updateZoomCall(id: number, callData: Partial<ZoomCall>): Promise<ZoomCall> {
    const updateData: Record<string, any> = {};
    
    if (callData.title !== undefined) updateData.title = callData.title;
    if (callData.description !== undefined) updateData.description = callData.description;
    if (callData.startTime !== undefined) updateData.start_time = callData.startTime.toISOString();
    if (callData.endTime !== undefined) updateData.end_time = callData.endTime.toISOString();
    if (callData.zoomLink !== undefined) updateData.zoom_link = callData.zoomLink;
    
    const { data, error } = await supabase
      .from('zoom_calls')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error(`Zoom call with ID ${id} not found`);
    
    return this.mapZoomCallFromSupabase(data);
  }

  async deleteZoomCall(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('zoom_calls')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  }

  async addParticipantToCall(data: InsertZoomCallParticipant): Promise<ZoomCallParticipant> {
    const { data: newParticipant, error } = await supabase
      .from('zoom_call_participants')
      .insert({
        call_id: data.callId,
        user_id: data.userId
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!newParticipant) throw new Error('Failed to add participant to call');
    
    return this.mapZoomCallParticipantFromSupabase(newParticipant);
  }

  async removeParticipantFromCall(userId: number, callId: number): Promise<boolean> {
    const { error } = await supabase
      .from('zoom_call_participants')
      .delete()
      .eq('user_id', userId)
      .eq('call_id', callId);
    
    if (error) throw error;
    
    return true;
  }

  async getCallParticipants(callId: number): Promise<User[]> {
    const { data, error } = await supabase
      .from('zoom_call_participants')
      .select('user_id')
      .eq('call_id', callId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    const userIds = data.map(participant => participant.user_id);
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, full_name, email, profile_image, is_premium, is_admin')
      .in('id', userIds);
    
    if (usersError) throw usersError;
    
    return (users || []).map(userData => ({
      id: userData.id,
      username: userData.username,
      fullName: userData.full_name,
      email: userData.email,
      profileImage: userData.profile_image,
      isPremium: userData.is_premium,
      isAdmin: userData.is_admin,
      // Other fields will be provided by PostgresStorage type guarantee, but not needed by this method
      password: '',
      premiumUntil: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      aboutMe: null,
      isVerified: false,
      verificationToken: null,
      verificationTokenExpiry: null,
      passwordResetToken: null,
      passwordResetExpiry: null,
      supabaseId: null,
      createdAt: new Date()
    }));
  }

  // Helper methods to map database rows to TypeScript types
  private mapUserFromSupabase(data: any): User {
    return {
      id: data.id,
      username: data.username,
      password: data.password,
      email: data.email,
      fullName: data.full_name,
      isPremium: data.is_premium,
      premiumUntil: data.premium_until ? new Date(data.premium_until) : null,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      aboutMe: data.about_me,
      profileImage: data.profile_image,
      isAdmin: data.is_admin,
      isVerified: data.is_verified,
      verificationToken: data.verification_token,
      verificationTokenExpiry: data.verification_token_expiry ? new Date(data.verification_token_expiry) : null,
      passwordResetToken: data.password_reset_token,
      passwordResetExpiry: data.password_reset_expiry ? new Date(data.password_reset_expiry) : null,
      supabaseId: data.supabase_id,
      createdAt: new Date(data.created_at)
    };
  }

  private mapGroupFromSupabase(data: any): Group {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      isPremium: data.is_premium,
      createdAt: new Date(data.created_at)
    };
  }

  private mapGroupMemberFromSupabase(data: any): GroupMember {
    return {
      id: data.id,
      userId: data.user_id,
      groupId: data.group_id,
      joinedAt: new Date(data.joined_at)
    };
  }

  private mapForumFromSupabase(data: any): Forum {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      isPremium: data.is_premium,
      createdAt: new Date(data.created_at)
    };
  }

  private mapForumPostFromSupabase(data: any): ForumPost {
    return {
      id: data.id,
      forumId: data.forum_id,
      userId: data.user_id,
      title: data.title,
      content: data.content,
      createdAt: new Date(data.created_at)
    };
  }

  private mapForumReplyFromSupabase(data: any): ForumReply {
    return {
      id: data.id,
      postId: data.post_id,
      userId: data.user_id,
      content: data.content,
      createdAt: new Date(data.created_at)
    };
  }

  private mapZoomCallFromSupabase(data: any): ZoomCall {
    return {
      id: data.id,
      groupId: data.group_id,
      title: data.title,
      description: data.description,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      zoomLink: data.zoom_link,
      createdAt: new Date(data.created_at)
    };
  }

  private mapZoomCallParticipantFromSupabase(data: any): ZoomCallParticipant {
    return {
      id: data.id,
      callId: data.call_id,
      userId: data.user_id,
      joinedAt: new Date(data.joined_at)
    };
  }
}

export const storage = new SupabaseStorage();