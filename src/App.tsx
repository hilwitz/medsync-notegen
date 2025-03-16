
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NewConsultation from "./pages/NewConsultation";
import ConsultationDetail from "./pages/ConsultationDetail";
import Patients from "./pages/Patients";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notes from "./pages/Notes";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import VerifyEmail from "./pages/VerifyEmail";
import SubscriptionManager from "./components/SubscriptionManager";
import { useToast } from "./hooks/use-toast";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSubscription, setShowSubscription] = useState(false);
  const [patientsCount, setPatientsCount] = useState(0);
  const [consultationsCount, setConsultationsCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkPremiumStatus(session.user.email);
        checkLimits(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          checkPremiumStatus(session.user.email);
          checkLimits(session.user.id);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkPremiumStatus = (email: string | undefined) => {
    if (email === "hilwitz.solutions@gmail.com") {
      setIsPremium(true);
    } else {
      setIsPremium(false);
    }
  };

  const checkLimits = async (userId: string) => {
    try {
      // Count patients
      const { count: pCount, error: pError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (!pError) {
        setPatientsCount(pCount || 0);
      }
      
      // Count consultations
      const { count: cCount, error: cError } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (!cError) {
        setConsultationsCount(cCount || 0);
      }
    } catch (error) {
      console.error("Error checking limits:", error);
    }
  };

  // Check if user has reached limits before allowing new items
  const checkSubscriptionLimits = (type: 'patient' | 'consultation') => {
    if (isPremium) return true;
    
    if (type === 'patient' && patientsCount >= 1) {
      toast({
        title: "Free Plan Limit Reached",
        description: "You've reached the limit of 1 patient on the free plan.",
        variant: "destructive"
      });
      setShowSubscription(true);
      return false;
    }
    
    if (type === 'consultation' && consultationsCount >= 3) {
      toast({
        title: "Free Plan Limit Reached",
        description: "You've reached the limit of 3 consultations on the free plan.",
        variant: "destructive"
      });
      setShowSubscription(true);
      return false;
    }
    
    return true;
  };

  // Protected route component with email verification check
  const ProtectedRoute = ({ children, pageType }: { children: React.ReactNode, pageType?: 'new-patient' | 'new-consultation' | undefined }) => {
    if (loading) return <div>Loading...</div>;
    
    if (!session) {
      return <Navigate to="/auth" replace />;
    }

    // Check if the user's email is verified
    const userEmail = session.user?.email;
    const isEmailVerified = session.user?.email_confirmed_at || userEmail === "hilwitz.solutions@gmail.com";
    
    if (!isEmailVerified) {
      return <Navigate to="/verify-email" replace />;
    }
    
    // Check subscription limits for specific pages
    if (pageType === 'new-patient' && !checkSubscriptionLimits('patient')) {
      return <Navigate to="/patients" replace />;
    }
    
    if (pageType === 'new-consultation' && !checkSubscriptionLimits('consultation')) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return (
      <div className="flex flex-col min-h-screen">
        {children}
        {showSubscription && (
          <SubscriptionManager 
            open={showSubscription}
            onOpenChange={setShowSubscription}
            premiumEmail="hilwitz.solutions@gmail.com"
          />
        )}
      </div>
    );
  };

  // Check if user is logged in for root route
  const HomeRoute = () => {
    if (loading) return <div>Loading...</div>;
    
    if (session) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <Index />;
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/features" element={<Features />} />
              <Route path="/free-trial" element={<Navigate to="/auth" />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/consultations/new" element={
                <ProtectedRoute pageType="new-consultation">
                  <NewConsultation />
                </ProtectedRoute>
              } />
              
              <Route path="/consultations/:id" element={
                <ProtectedRoute>
                  <ConsultationDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/patients" element={
                <ProtectedRoute>
                  <Patients />
                </ProtectedRoute>
              } />
              
              <Route path="/patients/:id" element={
                <ProtectedRoute>
                  <Patients />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="/notes" element={
                <ProtectedRoute>
                  <Notes />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
