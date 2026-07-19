'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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
    <header className="w-full top-0 z-50 bg-surface dark:bg-surface-dim shadow-sm flex justify-between items-center py-4 fixed px-2 lg:px-[64px] h-[68px]">
      <div className="flex items-center flex-1 gap-10">
        <div className="flex items-center gap-2">
          <Image
            src="/logos/KnovaWordmark.png"
            alt="Knova"
            width={64}
            height={64}
            className="h-16 object-contain transition-all"
            priority
          />
        </div>

        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl group transition-colors ${isActive
                  ? 'font-bold bg-orange-100 text-orange-500'
                  : 'text-on-surface-variant hover:bg-orange-50'
                  }`}
              >
                <span
                  className={`material-symbols-outlined text-xl transition-colors ${isActive ? 'text-orange-500' : 'text-orange-500 group-hover:text-orange-600'
                    }`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {link.icon}
                </span>
                <span className="font-label-sm text-label-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors">
            notifications
          </button>
          
          {user ? (
            <div
              ref={dropdownRef}
              className="relative"
            >
              <div
                onClick={() => setDropDownOpen(prev => !prev)}
                className="h-9 w-9 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-surface-variant cursor-pointer"
              >
                <img
                  alt="User profile"
                  className="w-full h-full object-cover"
                  src={user.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCEu-3t0uD8i4XHinactyZVIgU5H7GfzqCbS8sWTAWqp4bu2FT6BQazk7xznnRfgM79DLGKmUOMfhSZ7ZltOxkaZa4BoxVzMoWBZN7lWq7-H6-zOpZ9cKOQ5DLXJwgCf1DA_64LXRFB-k5-ObAh7PVKgli4I3MLEGQJypaipzHqdLm8T22ZAA8J9LaS4pj7subHocFLNZZuTFi7B_raIxHTm8roMmUnzUmkzQZ0Qdb3ISzIyr9Lherefvbt-zrfl6GK2WBp1rfXz5g"}
                  width={36}
                  height={36}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-surface-variant/30 py-2 z-50 transition-all duration-200 ${isDropDownOpen
                  ? 'opacity-100 visible'
                  : 'opacity-0 invisible'
                  }`}
              >
                <div className="px-4 py-2 border-b border-surface-variant/30">
                  <p className="text-xs text-outline font-medium uppercase tracking-wider">Account</p>
                  <p className="text-sm font-bold text-on-surface truncate">{user.username}</p>
                </div>
                <Link
                  href={`/profile/${user.username}`}
                  onClick={() => setDropDownOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    person
                  </span>
                  My Profile
                </Link>
                <button
                  onClick={async () => {
                    setDropDownOpen(false);
                    await logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    logout
                  </span>
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="py-2 px-4 rounded-xl text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}