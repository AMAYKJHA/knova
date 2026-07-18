'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FlashCard from '@/components/cards/FlashCard';
import McqCard from '@/components/cards/McqCard';
import TextCard from '@/components/cards/TextContentCard';
import { spacePosts } from '@/data/mockData';

export default function SpaceReel() {
  const router = useRouter();
  const [commentsOpen, setCommentsOpen] = useState<boolean>(false);

  return (
    <div className="bg-[#0a0f1e] min-h-screen overflow-hidden relative text-white antialiased transition-all"
         style={{ transform: commentsOpen ? 'translateX(-240px)' : 'none' }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#f36710] to-[#00afef] opacity-10 pointer-events-none z-0" />

      {/* Top Nav Overlay */}
      <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-between h-20 px-6 pointer-events-none">
        <div className="pointer-events-auto">
          <button 
            className="p-2 text-black hover:text-red-600 transition-colors flex items-center justify-center"
            onClick={() => router.push('/')}
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <button className="p-2 text-black hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden bg-gray-200 cursor-pointer hover:border-white transition-colors">
            <img 
              alt="Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoL6Tz-loSXPzAFM0ngTHJa_vd-cHY-twsdup-7NcFw33hdYuWamtSvCMzW-ZipgBpOHkTbwTYWN-yrfVSV86i5W8oiFWPpqp3Qj1VTIHGuU7gKeOdM3eJSMGXylGH1vowIdWiylOz0moZvWcFCMbvacxj4ZHeOdBckiFwZEGtqDIvBfGMVFqhDA42WA56ouAUC8J5z189MFkfIQWfouE7kv_lSUpn95a8XC9ddAgfENLq1vE_EzQ8crCz5kmw0ofUeOg6HG1gaFc "
            />
          </div>
        </div>
      </div>

      <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide z-10 relative">
        {spacePosts.map((post) => {
          if (post.type === 'FlashCard') {
            return <FlashCard key={post.id} variant="reel" onCommentToggle={() => setCommentsOpen(!commentsOpen)} {...post} />;
          } else if (post.type === 'mcq') {
            return <McqCard key={post.id} variant="reel" onCommentToggle={() => setCommentsOpen(!commentsOpen)} {...post} />;
          } else if (post.type === 'text') {
            return <TextCard key={post.id} variant="reel" onCommentToggle={() => setCommentsOpen(!commentsOpen)} {...post} />;
          }
          return null;
        })}
      </div>

      {commentsOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setCommentsOpen(false)} 
        />
      )}

      {/* Comments Panel */}
      <div 
        className={`fixed right-0 top-[5vh] w-[400px] h-[90vh] bg-white rounded-l-2xl shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-50 flex flex-col transition-transform duration-500 text-on-surface ${commentsOpen ? 'translate-x-[-30px]' : 'translate-x-full'}`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-lg">Comments (84)</h3>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center" onClick={() => setCommentsOpen(false)}>
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="flex gap-3">
            <img alt="" className="w-8 h-8 rounded-full bg-surface-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_B7PdErlpS-Hr37FNUXhr1I7IUcIYfslZYxB4U-DOLsd2-M8vRTyscEChs_gOqJsGMIgNAAibTrNfXM31pNn0BU4dgcUytb05KtTG23E8Z6nFN06YO72uPMRESPT1OtIt6sCQ19vhYzAMbiOo8w_jGUHTse6Gch_3VZI3eoBv6hJ5DCYBWPhd1ze9nawmSAy665JLOT_R31AkGGR5wP8rPhZC7icl0nhVRXv1srGcOgrg8PwilWxua7MuQ2FkzwYByC-4iuhcsxk " />
            <div className="flex-1">
              <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none">
                <p className="font-bold text-xs text-on-surface">Alex_Study</p>
                <p className="text-sm text-on-surface-variant">This really helped me with my exam prep today. Simple and effective!</p>
              </div>
              <div className="flex items-center gap-4 mt-1 ml-2">
                <span className="text-[11px] text-on-surface-variant">12m</span>
                <button className="text-[11px] font-bold text-on-surface-variant">Reply</button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center gap-3">
          <input className="flex-1 bg-gray-50 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-primary-container outline-none" placeholder="Add a comment..." type="text" />
          <button className="text-primary-container font-bold text-sm px-2">Post</button>
        </div>
      </div>
    </div>
  );
}