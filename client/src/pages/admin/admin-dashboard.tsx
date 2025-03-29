import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Loader2, 
  Search, 
  ChevronDown, 
  UserPlus, 
  Users, 
  MessageSquare, 
  Video, 
  Edit, 
  Trash2, 
  Plus, 
  Check, 
  X 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema for creating/editing forums
const forumSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  isPremium: z.boolean().default(false),
});

// Schema for creating/editing groups
const groupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  isPremium: z.boolean().default(false),
});

type ForumFormValues = z.infer<typeof forumSchema>;
type GroupFormValues = z.infer<typeof groupSchema>;

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [newForumDialogOpen, setNewForumDialogOpen] = useState(false);
  const [editForumDialogOpen, setEditForumDialogOpen] = useState(false);
  const [newGroupDialogOpen, setNewGroupDialogOpen] = useState(false);
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false);
  const [selectedForum, setSelectedForum] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // Redirect if user is not admin
  if (!user?.isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  // Fetch forums
  const { data: forums, isLoading: isLoadingForums } = useQuery({
    queryKey: ["/api/forums"],
    enabled: !!user?.isAdmin,
  });

  // Fetch groups
  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["/api/groups"],
    enabled: !!user?.isAdmin,
  });

  // Filter items based on search query
  const filteredUsers = users
    ? users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredForums = forums
    ? forums.filter(
        (forum) =>
          forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          forum.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredGroups = groups
    ? groups.filter(
        (group) =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Forum form
  const forumForm = useForm<ForumFormValues>({
    resolver: zodResolver(forumSchema),
    defaultValues: {
      title: "",
      description: "",
      isPremium: false,
    },
  });

  // Edit forum form
  const editForumForm = useForm<ForumFormValues>({
    resolver: zodResolver(forumSchema),
    defaultValues: {
      title: selectedForum?.title || "",
      description: selectedForum?.description || "",
      isPremium: selectedForum?.isPremium || false,
    },
  });

  // Group form
  const groupForm = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
      isPremium: false,
    },
  });

  // Edit group form
  const editGroupForm = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: selectedGroup?.name || "",
      description: selectedGroup?.description || "",
      isPremium: selectedGroup?.isPremium || false,
    },
  });

  // Update form values when selected item changes
  React.useEffect(() => {
    if (selectedForum) {
      editForumForm.reset({
        title: selectedForum.title,
        description: selectedForum.description,
        isPremium: selectedForum.isPremium,
      });
    }
  }, [selectedForum, editForumForm]);

  React.useEffect(() => {
    if (selectedGroup) {
      editGroupForm.reset({
        name: selectedGroup.name,
        description: selectedGroup.description,
        isPremium: selectedGroup.isPremium,
      });
    }
  }, [selectedGroup, editGroupForm]);

  // Create forum mutation
  const createForumMutation = useMutation({
    mutationFn: async (data: ForumFormValues) => {
      await apiRequest("POST", "/api/admin/forums", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forums"] });
      toast({
        title: "Forum created",
        description: "The forum has been created successfully.",
      });
      setNewForumDialogOpen(false);
      forumForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create forum",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit forum mutation
  const editForumMutation = useMutation({
    mutationFn: async (data: ForumFormValues) => {
      await apiRequest("PUT", `/api/admin/forums/${selectedForum.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forums"] });
      toast({
        title: "Forum updated",
        description: "The forum has been updated successfully.",
      });
      setEditForumDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update forum",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete forum mutation
  const deleteForumMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/forums/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forums"] });
      toast({
        title: "Forum deleted",
        description: "The forum has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete forum",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: GroupFormValues) => {
      await apiRequest("POST", "/api/admin/groups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Group created",
        description: "The group has been created successfully.",
      });
      setNewGroupDialogOpen(false);
      groupForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit group mutation
  const editGroupMutation = useMutation({
    mutationFn: async (data: GroupFormValues) => {
      await apiRequest("PUT", `/api/admin/groups/${selectedGroup.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Group updated",
        description: "The group has been updated successfully.",
      });
      setEditGroupDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Group deleted",
        description: "The group has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/admin/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User updated",
        description: "The user has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onCreateForumSubmit = (data: ForumFormValues) => {
    createForumMutation.mutate(data);
  };

  const onEditForumSubmit = (data: ForumFormValues) => {
    editForumMutation.mutate(data);
  };

  const onCreateGroupSubmit = (data: GroupFormValues) => {
    createGroupMutation.mutate(data);
  };

  const onEditGroupSubmit = (data: GroupFormValues) => {
    editGroupMutation.mutate(data);
  };

  const handleDeleteForum = (id: number) => {
    if (window.confirm("Are you sure you want to delete this forum? This action cannot be undone.")) {
      deleteForumMutation.mutate(id);
    }
  };

  const handleDeleteGroup = (id: number) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      deleteGroupMutation.mutate(id);
    }
  };

  const handleToggleUserPremium = (user: any) => {
    updateUserMutation.mutate({
      id: user.id,
      data: {
        isPremium: !user.isPremium,
        premiumUntil: !user.isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    });
  };

  const handleToggleUserAdmin = (user: any) => {
    updateUserMutation.mutate({
      id: user.id,
      data: {
        isAdmin: !user.isAdmin,
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
          <p className="text-neutral-600">Manage users, forums, groups, and Zoom calls</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={18} />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="users" className="mb-8">
          <TabsList className="mb-8">
            <TabsTrigger value="users" className="flex items-center">
              <Users size={16} className="mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger value="forums" className="flex items-center">
              <MessageSquare size={16} className="mr-2" /> Forums
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center">
              <Users size={16} className="mr-2" /> Groups
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">User Management</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-600">
                    {filteredUsers?.length || 0} users
                  </span>
                </div>
              </div>

              {isLoadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profileImage} />
                                <AvatarFallback>
                                  {user.fullName
                                    ? `${user.fullName.split(" ")[0][0]}${
                                        user.fullName.split(" ")[1]?.[0] || ""
                                      }`
                                    : user.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.fullName || user.username}</p>
                                <p className="text-sm text-neutral-500">@{user.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Switch
                              checked={user.isPremium}
                              onCheckedChange={() => handleToggleUserPremium(user)}
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={user.isAdmin}
                              onCheckedChange={() => handleToggleUserAdmin(user)}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No users found</h3>
                  <p className="text-neutral-600">Try a different search term</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Forums Tab */}
          <TabsContent value="forums">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Forum Management</h2>
                <Button onClick={() => setNewForumDialogOpen(true)}>
                  <Plus size={16} className="mr-2" /> New Forum
                </Button>
              </div>

              {isLoadingForums ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredForums && filteredForums.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Forum</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredForums.map((forum) => (
                        <TableRow key={forum.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{forum.title}</p>
                              <p className="text-sm text-neutral-500 truncate max-w-[300px]">
                                {forum.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {forum.isPremium ? (
                              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400">
                                Premium
                              </Badge>
                            ) : (
                              <Badge variant="outline">Public</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(forum.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedForum(forum);
                                  setEditForumDialogOpen(true);
                                }}
                              >
                                <Edit size={14} className="mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteForum(forum.id)}
                              >
                                <Trash2 size={14} className="mr-1" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No forums found</h3>
                  <p className="text-neutral-600 mb-4">
                    {searchQuery ? "Try a different search term" : "Create your first forum"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setNewForumDialogOpen(true)}>
                      <Plus size={16} className="mr-2" /> New Forum
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Group Management</h2>
                <Button onClick={() => setNewGroupDialogOpen(true)}>
                  <Plus size={16} className="mr-2" /> New Group
                </Button>
              </div>

              {isLoadingGroups ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredGroups && filteredGroups.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGroups.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{group.name}</p>
                              <p className="text-sm text-neutral-500 truncate max-w-[300px]">
                                {group.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {group.isPremium ? (
                              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400">
                                Premium
                              </Badge>
                            ) : (
                              <Badge variant="outline">Public</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(group.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedGroup(group);
                                  setEditGroupDialogOpen(true);
                                }}
                              >
                                <Edit size={14} className="mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteGroup(group.id)}
                              >
                                <Trash2 size={14} className="mr-1" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No groups found</h3>
                  <p className="text-neutral-600 mb-4">
                    {searchQuery ? "Try a different search term" : "Create your first group"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setNewGroupDialogOpen(true)}>
                      <Plus size={16} className="mr-2" /> New Group
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      {/* Create Forum Dialog */}
      <Dialog open={newForumDialogOpen} onOpenChange={setNewForumDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Forum</DialogTitle>
            <DialogDescription>
              Create a new forum for discussions on Silver Circles
            </DialogDescription>
          </DialogHeader>

          <Form {...forumForm}>
            <form onSubmit={forumForm.handleSubmit(onCreateForumSubmit)} className="space-y-4">
              <FormField
                control={forumForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter forum title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={forumForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter forum description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={forumForm.control}
                name="isPremium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Premium Forum</FormLabel>
                      <FormDescription>
                        Make this forum exclusive to premium members
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewForumDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createForumMutation.isPending}
                >
                  {createForumMutation.isPending ? "Creating..." : "Create Forum"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Forum Dialog */}
      <Dialog open={editForumDialogOpen} onOpenChange={setEditForumDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Forum</DialogTitle>
            <DialogDescription>
              Update the forum information
            </DialogDescription>
          </DialogHeader>

          <Form {...editForumForm}>
            <form onSubmit={editForumForm.handleSubmit(onEditForumSubmit)} className="space-y-4">
              <FormField
                control={editForumForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter forum title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForumForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter forum description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForumForm.control}
                name="isPremium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Premium Forum</FormLabel>
                      <FormDescription>
                        Make this forum exclusive to premium members
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditForumDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editForumMutation.isPending}
                >
                  {editForumMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={newGroupDialogOpen} onOpenChange={setNewGroupDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a new group for members on Silver Circles
            </DialogDescription>
          </DialogHeader>

          <Form {...groupForm}>
            <form onSubmit={groupForm.handleSubmit(onCreateGroupSubmit)} className="space-y-4">
              <FormField
                control={groupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={groupForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter group description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={groupForm.control}
                name="isPremium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Premium Group</FormLabel>
                      <FormDescription>
                        Make this group exclusive to premium members
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewGroupDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createGroupMutation.isPending}
                >
                  {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={editGroupDialogOpen} onOpenChange={setEditGroupDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update the group information
            </DialogDescription>
          </DialogHeader>

          <Form {...editGroupForm}>
            <form onSubmit={editGroupForm.handleSubmit(onEditGroupSubmit)} className="space-y-4">
              <FormField
                control={editGroupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editGroupForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter group description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editGroupForm.control}
                name="isPremium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Premium Group</FormLabel>
                      <FormDescription>
                        Make this group exclusive to premium members
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditGroupDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editGroupMutation.isPending}
                >
                  {editGroupMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
