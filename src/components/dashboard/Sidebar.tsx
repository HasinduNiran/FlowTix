'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Bus,
  Map,
  MapPin,
  Link as LinkIcon,
  RefreshCw,
  Route,
  Ticket,
  Sunrise,
  DollarSign,
  TrendingDown,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  X
} from 'lucide-react';

interface SidebarProps {
  role: 'super-admin' | 'bus-owner' | 'manager' | 'user';
  mobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

export default function Sidebar({ role, mobileMenuOpen, onMobileMenuClose }: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const pathname = usePathname();
  const { logout } = useAuth();

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    );
  };

  const superAdminGroups = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/super-admin/dashboard',
      isStandalone: true
    },
    {
      name: 'Users',
      icon: Users,
      href: '/super-admin/users',
      isStandalone: true
    },
    {
      name: 'Buses',
      icon: Bus,
      href: '/super-admin/buses',
      isStandalone: true
    },
    {
      name: 'Route Management',
      icon: Map,
      items: [
        { name: 'Routes', href: '/super-admin/routes', icon: Route },
        { name: 'Stops', href: '/super-admin/stops', icon: MapPin },
        { name: 'Route Sections', href: '/super-admin/route-sections', icon: LinkIcon },
        { name: 'Sections', href: '/super-admin/sections', icon: RefreshCw },
      ]
    },
    {
      name: 'Trip Operations',
      icon: Bus,
      items: [
        { name: 'Trips', href: '/super-admin/trips', icon: Route },
        { name: 'Tickets', href: '/super-admin/tickets', icon: Ticket },
        { name: 'Day End', href: '/super-admin/day-end', icon: Sunrise },
      ]
    },
    {
      name: 'Financial Overview',
      icon: DollarSign,
      items: [
        { name: 'Monthly Fees', href: '/super-admin/monthly-fees', icon: DollarSign },
        { name: 'Expenses', href: '/super-admin/expenses', icon: TrendingDown },
        { name: 'Reports', href: '/super-admin/reports', icon: FileText },
      ]
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '/super-admin/settings',
      isStandalone: true
    },
  ];

  const busOwnerGroups = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/bus-owner/dashboard',
      isStandalone: true
    },
    {
      name: 'Users',
      icon: Users,
      href: '/bus-owner/users',
      isStandalone: true
    },
    {
      name: 'Buses',
      icon: Bus,
      href: '/bus-owner/buses',
      isStandalone: true
    },
    {
      name: 'Route Sections',
      icon: LinkIcon,
      href: '/bus-owner/route-sections',
      isStandalone: true
    },
    {
      name: 'Trip Operations',
      icon: Bus,
      items: [
        { name: 'Trips', href: '/bus-owner/trips', icon: Route },
        { name: 'Tickets', href: '/bus-owner/tickets', icon: Ticket },
        { name: 'Day End', href: '/bus-owner/day-end', icon: Sunrise },
      ]
    },
    {
      name: 'Financial Overview',
      icon: DollarSign,
      items: [
        { name: 'Monthly Fees', href: '/bus-owner/monthly-fees', icon: DollarSign },
        { name: 'Expenses', href: '/bus-owner/expenses', icon: TrendingDown },
      ]
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '/bus-owner/settings',
      isStandalone: true
    },
  ];

  const managerGroups = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/manager/dashboard',
      isStandalone: true
    },
    {
      name: 'My Bus',
      icon: Bus,
      href: '/manager/bus',
      isStandalone: true
    },
    {
      name: 'Route Sections',
      icon: LinkIcon,
      href: '/manager/route-sections',
      isStandalone: true
    },
    {
      name: 'Trip Operations',
      icon: Bus,
      items: [
        { name: 'Trips', href: '/manager/trips', icon: Route },
        { name: 'Tickets', href: '/manager/tickets', icon: Ticket },
        { name: 'Day End', href: '/manager/day-end', icon: Sunrise },
      ]
    },
    {
      name: 'Financial Overview',
      icon: DollarSign,
      items: [
        { name: 'Monthly Fees', href: '/manager/monthly-fees', icon: DollarSign },
        { name: 'Expenses', href: '/manager/expenses', icon: TrendingDown },
      ]
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '/manager/settings',
      isStandalone: true
    },
  ];

  const groups = role === 'super-admin' ? superAdminGroups : 
                 role === 'bus-owner' ? busOwnerGroups : 
                 role === 'manager' ? managerGroups : busOwnerGroups;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .sidebar-nav::-webkit-scrollbar {
            display: none;
          }
          .desktop-sidebar {
            display: flex;
          }
          @media (max-width: 768px) {
            .desktop-sidebar {
              display: none;
            }
            .mobile-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.5);
              z-index: 40;
            }
            .mobile-sidebar {
              position: fixed;
              top: 0;
              left: 0;
              bottom: 0;
              z-index: 50;
              transform: translateX(-100%);
              transition: transform 0.3s ease-in-out;
              display: flex;
            }
            .mobile-sidebar.open {
              transform: translateX(0);
            }
          }
        `
      }} />
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay md:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          relative flex-col min-h-screen text-white shadow-xl 
          transition-all duration-300 ease-in-out border-r border-opacity-20
          w-64 desktop-sidebar
          mobile-sidebar ${mobileMenuOpen ? 'open' : ''}
        `}
        style={{ 
          backgroundColor: '#112545',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
      {/* Header Section */}
      <div 
        className="flex items-center justify-between p-4 border-b border-opacity-20"
        style={{ 
          borderColor: 'rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            {/* FlowTix Logo - Wave design inspired by the attached image */}
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 40 40" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              {/* Main wave curves */}
              <path 
                d="M8 20C8 12 12 8 20 8C28 8 32 12 32 20C32 28 28 32 20 32C12 32 8 28 8 20Z" 
                fill="url(#gradient1)" 
                fillOpacity="0.1"
              />
              <path 
                d="M10 18C12 12 16 10 22 12C28 14 30 18 28 22C26 26 22 28 18 26C14 24 10 20 10 18Z" 
                stroke="white" 
                strokeWidth="2" 
                fill="none"
                opacity="0.9"
              />
              <path 
                d="M14 16C16 14 18 14 20 16C22 18 22 20 20 22C18 24 16 24 14 22C12 20 12 18 14 16Z" 
                stroke="white" 
                strokeWidth="1.5" 
                fill="none"
                opacity="0.7"
              />
              {/* Decorative dots */}
              <circle cx="30" cy="15" r="2" fill="white" opacity="0.8" />
              <circle cx="32" cy="25" r="1.5" fill="white" opacity="0.6" />
              <circle cx="12" cy="12" r="1" fill="white" opacity="0.5" />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.05" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-wide">FlowTix</span>
        </div>
        
        {/* Close button for mobile */}
        <button 
          className="md:hidden p-2 rounded-lg transition-colors duration-200"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
          onClick={onMobileMenuClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          title="Close menu"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Navigation Section */}
      <nav 
        className="flex-1 py-6 overflow-y-auto sidebar-nav"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* Internet Explorer 10+ */
        }}
      >
        <div className="space-y-1 px-3">
          {groups.map((group) => {
            // Handle standalone items (Dashboard, Settings, Users, Buses, etc.)
            if (group.isStandalone) {
              const isActive = pathname === group.href;
              return (
                <div key={group.name}>
                  <Link 
                    href={group.href!}
                    className="group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out relative"
                    style={{
                      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.8)' : 'transparent',
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                      }
                    }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" 
                        style={{ backgroundColor: '#60a5fa' }}
                      />
                    )}
                    
                    <div className="flex items-center">
                      <group.icon className="w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
                      <span className="ml-4 truncate font-medium">{group.name}</span>
                    </div>
                  </Link>
                </div>
              );
            }

            // Handle grouped items
            const isGroupExpanded = expandedGroups.includes(group.name);
            const hasActiveChild = group.items?.some(item => pathname === item.href);

            return (
              <div key={group.name} className="mb-2">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="group w-full flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out relative justify-between"
                  style={{
                    backgroundColor: hasActiveChild ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                    color: hasActiveChild ? 'white' : 'rgba(255, 255, 255, 0.9)',
                  }}
                  onMouseEnter={(e) => {
                    if (!hasActiveChild) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!hasActiveChild) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                    }
                  }}
                >
                  {/* Active indicator for group */}
                  {hasActiveChild && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" 
                      style={{ backgroundColor: '#60a5fa' }}
                    />
                  )}
                  
                  <div className="flex items-center">
                    <group.icon className="w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
                    <span className="ml-4 truncate font-semibold">{group.name}</span>
                  </div>
                  
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-200 ${isGroupExpanded ? 'rotate-180' : ''}`}
                    strokeWidth={1.5}
                  />
                </button>

                {/* Group Items */}
                {isGroupExpanded && group.items && (
                  <div className="mt-2 ml-6 space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link 
                          key={item.name}
                          href={item.href}
                          className="group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out relative"
                          style={{
                            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.8)' : 'transparent',
                            color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                              e.currentTarget.style.color = 'white';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                            }
                          }}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <div 
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" 
                              style={{ backgroundColor: '#60a5fa' }}
                            />
                          )}
                          
                          <div className="flex items-center">
                            <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                            <span className="ml-4 truncate">{item.name}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer Section */}
      <div 
        className="p-4 border-t border-opacity-20"
        style={{ 
          borderColor: 'rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}
      >
        <button
          onClick={logout}
          className="group w-full flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out relative"
          style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
          title="Logout"
        >
          <div className="flex items-center">
            <LogOut className="w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
            <span className="ml-4 font-medium">Logout</span>
          </div>
        </button>
      </div>
    </div>
    </>
  );
}
