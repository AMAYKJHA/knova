// lib/post.ts

import { api } from "@/lib/api";
import {
  Post,
  PostListResponse,
  Comment,
  CommentListResponse,
  SaveResponse,
  CreatePostRequest,
  UpdatePostRequest,
} from "@/types/post";

export class PostService {
  async getPosts(params: {
    page?: number;
    size?: number;
    sort_by?: string;
    creator_id?: string;
    topic_id?: string;
    content_type?: string;
    search?: string;
  }): Promise<PostListResponse> {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });

    return api<PostListResponse>(`/api/v1/posts?${query.toString()}`);
  }

  // Personalized recommendation feed (interest/CF/Thompson/creator retrieval +
  // LightGBM ranking). Requires an authenticated session. Paging is repeated
  // requests: each call re-runs retrieval excluding already-seen posts.
  async getFeed(params: { size?: number } = {}): Promise<PostListResponse> {
    const query = new URLSearchParams();
    if (params.size !== undefined) query.append("size", String(params.size));
    const qs = query.toString();
    return api<PostListResponse>(`/api/v1/posts/feed${qs ? `?${qs}` : ""}`);
  }

  async getPost(postId: string): Promise<Post> {
    return api<Post>(`/api/v1/posts/${postId}`);
  }

  async createPost(data: CreatePostRequest): Promise<Post> {
    return api<Post>("/api/v1/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePost(
    postId: string,
    data: UpdatePostRequest
  ): Promise<Post> {
    return api<Post>(`/api/v1/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePost(postId: string): Promise<void> {
    await api<void>(`/api/v1/posts/${postId}`, {
      method: "DELETE",
    });
  }

  async vote(postId: string, value: number): Promise<Post> {
    return api<Post>(`/api/v1/posts/${postId}/vote`, {
      method: "POST",
      body: JSON.stringify({ value }),
    });
  }

  async toggleSave(postId: string): Promise<SaveResponse> {
    return api<SaveResponse>(`/api/v1/posts/${postId}/save`, {
      method: "POST",
    });
  }

  async getComments(
    postId: string,
    page?: number,
    size?: number
  ): Promise<CommentListResponse> {
    const query = new URLSearchParams();

    if (page !== undefined) query.append("page", String(page));
    if (size !== undefined) query.append("size", String(size));

    const queryString = query.toString();

    return api<CommentListResponse>(
      `/api/v1/posts/${postId}/comments${
        queryString ? `?${queryString}` : ""
      }`
    );
  }

  async createComment(
    postId: string,
    body: string,
    parentCommentId?: string
  ): Promise<Comment> {
    return api<Comment>(`/api/v1/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({
        body,
        parent_comment_id: parentCommentId,
      }),
    });
  }

  async updateComment(
    commentId: string,
    body: string
  ): Promise<Comment> {
    return api<Comment>(`/api/v1/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ body }),
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    await api<void>(`/api/v1/comments/${commentId}`, {
      method: "DELETE",
    });
  }
}

export const postService = new PostService();