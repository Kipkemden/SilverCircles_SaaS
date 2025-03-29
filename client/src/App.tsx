import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ForumsPage from "@/pages/forums-page";
import ForumDetailPage from "@/pages/forum-detail-page";
import GroupsPage from "@/pages/groups-page";
import GroupDetailPage from "@/pages/group-detail-page";
import ZoomCallsPage from "@/pages/zoom-calls-page";
import SubscriptionPage from "@/pages/subscription-page";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/forums" component={ForumsPage} />
      <ProtectedRoute path="/forums/:id" component={ForumDetailPage} />
      <ProtectedRoute path="/groups" component={GroupsPage} />
      <ProtectedRoute path="/groups/:id" component={GroupDetailPage} />
      <ProtectedRoute path="/zoom-calls" component={ZoomCallsPage} />
      <ProtectedRoute path="/subscription" component={SubscriptionPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
