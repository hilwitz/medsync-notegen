
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { CustomButton } from '@/components/ui/CustomButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  premiumEmail?: string;
}

const SubscriptionManager = ({ open, onOpenChange, premiumEmail = "hilwitz.solutions@gmail.com" }: SubscriptionProps) => {
  const [isPremium, setIsPremium] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [patientsCount, setPatientsCount] = useState(0);
  const [consultationsCount, setConsultationsCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const checkUserSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setCurrentEmail(user.email || '');
        setIsPremium(user.email === premiumEmail);
        
        // Count patients
        const { count: pCount, error: pError } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (!pError) {
          setPatientsCount(pCount || 0);
        }
        
        // Count consultations
        const { count: cCount, error: cError } = await supabase
          .from('consultations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (!cError) {
          setConsultationsCount(cCount || 0);
        }
      }
    };
    
    if (open) {
      checkUserSubscription();
    }
  }, [open, premiumEmail]);

  const handleSubscribe = () => {
    toast({
      title: "Subscription processing",
      description: "Your payment is being processed. Please wait a moment."
    });
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Subscription successful",
        description: "You now have premium access. Enjoy MedSync!"
      });
      
      setIsPremium(true);
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <DialogTitle className="text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
          {isPremium ? "Premium Access" : "Upgrade to Premium"}
        </DialogTitle>
        
        <DialogDescription className="text-center mx-auto max-w-sm">
          {isPremium 
            ? "You have full premium access to all MedSync features." 
            : "Get unlimited patients, consultations, and advanced features."}
        </DialogDescription>
        
        <div className="py-4">
          {isPremium ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4 text-center">
                <p className="text-green-800 dark:text-green-300 font-medium">
                  Premium account active
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  {currentEmail}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">Unlimited</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Patients</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">Unlimited</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Consultations</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between gap-4">
                <div className="w-1/2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Free Plan</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Current limitations:</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <span className={patientsCount >= 1 ? "text-red-500" : "text-gray-600"}>
                        {patientsCount}/1
                      </span>
                      <span>Patients</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={consultationsCount >= 3 ? "text-red-500" : "text-gray-600"}>
                        {consultationsCount}/3
                      </span>
                      <span>Consultations</span>
                    </li>
                  </ul>
                </div>
                
                <div className="w-1/2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">Premium Plan</h3>
                  <div className="mt-2 text-lg font-bold text-blue-800 dark:text-blue-200">
                    ₹999<span className="text-sm font-normal text-blue-600 dark:text-blue-400">/month</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <li>Unlimited patients</li>
                    <li>Unlimited consultations</li>
                    <li>AI note generation</li>
                    <li>Priority support</li>
                  </ul>
                </div>
              </div>
              
              <CustomButton
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-md"
                onClick={handleSubscribe}
              >
                Upgrade Now
              </CustomButton>
              
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                Secure payment processing • Cancel anytime
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionManager;
