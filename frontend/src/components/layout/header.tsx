'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/hackathons', label: 'Hackathons' },
  { href: '/courses', label: 'Learn' },
  { href: '/community', label: 'Community' },
  { href: '/blog', label: 'Blog' },
];

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const isActiveLink = (href: string) => {
    if (href === '/courses') {
      return pathname === '/courses' || pathname.startsWith('/courses/');
    }
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black border-b-[3px] border-brand">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <div className="flex items-center">
            <span className="bg-brand text-black font-extrabold text-lg sm:text-xl px-2 py-0.5 rounded-sm italic -skew-x-6">
              4
            </span>
            <span className="text-white font-extrabold text-lg sm:text-xl ml-0.5 tracking-tight">
              HACKS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                isActiveLink(link.href)
                  ? 'bg-brand text-black'
                  : 'text-white hover:text-brand'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <span className="text-sm font-medium text-white hover:text-brand transition-colors">
                  Dashboard
                </span>
              </Link>
              <button
                onClick={() => logout()}
                className="text-sm font-medium text-white hover:text-brand transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <span className="text-sm font-medium text-white hover:text-brand transition-colors">
                  Log In
                </span>
              </Link>
              <Link href="/auth/register">
                <button className="h-9 px-5 text-sm font-bold bg-brand text-black rounded-full hover:bg-brand-light transition-colors whitespace-nowrap">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 -mr-2 touch-manipulation text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-[calc(3.5rem+3px)] sm:top-[calc(4rem+3px)] bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden fixed left-0 right-0 top-[calc(3.5rem+3px)] sm:top-[calc(4rem+3px)] bg-black border-b-[3px] border-brand z-50 transition-all duration-300 ease-in-out',
          mobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <nav className="flex flex-col p-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-3 text-base font-medium rounded-lg transition-colors',
                isActiveLink(link.href)
                  ? 'bg-brand text-black'
                  : 'text-white hover:bg-white/10 active:bg-white/10'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 pt-4 border-t border-white/20 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full justify-center border-white text-white hover:bg-white hover:text-black">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-center text-white hover:bg-white/10"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full justify-center border-white text-white hover:bg-white hover:text-black">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/register" className="block">
                  <button className="w-full h-11 px-5 text-sm font-bold bg-brand text-black rounded-full hover:bg-brand-light transition-colors">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
