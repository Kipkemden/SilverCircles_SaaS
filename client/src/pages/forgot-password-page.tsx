import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await apiRequest('POST', '/api/forgot-password', {
        email: values.email,
      });

      if (response.ok) {
        setIsEmailSent(true);
        toast({
          title: "Reset Email Sent",
          description: "If an account exists with that email, you'll receive password reset instructions.",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Request Failed",
          description: errorData.message || "Failed to send password reset email.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Request Error",
        description: "An unexpected error occurred while requesting a password reset.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isEmailSent) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h3 className="text-xl font-semibold">Check Your Email</h3>
          <p className="text-center text-muted-foreground">
            If an account exists with that email, we've sent instructions on how to reset your password. Please check your inbox and spam folders.
          </p>
          <div className="space-y-2">
            <Button className="w-full" onClick={() => {
              form.reset();
              setIsEmailSent(false);
            }}>
              Try Another Email
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setLocation("/auth")}>
              Back to Login
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2 mb-6">
            <Mail className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-semibold">Forgot Your Password?</h3>
            <p className="text-center text-muted-foreground">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Instructions...
              </>
            ) : (
              "Send Reset Instructions"
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
          <CardTitle className="text-center text-2xl">Recover Your Account</CardTitle>
          {!isEmailSent && (
            <CardDescription className="text-center">
              We'll help you reset your password
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