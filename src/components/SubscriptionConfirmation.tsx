
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Calendar, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addMonths, addYears } from 'date-fns';

interface SubscriptionConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: 'monthly' | 'yearly' | null;
}

const SubscriptionConfirmation = ({ open, onOpenChange, plan }: SubscriptionConfirmationProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePaymentProcess = async () => {
    if (!plan) return;
    
    try {
      setIsProcessing(true);

      // Generate order ID
      const orderId = `order_${Date.now()}`;
      
      // In a real implementation, this would integrate with Razorpay SDK
      // For now, we'll simulate a successful payment after a delay
      setTimeout(async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error("User not authenticated");
          }
          
          const subscriptionEndDate = plan === 'monthly' 
            ? addMonths(new Date(), 1) 
            : addYears(new Date(), 1);
          
          // Store subscription info in your database using the REST API directly
          // since the user_subscriptions table might not be accessible via the client
          const response = await fetch(`${supabase.auth.getSession().then(res => res.data.session?.access_token)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
              user_id: user.id,
              plan_type: plan,
              is_active: true,
              subscribed_at: new Date().toISOString(),
              expires_at: subscriptionEndDate.toISOString(),
              order_id: orderId
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to store subscription');
          }
          
          toast({
            title: "Payment successful!",
            description: `Your ${plan} subscription is now active.`,
          });
          
          navigate("/dashboard");
          onOpenChange(false);
        } catch (error) {
          console.error("Error processing payment:", error);
          toast({
            title: "Payment processing error",
            description: "There was a problem activating your subscription.",
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      }, 2000);
      
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Premium Subscription
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Unlock unlimited features and take your practice to the next level
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className={`rounded-lg p-4 border ${plan === 'monthly' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 bg-gray-50 dark:bg-gray-800'}`}>
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">Monthly</h3>
                  {plan === 'monthly' && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-300">
                      Selected
                    </Badge>
                  )}
                </div>
                <div className="mt-2 text-2xl font-bold">₹999<span className="text-sm font-normal">/month</span></div>
                <ul className="mt-3 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Unlimited patients</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Unlimited consultations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Billed monthly</span>
                  </li>
                </ul>
              </div>
              
              <div className={`rounded-lg p-4 border ${plan === 'yearly' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 bg-gray-50 dark:bg-gray-800'}`}>
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">Yearly</h3>
                  {plan === 'yearly' && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-300">
                      Selected
                    </Badge>
                  )}
                </div>
                <div className="mt-2 text-2xl font-bold">₹9999<span className="text-sm font-normal">/year</span></div>
                <ul className="mt-3 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Unlimited patients</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Unlimited consultations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <span>Save 2 months</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium">Summary</h4>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                  <span className="font-medium">{plan === 'monthly' ? 'Monthly' : 'Yearly'} Premium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="font-medium">{plan === 'monthly' ? '₹999' : '₹9999'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Validity:</span>
                  <span className="font-medium">{plan === 'monthly' ? '1 month' : '1 year'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Renewal date:</span>
                  <span className="font-medium">
                    {plan === 'monthly' 
                      ? format(addMonths(new Date(), 1), 'dd MMM yyyy')
                      : format(addYears(new Date(), 1), 'dd MMM yyyy')
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handlePaymentProcess}
            disabled={isProcessing}
            className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
          >
            {isProcessing ? "Processing..." : "Confirm Payment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SubscriptionConfirmation;
