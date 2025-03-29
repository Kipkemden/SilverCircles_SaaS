import React, { useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/profile/profile-card";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { ZoomCallCard } from "@/components/events/zoom-call-card";
import { ForumPost } from "@/components/forum/forum-post";
import { ResendVerificationEmail } from "@/components/resend-verification";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const { data: upcomingCalls = [], isLoading: isLoadingCalls } = useQuery<any[]>({
    queryKey: ["/api/user/zoom-calls"],
    enabled: !!user,
  });
  
  const { data: publicForums } = useQuery({
    queryKey: ["/api/forums", { premium: false }],
    enabled: !!user,
  });
  
  const { data: premiumForums } = useQuery({
    queryKey: ["/api/forums", { premium: true }],
    enabled: !!user && !!user.isPremium,
  });
  
  // Combine all forums and get posts from them
  const allForumIds = [
    ...(publicForums as any[] || []).map((forum: any) => forum.id),
    ...(premiumForums as any[] || []).map((forum: any) => forum.id),
  ];
  
  // Fetch recent forum posts for the forums
  const { data: recentPosts = [], isLoading: isLoadingPosts } = useQuery<any[]>({
    queryKey: ["/api/recent-forum-posts"],
    enabled: !!user && allForumIds.length > 0,
    queryFn: async () => {
      // Simulating fetching recent posts from all forums the user has access to
      // In a real implementation, you'd have a dedicated API endpoint for this
      const postPromises = allForumIds.slice(0, 3).map(async (forumId) => {
        const res = await fetch(`/api/forums/${forumId}/posts`);
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      });
      
      try {
        const postsArrays = await Promise.all(postPromises);
        // Flatten and sort by date
        return postsArrays
          .flat()
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
      } catch (error) {
        console.error("Error fetching forum posts:", error);
        return [];
      }
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Page Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8 border-b border-neutral-200">
            <TabsList className="bg-transparent border-b-0">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-1 py-4 border-b-2 border-transparent rounded-none"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="groups" 
                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-1 py-4 border-b-2 border-transparent rounded-none"
              >
                Groups
              </TabsTrigger>
              <TabsTrigger 
                value="forums" 
                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-1 py-4 border-b-2 border-transparent rounded-none"
              >
                Forums
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-1 py-4 border-b-2 border-transparent rounded-none"
              >
                Events
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <TabsContent value="dashboard" className="mt-0 space-y-8">
                {/* Email Verification Banner */}
                <ResendVerificationEmail />
                
                {/* Profile Summary Card */}
                <ProfileCard />
                
                {/* Upcoming Zoom Calls Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-neutral-800">Upcoming Zoom Calls</h2>
                    <Link href="/zoom-calls" className="text-primary hover:text-primary-dark font-medium text-sm">
                      View All
                    </Link>
                  </div>
                  
                  {isLoadingCalls ? (
                    <div className="space-y-4">
                      <div className="h-32 bg-neutral-100 animate-pulse rounded-lg"></div>
                      <div className="h-32 bg-neutral-100 animate-pulse rounded-lg"></div>
                    </div>
                  ) : upcomingCalls && upcomingCalls.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingCalls.slice(0, 2).map((call: any) => (
                        <ZoomCallCard key={call.id} call={call} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-600 mb-4">You don't have any upcoming Zoom calls.</p>
                      <Link href="/groups">
                        <Button variant="outline">Join Groups to Access Zoom Calls</Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Recent Forum Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-neutral-800">Recent Forum Activity</h2>
                    <Link href="/forums" className="text-primary hover:text-primary-dark font-medium text-sm">
                      View All Forums
                    </Link>
                  </div>
                  
                  {isLoadingPosts ? (
                    <div className="space-y-4">
                      <div className="h-32 bg-neutral-100 animate-pulse rounded-lg"></div>
                      <div className="h-32 bg-neutral-100 animate-pulse rounded-lg"></div>
                      <div className="h-32 bg-neutral-100 animate-pulse rounded-lg"></div>
                    </div>
                  ) : recentPosts && recentPosts.length > 0 ? (
                    <div className="space-y-4">
                      {recentPosts.map((post: any) => (
                        <ForumPost 
                          key={post.id} 
                          post={post} 
                          onClick={() => window.location.href = `/forums/${post.forumId}?post=${post.id}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-600 mb-4">No recent forum activity to display.</p>
                      <Link href="/forums">
                        <Button variant="outline">Browse Forums</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="groups" className="mt-0">
                <div className="p-12 text-center">
                  <h3 className="text-xl font-medium mb-4">Groups Section</h3>
                  <p className="text-neutral-600 mb-6">Manage your groups directly from your dashboard tab, or visit the dedicated groups page for more features.</p>
                  <Link href="/groups">
                    <Button>Go to Groups Page</Button>
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="forums" className="mt-0">
                <div className="p-12 text-center">
                  <h3 className="text-xl font-medium mb-4">Forums Section</h3>
                  <p className="text-neutral-600 mb-6">View recent forum activity directly from your dashboard tab, or visit the dedicated forums page for more features.</p>
                  <Link href="/forums">
                    <Button>Go to Forums Page</Button>
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="events" className="mt-0">
                <div className="p-12 text-center">
                  <h3 className="text-xl font-medium mb-4">Events Section</h3>
                  <p className="text-neutral-600 mb-6">View upcoming Zoom calls directly from your dashboard tab, or visit the dedicated events page for more features.</p>
                  <Link href="/zoom-calls">
                    <Button>Go to Events Page</Button>
                  </Link>
                </div>
              </TabsContent>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <DashboardSidebar />
            </div>
          </div>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
