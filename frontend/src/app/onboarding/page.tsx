'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  FlaskConical,
  Cpu,
  Palette,
  TrendingUp,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/useOnboarding";

const CATEGORIES = [
  {
    id: 'science',
    title: 'Science',
    icon: FlaskConical,
    iconColor: 'text-orange-600',
    items: [
      'Astrophysics',
      'Neuroscience',
      'Molecular Biology',
      'Environmental Science',
      'Organic Chemistry',
    ],
  },
  {
    id: 'technology',
    title: 'Technology',
    icon: Cpu,
    iconColor: 'text-sky-600',
    items: [
      'Artificial Intelligence',
      'Cybersecurity',
      'Web Development',
      'Data Science',
      'Cloud Computing',
      'Blockchain',
    ],
  },
  {
    id: 'arts',
    title: 'Arts & Humanities',
    icon: Palette,
    iconColor: 'text-red-600',
    items: [
      'Modern Art',
      'Philosophy',
      'Creative Writing',
      'Music Theory',
      'History',
    ],
  },
  {
    id: 'business',
    title: 'Business & Leadership',
    icon: TrendingUp,
    iconColor: 'text-blue-600',
    items: [
      'Entrepreneurship',
      'Marketing Strategy',
      'Finance',
      'Public Speaking',
    ],
  },
];

const REQUIRED_SELECTIONS = 5;

export default function OnboardingPage() {
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { loading, submitInterests } = useOnboarding();

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(interest)) {
        next.delete(interest);
      } else {
        next.add(interest);
      }
      return next;
    });
  };

  const progress = Math.min((selectedInterests.size / REQUIRED_SELECTIONS) * 100, 100);
  const canContinue = selectedInterests.size >= REQUIRED_SELECTIONS;

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORIES;
    const lowerQuery = searchQuery.toLowerCase();

    return CATEGORIES.map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.toLowerCase().includes(lowerQuery)
      )
    })).filter(category => category.items.length > 0);
  }, [searchQuery]);

  const handleContinue = async () => {
    try {
      await submitInterests([...selectedInterests]);
    } catch (error) {
      console.error(error);
      alert("Failed to save interests.");
    }
  };

  return (
    <div className="min-h-screen pb-40">
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-16">
        {/* Hero Section */}
        <div className="max-w-3xl mb-10 md:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-stone-900"
          >
            What do you want to learn?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-stone-600 leading-relaxed max-w-2xl"
          >
            Select at least {REQUIRED_SELECTIONS} interests to customize your feed. We'll use these to suggest courses, articles, and learning paths tailored just for you.
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-2xl mb-12 md:mb-16"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-stone-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-base outline-none shadow-sm placeholder:text-stone-400"
            placeholder="Search for topics (e.g. Quantum Physics, UX Design)"
          />
        </motion.div>

        {/* Categories & Chips */}
        <div className="space-y-12 md:space-y-16">
          {filteredCategories.map((category, index) => (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-6 flex items-center gap-2">
                <category.icon className={`w-5 h-5 ${category.iconColor}`} />
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-3">
                {category.items.map((item) => {
                  const isSelected = selectedInterests.has(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleInterest(item)}
                      className={`
                        relative group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
                        ${isSelected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 hover:bg-orange-600'
                          : 'bg-stone-200/50 text-stone-700 border-transparent hover:border-sky-400 hover:bg-white hover:shadow-sm'
                        }
                      `}
                    >
                      <span>{item}</span>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, width: 0, opacity: 0 }}
                            animate={{ scale: 1, width: 'auto', opacity: 1 }}
                            exit={{ scale: 0, width: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden flex items-center"
                          >
                            <Check className="w-4 h-4 ml-1" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            </motion.section>
          ))}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-stone-500">
              No topics found matching "{searchQuery}".
            </div>
          )}
        </div>
      </main>

      {/* Sticky Footer Progress Bar */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/85 backdrop-blur-xl border-t border-stone-200/50 py-5 px-6 md:px-10 z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">

          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-stone-800">
                {selectedInterests.size}/{REQUIRED_SELECTIONS} selected
              </span>
              <span className="text-sm font-medium text-stone-500">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full md:w-80 h-2.5 bg-stone-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.8 }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* <button className="px-6 py-3 text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors hidden md:block">
              Skip for now
            </button> */}
            <button
              disabled={!canContinue || loading}
              onClick={handleContinue}
              className={`
                w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm
                ${canContinue
                  ? 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }
              `}
            >
              {loading?"Saving...": canContinue?"Continue to Feed": "Continue"}
            </button>
          </div>

          {/* Mobile skip button below continue if needed */}
          {/* <button className="md:hidden text-sm font-medium text-stone-500 hover:text-stone-800 pb-2">
             Skip for now
          </button> */}
        </div>
      </footer>
    </div>
  );
}
