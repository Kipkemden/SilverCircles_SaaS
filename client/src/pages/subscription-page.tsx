import React, { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

// The subscription form component
const SubscriptionForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
    });

    // This will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, customer will be redirected to
    // the return_url.
    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for subscribing to Silver Circles Premium!",
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <PaymentElement />
      {message && (
        <Alert variant="destructive">
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
          </>
        ) : (
          "Subscribe Now"
        )}
      </Button>
    </form>
  );
};

// Wrapper component that handles the Stripe integration
const SubscriptionWrapper = () => {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Create a subscription
    const createSubscription = async () => {
      try {
        const response = await apiRequest("POST", "/api/get-or-create-subscription");
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error creating subscription:", error);
        toast({
          title: "Error",
          description: "Could not initialize payment. Please try again later.",
          variant: "destructive",
        });
      }
    };

    if (user) {
      createSubscription();
    }
  }, [user, toast]);

  if (!clientSecret) {
    return (
      <div className="p-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Preparing your subscription...</span>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3B7EA1',
        colorBackground: '#ffffff',
        colorText: '#343A40',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <SubscriptionForm />
    </Elements>
  );
};

// The main subscription page
export default function SubscriptionPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-serif font-bold mb-6">Premium Membership</h1>
            <p className="text-neutral-700 mb-8">
              Please log in to subscribe to Silver Circles Premium.
            </p>
            <Link href="/auth">
              <Button size="lg">Log In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if the user already has premium
  if (user?.isPremium) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-center mb-6">Manage Your Subscription</h1>
            
            <Card className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Premium Membership</h2>
                  <p className="text-green-600 flex items-center mt-1">
                    <Check className="h-4 w-4 mr-1" /> Active
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">$19.99<span className="text-base font-normal text-neutral-600">/month</span></p>
                  {user.premiumUntil && (
                    <p className="text-sm text-neutral-600">
                      Next billing date: {new Date(user.premiumUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="font-medium mb-4">Your Premium Benefits:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Access to all premium forums
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Join premium groups
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Unlimited Zoom calls
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Priority support
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-neutral-700 mb-4">
                  Need to update your payment information or cancel your subscription?
                </p>
                <Button variant="outline">Contact Support</Button>
              </div>
            </Card>
            
            <div className="mt-6 text-center">
              <Link href="/dashboard">
                <Button variant="link">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-center mb-2">Upgrade to Premium</h1>
          <p className="text-center text-neutral-600 mb-12">
            Join our premium community and unlock exclusive features
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Card className="p-8 h-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Premium Membership</h2>
                
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">$19.99</span>
                  <span className="text-neutral-700">/month</span>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Access all premium forums</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Join up to 5 premium groups</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Unlimited Zoom calls</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
                
                <div className="bg-primary bg-opacity-10 p-4 rounded-lg mb-6">
                  <p className="text-primary text-sm">
                    <span className="font-bold">Special Offer:</span> First month 50% off for new subscribers!
                  </p>
                </div>
              </Card>
            </div>
            
            <div>
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                <SubscriptionWrapper />
              </Card>
            </div>
          </div>
          
          <div className="mt-12 text-center text-sm text-neutral-600">
            <p>By subscribing, you agree to our <Link href="/terms"><a className="text-primary hover:underline">Terms of Service</a></Link> and <Link href="/privacy"><a className="text-primary hover:underline">Privacy Policy</a></Link>.</p>
            <p className="mt-2">Questions? <Link href="/contact"><a className="text-primary hover:underline">Contact our support team</a></Link>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
