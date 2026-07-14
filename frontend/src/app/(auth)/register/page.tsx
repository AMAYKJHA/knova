'use client';

import { useState, useEffect, useRef, RefCallback } from 'react';
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { SignUpSchema } from "@/schemas/signUp";
import Link from 'next/link';

type SignUpFormData = z.infer<typeof SignUpSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { register: registerUser, loading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpSchema),
  });

  // Define type for array of HTML elements or null
  const animRefs = useRef<(HTMLDivElement | HTMLElement | null)[]>([]);

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

  const ref = (i: number): RefCallback<HTMLDivElement | HTMLElement> =>
    (el) => { animRefs.current[i] = el; };

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await registerUser({
        email: data.email,
        username: data.name,
        password: data.password,
      });
    } catch {
      // error is already captured by useAuth and rendered below
    }
  };

  // Mobile View
  if (isMobile) {
    return (
      <div className="auth-page flex flex-col min-h-screen items-center text-center">
        <main className="auth-container flex flex-col items-center px-4 pt-12 pb-8 flex-grow">
          {/* Brand Header */}
          <header ref={ref(0)} className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <span
                className="material-symbols-outlined text-[48px] text-[#f36710]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <h1 className="font-bold text-[28px] leading-tight flex items-center">
              <span className="text-[#f36710]">K</span>
              <span className="text-[#00afef]">nova</span>
            </h1>
            <p className="text-[#5c5c5c] text-[13px] mt-1">
              Join the learning community.
            </p>
          </header>

          {/* Form */}
          <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && (
              <div ref={ref(1)} className="text-left text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div ref={ref(2)} className="form-group text-left">
              <input
                className="form-input"
                placeholder="Full name"
                type="text"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-[12px] text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div ref={ref(3)} className="form-group text-left">
              <input
                className="form-input"
                placeholder="Email address"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[12px] text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div ref={ref(4)} className="form-group text-left">
              <input
                className="form-input password-input"
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                {...register("password")}
              />
              <button
                type="button"
                className="password-toggle"
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

            <div ref={ref(5)} className="form-group text-left">
              <input
                className="form-input password-input"
                placeholder="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
              {errors.confirmPassword && (
                <p className="text-[12px] text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div ref={ref(6)} className="mt-5">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>

            <div ref={ref(7)} className="flex items-center gap-4 my-[14px]">
              <div className="h-px flex-grow bg-[#D9D9D9]" />
              <span className="text-[#5c5c5c] text-[14px]">or</span>
              <div className="h-px flex-grow bg-[#D9D9D9]" />
            </div>

            <div ref={ref(8)} className="mb-5">
              <Link href="/login" className="block">
                <button
                  type="button"
                  className="btn-secondary"
                >
                  Already have an account? Log In
                </button>
              </Link>
            </div>
          </form>
        </main>

        {/* Footer */}
        <footer ref={ref(9)} className="w-full mt-auto pb-10 flex flex-col items-center gap-4">
          <nav className="flex items-center gap-4 text-[12px] font-semibold tracking-wide text-[#5c5c5c]">
            <a href="#" className="auth-link">
              About
            </a>
            <span className="text-[#D9D9D9]">·</span>
            <a href="#" className="auth-link">
              Help
            </a>
            <span className="text-[#D9D9D9]">·</span>
            <a href="#" className="auth-link">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-1.5 text-[#5c5c5c] text-[12px] opacity-70">
            <span>Knova © 2025</span>
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
        </footer>
      </div>
    );
  }

  // Desktop View
  return (
    <main className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left Side - Registration Form */}
      <section className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center px-8 lg:px-16 py-12 relative">
        <div className="w-full max-w-md min-w-[320px]">
          {/* Heading */}
          <div className="mb-8 w-full text-left">
            <h1 className="text-[32px] font-semibold text-[#1a1a1a] mb-2 whitespace-nowrap">
              Create your account
            </h1>
            <p className="text-[14px] text-[#5c5c5c]">
              Join Knova and start learning.
            </p>
          </div>

          {error && (
            <div className="mb-4 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label className="block text-[12px] uppercase tracking-wide text-[#5c5c5c] mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full h-12 px-4 rounded-lg border border-[#d9d9d9] focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]/20 outline-none transition-all"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-[12px] text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-wide text-[#5c5c5c] mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Email"
                className="w-full h-12 px-4 rounded-lg border border-[#d9d9d9] focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]/20 outline-none transition-all"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[12px] text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-wide text-[#5c5c5c] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-lg border border-[#d9d9d9] focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]/20 outline-none transition-all"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5c5c5c]"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-[12px] text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-wide text-[#5c5c5c] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-lg border border-[#d9d9d9] focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]/20 outline-none transition-all"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5c5c5c]"
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[12px] text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#f36710] text-white font-bold rounded-lg hover:bg-[#d4580e] transition-colors shadow-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-[14px] text-[#5c5c5c]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#00afef] font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Branding */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-60">
          <span
            className="material-symbols-outlined text-[#f36710]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span className="font-black text-[#f36710] text-lg">Knova</span>
        </div>
      </section>

      {/* Divider */}
      <div className="hidden md:block w-[1px] bg-[#d9d9d9]" />

      {/* Right Side */}
      <section className="w-full md:w-1/2 bg-[#f8f9fa] flex flex-col justify-between p-8 lg:p-12 relative overflow-hidden">
        {/* Logo */}
        <div className="flex justify-end items-center gap-2">
          <span
            className="material-symbols-outlined text-[#f36710] text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span className="text-2xl font-black text-[#1a1a1a]">Knova</span>
        </div>

        {/* Middle Section: Achievement Cards */}
        <div className="flex flex-col items-end gap-4 w-full my-auto max-w-md ml-auto pr-4 lg:pr-8">
          {/* Card 1 */}
          <div className="w-[280px] bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex items-center gap-4 transition-transform hover:translate-y-[-2px]">
            <div className="w-10 h-10 rounded-xl bg-[#f36710]/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#f36710] text-xl">
                ads_click
              </span>
            </div>
            <div>
              <p className="font-bold text-[15px] text-[#1a1a1a]">
                50 FlashCards created
              </p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#5c5c5c] mt-0.5 flex items-center gap-1">
                🎯 Streak Active
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="w-[280px] bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex items-center gap-4 transition-transform hover:translate-y-[-2px]">
            <div className="w-10 h-10 rounded-xl bg-[#00afef]/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#00afef] text-xl">
                trending_up
              </span>
            </div>
            <div>
              <p className="font-bold text-[15px] text-[#1a1a1a]">
                Upvoted 120 times
              </p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#5c5c5c] mt-0.5 flex items-center gap-1">
                📈 Community Leader
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="w-[280px] bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex items-center gap-4 transition-transform hover:translate-y-[-2px]">
            <div className="w-10 h-10 rounded-xl bg-[#f36710]/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#f36710] text-xl">
                workspace_premium
              </span>
            </div>
            <div>
              <p className="font-bold text-[15px] text-[#1a1a1a]">
                Top Learner this week
              </p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#5c5c5c] mt-0.5 flex items-center gap-1">
                🏆 Ranking #1
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Headline & Copy */}
        <div className="w-full max-w-2xl mt-auto pt-8">
          <h2 className="font-black leading-[1.1] mb-4 tracking-tight">
            <span className="block text-[44px] lg:text-[56px] text-[#1a1a1a]">
              Your knowledge,
            </span>
            <span className="block text-[44px] lg:text-[56px] text-[#f36710]">
              amplified.
            </span>
          </h2>
          <p className="text-[#5c5c5c] text-[15px] lg:text-[16px] leading-relaxed">
            The smarter way to study, create, and grow. All <br />your learning
            materials in one powerful AI-driven hub.
          </p>
        </div>

        {/* Decorative Blobs */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#f36710]/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-[#00afef]/10 rounded-full blur-2xl opacity-40 pointer-events-none" />
      </section>
    </main>
  );
}