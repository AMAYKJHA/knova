'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

interface NavLink {
  name: string;
  href: string;
  icon: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [isDropDownOpen, setDropDownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const links: NavLink[] = [
    { name: 'Home', href: '/', icon: 'home' },
    { name: 'Space', href: '/learnspace', icon: 'school' },
    { name: 'Explore', href: '/explore', icon: 'explore' },
    { name: 'Profile', href: '/profile', icon: 'person' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ];

  // Prefix match so nested routes still light up their tab — "/" has to be
  // exact or it would match everything.
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropDownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (pathname === '/learnspace') return null;

  return (
    <header className="w-full top-0 z-50 bg-[#fbf9f8] shadow-sm flex justify-between items-center py-4 fixed px-2 lg:px-[64px] h-[68px]">
      <div className="flex items-center flex-1 gap-10">
        <div className="flex items-center gap-2">
          <img
            src="/logos/KnovaWordmark.svg"
            alt="Knova"
            width={198}
            height={101}
            className="h-16 w-auto object-contain transition-all"
          />
        </div>

        <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl group transition-colors ${
                  active
                    ? 'font-bold bg-[#f36710]/10 text-[#f36710]'
                    : 'text-[#594137] hover:bg-[#e9e8e7]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-xl transition-colors ${
                    active ? 'text-[#f36710]' : 'group-hover:text-[#f36710]'
                  }`}
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {link.icon}
                </span>
                <span className="text-[13px] font-medium tracking-wide">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className={`relative flex items-center justify-center transition-colors ${
              pathname === '/notifications'
                ? 'text-[#f36710]'
                : 'text-[#594137] hover:text-[#1b1c1c]'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  pathname === '/notifications' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              notifications
            </span>
            {/* unread dot — swap for a real count once the endpoint exists */}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#f36710] ring-2 ring-[#fbf9f8]" />
          </Link>

          {user ? (
            <div ref={dropdownRef} className="hidden md:block relative">
              <div
                onClick={() => setDropDownOpen((prev) => !prev)}
                className="h-9 w-9 rounded-full bg-[#2cbcfd] flex items-center justify-center overflow-hidden border border-[#e4e2e2] cursor-pointer"
              >
                <img
                  alt="User profile"
                  className="w-full h-full object-cover"
                  src={
                    user.avatar_url ||
                    '/logos/default-avatar.png'
                  }
                  width={36}
                  height={36}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#e4e2e2]/50 py-2 z-50 transition-all duration-200 ${
                  isDropDownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                <div className="px-4 py-2 border-b border-[#e4e2e2]/50">
                  <p className="text-xs text-[#8d7165] font-medium uppercase tracking-wider">
                    Account
                  </p>
                  <p className="text-sm font-bold text-[#1b1c1c] truncate">
                    {user.username}
                  </p>
                </div>
                <Link
                  href={`/profile/${user.username}`}
                  onClick={() => setDropDownOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-[#594137] hover:bg-[#f5f3f3] hover:text-[#f36710] transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  My Profile
                </Link>
                <button
                  onClick={async () => {
                    setDropDownOpen(false);
                    await logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#594137] hover:bg-[#f5f3f3] hover:text-[#f36710] transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="py-2 px-4 rounded-xl text-sm font-bold bg-[#f36710] text-white hover:bg-[#d95a0d] transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}