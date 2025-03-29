import React from "react";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary/10 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">About Silver Circles</h1>
              <p className="text-xl md:text-2xl text-neutral-700 mb-8">
                Small, online support groups built for adults 45 to 70, tackling life's big shifts together.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="font-medium" asChild>
                  <Link href="/auth">Join Today</Link>
                </Button>
                <Button size="lg" variant="outline" className="font-medium" asChild>
                  <Link href="/subscription">Learn About Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">Our Story</h2>
              
              <div className="prose prose-lg max-w-none text-neutral-700">
                <p>
                  Picture it: You're 60, retirement's knocking, and "What's next?" keeps you up. Or 67, eyeing a date, heart thumping with nerves. Therapy's a wallet-busting $150 a session—too stiff, too scary. Friends? They're MIA or miss the mark. You need a lifeline—someone to hear you out, lift you up, and say, "I've been there."
                </p>
                
                <p>
                  Meet Silver Circles. We're not therapy. We're not a casual coffee chat that fizzles out. We're small, online support groups built for you—45 to 70, tackling life's big shifts. Whether it's reinventing retirement or finding love later in life, you'll join 6-10 others who get it, guided by pros who've lived it: a retired therapist, a seasoned career coach, or an expert who's walked your path.
                </p>
                
                <p>
                  It's real talk, real support, and real understanding—for just $60 a month. Plus, it's all on Zoom—easy, cozy, from your couch. Therapy's $200 price tag? Not here.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-neutral-100 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-neutral-800 mb-12 text-center">What Our Members Say</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 bg-white shadow-md">
                <div className="flex items-start mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">Joan, 64</h3>
                    <p className="text-primary font-medium text-sm">Reinventing Retirement</p>
                  </div>
                </div>
                <p className="text-neutral-700 italic">
                  "I was drifting post-job. My circle, led by a retired exec, gave me clarity—and buddies who cheer me on."
                </p>
              </Card>
              
              <Card className="p-6 bg-white shadow-md">
                <div className="flex items-start mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarFallback>TS</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">Tom, 57</h3>
                    <p className="text-primary font-medium text-sm">Silver Singles</p>
                  </div>
                </div>
                <p className="text-neutral-700 italic">
                  "Dating at my age felt wild. My group, with a relationship pro, turned jitters into guts."
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Silver Circles Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">Why Silver Circles?</h2>
              
              <div className="prose prose-lg max-w-none text-neutral-700">
                <p>
                  Because life after 45 isn't meant to be faced solo. Therapy can be too formal, too pricey—$200 sessions add up fast. Friends might not always show up. But our senior support groups are here, online, every week, blending expert wisdom with peer connection. It's your safe space to vent, dream, and grow—without breaking the bank.
                </p>
                
                <div className="bg-primary/5 p-6 rounded-xl my-8">
                  <h3 className="text-xl font-semibold text-primary mb-4">Our Commitment</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Small groups of 6-10 people who understand your journey</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Guided by professionals who've lived similar experiences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Affordable monthly fee of $60 (versus $150-200 per therapy session)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Convenient weekly Zoom meetings from the comfort of your home</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Supportive forums for ongoing connection between meetings</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center mt-10">
                <Button size="lg" className="font-medium" asChild>
                  <Link href="/auth">Start Your Journey Today</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}