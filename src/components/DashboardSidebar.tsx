
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Sidebar, SidebarGroup, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
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
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Home className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </NavLink>
          
          <NavLink
            to="/notes"
            className={({ isActive }) =>
              `flex items-center p-3 ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
              } rounded-md transition-colors mb-1`
            }
          >
            <SidebarMenuItem>
              <SidebarMenuButton>
                <FilePenLine className="mr-2 h-4 w-4" />
                <span>Notes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </NavLink>
          
          <NavLink
            to="/patients"
            className={({ isActive }) =>
              `flex items-center p-3 ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
              } rounded-md transition-colors mb-1`
            }
          >
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Users className="mr-2 h-4 w-4" />
                <span>Patients</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center p-3 ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
              } rounded-md transition-colors mb-1`
            }
          >
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </NavLink>
          
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors mb-1 w-full"
          >
            <SidebarMenuItem>
              <SidebarMenuButton>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
