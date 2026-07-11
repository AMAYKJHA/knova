'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, MessageSquare, Share2 } from 'lucide-react';

interface FeedActionsProps {
  upvotes: number | string;
  downvotes: number;
  comments: number;
  onShare?: () => void;
  onCommentToggle?: () => void;
  showComments?: boolean;
}

interface ReelActionsProps {
  upvotes: number | string;
  comments: number;
  onCommentToggle?: () => void;
}

export function FeedActions({ upvotes, downvotes, comments, onShare, onCommentToggle, showComments }: FeedActionsProps) {
  return (
    <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
          <button className="text-gray-500 hover:text-orange-600 transition-colors">
            <ArrowUp size={18} />
          </button>
          <span className="font-bold text-sm text-gray-700 mx-1">{upvotes}</span>
          <div className="w-px h-3 bg-gray-300 mx-1"></div>
          <button className="text-gray-500 hover:text-red-600 transition-colors">
            <ArrowDown size={18} />
          </button>
          <span className="font-bold text-sm text-gray-700 ml-1">{downvotes}</span>
        </div>
        
        <button 
          onClick={onCommentToggle}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${showComments ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <MessageSquare size={18} className={showComments ? 'fill-orange-200' : ''} />
          <span className="font-medium text-sm">{comments}</span>
        </button>
      </div>
      
      <button 
        onClick={onShare}
        className="text-gray-500 hover:text-orange-600 hover:bg-orange-50 p-2 rounded-full transition-colors"
      >
        <Share2 size={18} />
      </button>
    </div>
  );
}

export function CommentsSection({ show }: { show?: boolean }) {
  if (!show) return null;
  
  return (
    <div className="p-5 border-t border-gray-100 bg-gray-50/50 animate-in slide-in-from-top-2">
      <div className="space-y-4">
        <p className="text-sm text-gray-500 text-center italic py-2">No comments yet. Be the first to share your thoughts!</p>
      </div>
      
      <div className="flex gap-3 mt-5">
        <div className="w-8 h-8 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm">
          ME
        </div>
        <div className="flex-1 flex gap-2">
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="bg-white border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-xl px-4 py-2 text-sm flex-1 outline-none transition-all shadow-sm"
          />
          <button className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors shadow-sm">
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReelActions({ upvotes, comments, onCommentToggle }: ReelActionsProps) {
  const [voted, setVoted] = useState(false);

  return (
    <div className="absolute left-[calc(50%+230px)] top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
      <div className="flex flex-col items-center gap-1">
        <button 
          onClick={() => setVoted(!voted)}
          className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all text-[#1a1a1a] ${voted ? 'text-[#f36710]' : ''}`}
        >
          <ArrowUp size={24} />
        </button>
        <span className="text-white text-[12px] font-medium drop-shadow-md">{upvotes}</span>
      </div>
      
      <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all text-[#1a1a1a] hover:bg-gray-50">
        <ArrowDown size={24} />
      </button>

      <div className="flex flex-col items-center gap-1 mt-2">
        <button 
          onClick={onCommentToggle}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all text-[#1a1a1a] hover:bg-gray-50"
        >
          <MessageSquare size={22} />
        </button>
        <span className="text-white text-[12px] font-medium drop-shadow-md">{comments}</span>
      </div>

      <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all text-[#1a1a1a] hover:bg-gray-50 mt-2">
        <Share2 size={22} />
      </button>
    </div>
  );
}
