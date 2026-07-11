'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, LayoutTemplate, HelpCircle, FileType2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeedItem } from '@/data/feedData';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (post: FeedItem) => void;
}

type Format = 'note' | 'flashcard' | 'mcq' | 'article' | null;

export default function CreatePostModal({ isOpen, onClose, onCreate }: CreatePostModalProps) {
  const [step, setStep] = useState(1);
  const [format, setFormat] = useState<Format>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [noteContent, setNoteContent] = useState('');
  
  const [flashcardFront, setFlashcardFront] = useState('');
  const [flashcardBack, setFlashcardBack] = useState('');
  
  const [articleBody, setArticleBody] = useState('');
  
  const [mcqQuestion, setMcqQuestion] = useState('');
  const [mcqOptions, setMcqOptions] = useState<string[]>(['', '', '', '']);
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState<number>(0);
  const [mcqExplanation, setMcqExplanation] = useState('');

  const reset = () => {
    setStep(1);
    setFormat(null);
    setIsAnonymous(false);
    setTags([]);
    setTagInput('');
    setNoteContent('');
    setFlashcardFront('');
    setFlashcardBack('');
    setArticleBody('');
    setMcqQuestion('');
    setMcqOptions(['', '', '', '']);
    setMcqCorrectIndex(0);
    setMcqExplanation('');
  };

  const handlePublish = () => {
    const baseProps = {
      id: Date.now(),
      author: isAnonymous ? 'Anonymous User' : 'Biren Rawat',
      authorInitial: isAnonymous ? 'AU' : 'BR',
      authorBg: isAnonymous ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white',
      time: 'Just now',
      category: tags.length > 0 ? tags[0] : 'General',
      upvotes: 0,
      downvotes: 0,
      comments: 0
    };

    let newItem: FeedItem | null = null;

    if (format === 'note') {
      newItem = {
        ...baseProps,
        type: 'text',
        title: 'Short Note',
        content: noteContent
      };
    } else if (format === 'flashcard') {
      newItem = {
        ...baseProps,
        type: 'flashcard',
        question: flashcardFront,
        answer: flashcardBack,
        answerBg: 'bg-[#f36710]'
      };
    } else if (format === 'article') {
      newItem = {
        ...baseProps,
        type: 'text',
        title: 'Article',
        content: articleBody
      };
    } else if (format === 'mcq') {
      newItem = {
        ...baseProps,
        type: 'mcq',
        question: mcqQuestion,
        options: mcqOptions,
        correctIndex: mcqCorrectIndex,
        explanation: mcqExplanation
      };
    }

    if (newItem) {
      onCreate(newItem);
    }
    setStep(4);
  };


  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(',', '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const stepsData: Record<number, { title: string; label: string }> = {
    1: { title: "Create new post", label: "Step 1 of 3 — Choose format" },
    2: { title: "Create new post", label: "Step 2 of 3 — Write content" },
    3: { title: "Categorize your post", label: "Step 3 of 3 — Tags and publish" }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl w-full max-w-[480px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            {step < 4 && (
              <div className="p-5 flex justify-between items-start pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-gray-900 text-[15px] font-bold">{stepsData[step]?.title}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{stepsData[step]?.label}</p>
                </div>
                <button 
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}

            {/* Progress Bar */}
            {step < 4 && (
              <div className="px-5 flex gap-1.5 pt-4">
                {[1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1 rounded-full flex-1 transition-colors duration-300",
                      i <= step ? "bg-orange-600" : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Body */}
            <div className="px-5 pb-5 pt-4 flex-1 overflow-y-auto">
              
              {/* Step 1 */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-3">
                    What are you creating?
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                      onClick={() => setFormat('note')}
                      className={cn(
                        "p-4 rounded-xl flex flex-col items-center gap-2 text-center group border-2 transition-all",
                        format === 'note' ? "border-orange-600 bg-orange-50" : "border-gray-200 hover:border-orange-300"
                      )}
                    >
                      <FileText className={cn("w-6 h-6", format === 'note' ? "text-orange-600" : "text-gray-500")} />
                      <span className={cn("text-sm font-medium", format === 'note' ? "text-orange-600" : "text-gray-700")}>Short note</span>
                    </button>
                    <button 
                      onClick={() => setFormat('flashcard')}
                      className={cn(
                        "p-4 rounded-xl flex flex-col items-center gap-2 text-center group border-2 transition-all",
                        format === 'flashcard' ? "border-orange-600 bg-orange-50" : "border-gray-200 hover:border-orange-300"
                      )}
                    >
                      <LayoutTemplate className={cn("w-6 h-6", format === 'flashcard' ? "text-orange-600" : "text-gray-500")} />
                      <span className={cn("text-sm font-medium", format === 'flashcard' ? "text-orange-600" : "text-gray-700")}>Flashcard</span>
                    </button>
                    <button 
                      onClick={() => setFormat('mcq')}
                      className={cn(
                        "p-4 rounded-xl flex flex-col items-center gap-2 text-center group border-2 transition-all",
                        format === 'mcq' ? "border-orange-600 bg-orange-50" : "border-gray-200 hover:border-orange-300"
                      )}
                    >
                      <HelpCircle className={cn("w-6 h-6", format === 'mcq' ? "text-orange-600" : "text-gray-500")} />
                      <span className={cn("text-sm font-medium", format === 'mcq' ? "text-orange-600" : "text-gray-700")}>MCQ quiz</span>
                    </button>
                    <button 
                      onClick={() => setFormat('article')}
                      className={cn(
                        "p-4 rounded-xl flex flex-col items-center gap-2 text-center group border-2 transition-all",
                        format === 'article' ? "border-orange-600 bg-orange-50" : "border-gray-200 hover:border-orange-300"
                      )}
                    >
                      <FileType2 className={cn("w-6 h-6", format === 'article' ? "text-orange-600" : "text-gray-500")} />
                      <span className={cn("text-sm font-medium", format === 'article' ? "text-orange-600" : "text-gray-700")}>Text article</span>
                    </button>
                  </div>
                  {format && (
                    <button 
                      onClick={() => setStep(2)}
                      className="w-full bg-orange-600 text-white h-11 rounded-xl text-[15px] font-bold hover:bg-orange-700 active:scale-95 transition-all"
                    >
                      Next step
                    </button>
                  )}
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col gap-4">
                  {format === 'note' && (
                    <div>
                      <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider flex justify-between mb-1.5">
                        <span>Note Content</span>
                      </label>
                      <textarea 
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 min-h-[120px] outline-none transition-all placeholder:text-gray-400" 
                        placeholder="What is on your mind?"
                      />
                    </div>
                  )}
                  {format === 'flashcard' && (
                    <>
                      <div>
                        <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider flex justify-between mb-1.5">
                          <span>Front prompt</span>
                        </label>
                        <textarea 
                          value={flashcardFront}
                          onChange={(e) => setFlashcardFront(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 min-h-[80px] outline-none transition-all placeholder:text-gray-400" 
                          placeholder="Enter the question or concept..."
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider flex justify-between mb-1.5">
                          <span>Back definition</span>
                        </label>
                        <textarea 
                          value={flashcardBack}
                          onChange={(e) => setFlashcardBack(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 min-h-[80px] outline-none transition-all placeholder:text-gray-400" 
                          placeholder="Enter the answer or definition..."
                        />
                      </div>
                    </>
                  )}
                  {format === 'article' && (
                    <div>
                      <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider flex justify-between mb-1.5">
                        <span>Article Body</span>
                      </label>
                      <textarea 
                        value={articleBody}
                        onChange={(e) => setArticleBody(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 min-h-[200px] outline-none transition-all placeholder:text-gray-400" 
                        placeholder="Write your detailed thoughts here..."
                      />
                    </div>
                  )}
                  {format === 'mcq' && (
                    <>
                      <div>
                        <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider flex justify-between mb-1.5">
                          <span>Question</span>
                        </label>
                        <textarea 
                          value={mcqQuestion}
                          onChange={(e) => setMcqQuestion(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 min-h-[60px] outline-none transition-all placeholder:text-gray-400" 
                          placeholder="What are you asking?"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {['A', 'B', 'C', 'D'].map((opt, index) => (
                          <div key={opt} className="relative group">
                            <input 
                              type="text" 
                              value={mcqOptions[index]}
                              onChange={(e) => {
                                const newOpts = [...mcqOptions];
                                newOpts[index] = e.target.value;
                                setMcqOptions(newOpts);
                              }}
                              placeholder={`Option ${opt}`} 
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-3 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                              <input 
                                type="radio" 
                                name="correct-opt" 
                                checked={mcqCorrectIndex === index}
                                onChange={() => setMcqCorrectIndex(index)}
                                className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider flex justify-between mb-1.5 mt-2">
                          <span>Explanation (Optional)</span>
                        </label>
                        <textarea 
                          value={mcqExplanation}
                          onChange={(e) => setMcqExplanation(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 min-h-[60px] outline-none transition-all placeholder:text-gray-400" 
                          placeholder="Why is this the correct answer?"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 text-gray-700 h-11 rounded-xl text-[15px] font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      className="flex-1 bg-orange-600 text-white h-11 rounded-xl text-[15px] font-bold hover:bg-orange-700 active:scale-95 transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col gap-6">
                  <div>
                    <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2 block">
                      Topic Tags
                    </label>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 min-h-[48px] flex flex-wrap gap-2 items-center focus-within:ring-1 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                      {tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-700 text-[12px] font-medium px-2.5 py-1 rounded-full">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 flex-1 min-w-[120px] p-0"
                        placeholder={tags.length === 0 ? "Add tags (Enter or comma)..." : ""}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900">Post anonymously</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">Hide your profile from the feed</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={isAnonymous} onChange={() => setIsAnonymous(!isAnonymous)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-100 text-gray-700 h-11 rounded-xl text-[15px] font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handlePublish}
                      className="flex-1 bg-orange-600 text-white h-11 rounded-xl text-[15px] font-bold shadow-lg shadow-orange-600/25 hover:bg-orange-700 active:scale-95 transition-all"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              )}

              {/* Success Step 4 */}
              {step === 4 && (
                <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                  <div className="w-14 h-14 rounded-full bg-orange-600 flex items-center justify-center text-white mb-5 shadow-lg shadow-orange-600/20">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-[22px] font-bold text-gray-900 mb-2">Content created!</h4>
                  <p className="text-[15px] text-gray-500 mb-8">Your post is live on the feed.</p>
                  
                  <div className="flex flex-col gap-3 w-full">
                    <button 
                      onClick={handleClose}
                      className="w-full bg-orange-600 text-white h-11 rounded-xl text-[15px] font-bold hover:bg-orange-700 active:scale-95 transition-all shadow-md shadow-orange-600/20"
                    >
                      View post
                    </button>
                    <button 
                      onClick={reset}
                      className="w-full bg-gray-50 text-gray-700 h-11 rounded-xl text-[15px] font-semibold hover:bg-gray-100 transition-all active:scale-95"
                    >
                      Create another
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

