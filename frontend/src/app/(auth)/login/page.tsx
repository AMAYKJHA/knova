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
  const animRefs = useRef<(HTMLDivElement | HTMLFormElement | HTMLButtonElement | HTMLElement | null)[]>([]);

  // --- Forgot password modal state (shared: mobile + desktop) ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1);
  const [newPassVisible, setNewPassVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
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

  const ref = (i: number): RefCallback<HTMLDivElement | HTMLFormElement | HTMLButtonElement | HTMLElement> =>
    (el) => { animRefs.current[i] = el; };

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch {
      // error is already captured by useAuth and rendered below
    }
  };

  const openModal = () => {
    setModalStep(1);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleOtpInput = (index: number, value: string) => {
    if (value && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ===== MOBILE: bottom-sheet forgot-password modal =====
  const MobileForgotPasswordModal = () => {
    if (!modalOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center transition-opacity duration-300">
        <div className="bg-white w-full max-w-[400px] rounded-t-[20px] p-6 flex flex-col gap-6 animate-slide-up">
          <div className="flex justify-between items-center">
            <h2 className="text-[20px] font-semibold text-[#1b1c1c]">
              {modalStep === 1 ? 'Reset Password' : modalStep === 2 ? 'Verify Email' : 'New Password'}
            </h2>
            <button className="text-[#594137] p-2" onClick={closeModal}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Step 1: Email Input */}
          {modalStep === 1 && (
            <div className="flex flex-col gap-4">
              <p className="text-[15px] text-[#594137]">Enter your email address to receive a verification code.</p>
              <input
                type="email"
                placeholder="Email address"
                className="w-full h-12 px-4 rounded-lg bg-white border border-[#d9d9d9] outline-none focus:ring-2 focus:ring-[#2cbcfd] focus:border-[#00658c] transition-all text-[15px]"
              />
              <button
                className="w-full h-[50px] rounded-lg text-white font-semibold text-[16px] bg-[#f36710] hover:opacity-90 active:scale-[0.98] transition-all"
                onClick={() => setModalStep(2)}
              >
                Send Code
              </button>
            </div>
          )}

          {/* Step 2: Verify Code */}
          {modalStep === 2 && (
            <div className="flex flex-col gap-4">
              <p className="text-[15px] text-[#594137]">Enter the 6-digit code sent to your email.</p>
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    maxLength={1}
                    pattern="\d*"
                    type="text"
                    className="w-12 h-12 text-center border border-[#d9d9d9] rounded-lg text-[20px] font-semibold focus:ring-2 focus:ring-[#2cbcfd] outline-none"
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  />
                ))}
              </div>
              <button
                className="w-full h-[50px] rounded-lg text-white font-semibold text-[16px] bg-[#00afef] hover:opacity-90 active:scale-[0.98] transition-all"
                onClick={() => setModalStep(3)}
              >
                Verify
              </button>
              <button
                className="text-center text-[14px] font-semibold text-[#00afef] mt-2"
                onClick={() => setModalStep(1)}
              >
                Resend Code
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {modalStep === 3 && (
            <div className="flex flex-col gap-4">
              <p className="text-[15px] text-[#594137]">Create a new password for your account.</p>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <input
                    type={newPassVisible ? 'text' : 'password'}
                    placeholder="New Password"
                    className="w-full h-12 px-4 pr-12 rounded-lg bg-white border border-[#d9d9d9] outline-none focus:ring-2 focus:ring-[#2cbcfd] focus:border-[#00658c] transition-all text-[15px]"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#594137] flex items-center justify-center"
                    onClick={() => setNewPassVisible(!newPassVisible)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {newPassVisible ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={confirmPassVisible ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    className="w-full h-12 px-4 pr-12 rounded-lg bg-white border border-[#d9d9d9] outline-none focus:ring-2 focus:ring-[#2cbcfd] focus:border-[#00658c] transition-all text-[15px]"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#594137] flex items-center justify-center"
                    onClick={() => setConfirmPassVisible(!confirmPassVisible)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {confirmPassVisible ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <button
                className="w-full h-[50px] rounded-lg text-white font-semibold text-[16px] bg-[#f36710] hover:opacity-90 active:scale-[0.98] transition-all"
                onClick={closeModal}
              >
                Save Password
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===== DESKTOP: centered forgot-password modal =====
  const DesktopForgotPasswordModal = () => {
    if (!modalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
        <div
          className="relative w-full max-w-md flex-shrink-0 bg-white rounded-xl shadow-xl overflow-hidden"
          style={{ minWidth: '400px' }}
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[22px] font-semibold text-[#1a1a1a]">
                {modalStep === 1 ? 'Reset Password' : modalStep === 2 ? 'Verify Email' : 'Set New Password'}
              </h3>
              <button className="text-[#5c5c5c] hover:text-[#1a1a1a]" onClick={closeModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Step 1: Request Reset */}
            {modalStep === 1 && (
              <div className="space-y-4">
                <p className="text-[14px] text-[#5c5c5c]">Enter your email or username and we&apos;ll send you a code to reset your password.</p>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-[#d9d9d9] focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]/20 outline-none transition-all text-body-md"
                  placeholder="Email or username"
                  type="text"
                />
                <button
                  className="w-full h-11 bg-[#f36710] text-white font-bold rounded-lg hover:bg-[#d4580e] transition-colors shadow-sm"
                  onClick={() => setModalStep(2)}
                >
                  Send Code
                </button>
              </div>
            )}

            {/* Step 2: Verify Email */}
            {modalStep === 2 && (
              <div className="space-y-4">
                <p className="text-[14px] text-[#5c5c5c]">We&apos;ve sent a 6-digit code to your email. Please enter it below.</p>
                <div className="flex justify-between gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      maxLength={1}
                      placeholder="-"
                      type="text"
                      className="w-12 h-12 text-center border border-[#d9d9d9] rounded-lg focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]/20 outline-none text-lg font-bold"
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    />
                  ))}
                </div>
                <button
                  className="w-full h-11 bg-[#f36710] text-white font-bold rounded-lg hover:bg-[#d4580e] transition-colors shadow-sm"
                  onClick={() => setModalStep(3)}
                >
                  Verify
                </button>
                <div className="text-center">
                  <button
                    className="text-[#00afef] text-[13px] font-medium hover:underline"
                    onClick={() => setModalStep(1)}
                  >
                    Resend code
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Set New Password */}
            {modalStep === 3 && (
              <div className="space-y-4">
                <p className="text-[14px] text-[#5c5c5c]">Please enter your new password below.</p>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      className="w-full h-12 px-4 rounded-lg border border-[#d9d9d9] focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]/20 outline-none transition-all text-body-md"
                      placeholder="New Password"
                      type={newPassVisible ? 'text' : 'password'}
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5c5c5c]"
                      type="button"
                      onClick={() => setNewPassVisible(!newPassVisible)}
                    >
                      <span className="material-symbols-outlined">
                        {newPassVisible ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full h-12 px-4 rounded-lg border border-[#d9d9d9] focus:border-[#00afef] focus:ring-2 focus:ring-[#00afef]/20 outline-none transition-all text-body-md"
                      placeholder="Confirm New Password"
                      type={confirmPassVisible ? 'text' : 'password'}
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5c5c5c]"
                      type="button"
                      onClick={() => setConfirmPassVisible(!confirmPassVisible)}
                    >
                      <span className="material-symbols-outlined">
                        {confirmPassVisible ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                <button
                  className="w-full h-11 bg-[#f36710] text-white font-bold rounded-lg hover:bg-[#d4580e] transition-colors shadow-sm"
                  onClick={closeModal}
                >
                  Save Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Mobile View
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-[#f5f5f5]">
        <main className="w-full max-w-[400px] flex flex-col items-center px-5 pt-10">
          {/* Logo Section */}
          <header ref={ref(0)} className="flex flex-col items-center mb-10">
            <img
              src="/logos/KnovaWordmark.png"
              alt="Knova Logo"
              className="w-[180px] object-contain"
            />
          </header>

          {/* Form Section */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full flex flex-col gap-5">
            {error && (
              <div ref={ref(1)} className="text-left text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div ref={ref(1)} className="relative w-full">
              <input
                type="text"
                placeholder="Email or username"
                className="w-full h-12 px-4 rounded-lg bg-white border border-[#d9d9d9] outline-none focus:ring-2 focus:ring-[#2cbcfd] focus:border-[#00658c] transition-all text-[15px]"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[12px] text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div ref={ref(2)} className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full h-12 px-4 pr-12 rounded-lg bg-white border border-[#d9d9d9] outline-none focus:ring-2 focus:ring-[#2cbcfd] focus:border-[#00658c] transition-all text-[15px]"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#594137] flex items-center justify-center"
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

            <button
              ref={ref(3)}
              type="submit"
              disabled={loading}
              className="w-full h-[50px] rounded-lg text-white font-semibold text-[16px] bg-[#f36710] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            <div ref={ref(4)} className="text-center -mt-1.5">
              <button
                type="button"
                onClick={openModal}
                className="text-[#00afef] text-[14px] font-semibold hover:underline underline-offset-4"
              >
                Forgot password?
              </button>
            </div>

            <div ref={ref(5)} className="flex items-center gap-4 my-1">
              <div className="flex-1 h-px bg-[#d9d9d9]" />
              <span className="text-[#5c5c5c] text-[13px] font-medium uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[#d9d9d9]" />
            </div>

            <Link href="/register" className="block">
              <button
                ref={ref(6)}
                type="button"
                className="w-full h-[50px] rounded-lg text-white font-semibold text-[16px] bg-[#00afef] hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Create New Account
              </button>
            </Link>
          </form>
        </main>

        {/* Footer Section */}
        <footer ref={ref(7)} className="w-full max-w-[400px] mt-12 pb-10 flex flex-col items-center gap-3.5">
          <nav className="flex gap-4">
            <Link href="/about" className="text-[#5c5c5c] text-[12px] font-medium hover:text-[#1b1c1c] transition-colors">About</Link>
            <span className="text-[#d9d9d9]">•</span>
            <Link href="/help" className="text-[#5c5c5c] text-[12px] font-medium hover:text-[#1b1c1c] transition-colors">Help</Link>
            <span className="text-[#d9d9d9]">•</span>
            <Link href="/contact" className="text-[#5c5c5c] text-[12px] font-medium hover:text-[#1b1c1c] transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-1.5 opacity-80">
            <img
              src="/logos/Knova.png"
              alt="Knova small icon"
              className="h-[14px] object-contain"
            />
            <span className="text-[#5c5c5c] text-[11px]">Knova © 2025</span>
          </div>
        </footer>

        <MobileForgotPasswordModal />

        <style jsx>{`
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up { animation: slide-up 0.3s ease-out; }
        `}</style>
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
          <div className="w-32 h-32 flex items-center justify-center">
            <img
              alt="Knova Wordmark"
              className="w-full h-full object-contain"
              src="/logos/KnovaWordmark.png"
            />
          </div>
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
                  src="/images/photosynthesis.png"
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
          <p className="text-body-lg text-[#5c5c5c]">
            Create flashcards, MCQs, and text content. Learn your way.
          </p>
        </div>
      </div>

      {/* Divider Line */}
      <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#d9d9d9]"></div>

      {/* Right Half: Login Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-[40px] bg-white">
        <div className="w-full max-w-[396px]">
          <div className="mb-8 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6">
              <img
                alt="Knova Logo"
                className="h-16 w-auto object-contain"
                src="/logos/Knova.png"
              />
            </div>
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
                placeholder="Email or username"
                type="text"
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

            {/* Forgot password: BUTTON that opens the desktop modal (not a Link) */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={openModal}
                className="text-[#00afef] text-[13px] font-medium hover:underline"
              >
                Forgot password?
              </button>
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
              src="/logos/Knova.png"
            />
          </div>
        </div>
      </div>

      {/* Desktop forgot-password modal — rendered here so it overlays the whole page */}
      <DesktopForgotPasswordModal />
    </main>
  );
}