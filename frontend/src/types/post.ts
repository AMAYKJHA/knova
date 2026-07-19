export interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface Creator {
  id: string;
  user_id: string;
  headline?: string;
  authority_score: number;
  follower_count: number;
  user: User;
}

export interface McqData {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

export interface FlashcardData {
  front: string;
  back: string;
  flip_threshold_sec?: number;
}

export interface Post {
  id: string;
  creator_id: string;
  topic_id?: string;
  content_type: 'text' | 'mcq' | 'flashcard' | 'short_note';
  title?: string;
  body: string;
  difficulty: number;
  status: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  save_count: number;
  share_count: number;
  total_votes: number;
  creator?: Creator;
  tags: string[];
  mcq?: McqData;
  flashcard?: FlashcardData;
  user_vote?: number;
  user_saved: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  body: string;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: Comment[];
}

export interface PostListResponse {
  items: Post[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
}

export interface CommentListResponse {
  items: Comment[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
}

export interface VoteResponse {
  id: string;
  user_id: string;
  post_id: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface SaveResponse {
  post_id: string;
  saved: boolean;
  save_count: number;
}

export interface CreatePostRequest {
  creator_id: string;
  topic_id?: string;
  content_type: 'text' | 'mcq' | 'flashcard' | 'short_note';
  title?: string;
  body: string;
  difficulty?: number;
  status?: string;
  mcq?: McqData;
  flashcard?: FlashcardData;
  tags?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  body?: string;
  topic_id?: string;
  difficulty?: number;
  status?: string;
  tags?: string[];
  mcq?: McqData;
  flashcard?: FlashcardData;
}