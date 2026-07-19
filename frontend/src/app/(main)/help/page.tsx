"use client";
import React, { useState } from 'react';
import { Search, Rocket, ChevronDown, BarChart2, TrendingUp, Settings } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface FAQ {
  q: string;
  a: string;
}

export default function HelpScreen({ setCurrentScreen }: { setCurrentScreen?: (screen: string) => void }) {
  const [openCategory, setOpenCategory] = useState<string | null>('getting-started');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories: Category[] = [
    { id: 'getting-started', label: 'Getting Started', icon: Rocket },
    { id: 'profile-stats', label: 'Profile & Stats', icon: BarChart2 },
    { id: 'learning-ladders', label: 'Learning Ladders', icon: TrendingUp },
    { id: 'quizzes-settings', label: 'Quizzes & Settings', icon: Settings },
  ];

  const faqs: FAQ[] = [
    { q: "How do I create my first Learning Space?", a: "Creating your first Space is simple! Navigate to the 'Space' tab in the top bar and click the 'New Space' button. You'll be prompted to name your space and select your primary learning objective. From there, Knova will automatically suggest initial resources and a starter path for you." },
    { q: "What platforms does Knova support?", a: "Knova is currently available as a progressive web app (PWA), meaning it works seamlessly on any modern web browser across Desktop, Tablet, and Mobile. We also offer dedicated sync features for Chrome and Firefox extensions." },
    { q: "Is there a trial period for Premium features?", a: "Yes, all new users get a 14-day trial of Knova Pro. This includes AI-generated quizzes, advanced analytics, and unlimited Learning Ladders. No credit card is required for the initial trial period." },
    { q: "How do I invite classmates to my Space?", a: "Open your Space, click on the 'Members' icon at the top right, and select 'Invite via Link'. You can set permissions to 'View only' or 'Contributor' depending on your collaboration needs." },
    { q: "What is the 'Explore' tab for?", a: "The Explore tab connects you with public Learning Ladders created by the community. You can search for specific subjects, follow popular educators, and clone spaces to jumpstart your own learning journey." },
  ];

  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-10">
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold text-[#1b1c1c] mb-3">Help & Support</h1>
        <p className="text-[#594137] text-sm md:text-base">Find answers to frequently asked questions or explore our learning guides.</p>
      </div>

      <div className="relative mb-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8d7165]" />
        <input 
          type="text" 
          placeholder="Search for topics, features, or questions..." 
          className="w-full h-14 pl-14 pr-6 bg-white border border-[#efeded] shadow-sm rounded-full focus:border-[#00afef] focus:ring-1 focus:ring-[#00afef] outline-none transition-all" 
        />
      </div>

      <div className="flex overflow-x-auto gap-3 pb-4 mb-8 hide-scrollbar animate-in fade-in slide-in-from-bottom-8 duration-500">
        {categories.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setOpenCategory(cat.id)}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all border ${openCategory === cat.id ? 'bg-[#f36710] text-white border-[#f36710] shadow-md' : 'bg-white text-[#594137] border-[#d9d9d9] hover:bg-[#f5f5f5]'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-500">
        <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#fef3ea] flex items-center justify-center">
            <Rocket className="w-5 h-5 text-[#f36710]" />
          </div>
          Getting Started
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className={`bg-white rounded-2xl shadow-sm border transition-colors duration-300 ${openFaq === i ? 'border-[#f36710]' : 'border-[#efeded] hover:border-[#e1bfb1]'}`}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-5 lg:p-6 flex items-center justify-between text-left focus:outline-none">
                <span className="font-semibold text-[#1b1c1c] pr-6">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 shrink-0 text-[#8d7165] transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-5 lg:px-6 pb-5 lg:pb-6 text-sm md:text-base text-[#594137] leading-relaxed border-t border-[#efeded] pt-4">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-16 p-8 md:p-10 bg-white border border-[#efeded] rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold text-[#1b1c1c] mb-2">Still need help?</h3>
          <p className="text-[#594137] text-sm md:text-base">Our support team is available 24/7 to help with any technical issues or learning roadblocks.</p>
        </div>
        <button className="bg-[#00658c] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#004966] transition-colors shadow-md shrink-0 active:scale-95">
          Contact Support
        </button>
      </div>
    </div>
  );
}