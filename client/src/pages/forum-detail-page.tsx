import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ForumPost, ForumReply, EmptyPostsList } from "@/components/forum/forum-post";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Lock, MessageSquare } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// New post schema
const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

// Reply schema
const replySchema = z.object({
  content: z.string().min(3, "Reply must be at least 3 characters"),
});

type PostValues = z.infer<typeof postSchema>;
type ReplyValues = z.infer<typeof replySchema>;

export default function ForumDetailPage() {
  const [_, params] = useRoute("/forums/:id");
  const forumId = params ? parseInt(params.id) : null;
  const { user } = useAuth();
  const { toast } = useToast();
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [newReply, setNewReply] = useState("");

  // Forum details query
  const { data: forum, isLoading: isLoadingForum } = useQuery({
    queryKey: [`/api/forums/${forumId}`],
    enabled: !!forumId,
  });

  // Posts query
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: [`/api/forums/${forumId}/posts`],
    enabled: !!forumId,
  });

  // Selected post replies query
  const { data: replies, isLoading: isLoadingReplies } = useQuery({
    queryKey: [`/api/posts/${selectedPost}/replies`],
    enabled: !!selectedPost,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: PostValues) => {
      await apiRequest("POST", `/api/forums/${forumId}/posts`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forums/${forumId}/posts`] });
      toast({
        title: "Post created",
        description: "Your post has been published to the forum.",
      });
      setNewPostDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async (data: ReplyValues) => {
      await apiRequest("POST", `/api/posts/${selectedPost}/replies`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${selectedPost}/replies`] });
      toast({
        title: "Reply posted",
        description: "Your reply has been added to the discussion.",
      });
      setNewReply("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post reply",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form setup
  const postForm = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onPostSubmit = (data: PostValues) => {
    createPostMutation.mutate(data);
  };

  const handleSubmitReply = () => {
    if (!newReply.trim()) return;
    
    createReplyMutation.mutate({
      content: newReply,
    });
  };

  const handlePostClick = (postId: number) => {
    setSelectedPost(postId);
  };

  const isPremiumAndNotSubscribed = forum?.isPremium && !user?.isPremium;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isLoadingForum ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-white rounded w-3/4"></div>
                <div className="h-6 bg-white rounded w-1/2"></div>
              </div>
            ) : forum ? (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <Link href="/forums">
                    <a className="text-neutral-500 hover:text-primary flex items-center mr-3">
                      <ChevronLeft size={18} />
                      <span>Back to Forums</span>
                    </a>
                  </Link>
                </div>
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-serif font-bold mr-3">{forum.title}</h1>
                  {forum.isPremium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400">
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-neutral-700 mb-6">{forum.description}</p>
                
                {!isPremiumAndNotSubscribed ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <MessageSquare size={16} className="mr-2" />
                        New Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Create New Post</DialogTitle>
                        <DialogDescription>
                          Start a new discussion in the {forum?.title} forum
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...postForm}>
                        <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-4">
                          <FormField
                            control={postForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter a descriptive title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={postForm.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Content</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Share your thoughts, questions, or insights..." 
                                    className="min-h-[150px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => postForm.reset()}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              disabled={createPostMutation.isPending}
                            >
                              {createPostMutation.isPending ? "Creating..." : "Create Post"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="bg-white rounded-xl p-6 border border-yellow-300 mb-6">
                    <div className="flex items-start">
                      <Lock className="h-8 w-8 text-yellow-500 mr-3 mt-1" />
                      <div>
                        <h3 className="text-lg font-bold mb-2">Premium Forum</h3>
                        <p className="text-neutral-700 mb-4">
                          This is a premium forum. Upgrade to access exclusive content and join the discussions.
                        </p>
                        <Link href="/subscription">
                          <Button className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500">
                            Upgrade to Premium
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-bold text-neutral-800 mb-2">Forum not found</h2>
                <p className="text-neutral-600 mb-6">The forum you're looking for doesn't exist or you don't have permission to view it.</p>
                <Link href="/forums">
                  <Button>Back to Forums</Button>
                </Link>
              </div>
            )}
            
            {isPremiumAndNotSubscribed ? (
              <Card className="p-12 text-center">
                <Lock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Premium Content</h2>
                <p className="text-neutral-600 mb-6">
                  Upgrade to premium to access this exclusive forum and join the discussions.
                </p>
                <Link href="/subscription">
                  <Button className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500">
                    Upgrade to Premium
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Posts List */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Discussion Threads</h2>
                  {isLoadingPosts ? (
                    <div className="space-y-4">
                      <div className="h-32 bg-white animate-pulse rounded-xl"></div>
                      <div className="h-32 bg-white animate-pulse rounded-xl"></div>
                    </div>
                  ) : posts && posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <ForumPost 
                          key={post.id} 
                          post={post} 
                          onClick={() => handlePostClick(post.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyPostsList />
                  )}
                </div>
                
                {/* Selected Post & Replies */}
                <div>
                  {selectedPost && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Replies</h2>
                      {isLoadingReplies ? (
                        <div className="space-y-4">
                          <div className="h-32 bg-white animate-pulse rounded-xl"></div>
                          <div className="h-32 bg-white animate-pulse rounded-xl"></div>
                        </div>
                      ) : (
                        <div>
                          {replies && replies.length > 0 ? (
                            <div className="space-y-4 mb-4">
                              {replies.map((reply) => (
                                <ForumReply key={reply.id} reply={reply} />
                              ))}
                            </div>
                          ) : (
                            <Card className="p-6 text-center mb-4">
                              <p className="text-neutral-600">No replies yet. Be the first to reply!</p>
                            </Card>
                          )}
                          
                          {/* Reply Form */}
                          <div className="mt-4">
                            <Textarea
                              placeholder="Write your reply..."
                              className="mb-3"
                              value={newReply}
                              onChange={(e) => setNewReply(e.target.value)}
                            />
                            <Button 
                              onClick={handleSubmitReply}
                              disabled={createReplyMutation.isPending || !newReply.trim()}
                            >
                              {createReplyMutation.isPending ? "Posting..." : "Post Reply"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
    </div>
  );
}
