'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Users,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { href: '/dashboard/members', label: 'Members', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, organizations, currentOrganization, setCurrentOrganization, logout } =
    useAuthStore();

  const handleOrgChange = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-zinc-900 border-r border-zinc-800">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-white">
            <span className="text-[#D6FF25]">4</span>HACKS
          </h1>
          <span className="text-xs text-zinc-500">Organizer</span>
        </div>

        {/* Organization Selector */}
        <div className="px-4 py-4 border-b border-zinc-800">
          <label className="text-xs text-zinc-500 mb-2 block">Organization</label>
          <Select
            value={currentOrganization?.id || ''}
            onValueChange={handleOrgChange}
          >
            <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Select organization">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#D6FF25]" />
                  <span className="truncate">{currentOrganization?.name || 'Select'}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {organizations.map((org) => (
                <SelectItem
                  key={org.id}
                  value={org.id}
                  className="text-white focus:bg-zinc-700 focus:text-white"
                >
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#D6FF25]/10 text-[#D6FF25]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-zinc-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-[#D6FF25]/20 flex items-center justify-center">
              <span className="text-sm font-medium text-[#D6FF25]">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
