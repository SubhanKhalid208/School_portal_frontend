'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  PenTool, 
  UserPlus, 
  BookOpenCheck,
  Menu,
  X
} from 'lucide-react';
import Cookies from 'js-cookie';

export default function Sidebar({ role, onCollapseChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true); 
    const id = Cookies.get('userId');
    if (id) {
      setUserId(id);
    }
    
    // Detect screen size
    const handleResize = () => {
      const isMobileScreen = window.innerWidth < 768;
      setIsMobile(isMobileScreen);
      if (!isMobileScreen) {
        setIsMobileOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (onCollapseChange) onCollapseChange(isCollapsed);
  }, [isCollapsed, onCollapseChange]);
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }, [pathname, isMobile]);

  // Yeh logic ab aap dashboard header mein use karenge
  const onLogout = () => {
    Cookies.remove('userId');
    Cookies.remove('token'); 
    Cookies.remove('role');
    localStorage.clear();
    window.location.href = '/login';
  };

  const menuItems = {
    admin: [
      { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20}/> },
      { name: 'User Management', path: '/admin/users', icon: <Users size={20}/> },
    ],
    teacher: [
      { name: 'My Dashboard', path: '/teacher', icon: <LayoutDashboard size={20}/> },
      { name: 'Attendance', path: '/teacher/attendance', icon: <ClipboardCheck size={20}/> },
      { name: 'Create Quiz', path: '/teacher/create-quiz', icon: <PenTool size={20}/> },
      { name: 'Assign Quiz', path: '/teacher/assign-quiz', icon: <UserPlus size={20}/> },
    ],
    student: [
      { 
        name: 'My Dashboard', 
        path: userId ? `/dashboard/student/${userId}` : '#', 
        icon: <LayoutDashboard size={20}/> 
      },
      { 
        name: 'My Quizzes', 
        path: userId ? `/dashboard/student/${userId}/quizzes` : '#', 
        icon: <BookOpenCheck size={20}/> 
      },
      { 
        name: 'Attendance Report', 
        path: userId ? `/dashboard/student/${userId}/attendance` : '#', 
        icon: <FileText size={20}/> 
      },
    ]
  };

  const currentMenu = menuItems[role] || [];

  if (!isMounted) return <div className="w-20 h-screen bg-[#161d2f]"></div>;

  return (
    <>
      {/* Hamburger Menu Button - Mobile Only */}
      {isMobile && (
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-[70] bg-green-500 rounded-lg p-2 text-black hover:bg-green-400 transition-all md:hidden"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: Static positioning | Mobile: Fixed with slide */}
      <aside 
        className={`h-screen bg-[#161d2f] border-r border-gray-800 flex flex-col p-4 transition-all duration-300 ${
          isMobile
            ? `fixed top-0 left-0 z-50 w-64 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `relative ${isCollapsed ? 'w-20' : 'w-64'}`
        }`}
      >
      {/* Toggle Button - Desktop Only */}
      {!isMobile && (
        <div className="absolute -right-3 top-10 z-[60]">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-green-500 rounded-full p-1 text-black hover:scale-110 shadow-lg hover:bg-green-400 transition-all"
          >
            {isCollapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
          </button>
        </div>
      )}

      {/* Logo Section */}
      <div className={`mb-10 px-2 ${isCollapsed ? 'text-center' : ''}`}>
        <h1 className={`font-bold text-green-500 transition-all ${isCollapsed ? 'text-sm' : 'text-xl italic font-black'}`}>
          {isCollapsed ? 'LP' : 'Lahore Portal'}
        </h1>
        {!isCollapsed && <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{role} Panel</p>}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {currentMenu.map((item) => {
          const isActive = item.path !== '#' && (pathname === item.path || pathname.startsWith(item.path));
          const isDisabled = item.path === '#';

          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                  : 'hover:bg-[#1f2937] text-gray-400'
              } ${isCollapsed ? 'justify-center' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                if(isDisabled) {
                  e.preventDefault();
                }
              }}
            >
              <div className={isActive ? 'text-white' : 'text-green-500/70'}>
                {item.icon}
              </div>
              {!isCollapsed && <span className="font-bold text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout button yahan se delete kar diya gaya hai */}
      </aside>
    </>
  );
}