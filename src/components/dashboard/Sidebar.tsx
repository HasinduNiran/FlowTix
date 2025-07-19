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
    { name: 'Reports', href: '/super-admin/reports', icon: '📝' },
    { name: 'Settings', href: '/super-admin/settings', icon: '⚙️' },
  ];

  const busOwnerLinks = [
    { name: 'Dashboard', href: '/bus-owner/dashboard', icon: '📊' },
    { name: 'Buses', href: '/bus-owner/buses', icon: '🚌' },
    { name: 'Tickets', href: '/bus-owner/tickets', icon: '🎫' },
    { name: 'Trips', href: '/bus-owner/trips', icon: '🚍' },
    { name: 'Staff', href: '/bus-owner/staff', icon: '👥' },
    { name: 'Reports', href: '/bus-owner/reports', icon: '📝' },
    { name: 'Settings', href: '/bus-owner/settings', icon: '⚙️' },
  ];

  const links = role === 'super-admin' ? superAdminLinks : busOwnerLinks;

  return (
    <div 
      className={`bg-blue-800 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <span className="text-xl font-bold">FlowTix</span>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-blue-700"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="mt-5">
        <ul className="space-y-2 px-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link 
                  href={link.href}
                  className={`flex items-center p-2 rounded-lg ${
                    isActive 
                      ? 'bg-blue-700 text-white' 
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  {!collapsed && (
                    <span className="ml-3">{link.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4">
        <button
          onClick={logout}
          className={`flex items-center p-2 rounded-lg text-blue-100 hover:bg-blue-700 ${
            collapsed ? 'justify-center w-full' : ''
          }`}
        >
          <span className="text-xl">🚪</span>
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
} 