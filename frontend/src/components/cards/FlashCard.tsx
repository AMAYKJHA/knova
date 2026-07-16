// components/cards/FlashCard.tsx
'use client';

import { useState } from 'react';
import { FeedActions, ReelActions, CommentsSection } from './Shared';

interface CardProps {
  variant?: 'feed' | 'reel' | 'explore' | 'profile';
  author?: string;
  time?: string;
  category?: string;
  question?: string;
  answer?: string;
  upvotes?: number | string;
  downvotes?: number;
  comments?: number;
  authorInitial?: string;
  authorBg?: string;
  answerBg?: string;
  subtitle?: string;
  theme?: string;
  tag?: string;
  onCommentToggle?: () => void;
  bg?: string;
  onShare?: (id: string | number) => void;
  onVote?: (id: string, value: number) => Promise<void>;
  onSave?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onComment?: (id: string, body: string) => Promise<void>;
  id?: string | number;
  userVote?: number;
  userSaved?: boolean;
  isOwner?: boolean;
}

export default function FlashCard(props: CardProps) {
  const { variant = 'feed' } = props;
  if (variant === 'feed') return <FlashCardFeed {...props} />;
  if (variant === 'reel') return <FlashCardReel {...props} />;
  if (variant === 'explore') return <FlashCardExplore {...props} />;
  if (variant === 'profile') return <FlashCardProfile {...props} />;
  return null;
}

function FlashCardFeed({
  id,
  author,
  time,
  question,
  answer,
  upvotes,
  downvotes,
  comments,
  authorInitial,
  authorBg,
  answerBg,
  onShare,
  onVote,
  onSave,
  onDelete,
  userVote,
  userSaved,
  isOwner,
}: CardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(Number(upvotes) || 0);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes || 0);
  const [localUserVote, setLocalUserVote] = useState(userVote || 0);
  const [localUserSaved, setLocalUserSaved] = useState(userSaved || false);

  const handleVote = async (value: number) => {
    if (!id || !onVote) return;
    
    const previousVote = localUserVote;
    const previousUpvotes = localUpvotes;
    const previousDownvotes = localDownvotes;

    if (previousVote === value) {
      setLocalUserVote(0);
      if (value === 1) setLocalUpvotes(prev => prev - 1);
      else setLocalDownvotes(prev => prev - 1);
    } else {
      setLocalUserVote(value);
      if (value === 1) {
        setLocalUpvotes(prev => prev + 1);
        if (previousVote === -1) setLocalDownvotes(prev => prev - 1);
      } else {
        setLocalDownvotes(prev => prev + 1);
        if (previousVote === 1) setLocalUpvotes(prev => prev - 1);
      }
    }

    try {
      await onVote(id as string, value);
    } catch {
      setLocalUserVote(previousVote);
      setLocalUpvotes(previousUpvotes);
      setLocalDownvotes(previousDownvotes);
    }
  };

  const handleSave = async () => {
    if (!id || !onSave) return;
    setLocalUserSaved(!localUserSaved);
    try {
      await onSave(id as string);
    } catch (error) {
      setLocalUserSaved(!localUserSaved);
      console.error('Failed to save:', error);
    }
  };

  const handleDelete = async () => {
    if (!id || !onDelete) return;
    if (confirm('Are you sure you want to delete this post?')) {
      await onDelete(id as string);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover-lift transition-all duration-300">
      <div className="p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-orange-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${authorBg || 'bg-orange-500 text-white'}`}>
            {authorInitial || author?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-on-surface">{author || 'Unknown'}</p>
            <p className="text-xs text-outline">{time || 'Just now'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && onDelete && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          )}
          <button className="material-symbols-outlined text-outline">more_horiz</button>
        </div>
      </div>

      <div className="relative w-full h-[300px] perspective-1000 group cursor-pointer overflow-hidden" onClick={() => setFlipped(!flipped)}>
        <div className={`FlashCard-inner relative w-full h-full text-center flex flex-col items-center justify-center ${flipped ? 'is-flipped' : ''}`} style={{ transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)', transformStyle: 'preserve-3d' }}>
          <div className="FlashCard-front absolute inset-0 p-12 flex flex-col items-center justify-center bg-gradient-to-br from-white to-surface-container-low" style={{ backfaceVisibility: 'hidden' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{question || 'Question'}</h2>
            <p className="text-primary font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">touch_app</span> Tap to reveal answer
            </p>
          </div>

          <div className={`FlashCard-back absolute inset-0 p-12 flex flex-col items-center justify-center ${answerBg || 'bg-[#f36710]'} text-white`} style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
            <h2 className="text-3xl font-bold text-white mb-4">{answer || 'Answer'}</h2>
            <p className="text-white/80 text-sm">Tap to see question</p>
          </div>
        </div>
      </div>

      <FeedActions
        upvotes={localUpvotes}
        downvotes={localDownvotes}
        comments={comments || 0}
        onShare={() => onShare && id && onShare(id)}
        onCommentToggle={() => setShowComments(!showComments)}
        showComments={showComments}
        onVote={handleVote}
        onSave={handleSave}
        userVote={localUserVote}
        userSaved={localUserSaved}
        postId={id as string}
      />
      <CommentsSection show={showComments} />
    </div>
  );
}

function FlashCardReel({ question, answer, subtitle, theme, tag, author, time, upvotes, comments, onCommentToggle }: CardProps) {
  const [flipped, setFlipped] = useState(false);
  const isOrange = theme === 'orange';

  return (
    <section className="h-screen w-full snap-start flex items-center justify-center relative">
      <div className="w-[440px] h-[90vh] bg-white rounded-[16px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col relative z-20">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`h-1/2 flex items-center justify-center p-6 text-center ${isOrange ? 'bg-[#fef3ea]' : 'bg-[#e5f7fd]'}`}>
            <h2 className="text-[#1a1a1a] font-semibold text-[24px] leading-tight">{question || 'Question'}</h2>
          </div>
          <div className="flex-1 perspective-1000 cursor-pointer" onClick={() => setFlipped(!flipped)}>
            <div className={`relative w-full h-full transition-transform duration-600 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`} style={{ transition: 'transform 0.6s', transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 bg-white p-6 flex flex-col items-center justify-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                <span className={`material-symbols-outlined text-[36px] mb-2 ${isOrange ? 'text-[#f36710]' : 'text-[#00afef]'}`}>touch_app</span>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border tracking-widest shadow-sm ${isOrange ? 'text-[#f36710] border-[#f36710]/30' : 'text-[#00afef] border-[#00afef]/30'}`}>
                  Tap to flip
                </div>
              </div>
              <div className={`absolute inset-0 p-6 text-center flex flex-col items-center justify-center backface-hidden ${isOrange ? 'bg-[#f36710]' : 'bg-[#00afef]'}`} style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                <p className="text-white font-bold text-[28px] tracking-tight">{answer || 'Answer'}</p>
                <p className="text-white/80 text-sm mt-2">{subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 z-30 pointer-events-none">
          <div className="flex flex-wrap gap-1.5">
            <span className={`px-[10px] py-[4px] ${isOrange ? 'bg-[#fef3ea]/60 text-[#f36710]' : 'bg-[#e0f6fe]/60 text-[#0080b0]'} rounded-full text-[12px] font-semibold backdrop-blur-sm pointer-events-auto shadow-sm`}>
              {tag || 'General'}
            </span>
          </div>
          <div className="w-full h-px bg-[#1a1a1a]/10 mb-1" />
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className={`w-[36px] h-[36px] rounded-full ${isOrange ? 'bg-[#fef3ea] text-[#f36710]' : 'bg-[#e0f6fe] text-[#0080b0]'} flex items-center justify-center font-bold text-sm shadow-sm border border-white/50`}>
              {author?.slice(0, 2).toUpperCase() || 'AN'}
            </div>
            <div className="drop-shadow-sm">
              <p className="text-[14px] font-bold text-[#1a1a1a] leading-none mb-1">{author || 'Anonymous'}</p>
              <p className="text-[12px] text-[#5c5c5c] font-medium leading-none">{time || 'Just now'}</p>
            </div>
          </div>
        </div>
      </div>

      <ReelActions upvotes={upvotes || 0} comments={comments || 0} onCommentToggle={onCommentToggle} />
    </section>
  );
}

function FlashCardExplore({ question, author, upvotes, bg = "bg-[#fef3ea]" }: CardProps) {
  return (
    <div className={`h-[340px] rounded-xl relative flex flex-col p-6 hover-lift cursor-pointer border border-primary/10 ${bg}`}>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-primary-container text-4xl mb-4 opacity-50">help_center</span>
        <h3 className="text-headline-md font-semibold text-on-primary-container leading-tight px-2">{question || 'Question'}</h3>
      </div>
      <div className="pt-4 border-t border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary-fixed"></div>
          <span className="text-sm text-on-primary-container/70 font-semibold">{author || 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-1 text-primary-container">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
          <span className="text-sm font-bold">{upvotes || 0}</span>
        </div>
      </div>
      <div className="absolute bottom-16 left-0 right-0 flex justify-center opacity-30">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary-container">Tap to flip</span>
      </div>
    </div>
  );
}

function FlashCardProfile({ question }: CardProps) {
  return (
    <div className="aspect-square bg-[#fef3ea] rounded-[20px] relative flex flex-col p-5 border border-primary/10 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-[#f36710] text-3xl mb-3 opacity-50">help_center</span>
        <h3 className="text-sm font-bold text-on-surface leading-snug">{question || 'Question'}</h3>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-40">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#f36710]">Tap to flip</span>
      </div>
    </div>
  );
}