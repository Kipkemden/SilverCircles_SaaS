import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ZoomCallCard } from "@/components/events/zoom-call-card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Groups } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { format, isSameDay, isSameWeek, isSameMonth } from "date-fns";
import { Link } from "wouter";

export default function ZoomCallsPage() {
  const { user } = useAuth();
  
  // Get user's upcoming Zoom calls
  const { data: upcomingCalls, isLoading } = useQuery({
    queryKey: ["/api/user/zoom-calls"],
    enabled: !!user,
  });
  
  // Sort and group calls by timeframe
  const todayCalls = upcomingCalls?.filter(call => 
    isSameDay(new Date(call.startTime), new Date())
  ) || [];
  
  const thisWeekCalls = upcomingCalls?.filter(call => 
    !isSameDay(new Date(call.startTime), new Date()) && 
    isSameWeek(new Date(call.startTime), new Date())
  ) || [];
  
  const laterCalls = upcomingCalls?.filter(call => 
    !isSameDay(new Date(call.startTime), new Date()) && 
    !isSameWeek(new Date(call.startTime), new Date())
  ) || [];
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-serif font-bold">Zoom Calls</h1>
            </div>
            
            {isLoading ? (
              <div className="space-y-6">
                <div className="h-12 bg-white animate-pulse rounded-lg w-1/3"></div>
                <div className="space-y-4">
                  <div className="h-32 bg-white animate-pulse rounded-xl"></div>
                  <div className="h-32 bg-white animate-pulse rounded-xl"></div>
                </div>
              </div>
            ) : upcomingCalls && upcomingCalls.length > 0 ? (
              <div className="space-y-8">
                {/* Today's calls */}
                {todayCalls.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <Calendar className="mr-2" size={20} />
                      Today
                    </h2>
                    <div className="space-y-4">
                      {todayCalls.map(call => (
                        <ZoomCallCard key={call.id} call={call} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* This week's calls */}
                {thisWeekCalls.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <Calendar className="mr-2" size={20} />
                      This Week
                    </h2>
                    <div className="space-y-4">
                      {thisWeekCalls.map(call => (
                        <ZoomCallCard key={call.id} call={call} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Later calls */}
                {laterCalls.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <Calendar className="mr-2" size={20} />
                      Upcoming
                    </h2>
                    <div className="space-y-4">
                      {laterCalls.map(call => (
                        <ZoomCallCard key={call.id} call={call} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Zoom Calls</h3>
                <p className="text-neutral-600 mb-6">
                  You don't have any upcoming Zoom calls scheduled. Join a group to participate in Zoom calls.
                </p>
                <Link href="/groups">
                  <Button>Browse Groups</Button>
                </Link>
              </Card>
            )}
            
            {/* Zoom Call Tips */}
            <Card className="p-6 mt-8">
              <h3 className="text-lg font-bold mb-4">Zoom Call Tips</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-light rounded-full p-2 mr-3">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Join Early</h4>
                    <p className="text-sm text-neutral-600">We recommend joining the call 5 minutes early to test your audio and video.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-light rounded-full p-2 mr-3">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Use Headphones</h4>
                    <p className="text-sm text-neutral-600">Headphones help improve audio quality and reduce background noise.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-light rounded-full p-2 mr-3">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Good Lighting</h4>
                    <p className="text-sm text-neutral-600">Position yourself facing a light source for better visibility.</p>
                  </div>
                </div>
              </div>
            </Card>
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
