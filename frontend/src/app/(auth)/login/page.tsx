'use client';

import { useState, useEffect, useRef, RefCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { LoginSchema } from "@/schemas/login";
import { useRouter } from "next/navigation";
import Link from 'next/link';

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Define type for array of HTMLDivElement or null
  const animRefs = useRef<(HTMLDivElement | HTMLFormElement | HTMLButtonElement | HTMLElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    animRefs.current.forEach((el, i) => {
      if (!el) return;
      // Cast to HTMLElement to access style safely if strict types differ
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = '0';
      htmlEl.style.transform = 'translateY(10px)';
      htmlEl.style.transition = 'all 0.4s ease-out';
      setTimeout(() => {
        htmlEl.style.opacity = '1';
        htmlEl.style.transform = 'translateY(0)';
      }, 100 + i * 60);
    });
  }, []);

  const ref = (i: number): RefCallback<HTMLDivElement | HTMLFormElement | HTMLButtonElement | HTMLElement> =>
    (el) => { animRefs.current[i] = el; };

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch {
      // error is already captured by useAuth and rendered below
    }
  };

  // Mobile View
  if (isMobile) {
    return (
      <div className="auth-page flex flex-col min-h-screen items-center text-center">
        <main className="auth-container flex flex-col items-center px-5 pt-12 pb-8 flex-grow">
          {/* Brand Header */}
          <header ref={ref(0)} className="flex flex-col items-center mb-10">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWiSc93XM13_6nr4A9T9WbJYlLy2aVPdqx96zvMKRVRMO-0rNq7q-_FoRTzim2jaGDbHATA1-xbKMXE7wPn3ioCheB4M_9QJQRz3g4D1XjhVjS-ElBEOb9iwiHGMqCdoje4AFkjwFIBCwPLZLJdFQtN1E8Rurd2fkUhARQiu3xLZ4tXcRFEqVqNDRpbe5aS7k1tqsLIi2oKB0agSW6253G7cmNjHfxghYCL5S5UQ5wMgVsUKac1U3XAVkAV3rF3lP9eqhwQXMjUrk "
              alt="Knova Sparkle Logo"
              className="auth-logo mb-3"
            />
            <h1 className="font-extrabold text-[28px] leading-none flex items-center">
              <span className="text-[#f36710]">K</span>
              <span className="text-[#00afef]">nova</span>
            </h1>
            <p className="text-[#5c5c5c] text-[13px] mt-3 tracking-wide">
              Learn. Create. Grow.
            </p>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full flex flex-col gap-5">
            {error && (
              <div ref={ref(1)} className="text-left text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div ref={ref(1)} className="form-group text-left">
              <input
                type="email"
                placeholder="Email address"
                className="form-input"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[12px] text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div ref={ref(2)} className="form-group text-left">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="form-input password-input"
                {...register("password")}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
              {errors.password && (
                <p className="text-[12px] text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button ref={ref(3)} type="submit" disabled={loading} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Logging in..." : "Log In"}
            </button>

            <div ref={ref(4)} className="text-center -mt-1.5">
              <Link href="/forget_password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>

            <div ref={ref(5)} className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or</span>
              <div className="auth-divider-line" />
            </div>

            <Link href="/register" className="block">
              <button ref={ref(6)} type="button" className="btn-secondary">
                Create New Account
              </button>
            </Link>
          </form>
        </main>

        {/* Footer */}
        <footer ref={ref(7)} className="w-full mt-auto pb-10 flex flex-col items-center gap-3.5">
          <nav className="auth-footer-nav">
            <Link href="/about">About</Link>
            <span className="text-[#d9d9d9]">•</span>
            <Link href="/help">Help</Link>
            <span className="text-[#d9d9d9]">•</span>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className="auth-footer-copy">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWiSc93XM13_6nr4A9T9WbJYlLy2aVPdqx96zvMKRVRMO-0rNq7q-_FoRTzim2jaGDbHATA1-xbKMXE7wPn3ioCheB4M_9QJQRz3g4D1XjhVjS-ElBEOb9iwiHGMqCdoje4AFkjwFIBCwPLZLJdFQtN1E8Rurd2fkUhARQiu3xLZ4tXcRFEqVqNDRpbe5aS7k1tqsLIi2oKB0agSW6253G7cmNjHfxghYCL5S5UQ5wMgVsUKac1U3XAVkAV3rF3lP9eqhwQXMjUrk "
              alt="Knova small icon"
              className="auth-logo-small"
            />
            <span className="text-[#5c5c5c] text-[11px]">
              Knova © 2025
            </span>
          </div>
        </footer>
      </div>
    );
  }

  // Desktop View
  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left Half: Branding & Collage */}
      <div className="relative flex flex-col p-8 lg:p-[40px] justify-between overflow-hidden">
        {/* Top Logo */}
        <div className="flex items-center gap-2 z-10">
          <img
            alt="Knova Logo"
            className="w-8 h-8 object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3o0xkQHHA3nRWqaiDY65-LbmdhjpzFBWVBVtE0ipG96r1ZUww0nOmA0DtLVnUsZwxChia8uESSmAgKTPqf31qEcL4OezfxlN0YzxMv5FyHCPYWBSul0bxzL1YY8dsUDiEobuEjMcipdHzc1RbFjRChTLdqayDnLa3NCkq67mWbOrB8wHZc_XXCUXnHvdh65Vjb65NQ9xs-JaAtTC56JHt2RDPYo9fD-cv5XqR-MPdPuc8gWaQE8FBOQl49nXfVcwuhsT9_wPr9bQ "
          />
          <h1 className="text-headline-md font-extrabold flex">
            <span className="text-[#f36710]">K</span>
            <span className="text-[#00afef]">nova</span>
          </h1>
        </div>

        {/* Central Collage Area */}
        <div className="relative flex-grow flex items-center justify-center my-12">
          <div className="relative w-full max-w-md h-[400px]">
            {/* Floating MCQ Card */}
            <div className="absolute top-0 left-0 w-64 glass-card bg-card-bg rounded-xl p-4 z-30 floating-anim stagger-1 transform -rotate-3">
              <div className="flex justify-between items-center mb-2">
                <span className="bg-blue-tint text-secondary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Multiple Choice
                </span>
                <span
                  className="material-symbols-outlined text-[#f36710] text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              </div>
              <p className="text-body-sm font-semibold mb-4">
                What is the primary function of Mitochondria?
              </p>
              <div className="space-y-2">
                <div className="w-full h-8 border border-border-subtle rounded-lg flex items-center px-3 text-xs bg-orange-tint">
                  Powerhouse of the cell
                </div>
                <div className="w-full h-8 border border-border-subtle rounded-lg flex items-center px-3 text-xs">
                  Protein synthesis
                </div>
              </div>
            </div>

            {/* Floating FlashCard */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 glass-card bg-card-bg rounded-xl p-4 z-40 floating-anim stagger-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#f36710]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#00afef]"></div>
                </div>
                <span className="material-symbols-outlined text-[#5c5c5c] text-lg">
                  flip_camera_android
                </span>
              </div>
              <div className="aspect-video bg-page-bg rounded-lg mb-4 flex items-center justify-center">
                <img
                  className="w-full h-full object-cover rounded-lg"
                  alt="Atom illustration"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQOdWe6DH8nv_ecUl--9gLGcig5hByhN1lhGBBrpH2mA3HpBJmGCjeJOG0mGV1mTTOx3tdcB1iq7moDaNs1wvfeMeVemUFm6Dog_oy__TxbFqvoMLBuqzHLNcuTlrTitwWZK9a2qjNdmpitVdTx9a86tFLwo4CgRc9DBHHcMXh8ulgTNA1Hm2mrf-7cPf6bXxsdzpUKP_m8NeK85lMMDSPDd-9Kr0p7iGqm91SutasLIB-OoAfsHFexyPpyBJ8aDY9Uc3Z5-IK24c "
                />
              </div>
              <p className="text-body-md font-bold text-center">Photosynthesis Process</p>
            </div>

            {/* Floating Text Post Card */}
            <div className="absolute bottom-4 right-0 w-60 glass-card bg-card-bg rounded-xl p-4 z-20 floating-anim stagger-3 transform rotate-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#00afef]"></div>
                <div className="h-2 w-20 bg-surface-dim rounded"></div>
              </div>
              <p className="text-[11px] text-[#5c5c5c] leading-relaxed mb-2">
                "The learning curve is steep, but the view from the top is worth it. Keep pushing."
              </p>
              <div className="flex items-center gap-4 text-[#f36710]">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  thumb_up
                </span>
                <span className="material-symbols-outlined text-sm">comment</span>
              </div>
            </div>

            {/* Floating Sparkles */}
            <span className="material-symbols-outlined absolute top-10 right-10 text-[#f36710] text-3xl animate-pulse">
              auto_awesome
            </span>
          </div>
        </div>

        {/* Tagline Section */}
        <div className="z-10 mt-auto">
          <div className="mb-4">
            <p className="text-[60px] leading-[1.1] font-extrabold text-[#1a1a1a]">
              Learn smarter,
            </p>
            <p className="text-[60px] leading-[1.1] font-extrabold text-[#00afef]">
              every day.
            </p>
          </div>
          <p className="text-body-lg text-[#5c5c5c] max-w-md min-w-[300px]">
            Create FlashCards, MCQs, and text content. Learn your way.
          </p>
        </div>
      </div>

      {/* Divider Line */}
      <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#d9d9d9]"></div>

      {/* Right Half: Login Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-[40px] bg-white">
        <div className="w-full max-w-[396px]">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-[22px] font-semibold text-[#1a1a1a] mb-1">
              Log in to Knova
            </h2>
            <p className="text-[14px] text-[#5c5c5c]">
              Welcome back. Keep learning.
            </p>
          </div>

          {error && (
            <div className="mb-4 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <input
                className="w-full h-12 px-4 rounded-lg border border-[#d9d9d9] focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]/20 outline-none transition-all text-body-md"
                placeholder="Email address"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[12px] text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <input
                className="w-full h-12 px-4 rounded-lg border border-[#d9d9d9] focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]/20 outline-none transition-all text-body-md"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5c5c5c]"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
              {errors.password && (
                <p className="text-[12px] text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#f36710] text-white font-bold rounded-lg hover:bg-[#d4580e] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            <div className="text-center pt-2">
              <Link
                className="text-[#00afef] text-[13px] font-medium hover:underline"
                href="/forget_password"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative py-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d9d9d9]"></div>
              </div>
              <span className="relative bg-white px-3 text-[13px] text-[#5c5c5c] uppercase tracking-widest font-semibold">
                or
              </span>
            </div>

            <Link
              href="/register"
              className="w-full h-11 flex items-center justify-center border-2 border-[#00afef] text-[#00afef] font-bold rounded-lg hover:bg-[#e0f6fe] transition-colors"
            >
              Create new account
            </Link>
          </form>

          <div className="mt-16 flex justify-center opacity-30">
            <img
              alt="Footer Logo"
              className="w-5 h-5 grayscale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3o0xkQHHA3nRWqaiDY65-LbmdhjpzFBWVBVtE0ipG96r1ZUww0nOmA0DtLVnUsZwxChia8uESSmAgKTPqf31qEcL4OezfxlN0YzxMv5FyHCPYWBSul0bxzL1YY8dsUDiEobuEjMcipdHzc1RbFjRChTLdqayDnLa3NCkq67mWbOrB8wHZc_XXCUXnHvdh65Vjb65NQ9xs-JaAtTC56JHt2RDPYo9fD-cv5XqR-MPdPuc8gWaQE8FBOQl49nXfVcwuhsT9_wPr9bQ "
            />
          </div>
        </div>
      </div>
    </main>
  );
}