'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r-2 border-black">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b-2 border-black bg-brand">
          <Image
            src="/images/logo-lg.png"
            alt="4HACKS"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
          <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded">ORG</span>
        </div>

        {/* Organization Selector */}
        <div className="px-4 py-4 border-b-2 border-black bg-gray-50">
          <label className="text-xs font-bold text-black mb-2 block uppercase tracking-wide">Organization</label>
          <Select
            value={currentOrganization?.id || ''}
            onValueChange={handleOrgChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select organization">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-black" />
                  <span className="truncate">{currentOrganization?.name || 'Select'}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem
                  key={org.id}
                  value={org.id}
                >
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all border-2',
                  isActive
                    ? 'bg-brand text-black border-black shadow-brutal-sm'
                    : 'text-gray-700 border-transparent hover:border-black hover:bg-gray-100'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t-2 border-black p-4 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg border-2 border-black bg-brand flex items-center justify-center shadow-brutal-sm">
              <span className="text-sm font-bold text-black">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-black truncate">{user?.name}</p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-bold text-black bg-white border-2 border-black rounded-lg shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
