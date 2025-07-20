'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  role: 'super-admin' | 'bus-owner' | 'user';
}

export default function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  const superAdminLinks = [
    { name: 'Dashboard', href: '/super-admin/dashboard', icon: '📊' },
    { name: 'Users', href: '/super-admin/users', icon: '👥' },
    { name: 'Buses', href: '/super-admin/buses', icon: '🚌' },
    { name: 'Routes', href: '/super-admin/routes', icon: '🗺️' },
    { name: 'Stops', href: '/super-admin/stops', icon: '🛑' },
    { name: 'Route Sections', href: '/super-admin/route-sections', icon: '🔗' },
    { name: 'Sections', href: '/super-admin/sections', icon: '🔄' },
    { name: 'Trips', href: '/super-admin/trips', icon: '🚍' },
    { name: 'Tickets', href: '/super-admin/tickets', icon: '🎫' },
    { name: 'Day End', href: '/super-admin/day-end', icon: '🌅' },
    { name: 'Monthly Fees', href: '/super-admin/monthly-fees', icon: '💰' },
    { name: 'Expenses', href: '/super-admin/expenses', icon: '💸' },
    { name: 'Reports', href: '/super-admin/reports', icon: '📝' },
    { name: 'Settings', href: '/super-admin/settings', icon: '⚙️' },
  ];

  const busOwnerLinks = [
    { name: 'Dashboard', href: '/bus-owner/dashboard', icon: '📊' },
    { name: 'Buses', href: '/bus-owner/buses', icon: '🚌' },
    { name: 'Tickets', href: '/bus-owner/tickets', icon: '🎫' },
    { name: 'Trips', href: '/bus-owner/trips', icon: '🚍' },
    { name: 'Expenses', href: '/bus-owner/expenses', icon: '💰' },
    { name: 'Staff', href: '/bus-owner/staff', icon: '👥' },
    { name: 'Reports', href: '/bus-owner/reports', icon: '📝' },
    { name: 'Settings', href: '/bus-owner/settings', icon: '⚙️' },
  ];

  const links = role === 'super-admin' ? superAdminLinks : busOwnerLinks;

  return (
    <div 
      className={`
        relative flex flex-col min-h-screen text-white shadow-xl 
        transition-all duration-300 ease-in-out border-r border-opacity-20
        ${collapsed ? 'w-16' : 'w-64'}
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
        {!collapsed && (
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
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="w-8 h-8 flex items-center justify-center">
              {/* Simplified logo for collapsed state */}
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 40 40" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M14 16C16 14 18 14 20 16C22 18 22 20 20 22C18 24 16 24 14 22C12 20 12 18 14 16Z" 
                  stroke="white" 
                  strokeWidth="2" 
                  fill="none"
                />
                <circle cx="28" cy="15" r="1.5" fill="white" opacity="0.8" />
                <circle cx="30" cy="25" r="1" fill="white" opacity="0.6" />
              </svg>
            </div>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg transition-colors duration-200"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="space-y-1 px-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <div key={link.name}>
                <Link 
                  href={link.href}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-xl
                    transition-all duration-200 ease-in-out relative
                    ${collapsed ? 'justify-center' : ''}
                  `}
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
                  
                  <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
                    <span className="text-lg flex-shrink-0">{link.icon}</span>
                    {!collapsed && (
                      <span className="ml-3 truncate">{link.name}</span>
                    )}
                  </div>
                  
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div 
                      className="
                        absolute left-full ml-2 px-2 py-1 text-white text-sm 
                        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity 
                        duration-200 pointer-events-none whitespace-nowrap z-50
                        shadow-lg border
                      "
                      style={{ 
                        backgroundColor: '#112545',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {link.name}
                    </div>
                  )}
                </Link>
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
          className={`
            group w-full flex items-center px-3 py-3 text-sm font-medium 
            rounded-xl transition-all duration-200 ease-in-out relative
            ${collapsed ? 'justify-center' : ''}
          `}
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
          <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && (
              <span className="ml-3">Logout</span>
            )}
          </div>
          
          {/* Tooltip for collapsed state */}
          {collapsed && (
            <div 
              className="
                absolute left-full ml-2 px-2 py-1 text-white text-sm 
                rounded-lg opacity-0 group-hover:opacity-100 transition-opacity 
                duration-200 pointer-events-none whitespace-nowrap z-50
                shadow-lg border
              "
              style={{ 
                backgroundColor: '#112545',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
} 