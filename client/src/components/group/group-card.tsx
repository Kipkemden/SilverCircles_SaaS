import React from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GroupCardProps {
  group: {
    id: number;
    name: string;
    description?: string;
    isPremium: boolean;
    memberCount?: number;
    members?: Array<{
      id: number;
      username: string;
      fullName?: string;
      profileImage?: string;
    }>;
  };
  showJoinButton?: boolean;
  className?: string;
}

export function GroupCard({ group, showJoinButton = false, className = "" }: GroupCardProps) {
  const { toast } = useToast();
  
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/groups/${group.id}/join`);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `You've joined the ${group.name} group`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/suggested-groups"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join group",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    joinGroupMutation.mutate();
  };
  
  return (
    <Card className={`p-4 hover:border-primary transition ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-neutral-800">{group.name}</h3>
        {group.isPremium && (
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500">
            Premium
          </Badge>
        )}
      </div>
      
      {group.description && (
        <p className="text-neutral-600 text-sm mb-3 line-clamp-2">{group.description}</p>
      )}
      
      <div className="flex items-center text-neutral-600 mb-3 text-sm">
        <Users size={14} className="mr-2" />
        <span>{group.memberCount || group.members?.length || 0} members</span>
      </div>
      
      {group.members && group.members.length > 0 && (
        <div className="flex -space-x-2 mb-3">
          {group.members.slice(0, 3).map((member) => (
            <Avatar key={member.id} className="w-8 h-8 border-2 border-white">
              <AvatarImage src={member.profileImage} />
              <AvatarFallback>
                {member.fullName 
                  ? `${member.fullName.split(' ')[0][0]}${member.fullName.split(' ')[1]?.[0] || ''}`
                  : member.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {group.members.length > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600">
              +{group.members.length - 3}
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        {showJoinButton ? (
          <Button 
            size="sm" 
            className="w-full" 
            onClick={handleJoin}
            disabled={joinGroupMutation.isPending}
          >
            {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
          </Button>
        ) : (
          <Link href={`/groups/${group.id}`}>
            <a className="text-primary hover:text-primary-dark text-sm font-medium">
              Open Group
            </a>
          </Link>
        )}
      </div>
    </Card>
  );
}
