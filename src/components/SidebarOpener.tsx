
import { useState, useEffect } from 'react';
import { CustomButton } from '@/components/ui/CustomButton';
import { PanelLeft } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

export const SidebarOpener = () => {
  const { state, toggleSidebar } = useSidebar();
  
  return (
    <div className="fixed top-4 left-4 z-50">
      <CustomButton
        onClick={toggleSidebar}
        size="sm"
        variant="outline"
        className="rounded-full p-2 h-10 w-10 shadow-md backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-800"
      >
        <PanelLeft size={20} className="text-blue-600 dark:text-blue-400" />
        <span className="sr-only">Open Sidebar</span>
      </CustomButton>
    </div>
  );
};
