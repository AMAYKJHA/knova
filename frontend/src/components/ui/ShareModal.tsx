'use client';

import { X, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ShareModal({ isOpen, onClose, contentId }: { isOpen: boolean; onClose: () => void; contentId: string | number | null }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const shareUrl = contentId ? `https://knova.edu/post/${contentId}` : '';

  const handleCopy = () => {
    if (!contentId) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1000);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-xl">Share knowledge</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600 font-medium">Copy the link below to share with others:</p>
          <div className="flex items-center gap-2 p-1.5 pl-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
            <input
              className="bg-transparent border-none focus:ring-0 text-sm flex-1 text-gray-700 outline-none w-full min-w-0"
              readOnly
              value={shareUrl}
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors flex-shrink-0 ${
                copied ? 'bg-green-500 text-white' : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
