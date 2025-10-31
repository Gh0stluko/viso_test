'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Головна', private: false },
  { href: '/recipes', label: 'Рецепти', private: false },
  { href: '/my-recipes', label: 'Мої рецепти', private: true },
  { href: '/recipes/create', label: 'Створити', private: true },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Flavor<span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">AI</span>
            </Link>

            <div className="hidden md:flex gap-1">
              {navLinks
                .filter((link) => (link.private ? !!user : true))
                .map((link) => {
                  const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  );
                })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">Привіт, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Вийти
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors hidden sm:block">
                  Увійти
                </Link>
                <Link href="/auth/register" className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                  Почати
                </Link>
              </>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {navLinks
              .filter((link) => (link.private ? !!user : true))
              .map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium mb-1 ${
                      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            {!user && (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block sm:hidden px-3 py-2 rounded-lg text-sm font-medium text-gray-600 mb-1"
              >
                Увійти
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}