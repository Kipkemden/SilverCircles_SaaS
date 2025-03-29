import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ForumCard, ForumList } from "@/components/forum/forum-card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Search, Lock } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/sidebar";

export default function ForumsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get public forums
  const { data: publicForums, isLoading: isLoadingPublic } = useQuery({
    queryKey: ["/api/forums", { premium: false }],
    enabled: true,
  });
  
  // Get premium forums if user has premium access
  const { data: premiumForums, isLoading: isLoadingPremium } = useQuery({
    queryKey: ["/api/forums", { premium: true }],
    enabled: !!user && !!user.isPremium,
  });
  
  // Filter forums based on search query
  const filteredPublicForums = publicForums
    ? publicForums.filter(forum => 
        forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        forum.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  const filteredPremiumForums = premiumForums
    ? premiumForums.filter(forum => 
        forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        forum.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-serif font-bold">Forums</h1>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={18} />
                <Input
                  type="text"
                  placeholder="Search forums..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="all" className="mb-8">
              <TabsList>
                <TabsTrigger value="all">All Forums</TabsTrigger>
                <TabsTrigger value="public">Public</TabsTrigger>
                {user?.isPremium && (
                  <TabsTrigger value="premium">Premium</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                {/* Premium Forums Section */}
                {user?.isPremium && (
                  <>
                    <div className="flex items-center mb-4">
                      <h2 className="text-xl font-bold">Premium Forums</h2>
                      <div className="ml-2 px-2 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs rounded-full">
                        Premium
                      </div>
                    </div>
                    
                    {isLoadingPremium ? (
                      <div className="space-y-4 mb-8">
                        <div className="h-28 bg-white animate-pulse rounded-xl"></div>
                        <div className="h-28 bg-white animate-pulse rounded-xl"></div>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-8">
                        {filteredPremiumForums.length > 0 ? (
                          <ForumList forums={filteredPremiumForums} />
                        ) : (
                          <p className="text-neutral-600 text-center py-4">
                            No premium forums match your search.
                          </p>
                        )}
                      </div>
                    )}
                    
                    <Separator className="my-8" />
                  </>
                )}
                
                {/* Public Forums Section */}
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold">Public Forums</h2>
                </div>
                
                {isLoadingPublic ? (
                  <div className="space-y-4">
                    <div className="h-28 bg-white animate-pulse rounded-xl"></div>
                    <div className="h-28 bg-white animate-pulse rounded-xl"></div>
                    <div className="h-28 bg-white animate-pulse rounded-xl"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPublicForums.length > 0 ? (
                      <ForumList forums={filteredPublicForums} />
                    ) : (
                      <p className="text-neutral-600 text-center py-4">
                        No public forums match your search.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="public" className="mt-6">
                {isLoadingPublic ? (
                  <div className="space-y-4">
                    <div className="h-28 bg-white animate-pulse rounded-xl"></div>
                    <div className="h-28 bg-white animate-pulse rounded-xl"></div>
                    <div className="h-28 bg-white animate-pulse rounded-xl"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPublicForums.length > 0 ? (
                      <ForumList forums={filteredPublicForums} />
                    ) : (
                      <p className="text-neutral-600 text-center py-4">
                        No public forums match your search.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
              
              {user?.isPremium && (
                <TabsContent value="premium" className="mt-6">
                  {isLoadingPremium ? (
                    <div className="space-y-4">
                      <div className="h-28 bg-white animate-pulse rounded-xl"></div>
                      <div className="h-28 bg-white animate-pulse rounded-xl"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredPremiumForums.length > 0 ? (
                        <ForumList forums={filteredPremiumForums} />
                      ) : (
                        <p className="text-neutral-600 text-center py-4">
                          No premium forums match your search.
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
            
            {/* Premium Upgrade Banner */}
            {!user?.isPremium && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-yellow-300">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <Lock className="h-10 w-10 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Unlock Premium Forums</h3>
                    <p className="text-neutral-700 mb-4">
                      Upgrade to premium to access exclusive forums on retirement planning, investments, dating after 50, and more.
                    </p>
                    <Button className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500">
                      Upgrade to Premium
                    </Button>
                  </div>
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
