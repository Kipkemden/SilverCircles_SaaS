import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function ProfileCard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.profileImage} alt={user.fullName || user.username} />
          <AvatarFallback className="text-xl">
            {user.fullName 
              ? `${user.fullName.split(' ')[0][0]}${user.fullName.split(' ')[1]?.[0] || ''}`
              : user.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">
            Welcome back, {user.fullName ? user.fullName.split(' ')[0] : user.username}!
          </h2>
          <p className="text-neutral-600">
            {user.isPremium 
              ? `Premium Member since ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              : `Member since ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
            }
          </p>
        </div>
      </div>
      
      <div className="bg-neutral-100 rounded-lg p-4 mb-6">
        <p className="text-neutral-700 font-medium">
          <Bell className="inline-block mr-2 text-secondary" size={18} />
          You have 3 unread messages and 2 upcoming events this week.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary bg-opacity-10 rounded-lg p-4 flex items-center space-x-3">
          <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-primary">Your Groups</h3>
            <p className="text-sm text-neutral-700">4 active groups</p>
          </div>
        </div>
        
        <div className="bg-secondary bg-opacity-10 rounded-lg p-4 flex items-center space-x-3">
          <div className="bg-secondary rounded-full w-10 h-10 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-secondary-dark">Forum Activity</h3>
            <p className="text-sm text-neutral-700">12 new posts today</p>
          </div>
        </div>
        
        <div className="bg-green-100 rounded-lg p-4 flex items-center space-x-3">
          <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-green-700">Upcoming Calls</h3>
            <p className="text-sm text-neutral-700">2 scheduled this week</p>
          </div>
        </div>
        
        <div className="bg-neutral-200 rounded-lg p-4 flex items-center space-x-3">
          <div className="bg-neutral-600 rounded-full w-10 h-10 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-neutral-700">Events</h3>
            <p className="text-sm text-neutral-700">1 event this month</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
