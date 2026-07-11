'use client';

import { useState } from 'react';
import { FeedActions, ReelActions, CommentsSection } from './Shared';
import { CheckCircle2, XCircle, MoreHorizontal } from 'lucide-react';

interface McqProps {
  variant?: 'feed' | 'reel' | 'explore' | 'profile';
  author?: string;
  time?: string;
  question?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  upvotes?: number | string;
  downvotes?: number;
  comments?: number;
  authorInitial?: string;
  authorBg?: string;
  authorImg?: string;
  tags?: string[];
  onCommentToggle?: () => void;
  tag?: string;
  highlightIndex?: number;
  onShare?: (id: string | number) => void;
  id?: string | number;
}

export default function McqCard(props: McqProps) {
  const { variant = 'feed' } = props;
  if (variant === 'feed') return <MCQFeed {...props} />;
  if (variant === 'reel') return <MCQReel {...props} />;
  if (variant === 'explore') return <MCQExplore {...props} />;
  if (variant === 'profile') return <MCQProfile {...props} />;
  return null;
}

function MCQFeed({ author, time, question, options, correctIndex, explanation, upvotes, downvotes,comments, authorInitial, authorBg, authorImg, id, onShare }: McqProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover-lift transition-all duration-300">
      <div className="p-6 bg-surface-container-high/20 flex justify-between items-center border-b border-surface-variant">
        <div className="flex items-center gap-3">
          {authorImg ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-secondary bg-white">
              <img src={authorImg} alt={author} className="w-full h-full object-contain p-1" />
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${authorBg}`}>
              {authorInitial}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-on-surface">{author}</p>
            <p className="text-xs text-outline">{time}</p>
          </div>
        </div>
        <button className="material-symbols-outlined text-outline">more_horiz</button>
      </div>

      <div className="p-8 bg-white">
        <h4 className="text-[24px] font-bold text-on-surface mb-8 leading-tight">{question}</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {options?.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = correctIndex === i;
            const showCorrect = selected !== null && isCorrect;
            const showWrong = isSelected && !isCorrect;

            let btnClasses = "border-outline-variant hover:border-primary";
            let markerClasses = "bg-surface-container text-on-surface-variant";

            if (selected !== null) {
              if (showCorrect) {
                btnClasses = "border-green-500 bg-green-50";
                markerClasses = "bg-green-500 text-white";
              } else if (showWrong) {
                btnClasses = "border-red-500 bg-red-50";
                markerClasses = "bg-red-500 text-white";
              } else {
                btnClasses = "border-outline-variant opacity-50";
              }
            }

            return (
              <button
                key={opt}
                disabled={selected !== null}
                onClick={() => setSelected(i)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${btnClasses}`}
              >
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${markerClasses}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-[16px] font-medium text-on-surface">{opt}</span>
              </button>
            )
          })}
        </div>

        {selected !== null && correctIndex !== undefined && (
          <div className={`p-4 rounded-xl border ${selected === correctIndex ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`font-bold text-sm mb-1 ${selected === correctIndex ? 'text-green-700' : 'text-red-700'}`}>
              {selected === correctIndex ? 'Correct!' : 'You are wrong.'}
            </p>
            <p className="text-sm text-on-surface-variant">
              {selected !== correctIndex && (
                <span className="font-bold block mb-1">
                  The correct answer is {options?.[correctIndex]}.
                </span>
              )}
              {explanation}
            </p>
          </div>
        )}
      </div>

      <FeedActions
        upvotes={upvotes || 0}
        downvotes={downvotes || 0}
        comments={comments || 0}
        onShare={() => onShare && id && onShare(id)}
        onCommentToggle={() => setShowComments(!showComments)}
        showComments={showComments}
      />
      <CommentsSection show={showComments} />
    </div>
  );
}

function MCQReel({ question, options, correctIndex, explanation, tags, author, time, upvotes, comments, onCommentToggle }: McqProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="h-screen w-full snap-start flex items-center justify-center relative">
      <div className="w-[440px] h-[90vh] bg-white rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col relative z-20 text-[#1a1a1a]">
        <div className="flex-1 p-6 flex flex-col justify-start pt-12 overflow-y-auto custom-scrollbar">
          <h2 className="font-bold text-[22px] leading-tight mb-8">{question}</h2>

          <div className="space-y-4">
            {options?.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = correctIndex === i;
              const showCorrect = selected !== null && isCorrect;
              const showWrong = isSelected && !isCorrect;

              let btnClasses = "border-surface-container hover:border-[#0080b0]";
              let iconClass = "opacity-0";

              if (selected !== null) {
                if (showCorrect) {
                  btnClasses = "border-emerald-500 bg-emerald-50 text-emerald-800";
                  iconClass = "opacity-100 text-emerald-600";
                } else if (showWrong) {
                  btnClasses = "border-red-500 bg-red-50 text-red-800";
                  iconClass = "opacity-100 text-red-600";
                } else {
                  btnClasses = "border-surface-container opacity-50";
                }
              }

              return (
                <button
                  key={opt}
                  disabled={selected !== null}
                  onClick={() => setSelected(i)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between text-left transition-all ${btnClasses}`}
                >
                  <span className="font-medium text-[16px]">{opt}</span>
                  <span className={`material-symbols-outlined text-[20px] transition-opacity ${iconClass}`}>
                    {showCorrect ? 'check' : showWrong ? 'close' : 'check'}
                  </span>
                </button>
              );
            })}
          </div>

          {selected !== null && correctIndex !== undefined && (
            <div className={`mt-6 p-4 rounded-xl border ${selected === correctIndex ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-100'}`}>
              <p className={`text-sm font-bold mb-1 ${selected === correctIndex ? 'text-emerald-700' : 'text-red-700'}`}>
                {selected === correctIndex ? 'Correct!' : 'You are wrong.'}
              </p>
              <p className="text-on-surface-variant text-sm">
                {selected !== correctIndex && (
                  <span className="font-bold block mb-1">
                    The right answer is {options?.[correctIndex]}.
                  </span>
                )}
                {explanation}
              </p>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 z-30 pointer-events-none bg-gradient-to-t from-white via-white to-transparent pt-6 pb-2 px-2 -mx-2 -mb-2 rounded-b-[16px]">
          <div className="flex flex-wrap gap-1.5">
            {tags?.map((tag) => (
              <span key={tag} className="px-[10px] py-[4px] bg-[#e0f6fe] text-[#0080b0] rounded-full text-[12px] font-semibold pointer-events-auto">
                {tag}
              </span>
            ))}
          </div>
          <div className="w-full h-px bg-[#1a1a1a]/10 mb-1" />
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="w-[36px] h-[36px] rounded-full bg-[#e0f6fe] flex items-center justify-center text-[#0080b0] font-bold text-sm shadow-sm">
              {author?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#1a1a1a] leading-none mb-1">{author}</p>
              <p className="text-[12px] text-[#5c5c5c] font-medium leading-none">{time}</p>
            </div>
          </div>
        </div>
      </div>

      <ReelActions upvotes={upvotes || 0} comments={comments || 0} onCommentToggle={onCommentToggle} />
    </section>
  );
}

function MCQExplore({ tag, question, options, author, upvotes, correctIndex = -1 }: McqProps) {
  return (
    <div className="h-[300px] bg-white rounded-xl flex flex-col p-5 hover-lift cursor-pointer border border-surface-container-high relative overflow-hidden">
      <div className="absolute inset-0 bg-[#00afef]/5 pointer-events-none" />
      <div className="flex justify-between items-start mb-3 relative z-10">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">{tag}</span>
      </div>
      <h3 className="text-[18px] font-semibold text-on-surface line-clamp-2 mb-4 relative z-10 leading-snug">{question}</h3>
      <div className="space-y-2 flex-1 relative z-10 overflow-hidden">
        {options?.map((opt, i) => (
          <div key={opt} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 border ${i === correctIndex ? 'border-primary/30 font-bold bg-primary/5' : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant'}`}>
            <span className="font-bold text-primary">{String.fromCharCode(65 + i)}</span> {opt}
          </div>
        ))}
      </div>
      <div className="pt-3 mt-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-secondary-fixed"></div>
          <span className="text-sm text-on-surface-variant font-medium">{author}</span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
          <span className="text-sm font-bold">{upvotes}</span>
        </div>
      </div>
    </div>
  );
}

function MCQProfile({ tag, question, options, highlightIndex = -1 }: McqProps) {
  return (
    <div className="aspect-square bg-white rounded-[20px] flex flex-col p-5 border border-surface-container-high hover:shadow-lg transition-all hover:-translate-y-1">
      <span className="text-[10px] font-bold text-[#00afef] mb-2 uppercase tracking-wide">{tag}</span>
      <h3 className="text-sm font-bold text-on-surface line-clamp-2 mb-3 leading-snug">{question}</h3>
      <div className="space-y-1.5 flex-1 mt-auto">
        {options?.map((opt, i) => (
          <div key={opt} className={`px-2 py-1.5 rounded-md text-[11px] ${i === highlightIndex ? 'font-bold border border-[#f36710]/30 bg-[#fef3ea] text-[#f36710]' : 'text-on-surface-variant border border-outline-variant/20 bg-surface-container-low'}`}>
            {String.fromCharCode(65 + i)} {opt}
          </div>
        ))}
      </div>
    </div>
  );
}