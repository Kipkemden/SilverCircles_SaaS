import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/verify-email");
  const { toast } = useToast();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (!token) {
      setIsLoading(false);
      setError("Verification token is missing");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await apiRequest('GET', `/api/verify-email?token=${token}`);
        
        if (response.ok) {
          setIsVerified(true);
          toast({
            title: "Email Verified",
            description: "Your email has been successfully verified.",
            variant: "default",
          });
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Email verification failed");
          toast({
            title: "Verification Failed",
            description: errorData.message || "Failed to verify your email address.",
            variant: "destructive",
          });
        }
      } catch (err) {
        setError("An error occurred during verification");
        toast({
          title: "Verification Error",
          description: "An unexpected error occurred while verifying your email.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [toast]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-lg">Verifying your email address...</p>
        </div>
      );
    }

    if (isVerified) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h3 className="text-xl font-semibold">Email Verified Successfully</h3>
          <p className="text-center text-muted-foreground">
            Your email address has been verified. You can now fully access your account.
          </p>
          <Button onClick={() => setLocation("/")}>Go to Dashboard</Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <h3 className="text-xl font-semibold">Verification Failed</h3>
        <p className="text-center text-muted-foreground">
          {error || "We couldn't verify your email address. The verification link may have expired."}
        </p>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => setLocation("/")}>
            Go to Dashboard
          </Button>
          <Button onClick={() => setLocation("/auth")}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Email Verification</CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}