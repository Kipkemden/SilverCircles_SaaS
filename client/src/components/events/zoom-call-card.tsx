import React from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Users, Video } from "lucide-react";
import { format, isToday, isTomorrow, addToDate } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ZoomCallCardProps {
  call: {
    id: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    zoomLink?: string;
    groupId: number;
    group?: {
      id: number;
      name: string;
    };
    participantCount?: number;
  };
}

export function ZoomCallCard({ call }: ZoomCallCardProps) {
  const { toast } = useToast();
  const startDate = new Date(call.startTime);
  const endDate = new Date(call.endTime);
  
  const joinCallMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/zoom-calls/${call.id}/join`);
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.zoomLink) {
        window.open(data.zoomLink, "_blank");
      } else {
        toast({
          title: "Zoom Link Not Available",
          description: "The Zoom link for this call is not available.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Join Call",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const getDateBadge = () => {
    if (isToday(startDate)) {
      return <Badge className="bg-primary-light">Today</Badge>;
    } else if (isTomorrow(startDate)) {
      return <Badge className="bg-primary-light">Tomorrow</Badge>;
    } else {
      return <Badge variant="outline" className="bg-neutral-500 text-white">Upcoming</Badge>;
    }
  };
  
  const formatTimeRange = () => {
    return `${format(startDate, "EEEE, MMM d")} • ${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`;
  };
  
  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    const googleCalendarUrl = new URL("https://calendar.google.com/calendar/render");
    googleCalendarUrl.searchParams.append("action", "TEMPLATE");
    googleCalendarUrl.searchParams.append("text", call.title);
    googleCalendarUrl.searchParams.append("details", call.description || "");
    googleCalendarUrl.searchParams.append("location", call.zoomLink || "");
    googleCalendarUrl.searchParams.append("dates", 
      `${format(startDate, "yyyyMMdd'T'HHmmss")}/${format(endDate, "yyyyMMdd'T'HHmmss")}`
    );
    
    window.open(googleCalendarUrl.toString(), "_blank");
  };
  
  const handleJoinCall = () => {
    if (call.zoomLink) {
      window.open(call.zoomLink, "_blank");
    } else {
      joinCallMutation.mutate();
    }
  };
  
  const canJoinCall = () => {
    const now = new Date();
    // Can join if current time is between 15 minutes before start and end time
    return now >= addToDate(startDate, { minutes: -15 }) && now <= endDate;
  };
  
  return (
    <Card className="p-4 hover:border-primary transition">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-neutral-800">
          {call.title || (call.group ? call.group.name : "Zoom Call")}
        </h3>
        {getDateBadge()}
      </div>
      
      <div className="flex items-center text-neutral-600 mb-3">
        <Clock size={16} className="mr-2" />
        <span>{formatTimeRange()}</span>
      </div>
      
      <div className="flex items-center text-neutral-600 mb-4">
        <Users size={16} className="mr-2" />
        <span>{call.participantCount || 0} participants</span>
      </div>
      
      <div className="flex space-x-3">
        {canJoinCall() ? (
          <Button 
            className="flex-1"
            onClick={handleJoinCall}
            disabled={joinCallMutation.isPending}
          >
            <Video size={16} className="mr-2" />
            {joinCallMutation.isPending ? "Joining..." : "Join Call"}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleAddToCalendar}
          >
            <Calendar size={16} className="mr-2" />
            Add to Calendar
          </Button>
        )}
      </div>
    </Card>
  );
}
