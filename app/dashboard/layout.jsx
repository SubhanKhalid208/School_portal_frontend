'use client'
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar'; 
import Cookies from 'js-cookie';

export default function DashboardLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const role = Cookies.get('role') || 'student';

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen bg-[#0a0f1c]">
      {/* Sidebar handles toggle state */}
      <Sidebar 
        role={role} 
        onCollapseChange={(collapsed) => setIsSidebarCollapsed(collapsed)} 
      />

      {/* Main Content Area - Mobile: full width with top padding | Desktop: flex-1 */}
      <main 
        className={`${
          isMobile 
            ? 'w-full pt-20' 
            : 'flex-1'
        } transition-all duration-300 ease-in-out`}
      >
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}