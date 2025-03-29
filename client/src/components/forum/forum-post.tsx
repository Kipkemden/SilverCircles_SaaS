import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: number;
  username: string;
  fullName?: string;
  profileImage?: string;
}

interface PostProps {
  post: {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    user?: User;
    replyCount?: number;
  };
  onClick?: () => void;
}

export function ForumPost({ post, onClick }: PostProps) {
  return (
    <Card 
      className="p-4 hover:border-primary cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-neutral-800">{post.title}</h3>
        <span className="text-neutral-500 text-sm">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-neutral-700 mb-3 line-clamp-3">{post.content}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center text-neutral-600 text-sm">
          <span className="flex items-center mr-4">
            <MessageSquare size={14} className="mr-1" /> {post.replyCount || 0} replies
          </span>
          <span className="flex items-center">
            <Eye size={14} className="mr-1" /> 126 views
          </span>
        </div>
        {post.user && (
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={post.user.profileImage} />
              <AvatarFallback>
                {post.user.fullName 
                  ? `${post.user.fullName.split(' ')[0][0]}${post.user.fullName.split(' ')[1]?.[0] || ''}`
                  : post.user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-neutral-700">
              {post.user.fullName || post.user.username}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

interface ReplyProps {
  reply: {
    id: number;
    content: string;
    createdAt: string;
    user?: User;
  };
}

export function ForumReply({ reply }: ReplyProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start mb-3">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={reply.user?.profileImage} />
          <AvatarFallback>
            {reply.user?.fullName 
              ? `${reply.user.fullName.split(' ')[0][0]}${reply.user.fullName.split(' ')[1]?.[0] || ''}`
              : reply.user?.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between">
            <span className="font-medium text-neutral-800">
              {reply.user?.fullName || reply.user?.username}
            </span>
            <span className="text-neutral-500 text-sm">
              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-neutral-700 mt-1">{reply.content}</p>
        </div>
      </div>
    </Card>
  );
}

export function EmptyPostsList() {
  return (
    <div className="text-center py-12">
      <MessageSquare className="mx-auto h-12 w-12 text-neutral-400" />
      <h3 className="mt-4 text-lg font-medium text-neutral-700">No posts yet</h3>
      <p className="text-neutral-500 mt-1">Be the first to start a conversation!</p>
      <Button className="mt-4">Create Post</Button>
    </div>
  );
}
