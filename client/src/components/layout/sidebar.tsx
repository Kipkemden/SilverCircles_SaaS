import React from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { GroupCard } from "@/components/group/group-card";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

export function MembershipCard() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-bold text-neutral-800 mb-4">Membership</h2>
      <div className="bg-secondary bg-opacity-10 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-2">
          <svg className="h-6 w-6 text-secondary mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <h3 className="font-bold text-secondary-dark">
            {user.isPremium ? "Premium Member" : "Free Member"}
          </h3>
        </div>
        {user.isPremium ? (
          <>
            <p className="text-neutral-700 mb-3">
              Your membership is active until{" "}
              <strong>
                {user.premiumUntil
                  ? new Date(user.premiumUntil).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })
                  : "N/A"}
              </strong>
            </p>
            <div className="text-sm text-neutral-600">
              <div className="flex justify-between mb-1">
                <span>Premium Forums</span>
                <span className="text-green-600"><Check size={16} className="inline" /> Included</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Private Groups</span>
                <span className="text-green-600"><Check size={16} className="inline" /> Included</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Unlimited Zoom Calls</span>
                <span className="text-green-600"><Check size={16} className="inline" /> Included</span>
              </div>
              <div className="flex justify-between">
                <span>Priority Support</span>
                <span className="text-green-600"><Check size={16} className="inline" /> Included</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-neutral-700 mb-3">
            Upgrade to Premium for exclusive access to premium forums, groups, and Zoom calls.
          </p>
        )}
      </div>
      
      <Link href="/subscription">
        <Button className="w-full">
          {user.isPremium ? "Manage Subscription" : "Upgrade to Premium"}
        </Button>
      </Link>
    </Card>
  );
}

export function UserGroupsSidebar() {
  const { user } = useAuth();
  
  const { data: userGroups, isLoading } = useQuery({
    queryKey: ["/api/user/groups"],
    enabled: !!user
  });
  
  if (!user) return null;

  return (
    <Card className="p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-neutral-800">Your Groups</h2>
        <Link href="/groups">
          <a className="text-primary hover:text-primary-dark font-medium text-sm">View All</a>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-24 bg-neutral-100 animate-pulse rounded"></div>
          <div className="h-24 bg-neutral-100 animate-pulse rounded"></div>
        </div>
      ) : userGroups?.length === 0 ? (
        <p className="text-neutral-600 text-center py-4">
          You haven't joined any groups yet. 
          <Link href="/groups">
            <a className="text-primary ml-1">Browse groups</a>
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {userGroups?.slice(0, 3).map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </Card>
  );
}

export function SuggestedGroupsSidebar() {
  const { user } = useAuth();
  
  const { data: suggestedGroups, isLoading } = useQuery({
    queryKey: ["/api/user/suggested-groups", { limit: 2 }],
    enabled: !!user
  });
  
  if (!user) return null;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-neutral-800 mb-4">Suggested For You</h2>
      
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-24 bg-neutral-100 animate-pulse rounded"></div>
          <div className="h-24 bg-neutral-100 animate-pulse rounded"></div>
        </div>
      ) : suggestedGroups?.length === 0 ? (
        <p className="text-neutral-600 text-center py-4">
          No suggested groups available at the moment.
        </p>
      ) : (
        <div className="space-y-3">
          {suggestedGroups?.map((group) => (
            <GroupCard key={group.id} group={group} showJoinButton />
          ))}
        </div>
      )}
    </Card>
  );
}

export function DashboardSidebar() {
  return (
    <div className="space-y-8">
      <MembershipCard />
      <UserGroupsSidebar />
      <SuggestedGroupsSidebar />
    </div>
  );
}
