'use client';
import { useState } from 'react';
import { FeedActions, ReelActions, CommentsSection } from './Shared';

interface TextProps {
  variant?: 'feed' | 'reel' | 'explore' | 'profile';
  author?: string;
  time?: string;
  title?: string;
  content?: string;
  upvotes?: number | string;
  downvotes?: number;
  comments?: number;
  authorInitial?: string;
  authorBg?: string;
  tags?: string[];
  onCommentToggle?: () => void;
  tag?: string;
  color?: string;
  onShare?: (id: string | number) => void;
  id?: string | number;
}

export default function TextCard(props: TextProps) {
  const { variant = 'feed' } = props;
  if (variant === 'feed') return <TextFeed {...props} />;
  if (variant === 'reel') return <TextReel {...props} />;
  if (variant === 'explore') return <TextExplore {...props} />;
  if (variant === 'profile') return <TextProfile {...props} />;
  return null;
}

function TextFeed({ author, time, title, content, upvotes, downvotes, comments, authorInitial, authorBg, id, onShare }: TextProps) {
  const [showComments, setShowComments] = useState(false);
  return (
    <div className="glass-card rounded-2xl overflow-hidden hover-lift transition-all duration-300">
      <div className="p-8 pb-4 bg-white">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${authorBg}`}>
              {authorInitial}
            </div>
            <div>
              <p className="font-semibold text-sm text-on-surface">{author}</p>
              <p className="text-xs text-outline">{time}</p>
            </div>
          </div>
          <button className="material-symbols-outlined text-outline">more_horiz</button>
        </div>
        <h3 className="text-[24px] font-bold text-on-surface mb-4 leading-tight">{title}</h3>
        <p className="text-[18px] text-on-surface-variant leading-relaxed mb-6">{content}</p>
        <button className="font-bold hover:underline flex items-center gap-1 mb-4 text-primary">
          Read more...
        </button>
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

function TextReel({ title, content, tags, author, time, upvotes, comments, onCommentToggle }: TextProps) {
  return (
    <section className="h-screen w-full snap-start flex items-center justify-center relative">
      <div className="w-[440px] h-[90vh] bg-white rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col relative z-20 text-[#1a1a1a]">
        <div className="flex-1 p-8 flex flex-col justify-center items-center text-center">
          <h2 className="font-bold text-[24px] leading-tight mb-6">{title}</h2>
          <p className="text-on-surface-variant text-[16px] leading-relaxed">{content}</p>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 z-30 pointer-events-none">
          <div className="flex flex-wrap gap-1.5">
            {tags?.map((tag) => (
              <span key={tag} className="px-[10px] py-[4px] bg-[#e0f6fe] text-[#0080b0] rounded-full text-[12px] font-semibold pointer-events-auto shadow-sm">
                {tag}
              </span>
            ))}
          </div>
          <div className="w-full h-px bg-[#1a1a1a]/10 mb-1" />
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="w-[36px] h-[36px] rounded-full bg-[#e0f6fe] flex items-center justify-center text-[#0080b0] font-bold text-sm shadow-sm border border-white/50">
              {author?.slice(0, 2).toUpperCase()}
            </div>
            <div className="drop-shadow-sm">
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

function TextExplore({ tag, title, content, author, upvotes, color = "border-l-secondary" }: TextProps) {
  return (
    <div className={`h-[340px] bg-white rounded-xl flex flex-col p-0 hover-lift cursor-pointer border border-surface-container-high overflow-hidden border-l-[4px] ${color} relative`}>
      <div className="absolute inset-0 bg-[#00afef]/5 pointer-events-none" />
      <div className="p-6 flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-[#e0f6fe] text-secondary text-[10px] font-bold px-2 py-1 rounded-full">{tag}</div>
        </div>
        <h3 className="text-headline-sm font-bold text-on-surface mb-3">{title}</h3>
        <div className="text-sm text-on-surface-variant leading-relaxed flex-1 relative overflow-hidden">
          <p>{content}</p>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
        </div>
        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-outline-variant"></div>
            <span className="text-sm text-on-surface-variant font-medium">{author}</span>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
            <span className="text-sm font-bold">{upvotes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextProfile({ tag, title, content }: TextProps) {
  return (
    <div className="aspect-square bg-white rounded-[20px] flex flex-col p-5 border border-surface-container-high border-l-[4px] border-l-[#00afef] hover-shadow-lg transition-all hover:-translate-y-1">
      <span className="text-[10px] font-bold text-[#00afef] mb-2 uppercase tracking-wide">{tag}</span>
      <h3 className="text-[15px] font-bold text-on-surface mb-2 leading-snug">{title}</h3>
      <p className="text-[11px] text-on-surface-variant line-clamp-4 leading-relaxed">{content}</p>
    </div>
  );
}


