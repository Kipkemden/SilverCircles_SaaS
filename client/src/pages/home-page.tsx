import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { ForumCard } from "@/components/forum/forum-card";
import { GroupCard } from "@/components/group/group-card";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: publicForums } = useQuery({
    queryKey: ["/api/forums", { premium: false }],
    enabled: true,
  });
  
  const { data: groups } = useQuery({
    queryKey: ["/api/groups", { premium: false }],
    enabled: true,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary bg-opacity-10 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-800 mb-6">
              Your Circle for Life's Next Chapter
            </h1>
            <p className="text-xl text-neutral-700 max-w-2xl mx-auto mb-8">
              Join Silver Circles and connect with like-minded adults 45-70 to share experiences, build relationships, and find support in this special season of life.
            </p>
            {!user ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth">
                  <Button size="lg" className="min-w-[150px]">
                    Join Now
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="lg" variant="outline" className="min-w-[150px]">
                    Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">What We Offer</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="bg-primary bg-opacity-10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Supportive Forums</h3>
                <p className="text-neutral-700">
                  Engage in meaningful discussions about retirement, relationships, health, and more with others who understand.
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="bg-secondary bg-opacity-10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Curated Groups</h3>
                <p className="text-neutral-700">
                  Join small groups matched to your interests for deeper connections and shared activities with people just like you.
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="bg-green-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Zoom Meetups</h3>
                <p className="text-neutral-700">
                  Meet face-to-face virtually with regular scheduled video calls to deepen friendships and share experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Preview Forums Section */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif font-bold">Popular Forums</h2>
              <Link href="/forums">
                <a className="text-primary hover:text-primary-dark font-medium">
                  View All Forums
                </a>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {publicForums ? (
                publicForums.slice(0, 4).map((forum) => (
                  <ForumCard key={forum.id} forum={forum} />
                ))
              ) : (
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
                ))
              )}
            </div>
          </div>
        </section>
        
        {/* Premium Benefits */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold mb-4">Premium Membership Benefits</h2>
              <p className="text-xl text-neutral-700 max-w-2xl mx-auto">
                Unlock the full potential of Silver Circles with our premium membership
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <svg className="w-6 h-6 text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-bold">Access to Premium Forums</h3>
                  </div>
                  <p className="pl-9 text-neutral-700">
                    Specialized discussions on retirement planning, investments, dating after 50, and more.
                  </p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <svg className="w-6 h-6 text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-bold">Curated Group Matching</h3>
                  </div>
                  <p className="pl-9 text-neutral-700">
                    We'll match you with small groups based on your interests, location, and preferences.
                  </p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <svg className="w-6 h-6 text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-bold">Unlimited Zoom Calls</h3>
                  </div>
                  <p className="pl-9 text-neutral-700">
                    Regular scheduled video meetups with your groups to deepen connections.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <svg className="w-6 h-6 text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-bold">Priority Support</h3>
                  </div>
                  <p className="pl-9 text-neutral-700">
                    Get help when you need it with our dedicated support team.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h3 className="text-2xl font-bold text-center mb-6">Premium Membership</h3>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">$19.99</span>
                  <span className="text-neutral-700">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Access all premium forums
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Join up to 5 premium groups
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Unlimited Zoom calls
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Cancel anytime
                  </li>
                </ul>
                <Link href={user ? "/subscription" : "/auth"}>
                  <Button className="w-full" size="lg">
                    {user ? "Upgrade Now" : "Sign Up & Subscribe"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-serif font-bold mb-12">What Our Members Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <svg className="w-10 h-10 text-primary mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-neutral-700 mb-6">
                  "Silver Circles helped me make friends after my retirement. The forums and Zoom calls have become the highlight of my week!"
                </p>
                <div>
                  <p className="font-bold">Margaret T.</p>
                  <p className="text-sm text-neutral-500">Retired Teacher, 62</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <svg className="w-10 h-10 text-primary mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-neutral-700 mb-6">
                  "After my divorce, I was feeling lost. The Dating After 50 group at Silver Circles gave me the support and confidence I needed."
                </p>
                <div>
                  <p className="font-bold">Robert J.</p>
                  <p className="text-sm text-neutral-500">Marketing Executive, 57</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <svg className="w-10 h-10 text-primary mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-neutral-700 mb-6">
                  "The investment advice in the premium forums has literally paid for my membership many times over. Such a supportive community!"
                </p>
                <div>
                  <p className="font-bold">Susan L.</p>
                  <p className="text-sm text-neutral-500">Financial Advisor, 65</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-20 bg-primary bg-opacity-10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Ready to Join Your Circle?
            </h2>
            <p className="text-xl text-neutral-700 max-w-2xl mx-auto mb-8">
              Start connecting with like-minded individuals today. Your new friends are waiting!
            </p>
            {!user ? (
              <Link href="/auth">
                <Button size="lg" className="min-w-[200px]">
                  Join Silver Circles
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button size="lg" className="min-w-[200px]">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
