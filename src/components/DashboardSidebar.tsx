
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Sidebar, SidebarGroup, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { User, Settings, Home, LogOut, Users } from "lucide-react";
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
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">MediNote</h2>
          <div className="flex items-center space-x-3 mt-4 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-800 dark:text-gray-200">{user.email}</div>
              <Badge variant="outline" className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 mt-1">
                Doctor
              </Badge>
            </div>
          </div>
        </div>

        <SidebarGroup className="px-3">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center p-3 ${
                isActive 
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 font-medium" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              } rounded-lg transition-all duration-200 mb-1`
            }
          >
            <SidebarMenuItem className="list-none">
              <SidebarMenuButton>
                <Home className="mr-3 h-5 w-5" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </NavLink>
          
          <NavLink
            to="/patients"
            className={({ isActive }) =>
              `flex items-center p-3 ${
                isActive 
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 font-medium" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              } rounded-lg transition-all duration-200 mb-1`
            }
          >
            <SidebarMenuItem className="list-none">
              <SidebarMenuButton>
                <Users className="mr-3 h-5 w-5" />
                <span>Patients</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center p-3 ${
                isActive 
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 font-medium" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              } rounded-lg transition-all duration-200 mb-1`
            }
          >
            <SidebarMenuItem className="list-none">
              <SidebarMenuButton>
                <Settings className="mr-3 h-5 w-5" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </NavLink>

          <div className="mt-6 border-t border-indigo-100 dark:border-indigo-900 pt-4">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200 mb-1 w-full"
            >
              <SidebarMenuItem className="list-none">
                <SidebarMenuButton>
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </button>
          </div>
        </SidebarGroup>

        <SidebarFooter className="mt-auto p-4 border-t border-indigo-100 dark:border-indigo-900/40">
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            MediSync v1.0
          </p>
          <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-1">
            A product by Hilwitz
          </p>
        </SidebarFooter>
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
