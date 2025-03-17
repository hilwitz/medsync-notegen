
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle, ArrowRight, Check, XCircle } from "lucide-react";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate("/auth");
        return;
      }
      
      const userEmail = data.session.user.email;
      setEmail(userEmail || null);
      
      // Check if email is verified
      if (data.session.user.email_confirmed_at) {
        navigate("/dashboard");
        return;
      }
      
      setLoading(false);
    };
    
    checkSession();
  }, [navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return;
    
    try {
      setIsVerifying(true);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and spam folder.",
        variant: "default",
      });
      
      setVerificationSent(true);
      
      // Set cooldown to 60 seconds
      setResendCooldown(60);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setIsVerifying(true);
      
      // Refresh the session to check if email was verified
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session?.user.email_confirmed_at) {
        toast({
          title: "Email verified",
          description: "Your email has been verified successfully.",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Email not verified yet",
          description: "Please check your inbox and click the verification link.",
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify email status",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinueAnyway = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Verify your email</h2>
          </div>
          
          {verificationSent ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Verification email sent successfully to <strong>{email}</strong>. Please check your inbox and click the verification link.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    We've sent a verification email to <strong>{email}</strong>. Please check your inbox and click the verification link.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <Button 
              onClick={handleVerifyEmail} 
              disabled={isVerifying}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isVerifying ? "Checking..." : "I've verified my email"}
            </Button>
            
            <Button 
              onClick={handleResendEmail} 
              disabled={resendCooldown > 0 || isVerifying}
              className="w-full"
              variant="outline"
            >
              {resendCooldown > 0 
                ? `Resend email (${resendCooldown}s)` 
                : "Resend verification email"}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
              </div>
            </div>
            
            <Button 
              onClick={handleContinueAnyway} 
              variant="ghost"
              className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Continue to dashboard anyway
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Changed your mind? <button 
              onClick={() => supabase.auth.signOut().then(() => navigate('/auth'))}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
            >
              Sign out
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
