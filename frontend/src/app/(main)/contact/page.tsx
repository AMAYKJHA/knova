'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Headset,
  Users,
  ArrowRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';

import { FaGithub, FaLinkedin } from 'react-icons/fa';

export default function ContactUs() {
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inquiryType, setInquiryType] = useState('support');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 2000);
    }, 1500);
  };

  const developers = [
    { init: 'AJ', name: 'Amay Jha', github: '#', linkedin: '#' },
    { init: 'BR', name: 'Birendra Rawat', github: '#', linkedin: '#' },
    { init: 'BS', name: 'Bishal Shrestha', github: '#', linkedin: '#' },
  ];

  return (
    <div className="min-h-screen bg-surface md:bg-page-bg pb-20 md:pb-0">
      <main className="max-w-[1280px] mx-auto px-4 md:px-10 pt-[68px] md:pt-16 pb-16 flex flex-col gap-4 md:gap-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center pt-2 md:pt-0 mb-4 md:mb-0">
          <div className="md:hidden flex justify-center mb-4">
            <Image
              src="/Knova.jpg"
              alt="Knova Logo"
              width={80}
              height={80}
              className="h-20 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="hidden md:block w-1.5 h-1.5 bg-primary mb-4" />
          <h1 className="text-[22px] md:text-4xl font-semibold md:font-bold text-on-surface mb-2 md:mb-4 tracking-tight">Get in touch</h1>
          <p className="text-[15px] md:text-lg text-on-surface-variant max-w-[280px] md:max-w-2xl">
            <span className="md:hidden">Have a question about Knova? We're here to help you build the future of learning.</span>
            <span className="hidden md:inline">Ready to climb the learning ladder? Whether you're a curious student or a campus innovator, our team is here to support your Knova journey.</span>
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 md:gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-container/50 md:border-transparent">
              <h2 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">Send us a message</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 md:gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div className="flex flex-col gap-1.5 md:gap-2">
                    <label className="text-[12px] md:text-sm font-semibold md:font-medium text-on-surface-variant px-1 md:px-0">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface md:bg-white focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-secondary focus:border-secondary transition-all text-on-surface text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:gap-2">
                    <label className="text-[12px] md:text-sm font-semibold md:font-medium text-on-surface-variant px-1 md:px-0">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface md:bg-white focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-secondary focus:border-secondary transition-all text-on-surface text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:gap-4">
                  <label className="text-[12px] md:text-sm font-semibold md:font-medium text-on-surface-variant px-1 md:px-0">Inquiry Type</label>
                  <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                    {[
                      { id: 'support', label: 'Support', mobileLabel: 'General Support' },
                      { id: 'creator', label: 'Creator', mobileLabel: 'Partnership Inquiry' },
                      { id: 'partnership', label: 'Partnership', mobileLabel: 'Technical Feedback' },
                    ].map((opt) => (
                      <label key={opt.id} className="flex items-center gap-3 p-3 md:p-0 rounded-lg md:rounded-none border border-outline-variant md:border-transparent bg-surface-container-low md:bg-transparent cursor-pointer group">
                        <input
                          type="radio"
                          name="inquiryType"
                          value={opt.id}
                          checked={inquiryType === opt.id}
                          onChange={() => setInquiryType(opt.id)}
                          className="w-4 h-4 text-primary focus:ring-1 md:focus:ring-2 focus:ring-primary border-outline-variant cursor-pointer"
                        />
                        <span className="text-sm font-medium md:font-normal text-on-surface md:text-on-surface-variant group-hover:text-primary transition-colors">
                          <span className="md:hidden">{opt.mobileLabel}</span>
                          <span className="hidden md:inline">{opt.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 md:gap-2">
                  <label className="text-[12px] md:text-sm font-semibold md:font-medium text-on-surface-variant px-1 md:px-0">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface md:bg-white focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-secondary focus:border-secondary transition-all text-on-surface text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full md:w-[200px] text-on-primary text-sm font-semibold py-4 md:py-3 rounded-xl md:rounded-lg shadow-lg md:shadow-none active:scale-[0.98] md:active:scale-95 transition-all flex justify-center items-center gap-2 mt-2 md:mt-0 ${
                    isSubmitted ? 'bg-secondary' : 'bg-primary-container hover:bg-primary'
                  } disabled:opacity-80`}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : isSubmitted ? (
                    <><CheckCircle2 className="w-4 h-4" /> Sent!</>
                  ) : (
                    'Send message'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Cards */}
          <div className="lg:col-span-4 flex flex-col gap-4 md:gap-8">
            {/* Direct Channels */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-container/50 md:border-surface-container">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-tint flex items-center justify-center">
                  <Headset className="w-[22px] h-[22px] md:w-5 md:h-5 text-secondary" />
                </div>
                <h2 className="text-[18px] md:text-lg font-semibold text-on-surface">Direct channels</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <span className="md:hidden text-[11px] font-semibold text-outline uppercase tracking-wider mb-1">Support</span>
                  <span className="hidden md:block text-sm font-medium text-on-surface-variant mb-1">General Support</span>
                  <a href="mailto:support@knova.ai" className="text-secondary font-medium text-sm flex items-center gap-1.5 md:hover:underline">
                    support@knova.ai
                    <ArrowRight className="w-4 h-4 md:hidden" />
                  </a>
                </div>
                <div className="md:hidden h-px bg-outline-variant w-full opacity-30" />
                <div className="flex flex-col">
                  <span className="md:hidden text-[11px] font-semibold text-outline uppercase tracking-wider mb-1">Creator Success</span>
                  <span className="hidden md:block text-sm font-medium text-on-surface-variant mb-1">Creator Relations</span>
                  <a href="mailto:creators@knova.ai" className="text-secondary font-medium text-sm flex items-center gap-1.5 md:hover:underline">
                    creators@knova.ai
                    <ArrowRight className="w-4 h-4 md:hidden" />
                  </a>
                </div>
              </div>
            </div>

            {/* Developer Core */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-container/50 md:border-surface-container">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-orange-tint flex items-center justify-center">
                  <Users className="w-[22px] h-[22px] md:w-5 md:h-5 text-primary" />
                </div>
                <h2 className="text-[18px] md:text-lg font-semibold text-on-surface">The developer core</h2>
              </div>

              <div className="flex flex-col gap-5 md:gap-6">
                {developers.map(dev => (
                  <div key={dev.init} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed md:bg-surface-container-high flex items-center justify-center font-bold text-on-primary-fixed-variant md:text-on-surface-variant text-sm">
                        {dev.init}
                      </div>
                      <span className="text-sm font-semibold md:font-medium text-on-surface">{dev.name}</span>
                    </div>
                    <div className="flex gap-2">
                      {dev.github && (
                        <a href={dev.github} className="w-[30px] h-[30px] md:w-8 md:h-8 rounded-full bg-surface-container-high md:bg-page-bg flex items-center justify-center hover:bg-outline-variant transition-colors text-[#1a1a1a]">
                          <FaGithub className="w-4 h-4" />
                        </a>
                      )}
                      {dev.linkedin && (
                        <a href={dev.linkedin} className="w-[30px] h-[30px] md:w-8 md:h-8 rounded-full bg-surface-container-high md:bg-page-bg flex items-center justify-center hover:bg-outline-variant transition-colors text-[#00afef]">
                          <FaLinkedin className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Footer Area */}
        <div className="md:hidden py-8 flex flex-col items-center">
          <Image
            src="/Knova.jpg"
            alt="Knova Wordmark"
            width={100}
            height={48}
            className="h-12 w-auto object-contain opacity-70"
            referrerPolicy="no-referrer"
          />
        </div>
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:flex bg-surface-container py-12 px-10 border-t border-outline-variant/30">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <Image
              src="/Knova.png"
              alt="Knova Logo Small"
              width={32}
              height={32}
              className="h-8 w-auto"
              referrerPolicy="no-referrer"
            />
            <p className="text-sm text-on-surface-variant">© 2026 Knova e-Learning Platform</p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">About Us</a>
            <a href="#" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">Help & FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}