'use client'
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
      <Sidebar role="admin" onCollapseChange={setIsCollapsed} />
      <main className={`${
        isMobile 
          ? 'w-full pt-20' 
          : 'flex-1'
      } transition-all duration-300`}>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}