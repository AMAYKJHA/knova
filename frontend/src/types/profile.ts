export interface Profile {
    id: string;
    username: string;
    email: string;

    avatar_url: string | null;

    headline: string | null;
    credentials: string | null;
    bio: string | null;

    followers: number;
    following: number;

    posts: number;
    authority_score: number;

    primary_topics: string[];

    total_upvotes: number;
    total_comments: number;
    total_shares: number;
}