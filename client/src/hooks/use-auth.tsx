import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useSupabaseAuth } from "./use-supabase-auth";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  resetPassword: (email: string) => Promise<void>;
};

type LoginData = {
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { 
    user: supabaseUser, 
    signIn: supabaseSignIn, 
    signUp: supabaseSignUp, 
    signOut: supabaseSignOut,
    resetPassword: supabaseResetPassword
  } = useSupabaseAuth();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!supabaseUser, // Only fetch user data if logged in with Supabase
  });

  // Sync Supabase auth with our backend
  useEffect(() => {
    if (supabaseUser && !user) {
      // If logged in with Supabase but not in our backend, sync the session
      apiRequest("POST", "/api/supabase-sync", { userId: supabaseUser.id })
        .then(res => res.json())
        .then(userData => {
          queryClient.setQueryData(["/api/user"], userData);
        })
        .catch(err => {
          console.error("Failed to sync Supabase session:", err);
        });
    }
  }, [supabaseUser, user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // First authenticate with Supabase
      await supabaseSignIn(credentials.email, credentials.password);
      
      // Then get user details from our API
      const res = await apiRequest("GET", "/api/user");
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: `You're now logged in as ${user.fullName || user.username}`,
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      // First register with Supabase
      await supabaseSignUp(userData.email, userData.password, userData.fullName);
      
      // Then create account in our database
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome to Silver Circles!",
        description: "Please check your email to verify your account",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Logout from both Supabase and our API
      await supabaseSignOut();
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Password reset function that uses Supabase
  const resetPassword = async (email: string) => {
    await supabaseResetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
