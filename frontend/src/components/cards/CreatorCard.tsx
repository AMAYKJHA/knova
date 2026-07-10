'use client';

import { useState, useEffect } from 'react';

export default function CreatorCard( { onCreateClick }: {onCreateClick?: () => void }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (isMobile) {
    return (
      <div className="bg-white px-4 py-6 border-b border-border-subtle shadow-sm mb-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <textarea
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-body-lg focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50 text-on-surface resize-none"
              placeholder="Write your content here...."
              rows={2}
            ></textarea>
          </div>
          <button className="bg-primary text-white w-full h-12 rounded-xl font-label-lg text-lg flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-primary/20">
            Create
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto text-center mb-12">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary opacity-10 blur rounded-2xl group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-4 border border-surface-variant/50">
          <div className="flex-1 w-full text-left">
            <input
              className="w-full text-headline-md font-headline-md border-none focus:ring-0 placeholder-on-surface-variant/40 bg-transparent py-4"
              placeholder="Write a topic to generate content..."
              type="text"
            />
          </div>
          <button className="w-full md:w-auto bg-primary-container text-white font-bold px-10 py-4 rounded-xl hover:bg-primary transition-all active:scale-95 shadow-lg shadow-primary/20">
            Create
          </button>
        </div>
      </div>
    </section>
  );
}