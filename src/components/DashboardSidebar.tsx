
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Sidebar, SidebarGroup, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { User, FilePenLine, Users, Settings, Home, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SidebarOpener } from "@/components/SidebarOpener";
import LogoutConfirmation from "@/components/LogoutConfirmation";

const DashboardSidebar = () => {
  const { user } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  if (!user) return null;

  return (
    <>
      <Sidebar>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">MediNote</h2>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-700" />
            </div>
            <div className="text-sm">
              <div>{user.email}</div>
              <Badge variant="outline" className="text-xs">
                Doctor
              </Badge>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center p-3 ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
              } rounded-md transition-colors mb-1`
            }
          >
            <SidebarMenuItem icon={Home} label="Dashboard" />
          </NavLink>
          
          <NavLink
            to="/notes"
            className={({ isActive }) =>
              `flex items-center p-3 ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
              } rounded-md transition-colors mb-1`
            }
          >
            <SidebarMenuItem icon={FilePenLine} label="Notes" />
          </NavLink>
          
          <NavLink
            to="/patients"
            className={({ isActive }) =>
              `flex items-center p-3 ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
              } rounded-md transition-colors mb-1`
            }
          >
            <SidebarMenuItem icon={Users} label="Patients" />
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center p-3 ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
              } rounded-md transition-colors mb-1`
            }
          >
            <SidebarMenuItem icon={Settings} label="Settings" />
          </NavLink>
          
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors mb-1 w-full"
          >
            <SidebarMenuItem icon={LogOut} label="Logout" />
          </button>
        </SidebarGroup>
      </Sidebar>
      
      <SidebarOpener />
      
      <LogoutConfirmation 
        open={showLogoutDialog} 
        setOpen={setShowLogoutDialog} 
      />
    </>
  );
};

export default DashboardSidebar;
