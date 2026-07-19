'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOnboarding } from "@/hooks/useOnboarding";
import { getTopics, Topic } from "@/lib/reference";

const REQUIRED_SELECTIONS = 5;

export default function OnboardingPage() {
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const { loading, submitInterests } = useOnboarding();

  // Load the real topic vocabulary from the backend. Selections are saved by name,
  // so they must come from this list to resolve to a Topic row on the server.
  useEffect(() => {
    let active = true;
    getTopics()
      .then((t) => { if (active) setTopics(t); })
      .catch((e) => {
        if (active) setTopicsError(e instanceof Error ? e.message : "Failed to load topics");
      })
      .finally(() => { if (active) setTopicsLoading(false); });
    return () => { active = false; };
  }, []);

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

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase();
    return topics.filter((t) => t.name.toLowerCase().includes(q));
  }, [searchQuery, topics]);

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
            placeholder="Search for topics (e.g. Machine Learning, UI/UX Design)"
          />
        </motion.div>

        {/* Topic chips */}
        <div className="space-y-8">
          {topicsLoading && (
            <div className="text-center py-12 text-stone-500">Loading topics…</div>
          )}

          {topicsError && !topicsLoading && (
            <div className="text-center py-12 text-red-500">{topicsError}</div>
          )}

          {!topicsLoading && !topicsError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              {filteredTopics.map((topic) => {
                const isSelected = selectedInterests.has(topic.name);
                return (
                  <button
                    key={topic.id}
                    onClick={() => toggleInterest(topic.name)}
                    className={`
                      relative group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
                      ${isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 hover:bg-orange-600'
                        : 'bg-stone-200/50 text-stone-700 border-transparent hover:border-sky-400 hover:bg-white hover:shadow-sm'
                      }
                    `}
                  >
                    <span>{topic.name}</span>
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
            </motion.div>
          )}

          {!topicsLoading && !topicsError && filteredTopics.length === 0 && (
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
              {loading ? "Saving..." : canContinue ? "Continue to Feed" : "Continue"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
