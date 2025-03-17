
import { useState } from 'react';
import { Sidebar, SidebarNav, SidebarNavGroup, SidebarNavItem } from '@/components/ui/sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Clipboard, Users, UserCircle, Settings, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SidebarOpener from './SidebarOpener';
import LogoutConfirmation from './LogoutConfirmation';

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  return (
    <>
      <Sidebar className="shrink-0 border-r h-screen">
        <SidebarOpener />
        
        <div className="my-4 flex items-center justify-center px-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            MedNotes
          </h2>
        </div>
        
        <SidebarNav>
          <SidebarNavGroup className="px-2 space-y-1">
            <SidebarNavItem 
              active={location.pathname === '/dashboard'} 
              onClick={() => navigate('/dashboard')}
              className={location.pathname === '/dashboard' ? 'bg-blue-50 dark:bg-blue-950' : ''}
            >
              <Home className="h-5 w-5 text-blue-600 mr-3" /> Dashboard
            </SidebarNavItem>
            
            <SidebarNavItem 
              active={location.pathname.includes('/consultations')} 
              onClick={() => navigate('/consultations/new')}
              className={location.pathname.includes('/consultations') ? 'bg-blue-50 dark:bg-blue-950' : ''}
            >
              <Clipboard className="h-5 w-5 text-blue-600 mr-3" /> New Consultation
            </SidebarNavItem>
            
            <SidebarNavItem 
              active={location.pathname.includes('/patients')} 
              onClick={() => navigate('/patients')}
              className={location.pathname.includes('/patients') ? 'bg-blue-50 dark:bg-blue-950' : ''}
            >
              <Users className="h-5 w-5 text-blue-600 mr-3" /> Patients
            </SidebarNavItem>
          </SidebarNavGroup>
          
          <div className="mt-auto">
            <SidebarNavGroup className="px-2 space-y-1">
              <SidebarNavItem 
                active={location.pathname === '/profile'} 
                onClick={() => navigate('/profile')}
                className={location.pathname === '/profile' ? 'bg-blue-50 dark:bg-blue-950' : ''}
              >
                <UserCircle className="h-5 w-5 text-blue-600 mr-3" /> Profile
              </SidebarNavItem>
              
              <SidebarNavItem 
                active={location.pathname === '/settings'} 
                onClick={() => navigate('/settings')}
                className={location.pathname === '/settings' ? 'bg-blue-50 dark:bg-blue-950' : ''}
              >
                <Settings className="h-5 w-5 text-blue-600 mr-3" /> Settings
              </SidebarNavItem>
              
              <SidebarNavItem 
                onClick={() => setLogoutDialogOpen(true)}
              >
                <LogOut className="h-5 w-5 text-red-500 mr-3" /> 
                <span className="text-red-500">Logout</span>
              </SidebarNavItem>
            </SidebarNavGroup>
          </div>
        </SidebarNav>
      </Sidebar>
      <LogoutConfirmation open={logoutDialogOpen} setOpen={setLogoutDialogOpen} />
    </>
  );
};

export default DashboardSidebar;
