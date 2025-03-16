
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  Home, 
  User, 
  Settings, 
  Users, 
  LogOut,
  FilePlus,
  CreditCard,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths } from 'date-fns';

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiryDate, setPremiumExpiryDate] = useState<Date | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if email matches premium email
          const isPremiumAccount = user.email === "hilwitz.solutions@gmail.com";
          setIsPremium(isPremiumAccount);
          
          if (isPremiumAccount) {
            // Set premium expiry to 1 month from today for demonstration
            setPremiumExpiryDate(addMonths(new Date(), 1));
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };
    
    checkSubscription();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "There was a problem logging out",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Check if the current path matches the given path
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-2">
          <h2 className="text-xl font-bold text-center">MedSync</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
                <Link to="/dashboard">
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/patients')}>
                <Link to="/patients">
                  <Users className="w-5 h-5" />
                  <span>Patients</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/consultations/new')}>
                <Link to="/consultations/new">
                  <FilePlus className="w-5 h-5" />
                  <span>New Consultation</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/notes')}>
                <Link to="/notes">
                  <FileText className="w-5 h-5" />
                  <span>Notes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              {isPremium ? (
                <div className="flex flex-col px-3 py-2 text-sm font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md">
                  <div className="flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    <span>Premium Account</span>
                  </div>
                  {premiumExpiryDate && (
                    <span className="text-xs mt-1 ml-7 text-green-600 dark:text-green-400">
                      Valid until {format(premiumExpiryDate, 'dd MMM yyyy')}
                    </span>
                  )}
                </div>
              ) : (
                <SidebarMenuButton asChild onClick={() => navigate('/settings')}>
                  <button className="flex items-center text-amber-600 dark:text-amber-400">
                    <CreditCard className="w-5 h-5" />
                    <span>Free Account</span>
                  </button>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/profile')}>
                <Link to="/profile">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/settings')}>
                <Link to="/settings">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="w-5 h-5" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-center text-gray-500">
          MedSync v1.0.0
          <p className="mt-1 text-gray-400 text-[10px]">A product by Hilwitz</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
