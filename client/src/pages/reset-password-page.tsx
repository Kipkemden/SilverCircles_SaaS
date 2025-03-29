import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, CheckCircle, XCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/reset-password");
  const { toast } = useToast();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenParam = queryParams.get('token');

    if (!tokenParam) {
      setIsLoading(false);
      setError("Reset token is missing");
      return;
    }

    setToken(tokenParam);
    setIsLoading(false);
  }, []);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setError("Reset token is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest('POST', '/api/reset-password', {
        token,
        password: values.password,
      });

      if (response.ok) {
        setIsComplete(true);
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset successfully. You can now log in with your new password.",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to reset password");
        toast({
          title: "Reset Failed",
          description: errorData.message || "Failed to reset your password.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("An error occurred during password reset");
      toast({
        title: "Reset Error",
        description: "An unexpected error occurred while resetting your password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-lg">Loading...</p>
        </div>
      );
    }

    if (isComplete) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h3 className="text-xl font-semibold">Password Reset Successful</h3>
          <p className="text-center text-muted-foreground">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <Button onClick={() => setLocation("/auth")}>Go to Login</Button>
        </div>
      );
    }

    if (error && !token) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <XCircle className="h-16 w-16 text-destructive" />
          <h3 className="text-xl font-semibold">Password Reset Failed</h3>
          <p className="text-center text-muted-foreground">
            {error || "The password reset link may be invalid or expired."}
          </p>
          <Button onClick={() => setLocation("/auth")}>
            Back to Login
          </Button>
        </div>
      );
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2 mb-6">
            <KeyRound className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-semibold">Create New Password</h3>
            <p className="text-center text-muted-foreground">
              Please enter a new password for your account.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              {error}
            </div>
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
          {!isComplete && !error && (
            <CardDescription className="text-center">
              Create a new password for your Silver Circles account
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <a href="/auth" className="text-primary hover:underline">
              Log in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}