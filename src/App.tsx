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
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import VerifyEmail from "./pages/VerifyEmail";
import SubscriptionManager from "./components/SubscriptionManager";
import { useToast } from "./hooks/use-toast";
import { AuthProvider } from "./hooks/useAuth";

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkPremiumStatus(session.user.id);
        checkLimits(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          checkPremiumStatus(session.user.id);
          checkLimits(session.user.id);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkForNotifications = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase.functions.invoke('check-subscription', {
            body: { userId: session.user.id }
          });
          
          if (!error && data) {
            setIsPremium(data.isSubscribed);
            
            if (data.isSubscribed && data.notificationDue) {
              toast({
                title: "Subscription Expiring Soon",
                description: `Your premium subscription will expire in ${data.daysRemaining} day${data.daysRemaining > 1 ? 's' : ''}. Renew now to avoid interruption.`,
                variant: "default"
              });
            }
          }
        } catch (e) {
          console.error("Error checking subscription notifications:", e);
        }
      }
    };
    
    if (session) {
      checkForNotifications();
    }
  }, [session, toast]);

  const checkPremiumStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { userId }
      });
      
      if (!error && data) {
        setIsPremium(data.isSubscribed);
      } else {
        setIsPremium(false);
      }
    } catch (e) {
      console.error("Error checking premium status:", e);
      setIsPremium(false);
    }
  };

  const checkLimits = async (userId: string) => {
    try {
      const { count: pCount, error: pError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (!pError) {
        setPatientsCount(pCount || 0);
      }
      
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
    
    if (type === 'consultation' && consultationsCount >= 1) {
      toast({
        title: "Free Plan Limit Reached",
        description: "You've reached the limit of 1 consultation on the free plan.",
        variant: "destructive"
      });
      setShowSubscription(true);
      return false;
    }
    
    return true;
  };

  const ProtectedRoute = ({ children, pageType }: { children: React.ReactNode, pageType?: 'new-patient' | 'new-consultation' | undefined }) => {
    if (loading) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      );
    }
    
    if (!session) {
      return <Navigate to="/auth" replace />;
    }

    const userEmail = session.user?.email;
    const isEmailVerified = session.user?.email_confirmed_at || userEmail === "hilwitz.solutions@gmail.com";
    
    if (!isEmailVerified) {
      return <Navigate to="/verify-email" replace />;
    }
    
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
          />
        )}
      </div>
    );
  };

  const HomeRoute = () => {
    if (loading) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      );
    }
    
    if (session) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <Index />;
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomeRoute />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/features" element={<Features />} />
                <Route path="/free-trial" element={<Navigate to="/auth" />} />
                
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
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
