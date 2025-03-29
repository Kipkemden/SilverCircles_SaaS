import React from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare } from "lucide-react";

interface ForumCardProps {
  forum: {
    id: number;
    title: string;
    description: string;
    isPremium: boolean;
    createdAt: string;
  };
  postCount?: number;
  latestActivityTimestamp?: string;
}

export function ForumCard({ forum, postCount = 0, latestActivityTimestamp }: ForumCardProps) {
  return (
    <Link href={`/forums/${forum.id}`}>
      <Card className="p-4 hover:border-primary cursor-pointer transition-all">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            {forum.isPremium ? (
              <Badge className="mr-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500">
                Premium
              </Badge>
            ) : (
              <Badge variant="outline" className="mr-2">
                Public
              </Badge>
            )}
            <h3 className="font-bold text-neutral-800">{forum.title}</h3>
          </div>
          {latestActivityTimestamp && (
            <span className="text-neutral-500 text-sm">
              {new Date(latestActivityTimestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}
        </div>
        <p className="text-neutral-700 mb-3 line-clamp-2">{forum.description}</p>
        <div className="flex items-center text-neutral-600 text-sm">
          <span className="flex items-center mr-4">
            <MessageSquare size={14} className="mr-1" /> {postCount} posts
          </span>
          <span className="flex items-center">
            <Eye size={14} className="mr-1" /> 126 views
          </span>
        </div>
      </Card>
    </Link>
  );
}

export function ForumList({ forums }: { forums: ForumCardProps['forum'][] }) {
  if (!forums || forums.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-neutral-700">No forums available</h3>
        <p className="text-neutral-500 mt-2">Check back later for new forums.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {forums.map((forum) => (
        <ForumCard key={forum.id} forum={forum} />
      ))}
    </div>
  );
}
