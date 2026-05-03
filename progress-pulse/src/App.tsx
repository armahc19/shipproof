import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import AuthCallback from "./pages/AuthCallback";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import PublicSharePage from "./pages/PublicSharePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/github/callback" element={<AuthCallback />} />
          <Route path="/onboarding/:role" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DeveloperDashboard />} />
          <Route path="/details/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/client/:projectId" element={<ClientDashboard />} />
          <Route path="/share/:projectId" element={<PublicSharePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
