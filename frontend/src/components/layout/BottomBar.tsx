'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  GraduationCap,
  Plus,
  Compass,
  User,
  Settings,
} from "lucide-react";

export default function BottomBar({
  onCreateClick,
}: {
  onCreateClick?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const navClass = (href: string) =>
    `flex flex-col items-center justify-center transition-colors ${
      pathname === href
        ? "text-orange-500 font-semibold"
        : "text-black hover:text-orange-500"
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-2xl bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex justify-around items-center h-20 px-2 pb-2">
      
      <Link href="/" className={navClass("/")}>
        <Home className="w-6 h-6 mb-1" />
        <span className="text-[10px]">Home</span>
      </Link>

      <Link href="/learnspace" className={navClass("/learnspace")}>
        <GraduationCap className="w-6 h-6 mb-1" />
        <span className="text-[10px]">Space</span>
      </Link>

      <button
        onClick={() => {
          if (onCreateClick) {
            onCreateClick();
          } else if (pathname === "/") {
            window.dispatchEvent(new CustomEvent("open-create-modal"));
          } else {
            router.push("/?create=true");
          }
        }}
        className="flex flex-col items-center justify-center relative -top-4"
      >
        <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-transform">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <span className="text-[10px] mt-1 text-orange-500 font-medium">
          Create
        </span>
      </button>

      <Link href="/explore" className={navClass("/explore")}>
        <Compass className="w-6 h-6 mb-1" />
        <span className="text-[10px]">Explore</span>
      </Link>

      <Link href="/profile" className={navClass("/profile")}>
        <User className="w-6 h-6 mb-1" />
        <span className="text-[10px]">Profile</span>
      </Link>

      <Link href="/settings" className={navClass("/settings")}>
        <Settings className="w-6 h-6 mb-1" />
        <span className="text-[10px]">Settings</span>
      </Link>
    </nav>
  );
}
