// app/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import CreatorCard from '@/components/cards/CreatorCard';
import FlashCard from '@/components/cards/FlashCard';
import TextCard from '@/components/cards/TextContentCard';
import McqCard from '@/components/cards/McqCard';
import { FeedSkeleton } from '@/components/ui/Skeleton';
import ShareModal from '@/components/ui/ShareModal';
import CreatePostModal from '@/components/ui/CreatePostModal';
import { feedItems, FeedItem } from '@/data/feedData';
import { PostService } from '@/lib/posts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function HomePage() {
  const { user } = useAuth();
  const { ref, inView } = useInView();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [shareContentId, setShareContentId] = useState<string | number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [useMockData, setUseMockData] = useState<boolean>(false);

  const postService = new PostService();

  // Ids already shown, so "load more" (which re-runs the feed) never repeats a post.
  const seenIdsRef = useRef<Set<string>>(new Set());

  const mapPostToFeedItem = useCallback((post: any): FeedItem => {
    const baseItem: FeedItem = {
      id: post.id,
      type: post.content_type,
      author: post.creator?.user?.username || 'Unknown',
      authorInitial: post.creator?.user?.username?.slice(0, 2).toUpperCase() || 'U',
      authorBg: 'bg-orange-500 text-white',
      time: post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Just now',
      category: post.tags?.[0] || 'General',
      upvotes: post.upvote_count || 0,
      downvotes: post.downvote_count || 0,
      comments: post.comment_count || 0,
      userVote: post.user_vote,
      userSaved: post.user_saved,
      isOwner: user?.id === post.creator?.user?.id,
    };

    if (post.content_type === 'flashcard') {
      return { ...baseItem, answerBg: 'bg-[#f36710]', question: post.flashcard?.front, answer: post.flashcard?.back };
    } else if (post.content_type === 'text') {
      return { ...baseItem, title: post.title || 'Untitled', content: post.body };
    } else if (post.content_type === 'mcq') {
      return {
        ...baseItem,
        question: post.mcq?.question,
        options: post.mcq?.options,
        correctIndex: post.mcq?.correct_index,
        explanation: post.mcq?.explanation,
      };
    }
    return baseItem;
  }, [user]);

  const loadFeed = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Personalized recommendation feed. Paging re-runs retrieval, so we filter
      // out any post already shown and stop when a batch yields nothing new.
      const response = await postService.getFeed({ size: 15 });
      const mapped = response.items.map(mapPostToFeedItem);

      if (!append) {
        seenIdsRef.current = new Set(mapped.map(it => String(it.id)));
        setFeed(mapped);
        setTotal(mapped.length);
        setHasNext(mapped.length > 0);
      } else {
        const fresh = mapped.filter(it => !seenIdsRef.current.has(String(it.id)));
        fresh.forEach(it => seenIdsRef.current.add(String(it.id)));
        setFeed(prev => [...prev, ...fresh]);
        setTotal(prev => prev + fresh.length);
        setHasNext(fresh.length > 0);
      }

      setPage(pageNum);
      setUseMockData(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isExpectedFallback = /not found|404|route not available|unable to reach the server/i.test(message);

      if (!append && pageNum === 1) {
        setFeed(feedItems);
        setHasNext(false);
        setUseMockData(true);

        if (!isExpectedFallback) {
          console.error('Failed to load feed from API, using mock data:', error);
        }

        toast.info(isExpectedFallback ? 'Showing sample feed while the backend feed endpoint is unavailable.' : 'Using sample data (API unavailable)');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [mapPostToFeedItem]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFeed(1, false);
    }, 500);

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Check query params to open modal (redirected from another page or direct link)
    const params = new URLSearchParams(window.location.search);
    if (params.get('create') === 'true') {
      setCreateModalOpen(true);
      window.history.replaceState({}, '', '/');
    }

    // Listen to custom event from the global BottomBar
    const handleOpen = () => setCreateModalOpen(true);
    window.addEventListener('open-create-modal', handleOpen);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('open-create-modal', handleOpen);
    };
  }, [loadFeed]);

  // Load more when scrolling
  useEffect(() => {
    if (inView && hasNext && !isLoadingMore && !isLoading && !useMockData) {
      loadFeed(page + 1, true);
    }
  }, [inView, hasNext, isLoadingMore, isLoading, page, loadFeed, useMockData]);

  const handleShare = (id: string | number) => {
    console.log("share clicked:", id);
    setShareContentId(id);
    setShareModalOpen(true);
  };

  const handleCloseShare = () => {
    setShareModalOpen(false);
    setShareContentId(null);
  };

  const handleCreatePost = (post: FeedItem) => {
    setFeed([post, ...feed]);
    setTotal(prev => prev + 1);
  };

  const handleVote = async (postId: string, value: number) => {
    if (useMockData) {
      // Mock vote for demo
      setFeed(prev => prev.map(p => {
        if (p.id === postId) {
          const newVote = p.userVote === value ? 0 : value;
          const upvoteDelta = newVote === 1 ? 1 : (p.userVote === 1 ? -1 : 0);
          const downvoteDelta = newVote === -1 ? 1 : (p.userVote === -1 ? -1 : 0);
          return {
            ...p,
            upvotes: p.upvotes + upvoteDelta,
            downvotes: p.downvotes + downvoteDelta,
            userVote: newVote,
          };
        }
        return p;
      }));
      return;
    }

    try {
      const updatedPost = await postService.vote(postId, value);
      setFeed(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            upvotes: updatedPost.upvote_count,
            downvotes: updatedPost.downvote_count,
            userVote: updatedPost.user_vote,
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error('Failed to vote');
    }
  };

  const handleSave = async (postId: string) => {
    if (useMockData) {
      // Mock save for demo
      setFeed(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            userSaved: !p.userSaved,
          };
        }
        return p;
      }));
      return;
    }

    try {
      const response = await postService.toggleSave(postId);
      setFeed(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            userSaved: response.saved,
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    if (useMockData) {
      setFeed(prev => prev.filter(p => p.id !== postId));
      setTotal(prev => prev - 1);
      toast.success('Post deleted');
      return;
    }

    try {
      await postService.deletePost(postId);
      setFeed(prev => prev.filter(p => p.id !== postId));
      setTotal(prev => prev - 1);
      toast.success('Post deleted');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  // Render the feed items
  const renderFeedItems = () => {
    return feed.map((item: FeedItem) => {
      // Common props for all card types
      const commonProps = {
        id: item.id,
        author: item.author,
        authorInitial: item.authorInitial,
        authorBg: item.authorBg || 'bg-orange-500 text-white',
        time: item.time,
        category: item.category,
        upvotes: item.upvotes,
        downvotes: item.downvotes,
        comments: item.comments,
        onShare: handleShare,
        onVote: handleVote,
        onSave: handleSave,
        onDelete: handleDeletePost,
        userVote: item.userVote,
        userSaved: item.userSaved,
        isOwner: item.isOwner,
      };

      if (item.type === 'flashcard') {
        return (
          <FlashCard
            key={item.id}
            {...commonProps}
            question={item.question}
            answer={item.answer}
            answerBg={item.answerBg || 'bg-[#f36710]'}
          />
        );
      } else if (item.type === 'text') {
        return (
          <TextCard
            key={item.id}
            {...commonProps}
            title={item.title || 'Untitled'}
            content={item.content || ''}
          />
        );
      } else if (item.type === 'mcq') {
        return (
          <McqCard
            key={item.id}
            {...commonProps}
            question={item.question}
            options={item.options}
            correctIndex={item.correctIndex}
            explanation={item.explanation}
          />
        );
      }
      return null;
    });
  };

  return (
    <div className="flex min-h-screen">
      <main className={`flex-1 ${isMobile ? 'px-4 py-6 pb-25' : 'px-4 md:px-[64px] py-12 pt-32 pb-12'}`}>
        <CreatorCard onCreateClick={() => setCreateModalOpen(true)} />

        {isLoading ? (
          <FeedSkeleton />
        ) : (
          <div className={`${isMobile ? 'flex flex-col gap-6' : 'max-w-4xl mx-auto space-y-8'}`}>
            {feed.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No posts yet. Be the first to create one!</p>
              </div>
            ) : (
              renderFeedItems()
            )}
          </div>
        )}

        {/* Load more trigger */}
        {hasNext && !isLoading && !useMockData && (
          <div ref={ref} className={`${isMobile ? '' : 'max-w-4xl mx-auto'} flex justify-center py-8`}>
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more...</span>
              </div>
            )}
          </div>
        )}
      </main>

      {!isMobile && (
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-orange-600 text-white shadow-2xl shadow-orange-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      <ShareModal isOpen={shareModalOpen} onClose={handleCloseShare} contentId={shareContentId} />
      <CreatePostModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreate={handleCreatePost} />
    </div>
  );
}