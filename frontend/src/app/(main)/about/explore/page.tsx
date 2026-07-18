'use client';

import { useState } from 'react';
import FlashCard from '@/components/cards/FlashCard';
import McqCard from '@/components/cards/McqCard';
import TextCard from '@/components/cards/TextContentCard';
import { exploreFilters, explorePosts } from '@/data/mockData';

// Type inference from mockData usually works, but explicit types help if data structure changes
type PostType = 'FlashCard' | 'mcq' | 'text';

export default function Explore() {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  return (
    <main className="pt-[80px] min-h-screen px-4 pb-20">
      
      {/* Search Section */}
      <section className="flex flex-col items-center pt-8 pb-6 w-full max-w-[720px] mx-auto">
        <div className="w-full relative">
          <div className="bg-white rounded-full shadow-sm border border-outline-variant flex items-center px-6 py-3.5 focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
            <span className="material-symbols-outlined text-outline mr-3">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 w-full text-body-md text-on-surface placeholder:text-outline outline-none" 
              placeholder="Search for FlashCards, notes, or creators..." 
              type="text" 
            />
            <button className="flex items-center gap-1 bg-surface-container-high px-4 py-1.5 rounded-full text-label-md text-on-surface-variant hover:bg-surface-container transition-colors ml-2">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Filters
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-10 flex justify-center w-full overflow-hidden">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar whitespace-nowrap px-4 max-w-full">
          {exploreFilters.map((f: string) => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                activeFilter === f 
                  ? 'bg-primary-container text-white border-primary-container shadow-sm' 
                  : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="flex justify-center w-full">
        <div className="max-w-[1440px] w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {explorePosts.map((post) => {
            if (post.type === 'FlashCard') {
              return <FlashCard key={post.id} variant="explore" {...post} />;
            } else if (post.type === 'mcq') {
              return <McqCard key={post.id} variant="explore" {...post} />;
            } else if (post.type === 'text') {
              return <TextCard key={post.id} variant="explore" {...post} />;
            }
            return null;
          })}
        </div>
      </section>

    </main>
  );
}