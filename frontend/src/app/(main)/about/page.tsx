'use client';

import React from 'react';
// Note: Ensure you have lucide-react installed: pnpm add lucide-react
import { BookOpen, TrendingUp, GraduationCap } from 'lucide-react';

// Define props type if this component is used elsewhere with props, 
// otherwise remove setCurrentScreen if it's not used in this specific file structure.
interface AboutScreenProps {
  setCurrentScreen?: (screen: string) => void;
}

export default function AboutScreen({ setCurrentScreen }: AboutScreenProps) {
  return (
    <div className="max-w-[860px] mx-auto p-6 md:p-10 space-y-12 md:space-y-16">
      
      <section className="bg-white rounded-3xl p-10 md:p-16 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center flex flex-col items-center border border-[#efeded]">
        <div className="w-24 h-24 mb-8 text-[#00afef] flex items-center justify-center p-4 bg-[#E0F6FE] rounded-[2rem]">
          <GraduationCap className="w-full h-full stroke-[1.5]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b1c1c] leading-tight mb-6 tracking-tight">Turn Scrolling into Learning.</h1>
        <p className="text-lg text-[#594137] max-w-2xl leading-relaxed">
          Knova is reimagining the digital experience by blending the addictive, high-engagement loops of social media with the transformative power of structured education.
        </p>
      </section>

      <section className="space-y-12 px-2 md:px-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-[#1b1c1c]">
             <div className="w-2.5 h-8 bg-[#f36710] rounded-full"></div>
             Our Inspiration
          </h2>
          <p className="mt-2 text-[#594137] leading-relaxed text-base md:text-lg pl-6 border-l-2 border-[#efeded]">
            The initial spark for Knova came from a simple observation of modern student habits: the undeniable, almost magnetic addictiveness of social media feeds. We noticed how easily our peers could get hooked for hours on short-form content like reels and video clips.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-[#1b1c1c]">
             <div className="w-2.5 h-8 bg-[#00afef] rounded-full"></div>
             The Problem with Digital Education
          </h2>
          <p className="mt-2 text-[#594137] leading-relaxed text-base md:text-lg pl-6 border-l-2 border-[#efeded]">
            Traditional digital education remains locked behind rigid, static platforms. Most online learning spaces deliver the exact same resources and content to every single user, completely ignoring the fact that every student has a different background, pace, and current understanding.
          </p>
        </div>

        <div className="bg-[#fef3ea] border border-[#ffdbcc] rounded-3xl p-8 relative overflow-hidden shadow-sm">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#ffdbcc] text-xs font-extrabold text-[#f36710] rounded-full mb-5 tracking-wider uppercase shadow-sm">
            Our Core Problem Statement
          </div>
          <p className="text-[#1b1c1c] font-semibold text-lg leading-relaxed">
            Standard online tools lack the community-driven, peer-to-peer sharing features that make modern social platforms so highly interactive. This leaves self-learners isolated and struggling through uniform material.
          </p>
        </div>
      </section>

      <section className="bg-[#f36710] rounded-3xl p-10 md:p-14 text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-16"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">What We Are Building: Knova</h2>
          <p className="text-white/90 leading-relaxed text-lg md:text-xl">
            Knova is our solution to this challenge, built to turn unproductive scrolling habits into structured, knowledge-driven micro-learning sessions. We are developing a web-based platform that blends the familiar, addictive swipe interface of social networks with high-yield educational content.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6 pb-12">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-[#efeded] flex flex-col gap-5 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-[#E0F6FE] rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[#00afef]" />
          </div>
          <h3 className="text-xl font-bold text-[#1b1c1c]">Micro-Learning Made Social</h3>
          <p className="text-[#594137] leading-relaxed">Instead of facing long, exhausting textbooks, Knova delivers knowledge in bite-sized, meaningful units like FlashCards, short notes, and interactive multiple-choice questions.</p>
        </div>
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-[#efeded] flex flex-col gap-5 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-[#fef3ea] rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-[#f36710]" />
          </div>
          <h3 className="text-xl font-bold text-[#1b1c1c]">Your Personal Learning Ladder</h3>
          <p className="text-[#594137] leading-relaxed">The app shapes itself around your behavior, ensuring that you are always climbing your own personalized learning ladder at a speed that is just right for you.</p>
        </div>
      </section>
      
      <section className="text-center pt-8 border-t border-[#efeded]">
        <h2 className="text-2xl font-bold text-[#1b1c1c] mb-6">Join the Knova community today.</h2>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button className="bg-[#f36710] text-white px-10 py-3.5 rounded-xl font-bold hover:bg-[#d45600] active:scale-95 transition-all shadow-md">
            Get Started
          </button>
          <button className="bg-white text-[#00afef] border-2 border-[#00afef] px-10 py-3.5 rounded-xl font-bold hover:bg-[#f5fcfc] active:scale-95 transition-all">
            Learn More
          </button>
        </div>
      </section>
    </div>
  );
}