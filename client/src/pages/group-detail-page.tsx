import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Lock, Users, Video, Calendar, Clock } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { ZoomCallCard } from "@/components/events/zoom-call-card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GroupWithMembers, ZoomCallWithGroup, User } from "@shared/schema";

// New Zoom call schema
const zoomCallSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  zoomLink: z.string().url("Please enter a valid Zoom link"),
});

type ZoomCallValues = z.infer<typeof zoomCallSchema>;

export default function GroupDetailPage() {
  const [_, params] = useRoute("/groups/:id");
  const groupId = params ? parseInt(params.id) : null;
  const { user } = useAuth();
  const { toast } = useToast();
  const [newCallDialogOpen, setNewCallDialogOpen] = useState(false);
  
  // Group details query
  const { data: group, isLoading: isLoadingGroup } = useQuery<GroupWithMembers>({
    queryKey: [`/api/groups/${groupId}`],
    enabled: !!groupId,
  });
  
  // Group zoom calls query
  const { data: calls, isLoading: isLoadingCalls } = useQuery<ZoomCallWithGroup[]>({
    queryKey: [`/api/groups/${groupId}/zoom-calls`],
    enabled: !!groupId && !!user,
  });
  
  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/groups/${groupId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/groups"] });
      toast({
        title: "Success!",
        description: `You've joined the group`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join group",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/groups/${groupId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/groups"] });
      toast({
        title: "Left group",
        description: `You've left the group`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to leave group",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create zoom call mutation
  const createZoomCallMutation = useMutation({
    mutationFn: async (data: ZoomCallValues) => {
      await apiRequest("POST", `/api/groups/${groupId}/zoom-calls`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/zoom-calls`] });
      toast({
        title: "Zoom call scheduled",
        description: "Your Zoom call has been scheduled successfully.",
      });
      setNewCallDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule Zoom call",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form setup
  const zoomCallForm = useForm<ZoomCallValues>({
    resolver: zodResolver(zoomCallSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(Date.now() + 25 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      zoomLink: "",
    },
  });
  
  const onZoomCallSubmit = (data: ZoomCallValues) => {
    createZoomCallMutation.mutate(data);
  };
  
  const handleJoinGroup = () => {
    joinGroupMutation.mutate();
  };
  
  const handleLeaveGroup = () => {
    leaveGroupMutation.mutate();
  };
  
  // Check if user is a member of the group
  const isUserMember = group?.members?.some((member: User) => member.id === user?.id);
  
  // Check if this is a premium group and user doesn't have premium
  const isPremiumAndNotSubscribed = group?.isPremium && !user?.isPremium;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isLoadingGroup ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-white rounded w-3/4"></div>
                <div className="h-6 bg-white rounded w-1/2"></div>
              </div>
            ) : group ? (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <Link href="/groups" className="text-neutral-500 hover:text-primary flex items-center mr-3">
                    <ChevronLeft size={18} />
                    <span>Back to Groups</span>
                  </Link>
                </div>
                
                <Card className="p-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <h1 className="text-3xl font-serif font-bold mr-3">{group.name}</h1>
                        {group.isPremium && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-neutral-700">{group.description}</p>
                    </div>
                    
                    {!isPremiumAndNotSubscribed && (
                      <div>
                        {isUserMember ? (
                          <Button 
                            variant="outline" 
                            onClick={handleLeaveGroup}
                            disabled={leaveGroupMutation.isPending}
                          >
                            {leaveGroupMutation.isPending ? "Leaving..." : "Leave Group"}
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleJoinGroup}
                            disabled={joinGroupMutation.isPending}
                          >
                            {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-neutral-600 mb-6">
                    <Users size={16} className="mr-2" />
                    <span>{group.members?.length || 0} members</span>
                  </div>
                  
                  {group.members && group.members.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-3">Group Members</h3>
                      <div className="flex flex-wrap gap-4">
                        {group.members.map((member: User) => (
                          <div key={member.id} className="flex flex-col items-center">
                            <Avatar className="h-12 w-12 mb-1">
                              {member.profileImage && <AvatarImage src={member.profileImage} />}
                              <AvatarFallback>
                                {member.fullName 
                                  ? `${member.fullName.split(' ')[0][0]}${member.fullName.split(' ')[1]?.[0] || ''}`
                                  : member.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-neutral-700">{member.fullName || member.username}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
                
                {isPremiumAndNotSubscribed ? (
                  <div className="bg-white rounded-xl p-6 border border-yellow-300 mb-6">
                    <div className="flex items-start">
                      <Lock className="h-8 w-8 text-yellow-500 mr-3 mt-1" />
                      <div>
                        <h3 className="text-lg font-bold mb-2">Premium Group</h3>
                        <p className="text-neutral-700 mb-4">
                          This is a premium group. Upgrade to join and participate in discussions and Zoom calls.
                        </p>
                        <Link href="/subscription">
                          <Button className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500">
                            Upgrade to Premium
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : isUserMember ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Upcoming Zoom Calls</h2>
                      <Button onClick={() => setNewCallDialogOpen(true)}>
                        <Calendar size={16} className="mr-2" />
                        Schedule Call
                      </Button>
                    </div>
                    
                    {isLoadingCalls ? (
                      <div className="space-y-4">
                        <div className="h-32 bg-white animate-pulse rounded-xl"></div>
                        <div className="h-32 bg-white animate-pulse rounded-xl"></div>
                      </div>
                    ) : calls && calls.length > 0 ? (
                      <div className="space-y-4">
                        {calls.map((call) => (
                          <ZoomCallCard key={call.id} call={{
                            id: call.id,
                            title: call.title,
                            description: call.description || undefined,
                            startTime: call.startTime.toString(),
                            endTime: call.endTime.toString(),
                            zoomLink: call.zoomLink,
                            groupId: call.groupId,
                            group: call.group ? {
                              id: call.group.id,
                              name: call.group.name
                            } : undefined,
                          }} />
                        ))}
                      </div>
                    ) : (
                      <Card className="p-6 text-center">
                        <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Upcoming Calls</h3>
                        <p className="text-neutral-600 mb-6">
                          There are no upcoming Zoom calls scheduled for this group yet.
                        </p>
                        <Button onClick={() => setNewCallDialogOpen(true)}>
                          Schedule a Call
                        </Button>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card className="p-6 text-center">
                    <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Join to See More</h3>
                    <p className="text-neutral-600 mb-6">
                      Join this group to access Zoom calls and interact with other members.
                    </p>
                    <Button onClick={handleJoinGroup} disabled={joinGroupMutation.isPending}>
                      {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
                    </Button>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-bold text-neutral-800 mb-2">Group not found</h2>
                <p className="text-neutral-600 mb-6">The group you're looking for doesn't exist or you don't have permission to view it.</p>
                <Link href="/groups">
                  <Button>Back to Groups</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <DashboardSidebar />
          </div>
        </div>
      </main>
      <Footer />
      
      {/* New Zoom Call Dialog */}
      <Dialog open={newCallDialogOpen} onOpenChange={setNewCallDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Zoom Call</DialogTitle>
            <DialogDescription>
              Schedule a new Zoom call for the {group?.name} group
            </DialogDescription>
          </DialogHeader>
          
          <Form {...zoomCallForm}>
            <form onSubmit={zoomCallForm.handleSubmit(onZoomCallSubmit)} className="space-y-4">
              <FormField
                control={zoomCallForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for the call" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={zoomCallForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter a description for the call" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={zoomCallForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={zoomCallForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={zoomCallForm.control}
                name="zoomLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zoom Link</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the Zoom meeting link" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewCallDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createZoomCallMutation.isPending}
                >
                  {createZoomCallMutation.isPending ? "Scheduling..." : "Schedule Call"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
