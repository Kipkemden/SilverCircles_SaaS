import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GroupCard } from "@/components/group/group-card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Lock, Users } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/sidebar";

export default function GroupsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get public groups
  const { data: publicGroups, isLoading: isLoadingPublic } = useQuery({
    queryKey: ["/api/groups", { premium: false }],
    enabled: true,
  });
  
  // Get premium groups
  const { data: premiumGroups, isLoading: isLoadingPremium } = useQuery({
    queryKey: ["/api/groups", { premium: true }],
    enabled: !!user && !!user.isPremium,
  });
  
  // Get user's groups
  const { data: userGroups, isLoading: isLoadingUserGroups } = useQuery({
    queryKey: ["/api/user/groups"],
    enabled: !!user,
  });
  
  // Filter groups based on search query
  const filteredPublicGroups = publicGroups
    ? publicGroups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];
  
  const filteredPremiumGroups = premiumGroups
    ? premiumGroups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];
  
  const filteredUserGroups = userGroups
    ? userGroups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
              <h1 className="text-3xl font-serif font-bold">Groups</h1>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={18} />
                <Input
                  type="text"
                  placeholder="Search groups..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue={user ? "my-groups" : "all"} className="mb-8">
              <TabsList>
                {user && <TabsTrigger value="my-groups">My Groups</TabsTrigger>}
                <TabsTrigger value="all">All Groups</TabsTrigger>
                <TabsTrigger value="public">Public</TabsTrigger>
                {user?.isPremium && (
                  <TabsTrigger value="premium">Premium</TabsTrigger>
                )}
              </TabsList>
              
              {user && (
                <TabsContent value="my-groups" className="mt-6">
                  <div className="flex items-center mb-4">
                    <h2 className="text-xl font-bold">My Groups</h2>
                  </div>
                  
                  {isLoadingUserGroups ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-40 bg-white animate-pulse rounded-xl"></div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {filteredUserGroups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredUserGroups.map((group) => (
                            <GroupCard key={group.id} group={group} />
                          ))}
                        </div>
                      ) : (
                        <Card className="p-8 text-center">
                          <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Groups Joined Yet</h3>
                          <p className="text-neutral-600 mb-6">
                            You haven't joined any groups yet. Browse available groups below and join ones that interest you.
                          </p>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>
              )}
              
              <TabsContent value="all" className="mt-6">
                {/* Premium Groups Section */}
                {user?.isPremium && (
                  <>
                    <div className="flex items-center mb-4">
                      <h2 className="text-xl font-bold">Premium Groups</h2>
                      <div className="ml-2 px-2 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs rounded-full">
                        Premium
                      </div>
                    </div>
                    
                    {isLoadingPremium ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {Array(2).fill(0).map((_, i) => (
                          <div key={i} className="h-40 bg-white animate-pulse rounded-xl"></div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {filteredPremiumGroups.length > 0 ? (
                          filteredPremiumGroups.map((group) => (
                            <GroupCard 
                              key={group.id} 
                              group={group}
                              showJoinButton={!userGroups?.some(g => g.id === group.id)}
                            />
                          ))
                        ) : (
                          <p className="text-neutral-600 col-span-2 text-center py-4">
                            No premium groups match your search.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
                
                {/* Public Groups Section */}
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold">Public Groups</h2>
                </div>
                
                {isLoadingPublic ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-40 bg-white animate-pulse rounded-xl"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPublicGroups.length > 0 ? (
                      filteredPublicGroups.map((group) => (
                        <GroupCard 
                          key={group.id} 
                          group={group}
                          showJoinButton={!userGroups?.some(g => g.id === group.id)}
                        />
                      ))
                    ) : (
                      <p className="text-neutral-600 col-span-2 text-center py-4">
                        No public groups match your search.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="public" className="mt-6">
                {isLoadingPublic ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-40 bg-white animate-pulse rounded-xl"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPublicGroups.length > 0 ? (
                      filteredPublicGroups.map((group) => (
                        <GroupCard 
                          key={group.id} 
                          group={group}
                          showJoinButton={!userGroups?.some(g => g.id === group.id)}
                        />
                      ))
                    ) : (
                      <p className="text-neutral-600 col-span-2 text-center py-4">
                        No public groups match your search.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
              
              {user?.isPremium && (
                <TabsContent value="premium" className="mt-6">
                  {isLoadingPremium ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-40 bg-white animate-pulse rounded-xl"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredPremiumGroups.length > 0 ? (
                        filteredPremiumGroups.map((group) => (
                          <GroupCard 
                            key={group.id} 
                            group={group}
                            showJoinButton={!userGroups?.some(g => g.id === group.id)}
                          />
                        ))
                      ) : (
                        <p className="text-neutral-600 col-span-2 text-center py-4">
                          No premium groups match your search.
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
                    <h3 className="text-lg font-bold mb-2">Unlock Premium Groups</h3>
                    <p className="text-neutral-700 mb-4">
                      Upgrade to premium to access exclusive groups focused on retirement planning, dating after 50, travel for seniors, and more specialized interests.
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
