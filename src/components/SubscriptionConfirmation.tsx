
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CustomButton } from '@/components/ui/CustomButton';
import { CheckCircle, CreditCard, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: 'monthly' | 'yearly' | null;
  onSuccess?: () => void;
}

const SubscriptionConfirmation = ({
  open,
  onOpenChange,
  plan,
  onSuccess
}: SubscriptionConfirmationProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const planDetails = {
    monthly: {
      price: '₹999',
      label: 'Monthly Plan',
      period: 'month',
      durationInDays: 30
    },
    yearly: {
      price: '₹9999',
      label: 'Yearly Plan',
      period: 'year',
      durationInDays: 365,
      savings: 'Save 2 months free!'
    }
  };
  
  const handlePaymentProcess = async () => {
    if (!plan) return;
    
    setIsProcessing(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Simulate payment process
      // In a real implementation, this would integrate with Razorpay API
      const paymentSuccessful = true; // Simulating successful payment
      
      if (paymentSuccessful) {
        // Calculate expiration date
        const now = new Date();
        const expiresAt = new Date(now.setDate(now.getDate() + planDetails[plan].durationInDays));
        
        // Create a subscription record
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_subscriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            user_id: user.id,
            plan_type: plan,
            expires_at: expiresAt.toISOString(),
            order_id: `order_${Date.now()}`
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create subscription record');
        }
        
        toast({
          title: "Payment Successful!",
          description: `Your ${planDetails[plan].label} subscription is now active.`,
          variant: "default",
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        // Close the dialog and redirect to dashboard
        onOpenChange(false);
        navigate('/dashboard');
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!plan) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-center">
            Unlock unlimited access to all features
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-6 p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-md">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300">
              {planDetails[plan].label}
            </h3>
            <div className="mt-2 text-3xl font-bold">
              {planDetails[plan].price}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                /{planDetails[plan].period}
              </span>
            </div>
            {plan === 'yearly' && (
              <div className="mt-1 text-green-600 dark:text-green-400 font-medium text-sm">
                {planDetails.yearly.savings}
              </div>
            )}
          </div>
          
          <div className="space-y-3 mt-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Unlimited consultations</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Unlimited patients</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Advanced reporting</span>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <CustomButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </CustomButton>
          <CustomButton
            variant="primary"
            onClick={handlePaymentProcess}
            disabled={isProcessing}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            {isProcessing ? 'Processing...' : (
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscribe Now
              </span>
            )}
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionConfirmation;
